from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow import keras
from PIL import Image
import io
import base64
import os

# Production-ready Flask app
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app, resources={r"/*": {"origins": "*"}})

# Load model once at startup
MODEL_PATH = 'az_letters_model.keras'
model = keras.models.load_model(MODEL_PATH)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        img_b64 = data.get('image')
        if not img_b64:
            return jsonify({'error': 'No image provided'}), 400
        # Decode base64 image
        img_bytes = base64.b64decode(img_b64.split(',')[-1])
        img = Image.open(io.BytesIO(img_bytes)).convert('L')  # Grayscale
        img = img.resize((28, 28), Image.LANCZOS)
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = img_array.reshape(1, 28, 28, 1)
        preds = model.predict(img_array, verbose=0)[0]
        letter = chr(65 + int(np.argmax(preds)))
        return jsonify({'letter': letter})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)), debug=False)
