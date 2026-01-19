package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

var musicBaseDir = "./music"

func main() {
	if envDir := os.Getenv("MUSIC_BASE_DIR"); envDir != "" {
		musicBaseDir = envDir
	}

	// Ensure musicBaseDir is an absolute path for safer prefix checking
	absBase, err := filepath.Abs(musicBaseDir)
	if err != nil {
		log.Fatal("Could not determine absolute path of music base directory:", err)
	}
	musicBaseDir = absBase

	http.HandleFunc("/api/files", listFilesHandler)

	log.Println("Backend starting on :8080")
	log.Printf("Serving music from: %s\n", musicBaseDir)
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

func listFilesHandler(w http.ResponseWriter, r *http.Request) {
	// Enable CORS for development
	w.Header().Set("Access-Control-Allow-Origin", "*")

	dirParam := r.URL.Query().Get("dir")
	if dirParam == "" {
		http.Error(w, "dir parameter is required", http.StatusBadRequest)
		return
	}

	// Prevent path traversal
	targetPath := filepath.Join(musicBaseDir, dirParam)
	absTarget, err := filepath.Abs(targetPath)
	if err != nil {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	rel, err := filepath.Rel(musicBaseDir, absTarget)
	if err != nil || strings.HasPrefix(rel, "..") || filepath.IsAbs(rel) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	files, err := os.ReadDir(absTarget)
	if err != nil {
		http.Error(w, "Directory not found", http.StatusNotFound)
		return
	}

	var audioFiles []string
	extensions := map[string]bool{
		".mp3":  true,
		".wav":  true,
		".ogg":  true,
		".flac": true,
		".m4a":  true,
		".aac":  true,
	}

	for _, file := range files {
		if !file.IsDir() {
			ext := strings.ToLower(filepath.Ext(file.Name()))
			if extensions[ext] {
				// Return path relative to musicBaseDir
				relPath, err := filepath.Rel(musicBaseDir, filepath.Join(absTarget, file.Name()))
				if err == nil {
					audioFiles = append(audioFiles, relPath)
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(audioFiles); err != nil {
		log.Printf("Error encoding JSON: %v", err)
	}
}
