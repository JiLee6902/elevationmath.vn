#!/usr/bin/env bash
# First-time server bootstrap for a fresh Contabo (or any Ubuntu 24.04) VPS.
# Installs Docker, creates a non-root `deploy` user, locks down SSH, and opens
# only the ports we need. Run ONCE as root right after the VPS is provisioned:
#
#   scp scripts/server-setup.sh root@<IP>:/tmp/
#   ssh root@<IP> 'bash /tmp/server-setup.sh "ssh-ed25519 AAAA... your-key"'
#
# Pass your PUBLIC SSH key as the first argument (or via CI_DEPLOY_KEY env var).
# After it finishes, log in as `deploy` and follow DEPLOY.md from section 3.
set -euo pipefail

# --- Public key that will be authorized for the `deploy` user (and CI) ---
PUBKEY="${1:-${CI_DEPLOY_KEY:-}}"
if [[ -z "$PUBKEY" ]]; then
  echo "ERROR: provide your public SSH key as arg 1 or CI_DEPLOY_KEY env var." >&2
  echo "Example: bash server-setup.sh \"\$(cat ~/.ssh/id_ed25519.pub)\"" >&2
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: run this as root on the fresh VPS." >&2
  exit 1
fi

echo ">>> Updating base packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends ca-certificates curl git ufw

echo ">>> Installing Docker (official convenience script)"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo ">>> Creating non-root deploy user"
if ! id deploy >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" deploy
fi
usermod -aG docker deploy

echo ">>> Authorizing SSH key for deploy"
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
echo "$PUBKEY" > /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

echo ">>> Configuring firewall (SSH + HTTP + HTTPS only)"
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

echo ">>> Disabling SSH password login (key-only)"
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh || systemctl restart sshd || true

cat <<'EOF'

>>> Done. Next steps (see DEPLOY.md section 3+):
    ssh deploy@<IP>
    git clone <repo-url> mathverse && cd mathverse
    cp .env.production.example .env && nano .env   # set DOMAIN + rotate all secrets
    docker compose up -d --build
    docker compose exec app npx drizzle-kit push
    docker compose exec app npx tsx src/lib/db/seed.ts
EOF
