#!/usr/bin/env bash
# Read-only health baseline for networkpi. Tier 0. No secrets, no changes, one local HTTP check.
# Usage (from the repo root): bash networkpi/health.sh
# Writes docs/sessions/<date>-networkpi-health.md and prints it.
set -u
out="${1:-docs/sessions/$(date +%F)-networkpi-health.md}"
sec() { echo; echo "## $1"; echo '```'; }
end() { echo '```'; }

share_path=$(testparm -s 2>/dev/null | sed -n '/^\[ha-backups\]/,/^\[/p' | awk -F'= *' '/path/{print $2; exit}')

{
  echo "# networkpi health baseline $(date '+%F %H:%M %Z')"
  sec "uptime";                           uptime; end
  sec "throttled (0x0 = good, I11)";      vcgencmd get_throttled 2>&1; end
  sec "memory (I12: keep available > 300 MB)"; free -m; end
  sec "disk /";                           df -h /; end
  sec "dmesg: oom, under-voltage, throttle"; dmesg 2>&1 | grep -i -E 'oom|under-voltage|throttl' | tail -20; echo "(end of matches)"; end
  sec "claude-remote.service (Phase B)";  systemctl --user status claude-remote.service --no-pager 2>&1 | head -15; end
  sec "tmux sessions";                    tmux ls 2>&1; end
  sec "claude version";                   "$HOME/.local/bin/claude" --version 2>&1; end
  sec "linger (Phase B needs yes)";       loginctl show-user "$(id -un)" -p Linger 2>&1; end
  sec "ssh and smbd";                     systemctl is-active ssh smbd 2>&1; end
  sec "ufw";                              sudo -n ufw status 2>&1 | head -20; end
  sec "ha-backups share";                 echo "path: ${share_path:-not found}"; [ -n "${share_path:-}" ] && { ls -1 "$share_path" | wc -l; du -sh "$share_path"; ls -t "$share_path" | head -3; }; end
  sec "Pi 5 reachable (HTTP code)";       curl -s -o /dev/null -w '%{http_code}\n' --max-time 5 http://192.168.1.36:8123/ 2>&1; end
} > "$out"

echo "wrote $out"
cat "$out"
