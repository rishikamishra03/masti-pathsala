import whisper
import os

# Load the model once globally when the server starts
print("Loading Whisper model (this may take a moment)...")
model = whisper.load_model("small")
print("Whisper model loaded successfully!")

def transcribe_audio(audio_path):
    """
    Transcribes audio to text using OpenAI Whisper.
    Works offline (after initial model download).
    """
    try:
        if not os.path.exists(audio_path):
            return "Error: Audio file not found."
            
        # Transcribe with language detection (Hindi/English/Hinglish)
        prompt = "Hello! Who are you? Mujhe space game khelna hai. Create magical message. Masti Pathshala."
        result = model.transcribe(
            audio_path, 
            fp16=False,
            initial_prompt=prompt,
            condition_on_previous_text=False
        )
        return result["text"].strip()
    except Exception as e:
        print(f"STT Error: {e}")
        return ""
