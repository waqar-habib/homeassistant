#!/usr/bin/env bash
# DRAFT. Not installed, not enabled. Weekly copy of the newest HA backup (D19: keep 4).
# HA writes its backups (<slug>.tar) to the share ROOT (confirmed 2026-11-08), not daily/.
# Default is a dry run. Pass --apply to copy and prune.
# Never touches the source files. Prunes only weekly-*.tar inside the weekly folder.
# Needs read access to the share (owner habackup, mode 750) and write access to weekly/.
set -euo pipefail
cd /   # the caller's cwd may be unreadable by habackup; find would fail and set -e would exit silently

SRC="${SRC:-/srv/ha-backups}"
DEST="${DEST:-/srv/ha-backups/weekly}"
KEEP="${KEEP:-4}"
APPLY=0
[ "${1:-}" = "--apply" ] && APPLY=1
run() { if [ "$APPLY" = 1 ]; then "$@"; else echo "(dry run) $*"; fi; }

[ -r "$SRC" ] || { echo "cannot read $SRC (run as habackup or root)" >&2; exit 2; }
[ -d "$DEST" ] || { echo "missing $DEST" >&2; exit 2; }

# Newest HA backup in the root: top-level *.tar only, newest mtime
newest=$(find "$SRC" -maxdepth 1 -type f -name '*.tar' -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)
[ -n "$newest" ] || { echo "no .tar backups in $SRC" >&2; exit 3; }

# Refuse a backup younger than 2 minutes (HA may still be writing it) or older than 3 days (daily job stalled)
age=$(( $(date +%s) - $(stat -c %Y "$newest") ))
[ "$age" -ge 120 ] || { echo "newest backup is ${age}s old; may still be writing" >&2; exit 4; }
[ "$age" -le 259200 ] || { echo "newest backup is $((age/3600)) h old; daily backups look stalled" >&2; exit 5; }

week=$(date -d "@$(stat -c %Y "$newest")" +%G-W%V)
target="$DEST/weekly-$week-$(basename "$newest")"

if [ -e "$target" ]; then
  echo "week $week already copied: $(basename "$target")"
else
  size=$(stat -c %s "$newest")
  avail=$(df --output=avail -B1 "$DEST" | tail -1)
  [ "$avail" -gt $((size * 2)) ] || { echo "not enough free space for a copy" >&2; exit 6; }
  echo "copy $(basename "$newest") ($((size/1048576)) MB) -> $target"
  run cp --preserve=timestamps "$newest" "$target.part"
  run mv "$target.part" "$target"
  if [ "$APPLY" = 1 ] && [ "$(stat -c %s "$target")" != "$size" ]; then
    echo "size mismatch after copy; removing $target" >&2; rm -f "$target"; exit 7
  fi
fi

# Keep the newest $KEEP weekly copies
mapfile -t old < <(find "$DEST" -maxdepth 1 -type f -name 'weekly-*.tar' -printf '%T@ %p\n' | sort -rn | tail -n +$((KEEP + 1)) | cut -d' ' -f2-)
for f in "${old[@]}"; do echo "prune $(basename "$f")"; run rm -- "$f"; done
exit 0
