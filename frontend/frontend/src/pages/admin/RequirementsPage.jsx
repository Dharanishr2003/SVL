import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/system/ToastProvider";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import RequirementFormModal from "./RequirementFormModal";
import { getServiceCategories } from "../../api/serviceCategoriesApi";
import { getServiceTypes } from "../../api/serviceTypesApi";
import { getLeads } from "../../api/leadsApi";
import { getRequirementsByLeadId, deleteRequirement } from "../../api/requirementApi";

export default function RequirementsPage() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [requirementMap, setRequirementMap] = useState({});
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewingSpecs, setViewingSpecs] = useState(null);
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [requirementModalKey, setRequirementModalKey] = useState(0);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [modalLeadId, setModalLeadId] = useState(null);

  useEffect(() => {
    loadLeads();
    loadServiceMaster();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads({ status: "requirement" });
      const rows = Array.isArray(data) ? data : [];
      setLeads(rows);
      const entries = await Promise.all(
        rows.map(async (lead) => {
          try {
            const reqs = await getRequirementsByLeadId(lead.id);
            console.log(`Requirements for lead ${lead.id}:`, reqs);
            return [lead.id, Array.isArray(reqs) ? reqs : []];
          } catch (error) {
            console.error(`Error fetching requirements for lead ${lead.id}:`, error);
            return [lead.id, []];
          }
        })
      );
      const mapData = Object.fromEntries(entries);
      console.log("Final requirementMap:", mapData);
      setRequirementMap(mapData);
    } catch (error) {
      showError(extractApiErrorMessage(error) || "Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  const loadServiceMaster = async () => {
    try {
      const [cats, types] = await Promise.all([getServiceCategories(), getServiceTypes()]);
      setServiceCategories(Array.isArray(cats) ? cats : []);
      setServiceTypes(Array.isArray(types) ? types : []);
    } catch {
      // silent
    }
  };

  const refreshRequirements = async (leadId) => {
    if (!leadId) return;
    try {
      const data = await getRequirementsByLeadId(leadId);
      const reqs = Array.isArray(data) ? data : [];
      setRequirementMap((prev) => ({ ...prev, [leadId]: reqs }));
    } catch {
      // silent
    }
  };

  const openAddRequirementModal = (lead) => {
    setModalLeadId(lead.id);
    setEditingRequirement(null);
    setRequirementModalKey((k) => k + 1);
    setShowRequirementModal(true);
  };

  const openEditRequirementModal = (lead, req) => {
    setSelectedLead(lead);
    setEditingRequirement(req);
    setRequirementModalKey((k) => k + 1);
    setShowRequirementModal(true);
  };

  const handleDeleteRequirement = async (lead, req) => {
    if (!req?.id) return;
    if (!window.confirm("Delete this requirement?")) return;
    try {
      await deleteRequirement(req.id);
      await refreshRequirements(lead.id);
      showSuccess("Requirement deleted");
    } catch (e) {
      showError(extractApiErrorMessage(e) || "Failed to delete requirement");
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (lead.mobile || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (lead.owner || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const requirementsForSelected = selectedLead ? requirementMap[selectedLead.id] || [] : [];

  if (!selectedLead) {
    // LEADS LIST VIEW
    return (
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Requirements</h4>
              <h6>Manage requirement statuses for leads</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <a data-bs-toggle="tooltip" title="Refresh" onClick={loadLeads}>
                <i className="ti ti-refresh-dot"></i>
              </a>
            </li>
          </ul>
        </div>

        <div className="card table-list-card">
          <div className="card-body">
            <div className="filter-set">
              <div className="filter-search">
                <i className="ti ti-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, mobile, or owner"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No requirements found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table datatable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Owner</th>
                      <th>No of Requirements</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const reqs = requirementMap[lead.id];
                      const count = reqs ? reqs.length : 0;
                      console.log(`Lead ${lead.id} (${lead.name}): count = ${count}, reqs =`, reqs);
                      return (
                        <tr key={lead.id}>
                          <td>{lead.name || "-"}</td>
                          <td>{lead.mobile || "-"}</td>
                          <td>{lead.owner || "-"}</td>
                          <td>
                            <span className="badge bg-light-primary">
                              {count > 0 ? count : 0}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => openAddRequirementModal(lead)}
                                data-bs-toggle="tooltip"
                                title="Add Requirement"
                              >
                                <i className="ti ti-plus"></i>
                              </button>
                              <a
                                className="me-2"
                                onClick={() => setSelectedLead(lead)}
                                style={{ cursor: "pointer" }}
                                data-bs-toggle="tooltip"
                                title="View Requirements"
                              >
                                <i className="ti ti-eye"></i>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Requirement Form Modal - Leads List */}
        <RequirementFormModal
          key={requirementModalKey}
          show={showRequirementModal && !selectedLead && modalLeadId}
          leadId={modalLeadId}
          initialRequirement={editingRequirement}
          onClose={() => {
            setShowRequirementModal(false);
            setModalLeadId(null);
          }}
          onSaved={async () => {
            try {
              setShowRequirementModal(false);
              const tempLeadId = modalLeadId;
              setModalLeadId(null);

              // Refresh the specific lead's requirements first
              const reqs = await getRequirementsByLeadId(tempLeadId);
              setRequirementMap((prev) => ({
                ...prev,
                [tempLeadId]: Array.isArray(reqs) ? reqs : [],
              }));

              showSuccess("Requirement added successfully");
            } catch (error) {
              showError("Failed to update requirements count");
              console.error("Error refreshing requirements:", error);
            }
          }}
          serviceCategories={serviceCategories}
          serviceTypes={serviceTypes}
        />
      </div>
    );
  }

  // REQUIREMENTS DETAIL VIEW
  return (
    <div className="content">
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <a
              onClick={() => setSelectedLead(null)}
              style={{ cursor: "pointer" }}
              className="me-2"
            >
              <i className="ti ti-arrow-left"></i>
            </a>
            <h4>{selectedLead.name}'s Requirements</h4>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Requirements</h6>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={() => navigate("/quotation", { state: { prefillLead: selectedLead } })}
                disabled={!selectedLead}
              >
                <i className="ti ti-file-invoice me-1" />
                Create Quotation
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => openAddRequirementModal(selectedLead)}
              >
                <i className="ti ti-plus me-1" />
                Add Requirement
              </button>
            </div>
          </div>

          {requirementsForSelected.length === 0 && (
            <div className="alert alert-info py-2">
              No requirements added yet. Click &quot;Add Requirement&quot; to create one.
            </div>
          )}

          {requirementsForSelected.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Category</th>
                    <th>Product</th>
                    <th>Sub-type</th>
                    <th>Quantity</th>
                    <th>Specifications</th>
                    <th>Design Mode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requirementsForSelected.map((req, index) => {
                    let parsedSpecs = null;
                    try {
                      parsedSpecs = req.specs ? JSON.parse(req.specs) : null;
                    } catch {
                      parsedSpecs = null;
                    }
                    return (
                      <tr key={req.id}>
                        <td>{index + 1}</td>
                        <td>{req.categoryName || "-"}</td>
                        <td>{req.typeName || "-"}</td>
                        <td>{req.subtypeName || "-"}</td>
                        <td>{req.quantity || "-"}</td>
                        <td style={{ minWidth: 260 }}>
                          {parsedSpecs && Object.keys(parsedSpecs).length > 0 ? (
                            <button
                              type="button"
                              className="spec-view-btn"
                              onClick={() => setViewingSpecs({ specs: parsedSpecs, req })}
                            >
                              <i className="ti ti-eye" /> View
                            </button>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {req.designStatus ? (
                            <span className="badge bg-info">
                              {req.designStatus === "design_only"
                                ? "Design Only"
                                : req.designStatus === "production_only"
                                ? "Production Only"
                                : req.designStatus === "design_production"
                                ? "Design + Production"
                                : req.designStatus}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEditRequirementModal(selectedLead, req)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteRequirement(selectedLead, req)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Specs Viewer Modal */}
      {viewingSpecs && (
        <div
          className="modal fade show"
          id="specsModal"
          tabIndex="-1"
          aria-labelledby="specsModalLabel"
          aria-hidden="true"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Specifications</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingSpecs(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {viewingSpecs.specs && (
                  <div>
                    {Object.entries(viewingSpecs.specs).map(([key, value]) => (
                      <div key={key} className="mb-3">
                        <label className="form-label text-capitalize">
                          {key.replace(/_/g, " ")}
                        </label>
                        <p className="text-muted">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requirement Form Modal */}
      <RequirementFormModal
        key={requirementModalKey}
        show={showRequirementModal}
        leadId={selectedLead?.id}
        initialRequirement={editingRequirement}
        onClose={() => setShowRequirementModal(false)}
        onSaved={async () => {
          try {
            setShowRequirementModal(false);
            const reqs = await getRequirementsByLeadId(selectedLead.id);
            setRequirementMap((prev) => ({
              ...prev,
              [selectedLead.id]: Array.isArray(reqs) ? reqs : [],
            }));
            showSuccess("Requirement saved successfully");
          } catch (error) {
            showError("Failed to update requirements");
            console.error("Error refreshing requirements:", error);
          }
        }}
        serviceCategories={serviceCategories}
        serviceTypes={serviceTypes}
      />
    </div>
  );
}
