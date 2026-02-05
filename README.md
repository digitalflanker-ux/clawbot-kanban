# Clawbot Kanban

A local Kanban board for task management, built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

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
- ✅ Real-time auto-save

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/digitalflanker-ux/clawbot-kanban.git
   cd clawbot-kanban
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Managing Tasks

- **Drag and drop**: Move tasks between columns by dragging
- **Add task**: Click the "Add Task" button in the header
- **Edit task**: Click the filter icon (⋮) on any task card
- **Delete task**: Use the Delete button in the edit modal
- **Toggle subtask**: Click on a subtask to mark it complete

### Filtering

- **Search**: Type in the search box to find tasks by title, description, or tags
- **Priority filter**: Use the dropdown to filter by priority level

## 💾 Data Storage

- Tasks are stored in `data/tasks.json`
- Changes are automatically saved when you drag, edit, or delete tasks
- Data includes tasks, columns, and full task metadata

### Backup to Google Drive

```bash
# Manual backup
rclone sync /home/openclaw/clawd/kanban/data/tasks.json gdrive:/ClawbotKanban/tasks.json

# Using the backup script
./scripts/backup.sh
```

### Restore from Google Drive

```bash
./scripts/restore.sh
```

## 🤝 Collaboration

- **Fernando**: Use the web UI to visualize and organize tasks
- **Clawdbot**: Can read/write `data/tasks.json` to add/edit tasks via conversation
- **Both**: Changes are saved to the same JSON file, enabling seamless collaboration

## 📊 Data Structure

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

## 🛣️ API Routes

### GET /api/tasks

Returns all tasks and column configuration.

### PUT /api/tasks

Updates all tasks and column configuration.
Expects: `KanbanData` object
Returns: `{ success: true }`

## 🔧 Configuration

### Automatic Backup

Add to crontab to backup every 10 minutes:

```bash
crontab -e
# Add this line:
*/10 * * * * /home/openclaw/clawd/kanban/scripts/backup.sh
```

### Google Drive Setup

1. Configure rclone with Google Drive:
   ```bash
   rclone config create gdrive drive
   ```

2. Test connection:
   ```bash
   rclone ls gdrive:
   ```

3. Ensure backup scripts work:
   ```bash
   ./scripts/backup.sh
   ./scripts/restore.sh
   ```

## 🚀 Build for Production

```bash
npm run build
npm start
```

## 📝 Project Structure

```
clawbot-kanban/
├── app/
│   ├── api/tasks/route.ts    # API endpoints
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Main Kanban component
├── data/
│   └── tasks.json           # Task data (persisted)
├── lib/
│   └── types.ts            # TypeScript types
├── scripts/
│   ├── backup.sh            # Backup to Google Drive
│   └── restore.sh          # Restore from Google Drive
└── public/                 # Static assets
```

## 🗑️ Cleanup

To remove old backups:

```bash
# Delete backups older than 30 days
find /home/openclaw/clawd/kanban/data/backups -name "*.bak" -mtime +30 -delete
```

## 📝 License

MIT

---

Built with ❤️ for task management

