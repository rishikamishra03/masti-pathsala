import json
import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.models import Model # type: ignore
from tensorflow.keras.layers import Input, Embedding, LSTM, Bidirectional, Dense, Dropout, Layer # type: ignore
from tensorflow.keras.preprocessing.text import Tokenizer # type: ignore
from tensorflow.keras.preprocessing.sequence import pad_sequences # type: ignore
from sklearn.preprocessing import LabelEncoder
import os

class Attention(Layer):
    """
    Custom Attention Layer for BiLSTM.
    """
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

def train_model():
    current_dir = os.path.dirname(__file__)
    intents_file = os.path.join(current_dir, 'intents.json')
    
    with open(intents_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    sentences = []
    labels = []
    
    for intent in data['intents']:
        for pattern in intent['patterns']:
            sentences.append(pattern.lower())
            labels.append(intent['tag'])

    # Tokenization
    vocab_size = 2000
    embedding_dim = 64
    max_length = 20
    oov_tok = "<OOV>"

    tokenizer = Tokenizer(num_words=vocab_size, oov_token=oov_tok)
    tokenizer.fit_on_texts(sentences)
    word_index = tokenizer.word_index

    sequences = tokenizer.texts_to_sequences(sentences)
    padded_sequences = pad_sequences(sequences, maxlen=max_length, padding='post')

    # Label Encoding
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(labels)
    num_classes = len(np.unique(encoded_labels))

    # Build BiLSTM + Attention Model
    inputs = Input(shape=(max_length,))
    x = Embedding(vocab_size, embedding_dim, input_length=max_length)(inputs)
    x = Bidirectional(LSTM(64, return_sequences=True))(x)
    x = Attention(return_sequences=False)(x)
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.5)(x)
    outputs = Dense(num_classes, activation='softmax')(x)

    model = Model(inputs=inputs, outputs=outputs)
    model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    
    print("Training Custom BiLSTM + Attention Model...")
    model.fit(padded_sequences, encoded_labels, epochs=200, verbose=1)

    # Save everything
    model.save(os.path.join(current_dir, 'model.h5'))
    with open(os.path.join(current_dir, 'tokenizer.pkl'), 'wb') as handle:
        pickle.dump(tokenizer, handle, protocol=pickle.HIGHEST_PROTOCOL)
    with open(os.path.join(current_dir, 'label_encoder.pkl'), 'wb') as handle:
        pickle.dump(label_encoder, handle, protocol=pickle.HIGHEST_PROTOCOL)
        
    print("Training complete! Model and preprocessors saved.")

if __name__ == "__main__":
    train_model()
