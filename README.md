# 🎓 Masti Pathshala

Masti Pathshala is an AI-based interactive learning platform developed to make learning more engaging and accessible for children through voice interaction and chatbot-based communication.

The project combines React frontend development with a Flask-based AI backend that uses Natural Language Processing (NLP) and a Neural Network model to understand user queries and generate responses.

---

# 🚀 Features

- AI chatbot for interactive learning
- Voice-based interaction
- Speech-to-Text conversion
- Text-to-Speech response generation
- English and Hindi conversation support
- Intent-based response system
- Neural Network model training using TensorFlow/Keras
- Interactive frontend built with React

---

# 🛠️ Technologies Used

## Frontend
- React.js
- JavaScript
- HTML
- CSS

## Backend
- Python
- Flask

## AI / Machine Learning
- TensorFlow
- Keras
- NLTK
- NumPy

## Voice Processing
- gTTS
- SpeechRecognition

---

# 📂 Project Structure

```bash
masti-pathsala/
│
├── ai_backend/
│   ├── app.py
│   ├── train.py
│   ├── intents.json
│   ├── stt.py
│   ├── tts.py
│   └── model training files
│
├── src/
├── public/
├── package.json
├── requirements.txt
└── README.md

```

# ⚙️ Installation

## 1. Clone the Repository
git clone https://github.com/rishikamishra03/masti-pathsala.git
cd masti-pathsala

## 2. Create Virtual Environment
python -m venv .venv
Activate Virtual Environment
Windows
.venv\Scripts\activate
Linux/Mac
source .venv/bin/activate

## 3. Install Backend Dependencies
pip install -r requirements.txt

## 4. Run Flask Backend
python app.py

## 5. Install Frontend Dependencies
npm install

## 6. Start Frontend
npm start

---

# 🧠 Model Training

The chatbot model is trained using the data present in intents.json.

To train the model:

python train.py

The training process:

Tokenizes user input
Applies NLP preprocessing
Converts text into numerical format
Trains a Neural Network model
Saves trained model files

### 🎤 Voice Interaction Workflow
User gives voice input
Speech converts to text
NLP processes the text
Model predicts the intent
Chatbot generates response
Response converts to speech output


# 📌 Purpose of the Project

The objective of Masti Pathshala is to create an engaging educational platform where children can interact with an AI assistant through voice and text communication.

The project focuses on combining education with interactive AI technologies to improve learning experience.

# 👩‍💻 Contributors
- Sakshi Srivastav
- Rishika Mishra

#  📜 License

This project is licensed under the Apache-2.0 License.
