# Docker Setup for Stelle Music Bot

This guide explains how to run Stelle Music Bot using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (usually included with Docker Desktop)
- External MongoDB and Redis instances (not included in Docker setup)

## Quick Start

1. **Clone the repository and navigate to the project directory**

2. **Create your environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your actual configuration:
   - `TOKEN`: Your Discord bot token
   - `DATABASE_URL`: Your MongoDB connection string
   - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_USERNAME`: Your Redis configuration
   - `ERRORS_WEBHOOK`: Your Discord webhook URL for error reporting

3. **Build and run using Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```

4. **Alternative: Build and run manually**
   ```bash
   # Build the image
   docker build -t stelle-music-bot .
   
   # Run the container
   docker run -d \
     --name stelle-bot \
     --env-file .env \
     -v $(pwd)/logs:/app/logs \
     -v $(pwd)/cache:/app/cache \
     stelle-music-bot
   ```

## Docker Files

- `Dockerfile`: Standard development/production Dockerfile
- `Dockerfile.production`: Multi-stage optimized build for production
- `docker-compose.yml`: Docker Compose configuration
- `.dockerignore`: Files to exclude from Docker build context

## Available Scripts

### Linux/macOS
```bash
# Build the Docker image
./docker-build.sh
```

### Windows
```batch
# Build the Docker image
docker-build.bat
```

## Managing the Bot

### View logs
```bash
# Using Docker Compose
docker-compose logs -f stelle-bot

# Using Docker directly
docker logs -f stelle-bot
```

### Stop the bot
```bash
# Using Docker Compose
docker-compose down

# Using Docker directly
docker stop stelle-bot
```

### Restart the bot
```bash
# Using Docker Compose
docker-compose restart stelle-bot

# Using Docker directly
docker restart stelle-bot
```

### Update the bot
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Production Deployment

For production, use the optimized Dockerfile:

```bash
# Build production image
docker build -f Dockerfile.production -t stelle-music-bot:production .

# Run with production image
docker run -d \
  --name stelle-bot-prod \
  --env-file .env \
  --restart unless-stopped \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/cache:/app/cache \
  stelle-music-bot:production
```

## Environment Variables

The bot requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `TOKEN` | Discord bot token | Yes |
| `DATABASE_URL` | MongoDB connection string | Yes |
| `REDIS_HOST` | Redis server host | Yes |
| `REDIS_PORT` | Redis server port | Yes |
| `REDIS_PASSWORD` | Redis server password | Yes |
| `REDIS_USERNAME` | Redis server username | Yes |
| `ERRORS_WEBHOOK` | Discord webhook for error reporting | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Volumes

The Docker setup mounts the following directories:
- `./logs:/app/logs` - Persistent log storage
- `./cache:/app/cache` - Persistent cache storage

## Troubleshooting

### Bot won't start
1. Check your environment variables in `.env`
2. Ensure MongoDB and Redis are accessible from the Docker container
3. Check logs: `docker-compose logs stelle-bot`

### Permission issues
The container runs as a non-root user (`stelle`) for security. If you encounter permission issues with mounted volumes:
```bash
sudo chown -R 1001:1001 logs cache
```

### Network issues
If the bot can't connect to external services (MongoDB/Redis), ensure:
- The services are accessible from the Docker network
- Firewall rules allow the connections
- Connection strings use appropriate hostnames/IPs

## Notes

- This Docker setup only containerizes the bot itself
- MongoDB and Redis are expected to be running externally
- The bot will automatically restart unless stopped manually (when using `--restart unless-stopped`)
- Logs and cache are persisted using Docker volumes
