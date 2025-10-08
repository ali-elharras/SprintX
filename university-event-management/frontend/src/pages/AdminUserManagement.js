import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  universityId: "",
  role: "admin",
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/admin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "User created");
        setForm(initialForm);
        fetchUsers();
      } else {
        toast.error(data.message || "Error creating user");
      }
    } catch {
      toast.error("Error creating user");
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/delete-user/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "User deleted");
        fetchUsers();
      } else {
        toast.error(data.message || "Error deleting user");
      }
    } catch {
      toast.error("Error deleting user");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h2>Admin & Event Office User Management</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required type="email" />
        <input name="password" placeholder="Password" value={form.password} onChange={handleChange} required type="password" />
        <input name="universityId" placeholder="University ID" value={form.universityId} onChange={handleChange} required />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="admin">Admin</option>
          <option value="event_office">Event Office</option>
        </select>
        <button type="submit" disabled={creating}>Create User</button>
      </form>
      <h3>All Users</h3>
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <table border="1" cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>University ID</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Created</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.role === "admin" || u.role === "event_office").map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.universityId}</td>
                <td>{user.status}</td>
                <td>{user.verified ? "Yes" : "No"}</td>
                <td>{user.createdAt}</td>
                <td>
                  <button onClick={() => handleDelete(user.id)} style={{ color: "red" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserManagement;
