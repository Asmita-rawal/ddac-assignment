#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release git apt-transport-https software-properties-common

curl -fsSL https://get.docker.com | sudo sh
sudo apt-get install -y docker-compose-plugin

sudo systemctl enable docker
sudo systemctl restart docker
sudo usermod -aG docker ubuntu

sudo mkdir -p /opt/safetrack
cd /opt/safetrack

if [ ! -d .git ]; then
  sudo rm -rf /opt/safetrack/* /opt/safetrack/.[!.]* /opt/safetrack/..?* 2>/dev/null || true
  sudo git clone https://github.com/Asmita-rawal/ddac-assignment.git .
else
  sudo git fetch origin
  sudo git checkout main || sudo git checkout master || true
  sudo git pull origin main || sudo git pull origin master || true
fi

APP_DIR=/opt/safetrack
if [ -d /opt/safetrack/safetrack ]; then
  APP_DIR=/opt/safetrack/safetrack
fi

if [ ! -f "$APP_DIR/docker-compose.yml" ]; then
  echo "docker-compose.yml not found in $APP_DIR" >&2
  ls -la "$APP_DIR" >&2 || true
  exit 1
fi

sudo chown -R ubuntu:ubuntu /opt/safetrack

cat > /tmp/safetrack.env <<'EOF'
NODE_ENV=production
PORT=5001
DB_HOST=db
DB_USER=safetrack
DB_PASSWORD=safetrack_password
DB_NAME=safetrack
JWT_SECRET=safetrack_secret_key_2024
EOF

sudo cp /tmp/safetrack.env "$APP_DIR/.env"

if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow 5001/tcp
  sudo ufw --force enable
fi

cd "$APP_DIR"
sudo docker compose up -d --build --remove-orphans

for i in $(seq 1 60); do
  if curl -fsS http://127.0.0.1:5001/api/test >/dev/null 2>&1; then
    echo "SafeTrack is up"
    exit 0
  fi
  echo "Waiting for SafeTrack to start... ($i/60)"
  sleep 10
done

echo "SafeTrack did not become healthy in time" >&2
sudo docker compose ps >&2 || true
sudo docker compose logs >&2 || true
exit 1
