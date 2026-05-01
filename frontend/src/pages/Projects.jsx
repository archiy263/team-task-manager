import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  setProjects,
  addProject,
  updateProject,
  removeProject,
} from "../redux/features/project/projectSlice";
import { setCredentials } from "../redux/features/auth/authSlice";
import { setTasks } from "../redux/features/task/taskSlice";
import { Folder, Plus, Trash2, Users, ChevronDown, ChevronUp, X } from "lucide-react";
import TaskBoard from "../components/TaskBoard";

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

// ---- Create/Edit Project Modal ----
const ProjectModal = ({ onClose, onSave, existingProject }) => {
  const [name, setName] = useState(existingProject?.name || "");
  const [description, setDescription] = useState(existingProject?.description || "");
  const [members, setMembers] = useState(
    existingProject?.members?.map((m) => m._id) || []
  );
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all users to display as options
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/admin/users`);
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  const toggleMember = (userId) => {
    if (members.includes(userId)) {
      setMembers(members.filter((id) => id !== userId));
    } else {
      setMembers([...members, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (existingProject) {
        const res = await axios.put(
          `${API_URL}/api/v1/projects/${existingProject._id}`,
          { name, description, members }
        );
        onSave(res.data, "update");
      } else {
        const res = await axios.post(`${API_URL}/api/v1/projects`, {
          name,
          description,
          members,
        });
        onSave(res.data, "create");
      }
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col border dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
            {existingProject ? "Edit Project" : "New Project"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden space-y-4">
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Project Name</label>
              <input
                type="text"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">Description</label>
              <textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border dark:border-slate-700 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 dark:bg-slate-800 dark:text-slate-200"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">Assign Team Members</label>
              <div className="border dark:border-slate-700 rounded-xl max-h-40 overflow-y-auto bg-gray-50 dark:bg-slate-800/50 p-2 space-y-1">
                {users.length === 0 ? (
                  <p className="text-xs text-gray-400 p-2 text-center">Loading users...</p>
                ) : (
                  users.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => toggleMember(u._id)}
                      className="flex items-center gap-3 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={members.includes(u._id)}
                        readOnly
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-indigo-500"
                      />
                      <img
                        src={u.profilePicture}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover bg-white border dark:border-slate-700"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300 leading-tight">
                          {u.firstname} {u.lastname}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 leading-tight">{u.email}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800 mt-4">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-60 transition-all duration-300"
            >
              {loading ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Project Card ----
const ProjectCard = ({ project, userInfo, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();

  const handleExpand = async () => {
    if (!expanded) {
      try {
        const res = await axios.get(
          `${API_URL}/api/v1/tasks?project=${project._id}`
        );
        dispatch(setTasks(res.data));
      } catch (err) {
        console.error(err);
      }
    }
    setExpanded((v) => !v);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300 group">
      {/* Card Header */}
      <div className="p-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-md group-hover:shadow-lg transition-shadow">
            <Folder size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-800 dark:text-slate-100 text-lg leading-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {project.description || "No description."}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 flex items-center gap-1.5">
              <Users size={12} />
              <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-600 dark:text-slate-400">
                {project.members?.length || 0} member{project.members?.length !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-300 dark:text-slate-700">•</span>
              Created by {project.createdBy?.firstname} {project.createdBy?.lastname}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {userInfo?.role === "admin" && (
            <>
              <button
                onClick={() => onEdit(project)}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-600 dark:text-slate-400 font-semibold transition-all hover:shadow-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(project._id)}
                className="text-xs px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all hover:shadow-sm"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button
            onClick={handleExpand}
            className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
            title={expanded ? "Collapse tasks" : "View tasks"}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Members chips */}
      {project.members?.length > 0 && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {project.members.map((m) => (
            <div
              key={m._id}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-1.5 rounded-xl font-medium border border-indigo-100/50 dark:border-indigo-800/50 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-default"
            >
              <img
                src={m.profilePicture}
                alt={m.firstname}
                className="w-5 h-5 rounded-full object-cover border border-white dark:border-slate-700 shadow-sm"
              />
              {m.firstname} {m.lastname}
            </div>
          ))}
        </div>
      )}

      {/* Expanded Task Board */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-900/50 p-5">
          <TaskBoard projectId={project._id} />
        </div>
      )}
    </div>
  );
};

// ---- Main Projects Page ----
const Projects = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const projects = useSelector((state) => state.projects.projects);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Refresh user role from server on mount (ensures admin flag is always fresh)
  useEffect(() => {
    axios.get(`${API_URL}/api/v1/user/me`).then((res) => {
      if (res.data) {
        dispatch(setCredentials(res.data));
      }
    }).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/projects`);
        dispatch(setProjects(res.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [dispatch]);

  const handleSave = (project, mode) => {
    if (mode === "create") {
      dispatch(addProject(project));
    } else {
      dispatch(updateProject(project));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await axios.delete(`${API_URL}/api/v1/projects/${id}`);
      dispatch(removeProject(id));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting project");
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-md">
              <Folder className="text-white" size={28} />
            </div>
            Projects
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 ml-14">
            {userInfo?.role === "admin"
              ? "Manage all team projects"
              : "Your assigned projects"}
          </p>
        </div>
        {userInfo?.role === "admin" && (
          <button
            onClick={() => {
              setEditingProject(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block p-4 bg-gray-100 dark:bg-slate-800 rounded-3xl mb-4">
            <Folder size={48} className="text-gray-300 dark:text-slate-700" />
          </div>
          <p className="text-lg text-gray-500 dark:text-slate-400 font-medium">No projects yet.</p>
          {userInfo?.role === "admin" && (
            <p className="text-sm mt-1 text-gray-400 dark:text-slate-500">Create your first project above to get started.</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              userInfo={userInfo}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          onClose={() => {
            setShowModal(false);
            setEditingProject(null);
          }}
          onSave={handleSave}
          existingProject={editingProject}
        />
      )}
    </div>
  );
};

export default Projects;

