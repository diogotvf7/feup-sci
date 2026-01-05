# Use a lightweight Python base image
FROM python:3.12.3-slim

# Set the working directory inside the container
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# command to run the script inside the src folder
ENTRYPOINT ["python", "-u", "src/main_loop.py"]