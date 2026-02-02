FROM python:3.11-slim

ENV TF_CPP_MIN_LOG_LEVEL=2
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=10000
EXPOSE 10000

ENV PYTHONUNBUFFERED=1

# Use shell form so $PORT is expanded at container start
CMD gunicorn app:app --bind 0.0.0.0:$PORT --workers=1 --threads=2
