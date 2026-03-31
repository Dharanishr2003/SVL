import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/admin/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { getAssignableLeadGroups } from "../../api/leadsApi";
import { getLeadFlow, updateLeadFlow, getDealFlow, updateDealFlow } from "../../api/flowApi";
import { useAuth } from "../../context/AuthContext";
import { LEAD_FLOW_STATUSES, DEAL_FLOW_STATUSES } from "../../constants/leadFlowStatuses";
import { formatStatusLabel } from "../../utils/statusLabels";
import { useToast } from "../../components/system/ToastProvider";

const emptyRule = (status) => ({
  status,
  handledByGroupId: "",
  next: {},
});

// â”€â”€â”€ Shared FlowTab component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FlowTab({ defaultStatuses, getFn, updateFn, canEdit, groups, label, allAvailableStatuses, selectedStatuses, onStatusAdd, onStatusRemove }) {
  const { showSuccess, showError } = useToast();

  const [rules, setRules] = useState(defaultStatuses.map(emptyRule));
  const [defaultGroupId, setDefaultGroupId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusPickerRule, setStatusPickerRule] = useState(null);
  const [groupPickerRule, setGroupPickerRule] = useState(null);

  const groupOptions = useMemo(() => groups.filter((g) => g?.id != null), [groups]);

  const allStatusOptions = useMemo(() => {
    return Array.from(new Set(defaultStatuses));
  }, [defaultStatuses]);

  const applyDefaultGroup = (ruleList, groupId) => {
    if (!groupId) return ruleList;
    return ruleList.map((r) => ({ ...r, handledByGroupId: r.handledByGroupId || groupId }));
  };

  const handleDefaultGroupChange = (nextGroupId) => {
    setDefaultGroupId(nextGroupId);
    if (nextGroupId) setRules((prev) => applyDefaultGroup(prev, nextGroupId));
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const flow = await getFn();
        if (!active) return;
        const loadedRules = Array.isArray(flow?.rules) ? flow.rules : [];
        const nextStatuses = loadedRules.flatMap((rule) =>
          rule?.next && typeof rule.next === "object"
            ? Object.keys(rule.next).map((k) => String(k || "").trim()).filter(Boolean)
            : [],
        );
        const knownStatuses = Array.from(
          new Set([
            ...defaultStatuses,
            ...loadedRules.map((r) => String(r?.status || "").trim()).filter(Boolean),
            ...nextStatuses,
          ]),
        );
        const fallbackGroupId = flow?.defaultGroupId
          ? String(flow.defaultGroupId)
          : groups.length ? String(groups[0].id) : "";
        setDefaultGroupId(fallbackGroupId);
        const merged = knownStatuses.map((status) => {
          const found = loadedRules.find(
            (r) => String(r?.status || "").trim().toLowerCase() === status.toLowerCase(),
          );
          return {
            ...emptyRule(status),
            ...found,
            status,
            handledByGroupId: found?.handledByGroupId != null ? String(found.handledByGroupId) : fallbackGroupId,
            next: found?.next && typeof found.next === "object" ? found.next : {},
          };
        });
        setRules(merged);
      } catch (e) {
        if (active) showError(extractApiErrorMessage(e, "Failed to load flow"), { title: label });
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update rules when selectedStatuses changes (when user adds/removes statuses from dropdown)
  useEffect(() => {
    setRules((prev) => {
      // Add new statuses that are in selectedStatuses but not in rules
      const existingStatuses = new Set(prev.map((r) => r.status));
      const newStatuses = selectedStatuses.filter((s) => !existingStatuses.has(s));
      
      if (newStatuses.length > 0) {
        // Add new statuses to rules with empty config
        const newRules = newStatuses.map((status) => emptyRule(status));
        return [...prev, ...newRules];
      }
      
      return prev;
    });
  }, [selectedStatuses]);

  // Filter rules to only show selected statuses
  const filteredRules = useMemo(
    () => rules.filter((r) => selectedStatuses.includes(r.status)),
    [rules, selectedStatuses],
  );

  const buildPayload = (ruleList, dgId) => ({
    defaultGroupId: dgId ? Number(dgId) : null,
    rules: ruleList
      .filter((r) => selectedStatuses.includes(r.status))
      .map((r) => ({
        status: r.status,
        handledByGroupId: r.handledByGroupId ? Number(r.handledByGroupId) : null,
        next: r.next || {},
      })),
    statuses: selectedStatuses, // Include the selected statuses list
  });

  const persist = async (ruleList, successMsg, errMsg) => {
    setSaving(true);
    try {
      await updateFn(buildPayload(ruleList, defaultGroupId));
      showSuccess(successMsg, { title: label });
    } catch (e) {
      const msg = extractApiErrorMessage(e, errMsg);
      showError(msg, { title: label });
    } finally {
      setSaving(false);
    }
  };

  const toggleNextStatus = (status, nextStatus) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.status !== status) return r;
        const next = { ...(r.next || {}) };
        if (next[nextStatus] !== undefined) delete next[nextStatus];
        else next[nextStatus] = null;
        return { ...r, next };
      }),
    );
  };

  const updateNextGroup = (status, nextStatus, groupId) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.status !== status) return r;
        const next = { ...(r.next || {}) };
        next[nextStatus] = groupId ? Number(groupId) : null;
        return { ...r, next };
      }),
    );
  };

  const selectedNextStatuses = (rule) =>
    rule?.next && typeof rule.next === "object" ? Object.keys(rule.next) : [];

  const handleSave = () => persist(rules, "Flow saved", "Failed to save flow");

  if (loading) return <PageLoader />;

  return (
    <div>
      {/* Status Configuration Section */}
      <div className="mb-5 pb-4 border-bottom">
        <h6 className="mb-3">Configure {label.split(" ")[0]} Statuses</h6>
        <div className="d-flex gap-2 mb-3 align-items-end">
          <div style={{ flex: 1 }}>
            <label className="form-label">Select Status</label>
            <select
              className="form-select"
              id={`status-select-${label}`}
              disabled={!canEdit || selectedStatuses.length === allAvailableStatuses.length}
            >
              <option value="">Choose status...</option>
              {allAvailableStatuses
                .filter((s) => !selectedStatuses.includes(s))
                .map((status) => (
                  <option key={status} value={status}>
                    {formatStatusLabel(status)}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const select = document.getElementById(`status-select-${label}`);
              if (select.value && !selectedStatuses.includes(select.value)) {
                onStatusAdd(select.value);
                select.value = "";
              }
            }}
            disabled={!canEdit}
          >
            Add
          </button>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {selectedStatuses.length > 0 ? (
            selectedStatuses.map((status) => (
              <span
                key={status}
                className="badge bg-info d-inline-flex align-items-center gap-2"
                style={{ padding: "0.5rem 0.75rem" }}
              >
                {formatStatusLabel(status)}
                {canEdit && (
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    style={{ fontSize: "0.7rem" }}
                    onClick={() => onStatusRemove(status)}
                    title="Remove status"
                  />
                )}
              </span>
            ))
          ) : (
            <p className="text-muted mb-0">No statuses selected</p>
          )}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">Default Group</label>
          <select
            className="form-select"
            value={defaultGroupId}
            onChange={(e) => handleDefaultGroupChange(e.target.value)}
            disabled={!canEdit}
          >
            <option value="">Select Default Group</option>
            {groupOptions.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Special Design Status Configuration */}
  

      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>Status</th>
              <th>Handled By Group</th>
              <th>Allowed Next Status</th>
              <th>Next Group (per status)</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule) => (
              <tr key={rule.status} style={rule.status === "Design" ? { backgroundColor: "#e7f3ff", borderLeft: "4px solid #0d6efd" } : {}}>
                <td className="fw-medium">
                  {formatStatusLabel(rule.status)}
                  {rule.status === "Design" && <span className="badge bg-primary ms-2">Design</span>}
                  {rule.status === "Design + Production" && <span className="badge bg-warning ms-2">Locked</span>}
                </td>
                <td>
                  <select
                    className="form-select"
                    value={rule.handledByGroupId || ""}
                    onChange={(e) =>
                      setRules((prev) =>
                        prev.map((r) =>
                          r.status === rule.status ? { ...r, handledByGroupId: e.target.value } : r,
                        ),
                      )
                    }
                    disabled={!canEdit || rule.status === "Design + Production"}
                  >
                    <option value="">Select Group</option>
                    {groupOptions.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setStatusPickerRule(rule.status)}
                    disabled={!canEdit}
                  >
                    {selectedNextStatuses(rule).length
                      ? `${selectedNextStatuses(rule).length} selected`
                      : "Select Status"}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setGroupPickerRule(rule.status)}
                    disabled={!canEdit || selectedNextStatuses(rule).length === 0}
                  >
                    {selectedNextStatuses(rule).length ? "Set Next Group" : "No next status"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Picker Modal */}
      {statusPickerRule && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: "720px" }}>
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Allowed Next Status</h5>
              <button type="button" className="btn-close" onClick={() => setStatusPickerRule(null)} />
            </div>
            <div className="card-body">
              <div className="row g-2">
                {allStatusOptions.filter((s) => s !== statusPickerRule).map((status) => {
                  const rule = rules.find((r) => r.status === statusPickerRule);
                  return (
                    <div className="col-md-6" key={`${statusPickerRule}-${status}`}>
                      <label className="d-flex align-items-center gap-2 border rounded px-3 py-2 bg-white text-dark">
                        <input
                          type="checkbox"
                          checked={rule?.next?.[status] !== undefined}
                          onChange={() => toggleNextStatus(statusPickerRule, status)}
                        />
                        <span className="fw-medium">{formatStatusLabel(status)}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Picker Modal */}
      {groupPickerRule && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
          <div className="card shadow-lg" style={{ width: "100%", maxWidth: "720px" }}>
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Next Group</h5>
              <button type="button" className="btn-close" onClick={() => setGroupPickerRule(null)} />
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                {selectedNextStatuses(rules.find((r) => r.status === groupPickerRule)).map((status) => {
                  const rule = rules.find((r) => r.status === groupPickerRule);
                  return (
                    <div key={`${groupPickerRule}-${status}`} className="d-flex align-items-center gap-3">
                      <div style={{ minWidth: 160 }} className="fw-medium text-dark">{formatStatusLabel(status)}</div>
                      <select
                        className="form-select"
                        value={rule?.next?.[status] ?? ""}
                        onChange={(e) => updateNextGroup(groupPickerRule, status, e.target.value)}
                      >
                        <option value="">No Group Change</option>
                        {groupOptions.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
                {selectedNextStatuses(rules.find((r) => r.status === groupPickerRule)).length === 0 && (
                  <div className="text-muted">No next status selected.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}



      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-primary" onClick={handleSave} disabled={!canEdit || saving}>
          {saving ? "Saving..." : "Save Flow"}
        </button>
      </div>
    </div>
  );
}


// ─── Status Configuration Component ────────────────────────────────────────
function StatusConfigSection({ title, allStatuses, selectedStatuses, onStatusAdd, onStatusRemove, canEdit }) {
  const [selectedValue, setSelectedValue] = useState("");

  const handleAdd = () => {
    if (selectedValue && !selectedStatuses.includes(selectedValue)) {
      onStatusAdd(selectedValue);
      setSelectedValue("");
    }
  };

  const availableStatuses = allStatuses.filter((s) => !selectedStatuses.includes(s));

  return (
    <div className="mb-4">
      <h6 className="mb-3">{title}</h6>
      <div className="d-flex gap-2 mb-3 align-items-end">
        <div style={{ flex: 1 }}>
          <label className="form-label">Select Status</label>
          <select
            className="form-select"
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            disabled={!canEdit || availableStatuses.length === 0}
          >
            <option value="">Choose status...</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!canEdit || !selectedValue}
        >
          Add
        </button>
      </div>
      <div className="d-flex flex-wrap gap-2">
        {selectedStatuses.length > 0 ? (
          selectedStatuses.map((status) => (
            <span
              key={status}
              className="badge bg-info d-inline-flex align-items-center gap-2"
              style={{ padding: "0.5rem 0.75rem" }}
            >
              {formatStatusLabel(status)}
              {canEdit && (
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  style={{ fontSize: "0.7rem" }}
                  onClick={() => onStatusRemove(status)}
                  title="Remove status"
                />
              )}
            </span>
          ))
        ) : (
          <p className="text-muted mb-0">No statuses selected</p>
        )}
      </div>
    </div>
  );
}

// ─── Main FlowPage with Leads / Deals tabs ────────────────────────────────────
export default function FlowPage() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const canEdit = role === "SUPER_ADMIN";
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leads");
  const [leadStatuses, setLeadStatuses] = useState(LEAD_FLOW_STATUSES);
  const [dealStatuses, setDealStatuses] = useState(DEAL_FLOW_STATUSES);
  const leadAvailableStatuses = useMemo(
    () => Array.from(new Set([...LEAD_FLOW_STATUSES, ...DEAL_FLOW_STATUSES])),
    [],
  );
  const dealAvailableStatuses = useMemo(
    () => Array.from(new Set([...LEAD_FLOW_STATUSES, ...DEAL_FLOW_STATUSES])),
    [],
  );

  useEffect(() => {
    Promise.all([
      getAssignableLeadGroups(),
      getLeadFlow(),
      getDealFlow(),
    ])
      .then(([groups, leadFlow, dealFlow]) => {
        setGroups(Array.isArray(groups) ? groups : []);
        // Load saved statuses from backend, or use defaults
        if (leadFlow?.statuses && Array.isArray(leadFlow.statuses) && leadFlow.statuses.length > 0) {
          setLeadStatuses(leadFlow.statuses);
        }
        if (dealFlow?.statuses && Array.isArray(dealFlow.statuses) && dealFlow.statuses.length > 0) {
          setDealStatuses(dealFlow.statuses);
        }
      })
      .catch((err) => {
        console.error("Failed to load flow data:", err);
        setGroups([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="container-fluid">
      <PageHeader
        title="Flow"
        breadcrumb={[
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "Settings", path: "" },
          { label: "Flow", path: "" },
        ]}
      />
      <div className="card">
        <div className="card-body">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link${activeTab === "leads" ? " active" : ""}`}
                onClick={() => setActiveTab("leads")}
              >
                <i className="ti ti-users me-1"></i>Leads Flow
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link${activeTab === "deals" ? " active" : ""}`}
                onClick={() => setActiveTab("deals")}
              >
                <i className="ti ti-briefcase me-1"></i>Deals Flow
              </button>
            </li>
          </ul>
          {activeTab === "leads" && (
            <FlowTab
              key="leads"
              label="Leads Flow"
              defaultStatuses={leadStatuses}
              getFn={getLeadFlow}
              updateFn={updateLeadFlow}
              canEdit={canEdit}
              groups={groups}
              allAvailableStatuses={leadAvailableStatuses}
              selectedStatuses={leadStatuses}
              onStatusAdd={(status) => setLeadStatuses((prev) => [...prev, status])}
              onStatusRemove={(status) => setLeadStatuses((prev) => prev.filter((s) => s !== status))}
            />
          )}
          {activeTab === "deals" && (
            <FlowTab
              key="deals"
              label="Deals Flow"
              defaultStatuses={dealStatuses}
              getFn={getDealFlow}
              updateFn={updateDealFlow}
              canEdit={canEdit}
              groups={groups}
              allAvailableStatuses={dealAvailableStatuses}
              selectedStatuses={dealStatuses}
              onStatusAdd={(status) => setDealStatuses((prev) => [...prev, status])}
              onStatusRemove={(status) => setDealStatuses((prev) => prev.filter((s) => s !== status))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
