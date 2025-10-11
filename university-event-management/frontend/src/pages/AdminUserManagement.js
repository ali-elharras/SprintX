import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api";
import theme from "../theme";
import Navbar from "../components/Navbar";

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
  const [pendingAcademics, setPendingAcademics] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  // Row-level role selection for academic approval
  const [rowRoleSelections, setRowRoleSelections] = useState({});
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("admins"); // 'admins' | 'verification'

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAcademics = async () => {
    setPendingLoading(true);
    try {
      const data = await adminAPI.getPendingAcademics();
      setPendingAcademics(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch pending academics");
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingAcademics();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const data = await adminAPI.createUser(form);
      if (data) {
        toast.success(data.message || "User created");
        setForm(initialForm);
        fetchUsers();
      } else {
        toast.error("Error creating user");
      }
    } catch (err) {
      toast.error(err.message || "Error creating user");
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const data = await adminAPI.deleteUser(id);
      if (data) {
        toast.success(data.message || "User deleted");
        fetchUsers();
      } else {
        toast.error("Error deleting user");
      }
    } catch (err) {
      toast.error(err.message || "Error deleting user");
    }
  };

  const handleApproveAcademic = async (id, role) => {
    try {
      const data = await adminAPI.approveAcademic(id, role);
      if (data?.message) toast.success(data.message);
      await Promise.all([fetchPendingAcademics(), fetchUsers()]);
    } catch (err) {
      toast.error(err.message || "Failed to approve user");
    }
  };

  const filteredPending = useMemo(() => {
    if (roleFilter === "all") return pendingAcademics;
    return pendingAcademics.filter((u) => u.role === roleFilter);
  }, [pendingAcademics, roleFilter]);

  // ======== UI HELPERS ========
  const cardStyle = {
    background: theme.colors.background.paper,
    borderRadius: 16,
    border: `1px solid ${theme.colors.border.light}`,
    boxShadow: theme.shadows.lg,
  };

  const badge = (label, variant = "neutral") => {
    const palette = {
      success: { bg: "#D1FAE5", fg: "#065F46", bd: "#34D399" },
      danger: { bg: "#FEE2E2", fg: "#991B1B", bd: "#FCA5A5" },
      warning: { bg: "#FEF3C7", fg: "#92400E", bd: "#FCD34D" },
      info: { bg: "#DBEAFE", fg: "#1E40AF", bd: "#93C5FD" },
      neutral: { bg: "#F3F4F6", fg: "#374151", bd: "#D1D5DB" },
    }[variant] || { bg: "#F3F4F6", fg: "#374151", bd: "#D1D5DB" };
    return (
      <span style={{
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.bd}`,
        padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
        borderRadius: 999,
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semibold,
        textTransform: "capitalize",
      }}>{label}</span>
    );
  };

  const primaryButton = (props) => (
    <button
      {...props}
      style={{
        background: theme.colors.primary.main,
        color: "#fff",
        border: `1px solid ${theme.colors.primary.dark}`,
        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: theme.typography.fontWeight.medium,
        boxShadow: theme.shadows.md,
        ...props.style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.95)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
    />
  );

  const dangerButton = (props) => (
    <button
      {...props}
      style={{
        background: "#ef4444",
        color: "#fff",
        border: `1px solid #b91c1c`,
        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
        borderRadius: 10,
        cursor: "pointer",
        fontWeight: theme.typography.fontWeight.medium,
        boxShadow: theme.shadows.md,
        ...props.style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.95)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
    />
  );

  const inputStyle = {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: 10,
    border: `1px solid ${theme.colors.border.light}`,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    background: theme.colors.background.paper,
  };
  const selectStyle = { ...inputStyle };

  const tableStyle = { width: "100%", borderCollapse: "separate", borderSpacing: 0 };
  const thStyle = {
    textAlign: "left",
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing?.wide || 0.8,
    background: theme.colors.neutral.gray50,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };
  const tdStyle = {
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  const containerBg = {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
    padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
  };

  const headerCard = (
    <div style={{
      ...cardStyle,
      padding: theme.spacing[6],
      marginBottom: theme.spacing[6],
      background: `linear-gradient(135deg, ${theme.colors.primary.light} 0%, ${theme.colors.primary.main} 100%)`,
      color: "#fff",
      border: `1px solid ${theme.colors.primary.dark}`,
    }}>
      <h1 style={{ margin: 0, fontSize: theme.typography.fontSize["3xl"], fontWeight: theme.typography.fontWeight.bold }}>User Management</h1>
      <p style={{ marginTop: theme.spacing[2], opacity: 0.95 }}>
        Manage all users and verify academic accounts (Staff, TA, Professor) in one place.
      </p>
      <div style={{ display: "flex", gap: theme.spacing[3], marginTop: theme.spacing[4], flexWrap: "wrap" }}>
        {badge(`${users.length} Users`, "info")}
        {badge(`${pendingAcademics.length} Pending Academics`, pendingAcademics.length ? "warning" : "success")}
      </div>
    </div>
  );

  const tabs = (
    <div style={{ ...cardStyle, padding: theme.spacing[2], marginBottom: theme.spacing[6] }}>
      <div style={{ display: "flex", gap: theme.spacing[2] }}>
        {[
          { key: "admins", label: "Users" },
          { key: "verification", label: "Academic Verification" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              background: activeTab === t.key ? theme.colors.background.paper : theme.colors.neutral.gray50,
              border: `1px solid ${theme.colors.border.light}`,
              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: theme.typography.fontWeight.medium,
              boxShadow: activeTab === t.key ? theme.shadows.md : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  const AdminsTab = (
    <div style={{ ...cardStyle, padding: theme.spacing[6], marginBottom: theme.spacing[6] }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing[4] }}>
        <div>
          <h3 style={{ margin: 0, color: theme.colors.text.primary }}>All Users</h3>
          <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>Create admins or events office accounts, and view every user’s details and status (Active/Blocked).</p>
        </div>
      </div>

      {/* Users Table */}
      <form onSubmit={handleCreate} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: theme.spacing[3], marginBottom: theme.spacing[5] }}>
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required style={inputStyle} />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required style={inputStyle} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required type="email" style={inputStyle} />
        <input name="password" placeholder="Password" value={form.password} onChange={handleChange} required type="password" style={inputStyle} />
  <input name="universityId" placeholder="University ID (optional)" value={form.universityId} onChange={handleChange} style={inputStyle} />
        <select name="role" value={form.role} onChange={handleChange} style={selectStyle}>
          <option value="admin">Admin</option>
          <option value="event_office">Event Office</option>
        </select>
        {primaryButton({ type: "submit", disabled: creating, children: creating ? "Creating..." : "Create User", style: { gridColumn: "span 6" } })}
      </form>

      {/* Users Table */}
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div style={{ overflow: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>University ID</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Verified</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id || user._id} style={{ background: "#fff" }}>
                  <td style={tdStyle}>{(user.fullName || `${user.firstName || ""} ${user.lastName || ""}`).trim()}</td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>{badge(
                    user.role === "admin"
                      ? "Admin"
                      : (user.role === "events_office" || user.role === "event_office")
                      ? "Events Office"
                      : user.role.replace("_", " "),
                    user.role === "admin"
                      ? "danger"
                      : (user.role === "events_office" || user.role === "event_office")
                      ? "info"
                      : user.role === "staff"
                      ? "success"
                      : user.role === "ta"
                      ? "info"
                      : user.role === "professor"
                      ? "warning"
                      : "neutral"
                  )}</td>
                  <td style={tdStyle}>{user.universityId || "-"}</td>
                  <td style={tdStyle}>{badge(
                    (user.status || "").toString(),
                    (user.status || "").toString().toLowerCase() === "active" ? "success" : "neutral"
                  )}</td>
                  <td style={tdStyle}>{user.verified ? badge("Verified", "success") : badge("Not Verified", "warning")}</td>
                  <td style={tdStyle}>{user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</td>
                  <td style={tdStyle}>
                    {["admin", "events_office", "event_office"].includes(user.role)
                      ? dangerButton({ onClick: () => handleDelete(user.id || user._id), children: "Delete" })
                      : <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const VerificationTab = (
    <div style={{ ...cardStyle, padding: theme.spacing[6] }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing[4] }}>
        <div>
          <h3 style={{ margin: 0, color: theme.colors.text.primary }}>Academic Role Verification</h3>
          <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>Approve Staff, TA, and Professor accounts. Approval assigns the selected role and verifies the user.</p>
        </div>
        <div style={{ display: "flex", gap: theme.spacing[3], alignItems: "center" }}>
          <div>
            <label style={{ display: "block", fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing[1] }}>Filter</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              <option value="staff">Staff</option>
              <option value="ta">TA</option>
              <option value="professor">Professor</option>
            </select>
          </div>
        </div>
      </div>

      {pendingLoading ? (
        <div>Loading pending academics...</div>
      ) : filteredPending.length === 0 ? (
        <div style={{ color: theme.colors.text.secondary }}>No pending academic verifications.</div>
      ) : (
        <div style={{ overflow: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>University ID</th>
                <th style={thStyle}>Requested</th>
                <th style={thStyle}>Registered</th>
                <th style={thStyle}>Approve As</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.map((u) => (
                <tr key={u._id || u.id}>
                  <td style={tdStyle}>{u.firstName} {u.lastName}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.universityId}</td>
                  <td style={{ ...tdStyle, textTransform: "capitalize" }}>{badge(u.role, u.role === "staff" ? "success" : u.role === "ta" ? "info" : "warning")}</td>
                  <td style={tdStyle}>{new Date(u.createdAt).toLocaleString()}</td>
                  <td style={tdStyle}>
                    {(() => {
                      const uid = u._id || u.id;
                      const selected = rowRoleSelections[uid] || u.role;
                      return (
                        <select
                          value={selected}
                          onChange={(e) => setRowRoleSelections((prev) => ({ ...prev, [uid]: e.target.value }))}
                          style={selectStyle}
                        >
                          <option value="staff">Staff</option>
                          <option value="ta">TA</option>
                          <option value="professor">Professor</option>
                        </select>
                      );
                    })()}
                  </td>
                  <td style={tdStyle}>
                    {(() => {
                      const uid = u._id || u.id;
                      const selected = rowRoleSelections[uid] || u.role;
                      const label = `Approve as ${selected.charAt(0).toUpperCase() + selected.slice(1)}`;
                      return primaryButton({ onClick: () => handleApproveAcademic(uid, selected), children: label });
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <div style={containerBg}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {headerCard}
          {tabs}
          {activeTab === "admins" ? AdminsTab : VerificationTab}
        </div>
      </div>
    </>
  );
};

export default AdminUserManagement;
