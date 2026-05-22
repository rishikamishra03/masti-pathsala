import os
from gtts import gTTS
import pyttsx3
import time

def speak_offline(text, role):
    """
    Fallback offline TTS using pyttsx3.
    """
    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    
    # Try to set a female/childish voice for student, male/sincere for teacher
    if role == 'student':
        # Usually index 1 is female in Windows SAPI5
        if len(voices) > 1:
            engine.setProperty('voice', voices[1].id)
        engine.setProperty('rate', 150) # slightly slower/friendly
        engine.setProperty('pitch', 1.2) # pyttsx3 pitch control is limited, but we try
    else:
        # Teacher voice
        engine.setProperty('voice', voices[0].id)
        engine.setProperty('rate', 160)
        
    output_filename = f"response_{int(time.time())}.mp3"
    output_path = os.path.join(os.path.dirname(__file__), "static", output_filename)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    engine.save_to_file(text, output_path)
    engine.runAndWait()
    return output_filename

def synthesize_speech(text, role='student'):
    """
    Converts text to speech using Google TTS (gTTS) and returns the filename.
    """
    output_filename = f"response_{int(time.time())}.mp3"
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    os.makedirs(static_dir, exist_ok=True)
    output_path = os.path.join(static_dir, output_filename)

    try:
        # We use 'hi' for Hindi/Hinglish support. 
        # For student we might just use standard hi/en, gTTS doesn't have many voices
        # but the intonation handles Hindi/Hinglish well.
        lang = 'hi' 
        
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(output_path)
        return output_filename
    except Exception as e:
        print(f"gTTS failed (maybe offline), using pyttsx3 fallback: {e}")
        return speak_offline(text, role)
