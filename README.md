# Frisson OS — Website

Static, single-page site. The white signature mark (outline drop, FRISSON embedded) on white. No build step.

```
.
├── index.html                     # The page
├── assets/
│   └── frisson-logo-animated.js   # Animated <frisson-logo-animated> component
├── netlify.toml                   # Deploy config (publish ".")
└── README.md
```

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy

Connected to Netlify via GitHub — every push to `main` redeploys. Publish directory is the repo root; no build command.
