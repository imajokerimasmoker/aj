# Audio Player with Go Backend and Angular Frontend

This project is an audio player that takes a `dir` parameter from the URL and plays audio files from that directory. It is designed to be served with the Caddy webserver.

## Structure

- `backend/`: Go backend that lists audio files in a given directory.
- `frontend/`: Angular frontend player.
- `music/`: Default base directory for audio files.
- `Caddyfile`: Configuration for the Caddy webserver.

## Prerequisites

- Go 1.21+
- Node.js & Yarn
- Caddy

## Setup and Running

### 1. Build the Frontend

```bash
cd frontend
yarn install
yarn build
```

The build artifacts will be in `frontend/dist/frontend/browser`.

### 2. Run the Go Backend

```bash
cd backend
go run main.go
```

The backend listens on `:8080` by default. You can set the `MUSIC_BASE_DIR` environment variable to change where it looks for music.

### 3. Run Caddy

In the root directory:

```bash
caddy run
```

Caddy will listen on `:8000`.

### 4. Access the Player

Navigate to `http://localhost:8000/?dir=your-directory-name` in your browser.

Replace `your-directory-name` with a subdirectory inside the `music/` folder. For testing, you can use `?dir=test-album`.

## Security

The Go backend includes checks to prevent path traversal, ensuring only files within the base music directory can be listed.
