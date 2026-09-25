FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code and reference datasets
COPY backend/ /app/
COPY fssai_packaging_recommendation_dataset_5000_samples\ -\ Untitled.csv /packAI/fssai_packaging_recommendation_dataset_5000_samples\ -\ Untitled.csv
COPY fssai_shelf_life_simulation_dataset_5000_samples\ -\ Untitled.csv /packAI/fssai_shelf_life_simulation_dataset_5000_samples\ -\ Untitled.csv

ENV PYTHONPATH=/app
ENV RECOMMENDATION_DATASET_PATH="/packAI/fssai_packaging_recommendation_dataset_5000_samples - Untitled.csv"
ENV SIMULATION_DATASET_PATH="/packAI/fssai_shelf_life_simulation_dataset_5000_samples - Untitled.csv"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
