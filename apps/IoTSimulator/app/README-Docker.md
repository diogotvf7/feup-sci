# Bevywise IoT Simulator Docker Image

This Docker image packages the Bevywise IoT Simulator for easy deployment.

## Quick Start

### Build the image:
```bash
docker build --platform linux/amd64 -t bevywise-iot-simulator .
```

### Run the container:
```bash
docker run -d --name iot-simulator -p 9000:9000 -p 12345:12345 bevywise-iot-simulator
```

### Using Docker Compose:
```bash
docker-compose up -d
```

## Access the Simulator

- Web Interface: http://localhost:9000
- WebSocket Port: 12345

## Ports

- **9000**: Web UI port
- **12345**: WebSocket port

## Data Persistence

The Docker Compose configuration mounts local directories for data and logs:
- `./data` → `/app/data` (SQLite database storage)
- `./log` → `/app/log` (Application logs)

## Default Configuration

- Database: SQLite (default)
- Sample Network: Health_care (pre-loaded)
