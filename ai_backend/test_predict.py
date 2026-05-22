import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import sys
sys.path.append(r"c:\Users\saksh\OneDrive\Desktop\Major Project\masti-pathsala\ai_backend")
from intent_model.predict import IntentPredictor

predictor = IntentPredictor()

print("\n--- TESTS ---")
for text in ["namaste", "meri class kahan hai", "hello assistant", "open classroom"]:
    sequence = predictor.tokenizer.texts_to_sequences([text])
    print(f"Sequence for '{text}': {sequence}")
    result = predictor.predict_intent(text.lower())
    print(f"'{text}' -> {result}")
