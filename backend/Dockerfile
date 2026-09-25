FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies (supports both root context and backend/ context)
COPY requirements.txt* /app/
RUN if [ ! -f /app/requirements.txt ]; then cp /app/backend/requirements.txt /app/requirements.txt 2>/dev/null || true; fi
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . /app/

# Ensure datasets exist in both /packAI and /app
RUN mkdir -p /packAI
RUN cp /app/"fssai_packaging_recommendation_dataset_5000_samples - Untitled.csv" /packAI/ 2>/dev/null || true
RUN cp /app/"fssai_shelf_life_simulation_dataset_5000_samples - Untitled.csv" /packAI/ 2>/dev/null || true

ENV PYTHONPATH=/app
ENV RECOMMENDATION_DATASET_PATH="/app/fssai_packaging_recommendation_dataset_5000_samples - Untitled.csv"
ENV SIMULATION_DATASET_PATH="/app/fssai_shelf_life_simulation_dataset_5000_samples - Untitled.csv"

EXPOSE 8000

# Use PORT provided by Render/Railway or fallback to 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
