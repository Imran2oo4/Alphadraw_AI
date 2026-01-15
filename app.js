/**
 * Main Application Module
 */

class AlphabetRecognitionApp {
        // ...existing code...
    constructor() {
        this.drawingCanvas = document.getElementById('drawingCanvas');
        this.drawingCtx = this.drawingCanvas.getContext('2d');
        this.networkCanvas = document.getElementById('networkCanvas');
        
        this.clearBtn = document.getElementById('clearBtn');
        this.predictBtn = document.getElementById('predictBtn');
        this.brushSizeSlider = document.getElementById('brushSize');
        this.brushSizeValue = document.getElementById('brushSizeValue');
        this.predictedLetter = document.getElementById('predictedDigit');
            this.predictedLetter = document.getElementById('predictedDigit'); // id remains for compatibility, class updated
        this.confidence = document.getElementById('confidence');
        this.probabilityBars = document.getElementById('probabilityBars');
        this.pixelPreview = document.getElementById('pixelPreview');
        
        this.isDrawing = false;
        this.brushSize = 22;
        this.lastPos = null;
        this.predictionTimeout = null;
        
        this.visualizer = new NetworkVisualizer(this.networkCanvas);
        
        this.showLoadingState();
        this.waitForModel();
        this.init();
    }

    showLoadingState() {
        this.predictedLetter.textContent = '...';
        this.confidence.textContent = 'Connecting to server...';
        this.predictBtn.disabled = true;
        this.predictBtn.textContent = 'Loading...';
    }

    async waitForModel() {
        this.network = new NeuralNetwork();
        const connected = await this.network.initialize();
        
        if (connected) {
            this.predictedLetter.textContent = '?';
            this.confidence.textContent = 'Draw a letter';
            this.predictBtn.disabled = false;
            this.predictBtn.textContent = 'Predict';
        } else {
            this.predictedLetter.textContent = '!';
            this.confidence.textContent = 'Server not running. Run: python server.py';
            this.predictBtn.disabled = false;
            this.predictBtn.textContent = 'Retry';
        }
        this.visualizer.renderEmpty();
    }

    init() {
        this.setupCanvas();
        this.setupPixelPreview();
        this.setupProbabilityBars();
        this.bindEvents();
        this.visualizer.renderEmpty();
    }

    setupCanvas() {
        this.drawingCtx.fillStyle = '#000000';
        this.drawingCtx.fillRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.drawingCtx.lineCap = 'round';
        this.drawingCtx.lineJoin = 'round';
        this.drawingCtx.strokeStyle = '#ffffff';
        this.drawingCtx.lineWidth = this.brushSize;
        
        // Set brush size slider default
        this.brushSizeSlider.value = this.brushSize;
        this.brushSizeValue.textContent = this.brushSize;
    }

    setupPixelPreview() {
        this.pixelPreview.innerHTML = '';
        for (let i = 0; i < 28 * 28; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            this.pixelPreview.appendChild(pixel);
        }
    }

