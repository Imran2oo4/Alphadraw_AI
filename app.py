from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np

# Resource-efficient, Render-ready Flask+TensorFlow app
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

# Limit TensorFlow memory
import tensorflow as tf
tf.config.set_soft_device_placement(True)
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    for gpu in gpus:
        tf.config.experimental.set_memory_growth(gpu, True)

from PIL import Image
import base64
import io
from tensorflow import keras

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})

# Global model variable - lazy load
model = None
MODEL_PATH = "az_letters_model.keras"

def get_model():
    """Lazy load the model to avoid startup memory issues"""
    global model
    if model is None:
        print(f"Loading model from {MODEL_PATH}...")
        try:
            model = keras.models.load_model(MODEL_PATH)
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    return model


@app.route("/")
def index():
    """Serve the main page"""
    return send_from_directory('.', 'index.html')

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        pixels = data.get("pixels")
        img_b64 = data.get("image")
        
        # Support both pixels array (from frontend) and base64 image
        if pixels and len(pixels) == 784:
            # Frontend sends 784 pixel values (28x28)
            img_array = np.array(pixels, dtype=np.float32).reshape(28, 28)
            # Normalize if needed
            if img_array.max() > 1:
                img_array = img_array / 255.0
            img_array = img_array.reshape(1, 28, 28, 1)
        elif img_b64:
            # Base64 image format
            img_bytes = base64.b64decode(img_b64.split(",")[-1])
            img = Image.open(io.BytesIO(img_bytes)).convert("L")
            img = img.resize((28, 28), Image.LANCZOS)
            img_array = np.array(img, dtype=np.float32) / 255.0
            img_array = img_array.reshape(1, 28, 28, 1)
        else:
            return jsonify({"error": "No image or pixels provided"}), 400
        
        # Get model (lazy load)
        m = get_model()
        preds = m.predict(img_array, verbose=0)[0]
        letter = chr(65 + int(np.argmax(preds)))
        
        # Generate activations for visualization (simulated hidden layers)
        processed_flat = img_array.flatten()
        hidden1 = []
        for i in range(128):
            row = (i // 16) * 3
            col = (i % 16) * 2
            region_sum = 0
            count = 0
            for dy in range(7):
                for dx in range(7):
                    y, x = row + dy, col + dx
                    if 0 <= y < 28 and 0 <= x < 28:
                        region_sum += processed_flat[y * 28 + x]
                        count += 1
            hidden1.append(float(region_sum / max(count, 1)))
        h1_max = max(hidden1) if hidden1 else 1
        if h1_max > 0:
            hidden1 = [v / h1_max for v in hidden1]
        
        hidden2 = []
        for i in range(64):
            h1_idx = i * 2
            val = (hidden1[h1_idx] + hidden1[min(h1_idx + 1, 127)]) / 2
            out_idx = i % 26
            val = val * (0.5 + preds[out_idx])
            hidden2.append(float(val))
        h2_max = max(hidden2) if hidden2 else 1
        if h2_max > 0:
            hidden2 = [v / h2_max for v in hidden2]
        
        return jsonify({
            "letter": letter,
            "confidence": float(preds.max()),
            "probabilities": preds.tolist(),
            "activations": {
                "hidden1": hidden1,
                "hidden2": hidden2
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health")
def health():
    global model
    loaded = model is not None
    return jsonify({"status": "ok", "model_loaded": loaded})


# Serve static files (JS, CSS)
@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory('.', filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)), debug=False)
