# CampusFlow — Production Deployment & DevOps Architecture

This guide details the complete production deployment strategy, container orchestration, reverse proxy configuration, TLS/SSL certificates, MongoDB configuration, and CI/CD pipelines for **CampusFlow**.

---

## 1. CI/CD & Deployment Flow Architecture

```text
Developer
    ↓
Git Push
    ↓
GitHub
    ↓
CI (GitHub Actions)
    ├── Lint (ESLint 0 errors)
    ├── Test Server (158 Tests)
    ├── Test Client (41 Tests)
    └── Build (Vite 32kB entry chunk)
    ↓
Deployment (Docker / Cloud VM / K8s)
    ↓
Frontend (Nginx Alpine SPA Server)
    ↓ (Reverse Proxy /api & /socket.io)
Backend (Node.js Express + Socket.IO Server)
    ↓
MongoDB (MongoDB Replica Set / Atlas)
```

---

## 2. Docker & Container Deployment

### A. Quickstart with Docker Compose (Recommended)

Run the entire full-stack application (MongoDB, Backend API, and Nginx Frontend) with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/kubervaidya24-max/CAMPUSFLOW.git
cd CAMPUSFLOW

# 2. Configure Environment Variables
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Launch with Docker Compose
docker compose up -d --build
```

- **Frontend Application**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

To view logs:
```bash
docker compose logs -f
```

To stop containers:
```bash
docker compose down
```

---

## 3. Nginx Reverse Proxy & HTTPS / SSL Configuration

In production, Nginx handles TLS termination, HTTP/2 or HTTP/3, and proxies requests to the Node.js backend.

### SSL Certificate Generation (Let's Encrypt / Certbot)
```bash
sudo apt update && sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d campusflow.yourdomain.edu
```

### Production Nginx Virtual Host Config (`/etc/nginx/sites-available/campusflow`)
```nginx
server {
    listen 80;
    server_name campusflow.yourdomain.edu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name campusflow.yourdomain.edu;

    ssl_certificate /etc/letsencrypt/live/campusflow.yourdomain.edu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/campusflow.yourdomain.edu/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/campusflow/client/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    # Client-side SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy to Node.js Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy to Socket.IO Real-Time WebSockets
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 4. MongoDB Production Configuration Guidance

For production workloads, use **MongoDB Atlas** or a managed 3-node Replica Set:

1. **Connection String**:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusflow?retryWrites=true&w=majority&maxPoolSize=50&wtimeoutMS=2500
   ```
2. **Connection Pooling**:
   - Set `maxPoolSize: 50` and `minPoolSize: 5` in Mongoose connection options.
3. **Backup & Retention**:
   - Enable automated point-in-time recovery (PITR) and daily snapshot backups.
4. **Security & Firewall**:
   - Whitelist only application backend IP addresses in MongoDB Atlas Network Access.

---

## 5. Graceful Shutdown & Health Checks

CampusFlow includes production lifecycle hooks in `server/src/server.js`:
- Intercepts `SIGINT` and `SIGTERM` signals.
- Stops accepting new HTTP & WebSocket connections.
- Allows pending queries and requests to finish (with a 10s fallback timeout).
- Gracefully disconnects Mongoose connections before process exit.

Health checks can be queried by load balancers / Kubernetes probes at `/api/health`:
```json
{
  "success": true,
  "status": "healthy",
  "environment": "production",
  "database": "connected",
  "uptime": 86400,
  "timestamp": "2026-08-23T00:00:00.000Z"
}
```
