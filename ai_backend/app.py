import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import mysql.connector
import time

from stt import transcribe_audio
from tts import synthesize_speech
# We load IntentPredictor lazily or handle it gracefully if not trained yet
try:
    from intent_model.predict import IntentPredictor
    predictor = IntentPredictor()
    print("Intent Predictor Loaded Successfully!")
except Exception as e:
    print(f"Warning: Intent model not loaded. Run train.py first! Error: {e}")
    predictor = None

app = Flask(__name__)
CORS(app)

# Database connection helper
def get_db_connection():
    # Uses the same DB as Masti-Pathsala Node.js server
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='Sakshi8840@',
        database='masti_pathsala'
    )

@app.route('/api/chat', methods=['POST'])
def chat():
    # 1. Get role (student or teacher) and user_id
    role = request.form.get('role', 'student')
    user_id = request.form.get('user_id', 0)
    
    text = ""
    
    # 2. Check if we received an audio file
    if 'audio' in request.files:
        audio_file = request.files['audio']
        if audio_file.filename != '':
            filename = secure_filename(audio_file.filename)
            file_path = os.path.join(os.path.dirname(__file__), "temp_" + filename)
            audio_file.save(file_path)
            
            # STT
            print("Transcribing audio...")
            text = transcribe_audio(file_path)
            print(f"User said: {text}")
            
            # Cleanup temp audio
            try:
                os.remove(file_path)
            except:
                pass
    elif 'text' in request.form:
        text = request.form['text']
        print(f"User Command (Text): {text}")
        
    if not text:
        return jsonify({"error": "No audio or text provided."}), 400
        
    # 3. Predict Intent
    if predictor:
        result = predictor.predict_intent(text.lower())
    else:
        result = {"tag": "unknown", "response": "My brain (model) is not trained yet!", "action": None}
        
    response_text = result["response"]
    action = result["action"]
    
    # 4. Handle Actions (Database integrations)
    if action == "FETCH_STUDENT_SCORE":
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT SUM(score) as total_score FROM user_progress WHERE user_id = %s", (user_id,))
            row = cursor.fetchone()
            score = row['total_score'] if row['total_score'] else 0
            response_text = response_text.replace("{score}", str(score))
            conn.close()
        except Exception as e:
            response_text = "Mujhe aapka score check karne me problem ho rahi hai."
            print(f"DB Error: {e}")
            
    elif action == "FETCH_LOWEST_SCORE":
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT u.username, SUM(up.score) as total_score 
                FROM users u 
                LEFT JOIN user_progress up ON u.id = up.user_id 
                WHERE u.role = 'student' 
                GROUP BY u.id 
                ORDER BY total_score ASC LIMIT 1
            """)
            row = cursor.fetchone()
            if row:
                response_text = response_text.replace("{student_name}", row['username']).replace("{score}", str(row['total_score'] or 0))
            else:
                response_text = "No students found in the database."
            conn.close()
        except Exception as e:
            response_text = "There was an error accessing the database."
            
    elif action == "FETCH_HIGHEST_SCORE":
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("""
                SELECT u.username, SUM(up.score) as total_score 
                FROM users u 
                LEFT JOIN user_progress up ON u.id = up.user_id 
                WHERE u.role = 'student' 
                GROUP BY u.id 
                ORDER BY total_score DESC LIMIT 1
            """)
            row = cursor.fetchone()
            if row:
                response_text = response_text.replace("{student_name}", row['username']).replace("{score}", str(row['total_score'] or 0))
            else:
                response_text = "No students found in the database."
            conn.close()
        except Exception as e:
            response_text = "There was an error accessing the database."
    
    # 5. TTS
    print(f"Assistant replies: {response_text}")
    audio_filename = synthesize_speech(response_text, role)
    audio_url = f"http://localhost:5001/audio/{audio_filename}"
    
    return jsonify({
        "transcription": text,
        "response": response_text,
        "action": action,
        "audio_url": audio_url
    })

@app.route('/audio/<filename>', methods=['GET'])
def get_audio(filename):
    file_path = os.path.join(os.path.dirname(__file__), "static", filename)
    if os.path.exists(file_path):
        return send_file(file_path, mimetype="audio/mpeg")
    return "File not found", 404

if __name__ == '__main__':
    print("Starting AI Voice Assistant Backend on Port 5001...")
    # Using 5001 so it doesn't conflict with Node.js on 5000
    app.run(port=5001, debug=True)
