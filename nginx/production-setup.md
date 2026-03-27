# Production Nginx Setup Guide

## Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install nginx certbot python3-certbot-nginx
```

## Configuration

1. Copy the configuration file:
```bash
sudo cp nginx/production.conf /etc/nginx/sites-available/mdijital
```

2. Create symlink:
```bash
sudo ln -s /etc/nginx/sites-available/mdijital /etc/nginx/sites-enabled/
```

3. Remove default site (optional):
```bash
sudo rm /etc/nginx/sites-enabled/default
```

4. Test configuration:
```bash
sudo nginx -t
```

5. Reload nginx:
```bash
sudo systemctl reload nginx
```

## SSL Certificate (Let's Encrypt)

1. Get SSL certificate:
```bash
sudo certbot --nginx -d mdijital.io -d www.mdijital.io
```

2. Auto-renewal (already configured in certbot):
```bash
sudo certbot renew --dry-run
```

## Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'
# Or specific ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Important Notes

- Update `server_name` in the config file with your actual domain
- Update SSL certificate paths after running certbot
- Make sure Docker container is running on port 3000
- Check logs: `sudo tail -f /var/log/nginx/mdijital-error.log`

## Docker Container

Make sure the Docker container exposes port 3000:
```yaml
ports:
  - "3000:3000"
```

## Monitoring

Check nginx status:
```bash
sudo systemctl status nginx
```

View access logs:
```bash
sudo tail -f /var/log/nginx/mdijital-access.log
```

