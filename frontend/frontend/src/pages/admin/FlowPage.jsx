import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/admin/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { getAssignableLeadGroups } from "../../api/leadsApi";
import { getLeadFlow, updateLeadFlow } from "../../api/flowApi";
import { getInstitutions, getUserOrgSelection } from "../../api/orgHierarchyApi";
import { useAuth } from "../../context/AuthContext";
import { LEAD_FLOW_STATUSES, DEAL_FLOW_STATUSES } from "../../constants/leadFlowStatuses";
import FlowTabComponent from "../../components/admin/FlowTabComponent";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function findById(rows, id) {
  return rows.find((row) => String(row.id) === String(id));
}

function findByName(rows, name) {
  return rows.find((row) => normalize(row?.name) === normalize(name));
}

export default function FlowPage() {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const canEdit = role === "SUPER_ADMIN";
  const [loading, setLoading] = useState(true);
  const [initializingScope, setInitializingScope] = useState(true);
  const [groups, setGroups] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [leadStatuses, setLeadStatuses] = useState(LEAD_FLOW_STATUSES);
  const leadAvailableStatuses = useMemo(
    () => Array.from(new Set([...LEAD_FLOW_STATUSES, ...DEAL_FLOW_STATUSES])),
    [],
  );

  const selectedInstitution = useMemo(
    () => findById(institutions, selectedInstitutionId),
    [institutions, selectedInstitutionId],
  );
  const currentScope = useMemo(
    () => ({
      institutionName: selectedInstitution?.name || "",
    }),
    [selectedInstitution?.name],
  );
  const scopeKey = useMemo(() => normalize(currentScope.institutionName), [currentScope.institutionName]);

  useEffect(() => {
    let active = true;
    const loadInitial = async () => {
      setLoading(true);
      try {
        const [institutionRows, groupRows, orgSelection] = await Promise.all([
          getInstitutions(),
          getAssignableLeadGroups(),
          user?.id ? getUserOrgSelection(user.id) : Promise.resolve(null),
        ]);
        if (!active) return;

        const safeInstitutions = Array.isArray(institutionRows) ? institutionRows : [];
        const safeGroups = Array.isArray(groupRows) ? groupRows : [];
        setInstitutions(safeInstitutions);
        setGroups(safeGroups);

        const currentInstitutionName =
          orgSelection?.institutionName ||
          user?.institutionName ||
          user?.institution ||
          "";

        const institutionMatch =
          findByName(safeInstitutions, currentInstitutionName) || safeInstitutions[0] || null;
        setSelectedInstitutionId(institutionMatch?.id ? String(institutionMatch.id) : "");
      } catch (err) {
        if (active) {
          console.error("Failed to load flow data:", err);
          setGroups([]);
          setInstitutions([]);
        }
      } finally {
        if (active) {
          setInitializingScope(false);
          setLoading(false);
        }
      }
    };
    loadInitial();
    return () => {
      active = false;
    };
  }, [user?.id, user?.institution, user?.institutionName]);

  useEffect(() => {
    let active = true;
    const loadFlow = async () => {
      if (initializingScope) return;
      if (canEdit && !selectedInstitutionId) {
        return;
      }
      try {
        const flow = await getLeadFlow(currentScope);
        if (!active) return;
        if (flow?.statuses && Array.isArray(flow.statuses) && flow.statuses.length > 0) {
          setLeadStatuses(flow.statuses);
        } else {
          setLeadStatuses(LEAD_FLOW_STATUSES);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load scoped flow:", err);
          setLeadStatuses(LEAD_FLOW_STATUSES);
        }
      }
    };
    loadFlow();
    return () => {
      active = false;
    };
  }, [currentScope.institutionName, initializingScope, scopeKey]);

  const filteredGroups = useMemo(() => {
    const institution = normalize(currentScope.institutionName);
    return groups.filter((group) => {
      if (!group?.id || !group?.name) return false;
      if (!institution) return true;
      return normalize(group.institutionName) === institution;
    });
  }, [currentScope.institutionName, groups]);

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
          {canEdit && (
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">Branch</label>
                <select
                  className="form-select"
                  value={selectedInstitutionId}
                  onChange={(e) => {
                    setSelectedInstitutionId(e.target.value);
                  }}
                  disabled={!institutions.length}
                >
                  <option value="">Select Branch</option>
                  {institutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <FlowTabComponent
            key={scopeKey}
            label="Leads Flow"
            defaultStatuses={leadStatuses}
            getFn={() => getLeadFlow(currentScope)}
            updateFn={(payload) => updateLeadFlow(payload, currentScope)}
            canEdit={canEdit}
            groups={filteredGroups}
            allAvailableStatuses={leadAvailableStatuses}
            selectedStatuses={leadStatuses}
            hiddenFromTableStatuses={[]}
            hiddenFromSelectedStatuses={[]}
            hiddenFromAddStatuses={[]}
            readOnlyGroupStatuses={["Attempted", "Interested", "Rejected"]}
            onStatusAdd={(status) => setLeadStatuses((prev) => [...prev, status])}
            onStatusRemove={(status) => setLeadStatuses((prev) => prev.filter((s) => s !== status))}
          />
        </div>
      </div>
    </div>
  );
}
