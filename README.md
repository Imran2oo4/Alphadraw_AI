# Alphadraw_AI

An interactive web application for handwritten A–Z letter recognition using deep learning. Draw a letter on the canvas and get instant predictions from a trained neural network, with live probability charts and network visualization.

## 🚀 Features

- Draw uppercase letters (A–Z) on a responsive canvas
- Real-time prediction powered by TensorFlow/Keras
- Probability chart for all 26 letters
- Live neural network architecture visualization
- Modern, mobile-friendly UI

## 🛠️ Tech Stack

- **Backend:** Python, Flask, TensorFlow/Keras
- **Frontend:** HTML5 Canvas, Vanilla JS, CSS3
- **Model:** CNN trained on Kaggle A–Z dataset

## 📁 Project Structure

```text
├── server.py                # Flask backend & model API
├── az_letters_model.keras   # Trained Keras model (A–Z)
├── index.html               # Main web page
├── styles.css               # App styling
├── app.js                   # Drawing & UI logic
├── network.js               # API client (frontend-backend communication)
├── visualization.js         # Neural network visualization
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container build for Railway/Fly.io
├── templates/               # HTML templates
├── static/                  # Static assets (if any)
```

## ⚡ Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Imran2oo4/Alphadraw_AI.git
   cd Alphadraw_AI
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Model setup:**
   - Ensure `az_letters_model.keras` is present in the project directory.
   - If not, retrain the model locally or download a pre-trained version.

4. **Run the backend server:**

   ```bash
   python server.py
   ```

5. **Open your browser:**

   Go to [http://localhost:5000](http://localhost:5000)


## 🌐 Deployment (Railway Free Tier)

1. Push your code to GitHub.
2. On Railway, click "New Project" → "Deploy from GitHub repo" and select this repository.
3. No extra environment variables are needed.
4. Service will sleep when idle; no keep-alive or polling logic.
5. For large models, ensure file size <100MB for Railway Free Tier.

**Resource-saving tips:**
- Model loads once at startup, not per request.
- No background jobs, polling, or keep-alive logic.
- Minimal dependencies and logging.

**Frontend:**
- Use an HTML `<canvas>` for drawing.
- Add a “Predict” button that, when clicked, sends the canvas image as base64 to `/predict`.
- Do NOT send requests automatically or on every stroke.

## 🧠 How It Works

1. Draw a letter (A–Z) on the canvas.
2. The frontend converts your drawing to 28×28 grayscale pixel data.
3. The backend preprocesses the image and predicts the letter using a CNN model.
4. The frontend displays the predicted letter, confidence, probability bars, and network visualization.

## 📦 Requirements

- Python 3.8–3.12 recommended
- See `requirements.txt` for all Python dependencies

## 🛠️ Troubleshooting

- **Model not found:** Ensure `az_letters_model.keras` is present. Retrain or download if missing.
- **Server not running:** Activate your Python environment and install all dependencies.
- **Port in use:** If port 5000 is busy, stop other services or change the port in `server.py`.
- **TensorFlow errors:** Use a compatible Python version as per `requirements.txt`.

## 📜 License

MIT License

---

**Maintainer:** [Imran2oo4](https://github.com/Imran2oo4)
