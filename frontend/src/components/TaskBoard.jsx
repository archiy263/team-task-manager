/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Edit, Eye, Plus, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
} from "../redux/features/task/taskSlice";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

axios.defaults.withCredentials = true;

const API_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

/// ---- Priority color helpers ----
const priorityBadge = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50",
  Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50",
};

const columnStyle = {
  todo: { header: "bg-gradient-to-r from-slate-600 to-slate-500", border: "border-slate-200 dark:border-slate-800", bg: "bg-slate-50/50 dark:bg-slate-900/20" },
  inProgress: { header: "bg-gradient-to-r from-blue-600 to-cyan-500", border: "border-blue-200 dark:border-blue-900/30", bg: "bg-blue-50/30 dark:bg-blue-900/10" },
  done: { header: "bg-gradient-to-r from-emerald-500 to-green-500", border: "border-green-200 dark:border-green-900/30", bg: "bg-green-50/30 dark:bg-green-900/10" },
};

// ---- Task Detail Modal ----
const TaskDetailModal = ({ task, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all">
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl w-full max-w-md transform transition-all scale-100">
      <h2 className="text-2xl font-extrabold mb-4 text-gray-800 dark:text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{task.title}</h2>
      <div className="space-y-3 text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl">
        <p><strong>Description:</strong> {task.description || "—"}</p>
        <p><strong>Status:</strong> {task.status}</p>
        <p>
          <strong>Priority:</strong>{" "}
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityBadge[task.priority]}`}>
            {task.priority}
          </span>
        </p>
        <p>
          <strong>Due Date:</strong>{" "}
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Not set"}
        </p>
        {task.project && (
          <p><strong>Project:</strong> {task.project?.name || task.project}</p>
        )}
        {task.assignedTo && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
            <strong>Assigned To:</strong>
            <img src={task.assignedTo?.profilePicture} alt="" className="w-6 h-6 rounded-full" />
            <span>
              {task.assignedTo?.firstname
                ? `${task.assignedTo.firstname} ${task.assignedTo.lastname}`
                : task.assignedTo}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-xl font-bold hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
      >
        Close
      </button>
    </div>
  </div>
);

// ---- Edit Task Modal ----
const EditTaskModal = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-extrabold mb-5 text-gray-800 dark:text-slate-100">Edit Task</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Task Title</label>
            <input
              type="text"
              value={editedTask.title}
              placeholder="Title"
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Description</label>
            <textarea
              value={editedTask.description || ""}
              placeholder="Description"
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Status</label>
              <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Priority</label>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Due Date</label>
            <input
              type="date"
              value={editedTask.dueDate ? editedTask.dueDate.split("T")[0] : ""}
              onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-slate-700">
          <button
            onClick={onClose}
            className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Create Task Modal ----
const CreateTaskModal = ({ onClose, onCreate, projectId }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const payload = { ...form };
      if (projectId) payload.project = projectId;
      const res = await axios.post(`${API_URL}/api/v1/tasks`, payload);
      onCreate(res.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-extrabold mb-5 text-gray-800 dark:text-slate-100">Add New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Task Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="E.g., Update landing page"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Description</label>
            <textarea
              placeholder="Task details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 block">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full p-3 border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow hover:shadow-lg disabled:opacity-60 transition-all duration-300"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Main TaskBoard Component ----
const TaskBoard = ({ projectId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tasks = useSelector((state) => state.tasks.tasks);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const url = projectId
          ? `${API_URL}/api/v1/tasks?project=${projectId}`
          : `${API_URL}/api/v1/tasks`;
        const response = await axios.get(url);
        dispatch(setTasks(response.data));
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          dispatch(logout());
          navigate("/login");
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchTasks();
  }, [dispatch, navigate, projectId]);

  const getFilteredAndSorted = (statusFilter) => {
    let filtered = tasks
      .filter((task) => task.status === statusFilter)
      .filter(
        (task) =>
          task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (sortBy === "alphabetical") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      filtered = [...filtered].sort(
        (a, b) => order[a.priority] - order[b.priority]
      );
    } else if (sortBy === "dueDate") {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
      );
    }
    return filtered;
  };

  const columns = {
    todo: {
      id: "todo",
      title: "TODO",
      tasks: getFilteredAndSorted("To Do"),
    },
    inProgress: {
      id: "inProgress",
      title: "IN PROGRESS",
      tasks: getFilteredAndSorted("In Progress"),
    },
    done: {
      id: "done",
      title: "DONE",
      tasks: getFilteredAndSorted("Done"),
    },
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const task = columns[source.droppableId].tasks[source.index];
    const newStatus =
      destination.droppableId === "inProgress"
        ? "In Progress"
        : destination.droppableId === "done"
        ? "Done"
        : "To Do";

    const updatedTask = { ...task, status: newStatus };
    dispatch(updateTask(updatedTask)); // optimistic

    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${task._id}`,
        { status: newStatus }
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      dispatch(updateTask(task)); // revert
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      }
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/v1/tasks/${taskId}`);
      dispatch(removeTask(taskId));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      }
    }
  };

  const handleEditSave = async (updatedTask) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${updatedTask._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      }
    }
  };

  const handleCreate = (newTask) => {
    dispatch(addTask(newTask));
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-slate-400">
        <ClipLoader color="#6366f1" size={48} />
        <p className="mt-3 text-sm">Loading tasks...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
        <AlertCircle size={20} /> Error: {error}
      </div>
    );

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} /> Add Task
        </button>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search tasks..."
            className="border-gray-200 dark:border-slate-700 border bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-slate-200 transition-all min-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border-gray-200 dark:border-slate-700 border bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 dark:text-slate-200 transition-all"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recent</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-5">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="flex-1 min-w-[280px] flex flex-col">
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-t-2xl text-white font-bold text-sm shadow-sm ${columnStyle[column.id].header}`}
              >
                <span className="tracking-wide uppercase">{column.title}</span>
                <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs shadow-sm">
                  {column.tasks.length}
                </span>
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`rounded-b-2xl p-3 min-h-[200px] flex-1 transition-all duration-300 ${
                      snapshot.isDraggingOver
                        ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-100 dark:ring-indigo-900/40 ring-inset"
                        : `${columnStyle[column.id].bg}`
                    } border-x border-b ${columnStyle[column.id].border}`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-slate-900 p-4 mb-3 rounded-2xl border border-gray-100 dark:border-slate-800 transition-all duration-200 group ${
                              snapshot.isDragging
                                ? "shadow-2xl ring-4 ring-indigo-500/30 dark:ring-indigo-400/30 scale-105 rotate-1 z-50 cursor-grabbing"
                                : "shadow-sm hover:shadow-md dark:hover:shadow-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 hover:-translate-y-0.5"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-sm text-gray-800 dark:text-slate-200 leading-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors pr-2">
                                {task.title}
                              </h3>
                            </div>
                            {task.description && (
                              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 dark:border-slate-800">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge[task.priority]}`}
                                >
                                  {task.priority}
                                </span>
                                {task.dueDate && (
                                  <span className="text-xs text-gray-400 dark:text-slate-500">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(task._id)}
                                  className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <X size={14} />
                                </button>
                                <button
                                  onClick={() => setEditTask(task)}
                                  className="p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => setViewTask(task)}
                                  className="p-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-400 hover:text-green-600 dark:hover:text-green-400"
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                            </div>
                            {task.assignedTo && (
                              <div className="flex items-center gap-1 mt-2">
                                <img
                                  src={task.assignedTo?.profilePicture}
                                  alt=""
                                  className="w-5 h-5 rounded-full object-cover border dark:border-slate-700"
                                />
                                <span className="text-xs text-gray-400 dark:text-slate-500">
                                  {task.assignedTo?.firstname}{" "}
                                  {task.assignedTo?.lastname}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {column.tasks.length === 0 && (
                      <div className="text-center py-6 text-gray-300 dark:text-slate-600 text-xs">
                        Drop tasks here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modals */}
      {viewTask && (
        <TaskDetailModal task={viewTask} onClose={() => setViewTask(null)} />
      )}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onSave={handleEditSave}
          onClose={() => setEditTask(null)}
        />
      )}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default TaskBoard;
