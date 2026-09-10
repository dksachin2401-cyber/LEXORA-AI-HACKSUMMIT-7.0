# LEXORA AI Judicial Intelligence Platform — Production Deployment Guide

---

## 1. System Requirements & Architecture

### Server Hardware Specifications
- **CPU**: 4 vCPUs minimum (8 vCPUs recommended for concurrent PyMuPDF/Sentence Transformers embedding workload)
- **RAM**: 8 GB RAM minimum (16 GB recommended)
- **Storage**: 50 GB NVMe SSD minimum (for SQLite DB, uploads, ChromaDB persistence, backups)
- **OS**: Ubuntu 22.04 LTS or Debian 12 (Linux container host)

### Infrastructure Network Topography
```
                  INTERNET
                     |
                     v (Port 80 / 443)
              +--------------+
              | Nginx Reverse|
              | Proxy & TLS  |
              +--------------+
                     |
                     v (Port 5000 - Internal)
              +--------------+
              | Express API  |
              | Gateway (Node)|
              +--------------+
                     |
         +-----------+-----------+
         |                       |
         v                       v
    +---------+          +---------------+
    | SQLite  |          | FastAPI AI    |
    | Data    |          | Service (Py)  |
    +---------+          +---------------+
                                 |
                            +----+----+
                            |         |
                            v         v
                        ChromaDB    LLM API
```

> **Security Guarantee**: Only Nginx (Ports 80 & 443) is exposed publicly. Express, FastAPI, ChromaDB, and SQLite operate strictly within private Docker bridge networks.

---

## 2. Environment & Secrets Setup

1. Copy production template to `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```

2. Generate cryptographically strong random secrets for production:
   ```bash
   # JWT_SECRET (Minimum 64 chars)
   openssl rand -hex 32

   # ENCRYPTION_KEY (Minimum 32 chars - INDEPENDENT from JWT_SECRET)
   openssl rand -hex 32

   # INTERNAL_API_KEY (Minimum 32 chars)
   openssl rand -hex 32

   # BACKUP_ENCRYPTION_KEY (Minimum 32 chars - INDEPENDENT from ENCRYPTION_KEY)
   openssl rand -hex 32
   ```

3. Update `server/.env`:
   ```env
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://lexora.yourcourt.gov.in
   FASTAPI_BASE_URL=http://fastapi:8000
   DATABASE_URL="file:/app/prisma/dev.db"

   JWT_SECRET=<your-generated-jwt-secret>
   ENCRYPTION_KEY=<your-generated-encryption-key>
   INTERNAL_API_KEY=<your-generated-internal-api-key>
   BACKUP_ENCRYPTION_KEY=<your-generated-backup-key>
   ```

---

## 3. TLS Certificate Configuration

Mount production SSL/TLS certificates into `./nginx/certs/`:
- `fullchain.pem`
- `privkey.pem`

### Automated Renewal via Let's Encrypt / Certbot:
```bash
sudo certbot certonly --standalone -d lexora.yourcourt.gov.in
sudo cp /etc/letsencrypt/live/lexora.yourcourt.gov.in/fullchain.pem ./nginx/certs/
sudo cp /etc/letsencrypt/live/lexora.yourcourt.gov.in/privkey.pem ./nginx/certs/
```

---

## 4. Container Deployment & Pre-Flight Check

1. Run the Pre-Flight Configuration Validator:
   ```bash
   npx tsx scripts/check-production-config.ts
   ```
   *Output must report `PRODUCTION CONFIGURATION: PASS` before proceeding.*

2. Launch production containers:
   ```bash
   docker compose -f docker-compose.production.yml up --build -d
   ```

3. Verify Container Health:
   ```bash
   docker compose -f docker-compose.production.yml ps
   ```

---

## 5. Health, Observability & Readiness Monitoring

- **Liveness Probe**: `GET https://lexora.yourcourt.gov.in/api/health`
- **Readiness Probe**: `GET https://lexora.yourcourt.gov.in/api/ready`
- **Admin System Dashboard**: Log in as `ADMIN` and navigate to `/admin/system-health`

---

## 6. Backup, Restore & Disaster Recovery

### Automated Database Backup
```bash
bash scripts/backup_database.sh
```

### Database Restore Procedure
```bash
CONFIRM_RESTORE=yes bash scripts/restore_database.sh backups/lexora_db_backup_TIMESTAMP.enc
```

### ChromaDB Corpus Backup & Restore
```bash
# Backup
python scripts/backup_chroma.py

# Restore
CONFIRM_RESTORE=yes python scripts/restore_chroma.py backups/lexora_chroma_backup_TIMESTAMP.json
```

### Scheduled Cron Automation (Daily at 02:00 AM)
```cron
0 2 * * * cd /opt/lexora-ai && bash scripts/backup_database.sh && python scripts/backup_chroma.py && bash scripts/backup_retention.sh >> /var/log/lexora_backup.log 2>&1
```

---

## 7. Update & Rollback Procedures

### Rolling Application Update
```bash
git pull origin main
docker compose -f docker-compose.production.yml up --build -d
```

### Safe Emergency Rollback
```bash
docker compose -f docker-compose.production.yml down
# Restore database snapshot if migration occurred
CONFIRM_RESTORE=yes bash scripts/restore_database.sh backups/LAST_KNOWN_GOOD.enc
docker compose -f docker-compose.production.yml up -d
```
