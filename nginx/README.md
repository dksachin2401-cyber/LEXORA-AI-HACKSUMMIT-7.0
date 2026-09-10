# LEXORA AI Nginx Reverse Proxy & TLS Configuration

## Overview
The Nginx service handles HTTPS termination, security header enforcement, rate limiting, and request routing for the LEXORA platform.

## Certificate Mount Setup
In production, place real SSL certificates in the host volume directory mapped to `/etc/nginx/certs/`:

- `/etc/nginx/certs/fullchain.pem` — Full Certificate Chain
- `/etc/nginx/certs/privkey.pem` — RSA/ECDSA Private Key

### Using Let's Encrypt (Certbot)
```bash
sudo certbot certonly --standalone -d yourdomain.gov.in
sudo cp /etc/letsencrypt/live/yourdomain.gov.in/fullchain.pem ./certs/
sudo cp /etc/letsencrypt/live/yourdomain.gov.in/privkey.pem ./certs/
```

> [!CAUTION]
> NEVER commit `.pem` certificate files or private keys into git repositories.
