# Neural Network Alphabet Recognizer (Neural Visualizer)

An interactive web application that visualizes how a neural network recognizes handwritten letters (A-Z) in real-time. Draw a letter, and watch the AI predict and visualize the recognition process live.

## 🚀 Features

- Draw letters (A-Z) with adjustable brush size
- Real-time prediction powered by TensorFlow/Keras
- Live neural network architecture and activation visualization
- Probability distribution for all 26 letters
- Modern, responsive dark UI with glow effects
- Mobile-friendly design

## 🖥️ Demo

Try the live demo: [https://neural-visualizer-production.up.railway.app](https://neural-visualizer-production.up.railway.app)

## 🛠️ Tech Stack

- **Backend:** Python, Flask, TensorFlow/Keras
- **Frontend:** HTML5 Canvas, Vanilla JS, CSS3
- **Model:** CNN trained on EMNIST Letters (A-Z)

## 📁 Project Structure

```text
├── server.py               # Flask backend & model API
├── emnist_letters_model.keras # Trained Keras model (A-Z)
├── index.html              # Main web page
├── styles.css              # App styling
├── app.js                  # Drawing & UI logic
├── network.js              # API client (frontend-backend communication)
├── visualization.js        # Neural network visualization
├── requirements.txt        # Python dependencies

## ⚡ Quick Start


1. **Clone the repository:**

   ```bash
   git clone https://github.com/Imran2oo4/neural-visualizer.git
   cd neural-visualizer
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Model setup:**

   - If `emnist_letters_model.keras` exists, skip to the next step.
   - If not, the backend will automatically train a new model on first run (requires internet for EMNIST Letters dataset download; may take several minutes).

4. **Run the backend server:**

   ```bash
   python server.py
   ```

5. **Open your browser:**

   Go to [http://localhost:5000](http://localhost:5000)

## 🧠 How It Works

1. Draw a letter (A-Z) on the canvas.
2. The frontend converts your drawing to 28x28 grayscale pixel data.
3. The backend preprocesses the image and predicts the letter using a CNN model trained on EMNIST Letters.
4. The frontend displays the predicted letter, confidence, probability bars, and a live visualization of the neural network’s activations.


## 📦 Requirements

- Python 3.8–3.12 recommended
- See `requirements.txt` for all Python dependencies

## 🛠️ Troubleshooting

- **Model not found:** If `emnist_letters_model.keras` is missing, the backend will train a new model automatically. This requires internet access and may take several minutes.
- **Server not running:** Ensure you have activated your Python environment and installed all dependencies.
- **Port in use:** If port 5000 is busy, stop other services or change the port in `server.py`.
- **TensorFlow errors:** Make sure your Python version is compatible with the TensorFlow version in `requirements.txt`.

## 📜 License

MIT License

---

**Maintainer:** [Imran2oo4](https://github.com/Imran2oo4)
