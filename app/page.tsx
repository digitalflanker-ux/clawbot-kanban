'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, DropResult, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Search, Filter, Calendar, Tag, CheckSquare2, Square } from 'lucide-react';
import type { Task, Subtask, KanbanData, Priority, Column } from '@/lib/types';

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const COLUMN_COLORS = {
  backlog: 'bg-gray-50 border-gray-200',
  'in-progress': 'bg-blue-50 border-blue-200',
  review: 'bg-yellow-50 border-yellow-200',
  done: 'bg-green-50 border-green-200',
};

export default function Home() {
  const [data, setData] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/tasks');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: KanbanData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (response.ok) {
        setData(newData);
      }
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !data) return;

    const { source, destination, draggableId } = result;
    const sourceColumn: Column = source.droppableId as Column;
    const destColumn: Column = destination.droppableId as Column;

    const newColumns = { ...data.columns };
    const sourceTaskIds = [...newColumns[sourceColumn].taskIds];
    const destTaskIds = [...newColumns[destColumn].taskIds];

    if (sourceColumn === destColumn) {
      const [moved] = sourceTaskIds.splice(source.index, 1);
      destTaskIds.splice(destination.index, 0, moved);
    } else {
      const [moved] = sourceTaskIds.splice(source.index, 1);
      destTaskIds.splice(destination.index, 0, moved);

      const updatedTask = data.tasks.find((t) => t.id === draggableId);
      if (updatedTask) {
        updatedTask.column = destColumn;
        updatedTask.updatedAt = new Date().toISOString();
      }
    }

    newColumns[sourceColumn].taskIds = sourceTaskIds;
    newColumns[destColumn].taskIds = destTaskIds;

    saveData({ ...data, columns: newColumns });
  };

  const addTask = () => {
    if (!data) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Task',
      description: '',
      priority: 'medium',
      dueDate: null,
      column: 'backlog',
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };
    const newTasks = [...data.tasks, newTask];
    const newColumns = { ...data.columns };
    newColumns.backlog.taskIds = [...newColumns.backlog.taskIds, newTask.id];
    saveData({ ...data, tasks: newTasks, columns: newColumns });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (!data) return;
    const newTasks = data.tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    saveData({ ...data, tasks: newTasks });
  };

  const deleteTask = (taskId: string) => {
    if (!data) return;
    const newTasks = data.tasks.filter((t) => t.id !== taskId);
    const newColumns = { ...data.columns };
    for (const col of Object.values(newColumns)) {
      col.taskIds = col.taskIds.filter((id) => id !== taskId);
    }
    saveData({ ...data, tasks: newTasks, columns: newColumns });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    if (!data) return;
    const newTasks = data.tasks.map((t) => {
      if (t.id === taskId) {
        const newSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: newSubtasks, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    saveData({ ...data, tasks: newTasks });
  };

  const filteredTasks = data?.tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Kanban Board</h1>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={addTask}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-4 gap-6">
            {Object.values(data?.columns || {}).map((column) => (
              <div key={column.id} className={`${COLUMN_COLORS[column.id as Column]} border rounded-lg p-4`}>
                <h2 className="font-semibold text-lg mb-4 flex items-center justify-between">
                  {column.title}
                  <span className="text-sm text-gray-500">{column.taskIds.length}</span>
                </h2>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[500px] space-y-3 ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {column.taskIds.map((taskId) => {
                        const task = filteredTasks?.find((t) => t.id === taskId);
                        if (!task) return null;

                        const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
                        const subtaskProgress = task.subtasks.length > 0
                          ? `${completedSubtasks}/${task.subtasks.length}`
                          : null;

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={task.column === column.id ? column.taskIds.indexOf(taskId) : 0}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-card bg-white p-4 rounded-lg shadow-sm border-2 ${
                                  snapshot.isDragging ? 'border-blue-500' : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium flex-1">{task.title}</h3>
                                  <button
                                    onClick={() => setEditingTask(task)}
                                    className="text-gray-400 hover:text-gray-600 ml-2"
                                  >
                                    <Filter size={16} />
                                  </button>
                                </div>

                                {task.description && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                                )}

                                <div className="flex items-center gap-2 mb-3">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                  {subtaskProgress && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <CheckSquare2 size={14} />
                                      {subtaskProgress}
                                    </span>
                                  )}
                                </div>

                                {task.subtasks.length > 0 && (
                                  <div className="space-y-1 mb-3">
                                    {task.subtasks.map((subtask) => (
                                      <button
                                        key={subtask.id}
                                        onClick={() => toggleSubtask(task.id, subtask.id)}
                                        className="flex items-center gap-2 text-sm w-full text-left hover:bg-gray-50 p-1 rounded"
                                      >
                                        {subtask.completed ? (
                                          <CheckSquare2 size={14} className="text-green-500" />
                                        ) : (
                                          <Square size={14} className="text-gray-400" />
                                        )}
                                        <span className={subtask.completed ? 'line-through text-gray-400' : ''}>
                                          {subtask.title}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {task.tags.map((tag) => (
                                      <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                    <Calendar size={12} />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Task</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value || null })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editingTask.tags.join(', ')}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subtasks</label>
                  {editingTask.subtasks.map((subtask, index) => (
                    <div key={subtask.id} className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => {
                          const newSubtasks = editingTask.subtasks.map((st, i) =>
                            i === index ? { ...st, completed: !st.completed } : st
                          );
                          setEditingTask({ ...editingTask, subtasks: newSubtasks });
                        }}
                        className="text-gray-500"
                      >
                        {subtask.completed ? <CheckSquare2 size={18} /> : <Square size={18} />}
                      </button>
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => {
                          const newSubtasks = editingTask.subtasks.map((st, i) =>
                            i === index ? { ...st, title: e.target.value } : st
                          );
                          setEditingTask({ ...editingTask, subtasks: newSubtasks });
                        }}
                        className="flex-1 px-2 py-1 border rounded focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const newSubtasks = editingTask.subtasks.filter((_, i) => i !== index);
                          setEditingTask({ ...editingTask, subtasks: newSubtasks });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditingTask({
                      ...editingTask,
                      subtasks: [...editingTask.subtasks, {
                        id: Date.now().toString(),
                        title: 'New subtask',
                        completed: false
                      }]
                    })}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    + Add subtask
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    updateTask(editingTask.id, editingTask);
                    setEditingTask(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteTask(editingTask.id);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 text-red-500 hover:text-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