    setupProbabilityBars() {
        this.probabilityBars.innerHTML = '';
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i); // A-Z
            const row = document.createElement('div');
            row.className = 'prob-row';
            row.innerHTML = `
                <span class="prob-label" id="prob-label-${i}">${letter}</span>
                <div class="prob-bar-container">
                    <div class="prob-bar" id="prob-bar-${i}" style="width: 0%"></div>
                </div>
                <span class="prob-value" id="prob-value-${i}">0%</span>
            `;
            this.probabilityBars.appendChild(row);
        }
    }

    bindEvents() {
        this.drawingCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawingCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawingCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawingCanvas.addEventListener('mouseleave', () => this.stopDrawing());
        
        this.drawingCanvas.addEventListener('touchstart', (e) => this.handleTouch(e, 'start'), { passive: false });
        this.drawingCanvas.addEventListener('touchmove', (e) => this.handleTouch(e, 'move'), { passive: false });
        this.drawingCanvas.addEventListener('touchend', () => this.stopDrawing());
        
        this.clearBtn.addEventListener('click', () => this.clearCanvas());
        this.predictBtn.addEventListener('click', () => this.predict());
        
        this.brushSizeSlider.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            this.brushSizeValue.textContent = this.brushSize;
            this.drawingCtx.lineWidth = this.brushSize;
        });
    }

    getCanvasCoordinates(e) {
        const rect = this.drawingCanvas.getBoundingClientRect();
        const scaleX = this.drawingCanvas.width / rect.width;
        const scaleY = this.drawingCanvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    handleTouch(e, type) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY };
        
        if (type === 'start') this.startDrawing(mouseEvent);
        else if (type === 'move') this.draw(mouseEvent);
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.lastPos = this.getCanvasCoordinates(e);
        
        this.drawingCtx.beginPath();
        this.drawingCtx.arc(this.lastPos.x, this.lastPos.y, this.brushSize / 2, 0, Math.PI * 2);
        this.drawingCtx.fillStyle = '#ffffff';
        this.drawingCtx.fill();
    }

    draw(e) {
        if (!this.isDrawing) return;
        const pos = this.getCanvasCoordinates(e);
        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(this.lastPos.x, this.lastPos.y);
        this.drawingCtx.lineTo(pos.x, pos.y);
        this.drawingCtx.stroke();
        this.lastPos = pos;
        // Real-time prediction with debounce
        if (this.predictionTimeout) clearTimeout(this.predictionTimeout);
        this.predictionTimeout = setTimeout(() => this.predict(), 120);
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.lastPos = null;
            // Final prediction after drawing stops
            if (this.predictionTimeout) clearTimeout(this.predictionTimeout);
            this.predictionTimeout = setTimeout(() => this.predict(), 80);
        }
    }

    clearCanvas() {
        this.drawingCtx.fillStyle = '#000000';
        this.drawingCtx.fillRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        
        this.predictedLetter.textContent = '?';
        this.confidence.textContent = 'Draw a letter';
        
        for (let i = 0; i < 26; i++) {
            document.getElementById(`prob-bar-${i}`).style.width = '0%';
            document.getElementById(`prob-bar-${i}`).classList.remove('winner');
            document.getElementById(`prob-value-${i}`).textContent = '0%';
            document.getElementById(`prob-label-${i}`).classList.remove('winner');
        }
        
        const pixels = this.pixelPreview.querySelectorAll('.pixel');
        pixels.forEach(pixel => pixel.style.backgroundColor = '#000');
        
        this.visualizer.renderEmpty();
    }

    getPixelData() {
        // Step 1: Get the full canvas as grayscale
        const srcW = this.drawingCanvas.width;
        const srcH = this.drawingCanvas.height;
        const srcCtx = this.drawingCtx;
        const srcImageData = srcCtx.getImageData(0, 0, srcW, srcH);
        const srcPixels = new Float32Array(srcW * srcH);
        for (let i = 0; i < srcW * srcH; i++) {
            // Use red channel (canvas is white on black)
            srcPixels[i] = srcImageData.data[i * 4] / 255;
        }

        // Step 2: Binarize (threshold)
        const binarized = new Float32Array(srcW * srcH);
        for (let i = 0; i < srcPixels.length; i++) {
            binarized[i] = srcPixels[i] > 0.15 ? 1 : 0;
        }

        // Step 3: Find bounding box
        let minX = srcW, minY = srcH, maxX = 0, maxY = 0, found = false;
        for (let y = 0; y < srcH; y++) {
            for (let x = 0; x < srcW; x++) {
                if (binarized[y * srcW + x] > 0.1) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    found = true;
                }
            }
        }

        // If nothing drawn, return blank
        if (!found) {
            const blank = new Array(28 * 28).fill(0);
            this.updatePixelPreview(blank);
            return blank;
        }

        // Step 4: Crop to bounding box
        const boxW = maxX - minX + 1;
        const boxH = maxY - minY + 1;
        // Avoid 0 size
        if (boxW <= 0 || boxH <= 0) {
            const blank = new Array(28 * 28).fill(0);
            this.updatePixelPreview(blank);
            return blank;
        }

        // Step 5: Resize to fit 20x20 box, preserving aspect ratio
        let targetW, targetH;
        if (boxH > boxW) {
            targetH = 20;
            targetW = Math.max(1, Math.round(boxW * 20 / boxH));
        } else {
            targetW = 20;
            targetH = Math.max(1, Math.round(boxH * 20 / boxW));
        }
        // Create temp canvas for cropping and resizing
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = boxW;
        cropCanvas.height = boxH;
        const cropCtx = cropCanvas.getContext('2d');
        cropCtx.putImageData(srcCtx.getImageData(minX, minY, boxW, boxH), 0, 0);
        // Resize to targetW x targetH
        const resizeCanvas = document.createElement('canvas');
        resizeCanvas.width = targetW;
        resizeCanvas.height = targetH;
        const resizeCtx = resizeCanvas.getContext('2d');
        resizeCtx.imageSmoothingEnabled = false; // Dataset is not anti-aliased
        resizeCtx.drawImage(cropCanvas, 0, 0, targetW, targetH);

        // Step 6: Center in 28x28
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 28;
        finalCanvas.height = 28;
        const finalCtx = finalCanvas.getContext('2d');
        finalCtx.fillStyle = '#000';
        finalCtx.fillRect(0, 0, 28, 28);
        const padX = Math.floor((28 - targetW) / 2);
        const padY = Math.floor((28 - targetH) / 2);
        finalCtx.drawImage(resizeCanvas, padX, padY);

        // Step 7: Extract grayscale pixels (A-Z dataset is white on black)
        const finalImageData = finalCtx.getImageData(0, 0, 28, 28);
        const pixels = [];
        for (let i = 0; i < 28 * 28; i++) {
            // Use red channel (should be same for grayscale)
            pixels[i] = finalImageData.data[i * 4] / 255;
        }

        // Step 8: Normalize to [0,1] (already done), update preview
        this.updatePixelPreview(pixels);
        return pixels;
    }

    updatePixelPreview(pixels) {
        const previewPixels = this.pixelPreview.querySelectorAll('.pixel');
        pixels.forEach((value, i) => {
            const brightness = Math.floor(value * 255);
            previewPixels[i].style.backgroundColor = `rgb(${brightness}, ${brightness}, ${brightness})`;
        });
    }

    async predict() {
        if (!this.network || !this.network.isReady) {
            // Try to reconnect
            const connected = await this.network.initialize();
            if (!connected) {
                this.confidence.textContent = 'Server not running. Run: python server.py';
                return;
            }
        }
        
        const pixels = this.getPixelData();
        const totalBrightness = pixels.reduce((sum, p) => sum + p, 0);
        if (totalBrightness < 3) return;
        
        const result = await this.network.predict(pixels);
        
        if (result.error) {
            this.confidence.textContent = result.error;
            return;
        }
        
        this.updatePredictionDisplay(result);
        this.visualizer.render(this.network);
    }

    updatePredictionDisplay(result) {
            // ...existing code...
        // Show predicted letter (A-Z), fallback to max probability if missing
        let letter = result.letter;
        let confidence = result.confidence;
        if (!letter && Array.isArray(result.probabilities)) {
            const maxIdx = result.probabilities.indexOf(Math.max(...result.probabilities));
            letter = String.fromCharCode(65 + maxIdx);
            confidence = result.probabilities[maxIdx];
        }
        this.predictedLetter.textContent = letter || '?';
        const confidencePercent = (confidence * 100).toFixed(1);
        this.confidence.textContent = `Prediction: ${letter || '?'} (Confidence: ${confidencePercent}%)`;
        
        // Add high confidence styling
        if (result.confidence > 0.8) {
            this.confidence.classList.add('high');
        } else {
            this.confidence.classList.remove('high');
        }
        
        // Add active class to prediction display, then remove after animation
        const display = this.predictedLetter.parentElement;
        display.classList.add('active');
        setTimeout(() => {
            display.classList.remove('active');
        }, 600); // 600ms matches the CSS transition
        
        result.probabilities.forEach((prob, i) => {
            const percentage = (prob * 100).toFixed(1);
            const bar = document.getElementById(`prob-bar-${i}`);
            const value = document.getElementById(`prob-value-${i}`);
            const label = document.getElementById(`prob-label-${i}`);
            
            bar.style.width = `${percentage}%`;
            value.textContent = `${percentage}%`;
            
            if (String.fromCharCode(65 + i) === result.letter) {
                bar.classList.add('winner');
                if (label) label.classList.add('winner');
            } else {
                bar.classList.remove('winner');
                if (label) label.classList.remove('winner');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AlphabetRecognitionApp();
});