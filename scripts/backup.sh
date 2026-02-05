#!/bin/bash

# Backup Kanban tasks to Google Drive

# Source directory (containing tasks.json)
SOURCE_DIR="/home/openclaw/clawd/kanban/data"
# Source file
SOURCE_FILE="tasks.json"
# Google Drive destination
DEST_DIR="gdrive:/ClawbotKanban"

# Log file
LOG_FILE="/home/openclaw/clawd/kanban/logs/backup.log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "$(date): Starting backup..." >> "$LOG_FILE"

# Perform sync
if rclone copy "$SOURCE_DIR/$SOURCE_FILE" "$DEST_DIR/" -v --log-file "$LOG_FILE"; then
  echo "$(date): Backup successful" >> "$LOG_FILE"
else
  echo "$(date): Backup failed" >> "$LOG_FILE"
  exit 1
fi
