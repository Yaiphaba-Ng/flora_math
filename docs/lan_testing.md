# LAN / Mobile Testing Guide

## Quick Start

### 1. Find your LAN IP
```powershell
ipconfig | Select-String -Pattern "IPv4"
# Use the Wi-Fi adapter IP, e.g. 192.168.29.184
```

### 2. Start backend on all interfaces
```bash
cd backend
uv run uvicorn app.main:app --port 8000 --host 0.0.0.0 --reload
```

### 3. Start frontend on all interfaces
```bash
cd frontend
npm run dev -- --hostname 0.0.0.0
```

### 4. Open on phone
Navigate to `http://<YOUR_LAN_IP>:3000`

---

## What makes this work

| Config | File | Purpose |
|---|---|---|
| `allow_origins=["*"]` | `backend/app/main.py` | CORS allows any origin (phone LAN IP) |
| `allowedDevOrigins: ["192.168.x.x"]` | `frontend/next.config.ts` | Next.js allows HMR from specific LAN IP |
| `window.location.hostname` | `frontend/src/lib/apiClient.ts` | API URL auto-resolves to the host the page was loaded from |

## Notes
- All three configs are required — missing any one will break LAN testing.
- While `*` works in some environments for `allowedDevOrigins`, using your specific LAN IP (found via `ipconfig`) is more robust.
- The `window.location.hostname` trick means no hardcoded IPs anywhere in the code logic. The phone fetches the page from `192.168.x.x:3000`, so all API calls automatically go to `192.168.x.x:8000`.
- For production, lock down `allow_origins` to the real domain.
