import json
import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences # type: ignore
import os
import random

# Re-define Attention layer to load the model properly
class Attention(tf.keras.layers.Layer):
    def __init__(self, return_sequences=True, **kwargs):
        super(Attention, self).__init__(**kwargs)
        self.return_sequences = return_sequences

    def build(self, input_shape):
        self.W = self.add_weight(name="att_weight", shape=(input_shape[-1], 1), initializer="normal")
        self.b = self.add_weight(name="att_bias", shape=(input_shape[1], 1), initializer="zeros")
        super(Attention, self).build(input_shape)

    def call(self, x):
        e = tf.keras.backend.tanh(tf.keras.backend.dot(x, self.W) + self.b)
        a = tf.keras.backend.softmax(e, axis=1)
        output = x * a
        if self.return_sequences:
            return output
        return tf.keras.backend.sum(output, axis=1)

    def get_config(self):
        config = super().get_config()
        config.update({"return_sequences": self.return_sequences})
        return config

class IntentPredictor:
    def __init__(self):
        current_dir = os.path.dirname(__file__)
        self.model = tf.keras.models.load_model(os.path.join(current_dir, 'model.h5'), custom_objects={'Attention': Attention})
        
        with open(os.path.join(current_dir, 'tokenizer.pkl'), 'rb') as handle:
            self.tokenizer = pickle.load(handle)
            
        with open(os.path.join(current_dir, 'label_encoder.pkl'), 'rb') as handle:
            self.label_encoder = pickle.load(handle)
            
        with open(os.path.join(current_dir, 'intents.json'), 'r', encoding='utf-8') as f:
            self.intents_data = json.load(f)

    def predict_intent(self, text):
        max_length = 20
        sequence = self.tokenizer.texts_to_sequences([text])
        padded = pad_sequences(sequence, maxlen=max_length, padding='post')
        
        prediction = self.model.predict(padded)
        tag_index = np.argmax(prediction)
        confidence = prediction[0][tag_index]
        
        # If confidence is too low, we might not understand it
        if confidence < 0.5:
            return {"tag": "unknown", "response": "Sorry, I didn't quite catch that. Can you repeat?", "action": None}
            
        tag = self.label_encoder.inverse_transform([tag_index])[0]
        
        # Find response
        for intent in self.intents_data['intents']:
            if intent['tag'] == tag:
                response = random.choice(intent['responses'])
                action = intent.get('action', None)
                return {"tag": tag, "response": response, "action": action}
                
        return {"tag": "unknown", "response": "I am not sure how to help with that.", "action": None}
