import React, { useState, useEffect } from "react";
import API_URL from "../config";

const RELATIONS = ["Spouse", "Child", "Parent", "Sibling", "Other"];

const Dependents = ({ passengerID }) => {
  const [dependents, setDependents] = useState([]);
  const [form, setForm] = useState({ name: "", relation: "Spouse" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!passengerID) return;
    const fetchDependents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dependents/${passengerID}`);
        const data = await res.json();
        if (res.ok) setDependents(data);
      } catch {
        setError("Failed to load dependents.");
      }
    };
    fetchDependents();
  }, [passengerID]);

  const handleAdd = async () => {
    if (!form.name.trim()) {
      setError("Please enter a name.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dependents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengerID, name: form.name.trim(), relation: form.relation }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add dependent.");
      setMessage(`${form.name} added successfully.`);
      setForm({ name: "", relation: "Spouse" });
      setDependents((prev) => [...prev, data.dependent]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dep) => {
    setDeleting(dep.DependentID);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/dependents/${dep.DependentID}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove dependent.");
      setDependents((prev) => prev.filter((d) => d.DependentID !== dep.DependentID));
      setMessage(`${dep.Name} removed.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="container">
      <h2 className="page-title">My Dependents</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Add form */}
      <div style={addBoxStyle}>
        <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "600", color: "#0F2137" }}>
          Add a Dependent
        </h3>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={handleKeyDown}
              className="input"
              placeholder="e.g., Sara Ahmed"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Relationship</label>
            <select
              value={form.relation}
              onChange={(e) => setForm({ ...form, relation: e.target.value })}
              className="input"
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="button auto"
          disabled={loading}
          style={{ marginTop: "16px", padding: "10px 24px" }}
        >
          {loading ? "Adding…" : "+ Add Dependent"}
        </button>
      </div>

      {/* Dependents list */}
      <div style={{ marginTop: "28px" }}>
        <h3 className="section-title">
          {dependents.length === 0
            ? "No dependents yet"
            : `${dependents.length} Dependent${dependents.length !== 1 ? "s" : ""}`}
        </h3>

        {dependents.length === 0 ? (
          <p className="text-muted">
            Add family members who travel with you to track them in reports.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {dependents.map((dep) => (
              <div key={dep.DependentID} style={depCardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={avatarStyle}>
                    {dep.Name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#0F2137" }}>
                      {dep.Name}
                    </div>
                    <div style={relationStyle}>{dep.RelationToPassenger}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(dep)}
                  disabled={deleting === dep.DependentID}
                  style={deleteButtonStyle}
                >
                  {deleting === dep.DependentID ? "…" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const addBoxStyle = {
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: "12px",
  padding: "20px 22px",
};

const depCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: "10px",
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #006B3C, #004D2B)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
  fontSize: "16px",
  flexShrink: 0,
};

const relationStyle = {
  fontSize: "12px",
  color: "#64748B",
  marginTop: "2px",
  fontWeight: "500",
};

const deleteButtonStyle = {
  background: "transparent",
  color: "#DC2626",
  border: "1px solid #FCA5A5",
  borderRadius: "7px",
  padding: "5px 14px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "500",
  transition: "background 0.18s",
};

export default Dependents;
