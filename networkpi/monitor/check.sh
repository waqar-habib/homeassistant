#!/usr/bin/env bash
# DRAFT. Not installed, not enabled. Monitoring check for networkpi (D24).
# Checks HA, internet, DNS, own disk and memory. Read-only on the system.
# On failure: posts to ntfy (topic read from a file outside the repo).
# On success: pings a healthchecks.io URL (read from a file outside the repo).
# Secrets stay out of the repo: ~/.config/ntfy/topic and ~/.config/healthchecks/url.
set -u

HA_URL="${HA_URL:-http://192.168.1.36:8123/}"
DNS_NAME="${DNS_NAME:-cloudflare.com}"
INTERNET_HOST="${INTERNET_HOST:-1.1.1.1}"
DISK_MAX_PCT="${DISK_MAX_PCT:-80}"
MEM_MIN_MB="${MEM_MIN_MB:-200}"           # Phase B baseline is ~390 MB available
NTFY_SERVER="${NTFY_SERVER:-https://ntfy.sh}"
NTFY_TOPIC_FILE="${NTFY_TOPIC_FILE:-$HOME/.config/ntfy/topic}"
HC_URL_FILE="${HC_URL_FILE:-$HOME/.config/healthchecks/url}"
STATE_DIR="${STATE_DIR:-$HOME/.local/state/networkpi-monitor}"
REALERT_SECS="${REALERT_SECS:-21600}"      # repeat an unchanged alert every 6 h
DRY_RUN="${DRY_RUN:-0}"                    # 1 = print, never post or ping

mkdir -p "$STATE_DIR"
failures=()

# HA answers (any 2xx/3xx; /onboarding or login redirect counts as up)
code=$(curl -s -o /dev/null -m 8 -w '%{http_code}' "$HA_URL" || true)
case "$code" in 2*|3*) ;; *) failures+=("HA $HA_URL returned '${code:-none}'");; esac

# Internet and DNS are separate so the alert says which one broke
ping -c1 -W3 "$INTERNET_HOST" >/dev/null 2>&1 || failures+=("no internet: ping $INTERNET_HOST failed")
getent hosts "$DNS_NAME" >/dev/null 2>&1 || failures+=("DNS lookup failed for $DNS_NAME")

# Own disk and memory
disk=$(df --output=pcent / | tail -1 | tr -dc '0-9')
[ "${disk:-100}" -le "$DISK_MAX_PCT" ] || failures+=("disk / is ${disk}% used (max $DISK_MAX_PCT)")
mem=$(free -m | awk '/^Mem:/{print $7}')
[ "${mem:-0}" -ge "$MEM_MIN_MB" ] || failures+=("available memory ${mem} MB (min $MEM_MIN_MB)")

read_file() { [ -r "$1" ] && tr -d '[:space:]' < "$1"; }

if [ "${#failures[@]}" -gt 0 ]; then
  msg=$(printf '%s\n' "${failures[@]}")
  echo "FAIL:"; echo "$msg"
  sig=$(printf '%s' "$msg" | md5sum | cut -d' ' -f1)
  now=$(date +%s); last=0; last_sig=""
  [ -r "$STATE_DIR/alert" ] && read -r last last_sig < "$STATE_DIR/alert"
  # Alert on a new problem, or the same one after REALERT_SECS
  if [ "$sig" != "$last_sig" ] || [ $((now - last)) -ge "$REALERT_SECS" ]; then
    topic=$(read_file "$NTFY_TOPIC_FILE" || true)
    if [ "$DRY_RUN" = 1 ]; then echo "(dry run) would post to ntfy"
    elif [ -n "$topic" ]; then
      curl -s -m 10 -H "Title: networkpi check failed" -H "Priority: high" -d "$msg" "$NTFY_SERVER/$topic" >/dev/null \
        && echo "$now $sig" > "$STATE_DIR/alert"
    else echo "no ntfy topic file at $NTFY_TOPIC_FILE; alert not sent" >&2; fi
  fi
  # Tell healthchecks it failed (explicit), if configured
  hc=$(read_file "$HC_URL_FILE" || true)
  [ "$DRY_RUN" = 1 ] || { [ -n "$hc" ] && curl -s -m 10 "$hc/fail" >/dev/null; }
  exit 1
fi

echo "OK: HA $code, internet, DNS, disk ${disk}%, memory ${mem} MB"
rm -f "$STATE_DIR/alert"
hc=$(read_file "$HC_URL_FILE" || true)
if [ "$DRY_RUN" = 1 ]; then echo "(dry run) would ping healthchecks"
elif [ -n "$hc" ]; then curl -s -m 10 "$hc" >/dev/null
else echo "no healthchecks URL file at $HC_URL_FILE; success ping skipped" >&2; fi
exit 0
