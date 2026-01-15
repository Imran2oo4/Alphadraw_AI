# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . .

# Expose port (default Flask/Gunicorn port)
EXPOSE 5000

# Set environment variable for production
ENV PYTHONUNBUFFERED=1

# Start Gunicorn server
CMD ["gunicorn", "server:app", "--bind", "0.0.0.0:5000", "--workers", "1"]
