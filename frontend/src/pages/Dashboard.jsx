import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  AlertTriangle,
  Folder,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-slate-800 ${bg}`}>
    <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-sm`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-slate-400 font-medium tracking-wide uppercase">{label}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-slate-100">{value ?? "—"}</p>
    </div>
  </div>
);

const priorityColor = {
  High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const statusColor = {
  "To Do": "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Done: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/dashboard/stats`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
        {error}
      </div>
    );
  }

  const { stats, recentTasks, upcomingDeadlines } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-md">
            <LayoutDashboard className="text-white" size={28} />
          </div>
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2 ml-14">
          Welcome back,{" "}
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {userInfo?.firstname} {userInfo?.lastname}
          </span>
          !
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <StatCard
          icon={CheckSquare}
          label="Total Tasks"
          value={stats.totalTasks}
          color="from-indigo-500 to-indigo-600"
          bg="bg-white dark:bg-slate-900"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats.inProgressTasks}
          color="from-blue-500 to-cyan-500"
          bg="bg-white dark:bg-slate-900"
        />
        <StatCard
          icon={TrendingUp}
          label="Completed"
          value={stats.doneTasks}
          color="from-emerald-400 to-green-500"
          bg="bg-white dark:bg-slate-900"
        />
        <StatCard
          icon={AlertTriangle}
          label="High Priority"
          value={stats.highPriorityTasks}
          color="from-orange-400 to-orange-500"
          bg="bg-white dark:bg-slate-900"
        />
        <StatCard
          icon={Clock}
          label="Overdue"
          value={stats.overdueTasks}
          color="from-red-500 to-rose-600"
          bg="bg-white dark:bg-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={Folder}
          label="Projects"
          value={stats.totalProjects}
          color="from-purple-500 to-fuchsia-500"
          bg="bg-white dark:bg-slate-900"
        />
        {userInfo?.role === "admin" && (
          <StatCard
            icon={Users}
            label="Total Members"
            value={stats.totalUsers}
            color="from-amber-400 to-orange-500"
            bg="bg-white dark:bg-slate-900"
          />
        )}
        <StatCard
          icon={CheckSquare}
          label="To Do"
          value={stats.todoTasks}
          color="from-gray-400 to-gray-500"
          bg="bg-white dark:bg-slate-900"
        />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <CheckSquare size={20} className="text-indigo-500" /> Recent Tasks
            </h2>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl">No tasks yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentTasks.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors group cursor-default border border-transparent hover:border-gray-100 dark:hover:border-slate-700"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                      <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-600 dark:text-slate-400">
                        {task.project?.name || "No Project"}
                      </span>
                      {task.assignedTo
                        ? `${task.assignedTo.firstname} ${task.assignedTo.lastname}`
                        : "Unassigned"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${statusColor[task.status]}`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${priorityColor[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={20} className="text-red-500" /> Upcoming Deadlines
              <span className="text-xs font-medium text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-1">(7 days)</span>
            </h2>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-gray-400 dark:text-slate-500 text-sm text-center py-6 bg-gray-50 dark:bg-slate-800/50 rounded-xl">No upcoming deadlines.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingDeadlines.map((task) => (
                <li
                  key={task._id}
                  className="flex items-center justify-between p-3 hover:bg-red-50/50 dark:hover:bg-red-900/10 rounded-xl transition-colors group cursor-default border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                      <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-600 dark:text-slate-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                        {task.project?.name || "No Project"}
                      </span>
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end justify-center gap-1 flex-shrink-0">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${priorityColor[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
