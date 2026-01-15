FROM python:3.10-slim

ENV TF_CPP_MIN_LOG_LEVEL=2
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 10000

ENV PYTHONUNBUFFERED=1

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:10000", "--workers=1", "--threads=2"]
