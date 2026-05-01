import { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Trash2, UserCog, Search, Users, Crown } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const roleColors = {
  admin: "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white",
  member: "bg-gradient-to-r from-blue-400 to-cyan-400 text-white",
};

const Admin = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (userInfo?.role !== "admin") {
      navigate("/");
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/admin/users`);
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [userInfo, navigate]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/v1/admin/users/${userId}/role`,
        { role: newRole }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: res.data.role } : u))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Error updating role");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/api/v1/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.firstname?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastname?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === "admin").length;
  const memberCount = users.filter((u) => u.role === "member").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl shadow-md">
            <Shield className="text-white" size={28} />
          </div>
          Admin Panel
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2 ml-14">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Users</p>
            <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{users.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Admins</p>
            <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{adminCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400">
            <UserCog size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Members</p>
            <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{memberCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white dark:focus:bg-slate-800 text-sm shadow-sm dark:text-slate-200 transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 dark:from-slate-800 dark:to-slate-800/50 border-b dark:border-slate-800 text-left">
                  <th className="px-6 py-4 font-bold text-gray-600 dark:text-slate-400 uppercase text-xs tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold text-gray-600 dark:text-slate-400 uppercase text-xs tracking-wider">Email</th>
                  <th className="px-6 py-4 font-bold text-gray-600 dark:text-slate-400 uppercase text-xs tracking-wider">Role</th>
                  <th className="px-6 py-4 font-bold text-gray-600 dark:text-slate-400 uppercase text-xs tracking-wider">Joined</th>
                  <th className="px-6 py-4 font-bold text-gray-600 dark:text-slate-400 uppercase text-xs tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-12 text-gray-400"
                    >
                      <Users size={32} className="mx-auto mb-2 opacity-30" />
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* User */}
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={user.profilePicture}
                          alt={user.firstname}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 dark:border-slate-700 shadow-sm group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-colors"
                        />
                        <div>
                          <span className="font-semibold text-gray-800 dark:text-slate-200 block leading-tight">
                            {user.firstname} {user.lastname}
                          </span>
                          {user._id === userInfo?._id && (
                            <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{user.email}</td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${roleColors[user.role]}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user._id !== userInfo?._id && (
                            <>
                              <button
                                onClick={() =>
                                  handleRoleChange(
                                    user._id,
                                    user.role === "admin" ? "member" : "admin"
                                  )
                                }
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 font-semibold transition-all hover:shadow-sm"
                                title="Toggle Role"
                              >
                                <UserCog size={14} />
                                {user.role === "admin"
                                  ? "Make Member"
                                  : "Make Admin"}
                              </button>
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold transition-all hover:shadow-sm"
                                title="Delete User"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3.5 bg-gradient-to-r from-gray-50 to-gray-50/50 dark:from-slate-800 dark:to-slate-800/50 border-t dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 font-medium">
            Showing {filtered.length} of {users.length} user{users.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
