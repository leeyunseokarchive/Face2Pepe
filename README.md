# Face2Pepe

Browser-based demo that tracks facial features + hand gestures and swaps Pepe memes.

## Run
Serve the folder with a local static server (required for `fetch` + camera access). Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in Chrome and allow webcam access.

## Notes
- Meme sources live in `pepe.json` (action-based, pointing to local files under `assets/pepe/`).
- Face/hand thresholds are heuristic and may need tuning per lighting/camera.
