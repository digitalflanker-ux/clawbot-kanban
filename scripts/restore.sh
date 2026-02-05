#!/bin/bash

# Restore Kanban tasks from Google Drive

# Destination directory (containing tasks.json)
DEST_DIR="/home/openclaw/clawd/kanban/data"
# Source on Google Drive
SOURCE="gdrive:/ClawbotKanban/tasks.json"
# Backup local file before restore
BACKUP_DIR="/home/openclaw/clawd/kanban/data/backups"
mkdir -p "$BACKUP_DIR"

# Log file
LOG_FILE="/home/openclaw/clawd/kanban/logs/restore.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "$(date): Starting restore..." >> "$LOG_FILE"

# Backup current file
if [ -f "$DEST_DIR/tasks.json" ]; then
  BACKUP_FILE="$BACKUP_DIR/tasks.json.$(date +%Y%m%d_%H%M%S).bak"
  cp "$DEST_DIR/tasks.json" "$BACKUP_FILE"
  echo "$(date): Backed up current file to $BACKUP_FILE" >> "$LOG_FILE"
fi

# Perform restore
if rclone copy "$SOURCE" "$DEST_DIR/" -v --log-file "$LOG_FILE"; then
  echo "$(date): Restore successful" >> "$LOG_FILE"
else
  echo "$(date): Restore failed" >> "$LOG_FILE"
  exit 1
fi
