# Clawbot Kanban

A local Kanban board for task management, built with Next.js.

## Features

- ✅ Drag and drop tasks between columns
- ✅ Create, edit, and delete tasks
- ✅ Task priorities (Critical, High, Medium, Low)
- ✅ Due dates
- ✅ Subtasks with completion tracking
- ✅ Tags for categorization
- ✅ Search tasks
- ✅ Filter by priority
- ✅ Data persisted to JSON file
- ✅ Google Drive backup integration

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Data Storage

- Tasks are stored in `data/tasks.json`
- Changes are automatically saved when you drag, edit, or delete tasks
- Backup to Google Drive via rclone:

  ```bash
  rclone sync /home/openclaw/clawd/kanban/data/tasks.json gdrive:/ClawbotKanban/tasks.json
  ```

## Collaboration

- **Fernando**: Use the web UI to visualize and organize tasks
- **Clawdbot**: Can read/write `data/tasks.json` to add/edit tasks via conversation

## Data Structure

### Task
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "priority": "low" | "medium" | "high" | "critical",
  "dueDate": "string | null",
  "column": "backlog" | "in-progress" | "review" | "done",
  "subtasks": [
    {
      "id": "string",
      "title": "string",
      "completed": boolean
    }
  ],
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)",
  "tags": ["string"]
}
```

### Columns
- **Backlog**: Tasks not started yet
- **In Progress**: Currently working on
- **Review**: Ready for review
- **Done**: Completed tasks

## API Routes

### GET /api/tasks
Returns all tasks and column configuration.

### PUT /api/tasks
Updates all tasks and column configuration.
Expects: `KanbanData` object
Returns: `{ success: true }`

## Backup Script

To automatically backup tasks to Google Drive, add this to crontab:

```bash
# Backup every 10 minutes
*/10 * * * * /home/openclaw/clawd/kanban/scripts/backup.sh
```

Create `scripts/backup.sh`:
```bash
#!/bin/bash
rclone sync /home/openclaw/clawd/kanban/data/tasks.json gdrive:/ClawbotKanban/tasks.json
```
