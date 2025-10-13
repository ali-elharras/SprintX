import React, { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { adminAPI } from "../services/api";
import theme from "../theme";
import Navbar from "../components/Navbar";
import axios from "axios";

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

  // Ref for request cancellation
  const cancelTokenRef = useRef(null);

  const fetchUsers = async () => {
    // Cancel any existing request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("Operation cancelled due to new request");
    }

    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source();

    setLoading(true);
    try {
      const data = await adminAPI.getAllUsers(cancelTokenRef.current);
      setUsers(data);
    } catch (err) {
      // Don't show error if request was cancelled
      if (axios.isCancel(err)) {
        console.log("Request cancelled:", err.message);
        return;
      }
      toast.error(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAcademics = async () => {
    setPendingLoading(true);
    try {
      const data = await adminAPI.getPendingAcademics(cancelTokenRef.current);
      setPendingAcademics(data);
    } catch (err) {
      // Don't show error if request was cancelled
      if (axios.isCancel(err)) {
        console.log("Request cancelled:", err.message);
        return;
      }
      toast.error(err.message || "Failed to fetch pending academics");
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingAcademics();

    // Cleanup function to cancel requests on unmount
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounted");
      }
    };
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
    return pendingAcademics.filter((u) => {
      // For users with role "pending", check requestedRole
      if (u.role === "pending") {
        return u.requestedRole === roleFilter;
      }
      // For users who reapplied (role is staff/ta/professor), check actual role
      return u.role === roleFilter;
    });
  }, [pendingAcademics, roleFilter]);

  // ======== UI HELPERS ========
  const cardStyle = {
    background: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border.light}`,
    boxShadow: theme.shadows.lg,
    transition: `all ${theme.transitions.duration.base} ${theme.transitions.timing.easeOut}`,
  };

  const badge = (label, variant = "neutral") => {
    const palette = {
      success: {
        bg: theme.colors.success.light,
        fg: theme.colors.success.dark,
        bd: theme.colors.success.main,
      },
      danger: {
        bg: theme.colors.error.light,
        fg: theme.colors.error.dark,
        bd: theme.colors.error.main,
      },
      warning: {
        bg: theme.colors.warning.light,
        fg: theme.colors.warning.dark,
        bd: theme.colors.warning.main,
      },
      info: {
        bg: theme.colors.info.light,
        fg: theme.colors.info.dark,
        bd: theme.colors.info.main,
      },
      neutral: {
        bg: theme.colors.neutral.gray100,
        fg: theme.colors.neutral.gray700,
        bd: theme.colors.neutral.gray300,
      },
    }[variant] || {
      bg: theme.colors.neutral.gray100,
      fg: theme.colors.neutral.gray700,
      bd: theme.colors.neutral.gray300,
    };
    return (
      <span
        style={{
          background: palette.bg,
          color: palette.fg,
          border: `1px solid ${palette.bd}`,
          padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
          borderRadius: theme.borderRadius.full,
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.semibold,
          textTransform: "capitalize",
          display: "inline-flex",
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    );
  };

  const primaryButton = (props) => (
    <button
      {...props}
      style={{
        background:
          theme.components?.button?.primary?.background ||
          theme.colors.primary.gradient,
        color: theme.colors.text.white,
        border: "none",
        padding:
          theme.components?.button?.primary?.padding ||
          `${theme.spacing[2]} ${theme.spacing[4]}`,
        borderRadius: theme.borderRadius.md,
        cursor: "pointer",
        fontWeight: theme.typography.fontWeight.semibold,
        boxShadow: theme.shadows.md,
        transition: `all ${theme.transitions.duration.base} ${theme.transitions.timing.easeOut}`,
        ...props.style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = theme.shadows.lg;
        if (theme.components?.button?.primary?.hover?.background) {
          e.currentTarget.style.background =
            theme.components.button.primary.hover.background;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.shadows.md;
        e.currentTarget.style.background =
          theme.components?.button?.primary?.background ||
          theme.colors.primary.gradient;
      }}
    />
  );

  const dangerButton = (props) => (
    <button
      {...props}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.error.main} 0%, #dc2626 100%)`,
        color: theme.colors.text.white,
        border: "none",
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        borderRadius: theme.borderRadius.md,
        cursor: "pointer",
        fontWeight: theme.typography.fontWeight.medium,
        boxShadow: theme.shadows.sm,
        transition: `all ${theme.transitions.duration.base} ${theme.transitions.timing.easeOut}`,
        ...props.style,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-1px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    />
  );

  const inputStyle = {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${theme.colors.border.light}`,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    background: theme.colors.background.paper,
    transition: `all ${theme.transitions.duration.base} ${theme.transitions.timing.easeOut}`,
  };
  const selectStyle = { ...inputStyle };

  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  };
  const thStyle = {
    textAlign: "left",
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: theme.typography.letterSpacing.wide,
    background: theme.colors.neutral.gray50,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    position: "sticky",
    top: 0,
    zIndex: 1,
  };
  const tdStyle = {
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  };

  // Scroll container for tables so only the list scrolls, not the whole page
  const listContainerStyle = {
    overflow: "auto",
    maxHeight: "60vh",
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border.light}`,
    boxShadow: theme.shadows.sm,
    overscrollBehavior: "contain",
    background: theme.colors.background.paper,
  };

  const containerBg = {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
    padding: `${theme.spacing[8]} ${theme.spacing[6]}`,
  };

  const headerCard = (
    <div
      style={{
        ...cardStyle,
        padding: theme.spacing[6],
        marginBottom: theme.spacing[6],
        background: theme.colors.primary.gradient,
        color: "#fff",
        border: `1px solid ${theme.colors.primary.dark}`,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: theme.typography.fontSize["3xl"],
          fontWeight: theme.typography.fontWeight.bold,
        }}
      >
        User Management
      </h1>
      <p style={{ marginTop: theme.spacing[2], opacity: 0.95 }}>
        Manage all users and verify academic accounts (Staff, TA, Professor) in
        one place.
      </p>
      <div
        style={{
          display: "flex",
          gap: theme.spacing[3],
          marginTop: theme.spacing[4],
          flexWrap: "wrap",
        }}
      >
        {badge(`${users.length} Users`, "info")}
        {badge(
          `${pendingAcademics.length} Pending Academics`,
          pendingAcademics.length ? "warning" : "success"
        )}
      </div>
    </div>
  );

  const tabs = (
    <div
      style={{
        ...cardStyle,
        padding: theme.spacing[2],
        marginBottom: theme.spacing[6],
      }}
    >
      <div style={{ display: "flex", gap: theme.spacing[2] }}>
        {[
          { key: "admins", label: "Users" },
          { key: "verification", label: "Academic Verification" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              background:
                activeTab === t.key
                  ? theme.colors.primary.gradient
                  : theme.colors.neutral.gray50,
              color:
                activeTab === t.key
                  ? theme.colors.text.white
                  : theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.light}`,
              padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
              borderRadius: theme.borderRadius.md,
              cursor: "pointer",
              fontWeight: theme.typography.fontWeight.medium,
              boxShadow: activeTab === t.key ? theme.shadows.md : "none",
              transition: `all ${theme.transitions.duration.base} ${theme.transitions.timing.easeOut}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  const AdminsTab = (
    <div
      style={{
        ...cardStyle,
        padding: theme.spacing[6],
        marginBottom: theme.spacing[6],
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing[4],
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
            All Users
          </h3>
          <p
            style={{
              margin: 0,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            Create admins or events office accounts, and view every user’s
            details and status (Active/Blocked).
          </p>
        </div>
      </div>

      {/* Users Table */}
      <form
        onSubmit={handleCreate}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: theme.spacing[3],
          marginBottom: theme.spacing[5],
        }}
      >
        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          type="email"
          style={inputStyle}
        />
        <input
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          type="password"
          style={inputStyle}
        />
        <input
          name="universityId"
          placeholder="University ID (optional)"
          value={form.universityId}
          onChange={handleChange}
          style={inputStyle}
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          style={selectStyle}
        >
          <option value="admin">Admin</option>
          <option value="event_office">Event Office</option>
        </select>
        {primaryButton({
          type: "submit",
          disabled: creating,
          children: creating ? "Creating..." : "Create User",
          style: { gridColumn: "span 6" },
        })}
      </form>

      {/* Users Table */}
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div style={listContainerStyle}>
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
                  <td style={tdStyle}>
                    {(
                      user.fullName ||
                      `${user.firstName || ""} ${user.lastName || ""}`
                    ).trim()}
                  </td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>
                    {badge(
                      user.role === "admin"
                        ? "Admin"
                        : user.role === "events_office" ||
                          user.role === "event_office"
                        ? "Events Office"
                        : user.role.replace("_", " "),
                      user.role === "admin"
                        ? "danger"
                        : user.role === "events_office" ||
                          user.role === "event_office"
                        ? "info"
                        : user.role === "staff"
                        ? "success"
                        : user.role === "ta"
                        ? "info"
                        : user.role === "professor"
                        ? "warning"
                        : "neutral"
                    )}
                  </td>
                  <td style={tdStyle}>{user.universityId || "-"}</td>
                  <td style={tdStyle}>
                    {badge(
                      (user.status || "").toString(),
                      (user.status || "").toString().toLowerCase() === "active"
                        ? "success"
                        : "neutral"
                    )}
                  </td>
                  <td style={tdStyle}>
                    {user.verified
                      ? badge("Verified", "success")
                      : badge("Not Verified", "warning")}
                  </td>
                  <td style={tdStyle}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td style={tdStyle}>
                    {["admin", "events_office", "event_office"].includes(
                      user.role
                    ) ? (
                      dangerButton({
                        onClick: () => handleDelete(user.id || user._id),
                        children: "Delete",
                      })
                    ) : (
                      <span
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.fontSize.xs,
                        }}
                      >
                        —
                      </span>
                    )}
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing[4],
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
            Academic Role Verification
          </h3>
          <p
            style={{
              margin: 0,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            Approve Staff, TA, and Professor accounts. Approval assigns the
            selected role and verifies the user.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: theme.spacing[3],
            alignItems: "center",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing[1],
              }}
            >
              Filter
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={selectStyle}
            >
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
        <div style={{ color: theme.colors.text.secondary }}>
          No pending academic verifications.
        </div>
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
                  <td style={tdStyle}>
                    {u.firstName} {u.lastName}
                  </td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={tdStyle}>{u.universityId}</td>
                  <td style={{ ...tdStyle, textTransform: "capitalize" }}>
                    {(() => {
                      // For new registrations, show requestedRole
                      // For reapplied users, show their actual role since that's what they were approved for
                      const displayRole = u.role === "pending" ? u.requestedRole : u.role;
                      return badge(
                        displayRole,
                        displayRole === "staff"
                          ? "success"
                          : displayRole === "ta"
                          ? "info"
                          : "warning"
                      );
                    })()}
                  </td>
                  <td style={tdStyle}>
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    {(() => {
                      const uid = u._id || u.id;
                      // Default selection should be the role they originally requested/were approved for
                      const defaultRole = u.role === "pending" ? u.requestedRole : u.role;
                      const selected = rowRoleSelections[uid] || defaultRole;
                      return (
                        <select
                          value={selected}
                          onChange={(e) =>
                            setRowRoleSelections((prev) => ({
                              ...prev,
                              [uid]: e.target.value,
                            }))
                          }
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
                      const selected =
                        rowRoleSelections[uid] || u.requestedRole;
                      const label = `Approve as ${
                        selected.charAt(0).toUpperCase() + selected.slice(1)
                      }`;
                      return primaryButton({
                        onClick: () => handleApproveAcademic(uid, selected),
                        children: label,
                      });
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
