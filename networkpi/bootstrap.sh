#!/usr/bin/env bash
# networkpi base hardening. Raspberry Pi OS Lite (Debian 13 trixie).
# Run as the networkpi user, at home. Safe to re-run.
set -euo pipefail

LAN="192.168.1.0/24"
PI5="192.168.1.36"

echo "== 1. Update and install packages"
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get -y full-upgrade
sudo DEBIAN_FRONTEND=noninteractive apt-get -y install \
  ufw unattended-upgrades tmux git gh curl ca-certificates samba

echo "== 2. Timezone"
sudo timedatectl set-timezone America/Chicago

echo "== 3. SSH: keys only, no root login"
sudo tee /etc/ssh/sshd_config.d/10-hardening.conf >/dev/null <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
EOF
sudo sshd -t
sudo systemctl try-reload-or-restart ssh

echo "== 4. Firewall: deny inbound; LAN may SSH; only the Pi 5 may reach Samba"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from "$LAN" to any port 22 proto tcp
sudo ufw allow from "$PI5" to any port 445 proto tcp
sudo ufw --force enable

echo "== 5. Automatic security updates; reboot at 04:30 only when required"
sudo tee /etc/apt/apt.conf.d/20auto-upgrades >/dev/null <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
sudo tee /etc/apt/apt.conf.d/52networkpi-unattended >/dev/null <<'EOF'
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:30";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

echo "== 6. Journal capped at 100 MB; hardware watchdog reboots a hung system"
sudo mkdir -p /etc/systemd/journald.conf.d /etc/systemd/system.conf.d
sudo tee /etc/systemd/journald.conf.d/10-cap.conf >/dev/null <<'EOF'
[Journal]
Storage=persistent
SystemMaxUse=100M
EOF
sudo tee /etc/systemd/system.conf.d/10-watchdog.conf >/dev/null <<'EOF'
[Manager]
RuntimeWatchdogSec=15
RebootWatchdogSec=2min
EOF
sudo systemctl restart systemd-journald
sudo systemctl daemon-reexec

echo "== 7. Keep Raspberry Pi Connect running after a reboot without a login"
sudo loginctl enable-linger "$USER"

echo "== 8. Samba share for HA backups (SMB3 only, Pi 5 only)"
id habackup >/dev/null 2>&1 || sudo useradd --system --no-create-home --shell /usr/sbin/nologin habackup
sudo mkdir -p /srv/ha-backups/daily /srv/ha-backups/weekly
sudo chown -R habackup:habackup /srv/ha-backups
sudo chmod 750 /srv/ha-backups
sudo tee /etc/samba/smb.conf >/dev/null <<EOF
[global]
  server role = standalone server
  server min protocol = SMB3
  hosts allow = 127.0.0.1 $PI5
  hosts deny = ALL
  disable netbios = yes
  smb ports = 445
  map to guest = never
  max log size = 1000

[ha-backups]
  path = /srv/ha-backups
  valid users = habackup
  read only = no
  create mask = 0640
  directory mask = 0750
EOF
sudo systemctl disable --now nmbd 2>/dev/null || true
sudo systemctl enable --now smbd
sudo systemctl restart smbd

echo "== 9. Unprivileged user for Claude Code (no sudo)"
id claude >/dev/null 2>&1 || sudo useradd --create-home --shell /bin/bash claude
sudo loginctl enable-linger claude

echo "== Verify"
sudo ufw status verbose
sudo sshd -T | grep -E '^(passwordauthentication|permitrootlogin) '
ls -l /dev/watchdog || echo "WARN: no /dev/watchdog"
vcgencmd get_throttled
timedatectl | grep -E 'Time zone|synchronized'
systemctl is-active smbd
sudo unattended-upgrade --dry-run 2>&1 | tail -3
free -m
echo "Next: run 'sudo smbpasswd -a habackup' and store the password in Apple Keychain. Then reboot and confirm Raspberry Pi Connect reconnects."
