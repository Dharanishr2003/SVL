import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVendors } from "../../api/vendorsApi";
import { getVendorTypes } from "../../api/vendorTypesApi";
import { getServiceCategories } from "../../api/serviceCategoriesApi";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";
import PageLoader from "../../components/common/PageLoader";
import "./EditVendorPage.css";

export default function VendorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [vendor, setVendor] = useState(null);
  const [vendorTypes, setVendorTypes] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [vendors, types, cats] = await Promise.all([
          getVendors(),
          getVendorTypes(),
          getServiceCategories(),
        ]);
        const found = Array.isArray(vendors)
          ? vendors.find((v) => v.id === Number(id))
          : null;
        setVendor(found || null);
        setVendorTypes(Array.isArray(types) ? types : []);
        setServiceCategories(Array.isArray(cats) ? cats : []);
      } catch (e) {
        showError(extractApiErrorMessage(e, "Failed to load vendor details"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <PageLoader />;

  if (!vendor) {
    return (
      <div className="content">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Vendor Details</h5>
            <button
              type="button"
              className="btn btn-secondary btn-sm d-flex align-items-center"
              onClick={() => navigate("/stocks/vendors")}
            >
              <i className="ti ti-arrow-left me-2"></i>Back
            </button>
          </div>
          <div className="card-body">
            <div className="text-center text-muted">Vendor not found.</div>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (vendor.status || "active").toLowerCase() === "active";
  const typeNames =
    vendor?.vendorTypeIds?.length > 0
      ? vendor.vendorTypeIds
          .map((tid) => {
            const t = vendorTypes.find((vt) => vt.id === tid || vt.id === Number(tid));
            return t?.name || t?.vendorTypeName || t?.typeName || String(tid);
          })
          .join(", ")
      : "-";

  const categoryNames =
    vendor?.productIds?.length > 0
      ? vendor.productIds
          .map((cid) => {
            const c = serviceCategories.find((sc) => sc.id === cid || sc.id === Number(cid));
            return c?.name || c?.categoryName || String(cid);
          })
          .join(", ")
      : "-";

  const materialsText =
    vendor?.materialsSupplied?.length > 0
      ? vendor.materialsSupplied.join(", ")
      : "-";

  return (
    <>
      <div className="content">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <h5 className="mb-0">Vendor Details</h5>
            <button
              type="button"
              className="btn btn-secondary btn-sm d-flex align-items-center"
              onClick={() => navigate("/stocks/vendors")}
            >
              <i className="ti ti-arrow-left me-2"></i>Back
            </button>
          </div>
          <div className="card-body p-0">
            <div className="vendor-wizard">
              {/* Step 0: Basic Information */}
              <div className="wizard-step-content" style={{ margin: "2rem 0" }}>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="wizard-section-title">Basic Information</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Vendor Name</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.vendorName || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.contactPerson || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.phone || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={isActive ? "Active" : "Inactive"}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Step 1: Vendor Type & Services */}
              <div className="wizard-step-content" style={{ margin: "2rem 0" }}>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="wizard-section-title">Vendor Type & Services</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Vendor Types</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={typeNames}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Service Categories</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={categoryNames}
                      disabled
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Materials Supplied</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={materialsText}
                      disabled
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Deals With</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.dealsWith || ""}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Company Information */}
              <div className="wizard-step-content" style={{ margin: "2rem 0" }}>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="wizard-section-title">Company Information</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country of Registration</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.countryOfRegistration || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Company Registration No.</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.companyRegistrationNo || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">GST Number</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.gstNumber || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">PAN Number</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.panNumber || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Company Website</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.companyWebsite || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Country Code</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.countryCode || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Company Address</label>
                    <textarea
                      className="form-control vendor-wizard-input"
                      rows="3"
                      value={vendor.companyAddress || ""}
                      disabled
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Vendor Bank Details */}
              <div className="wizard-step-content" style={{ margin: "2rem 0" }}>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="wizard-section-title">🏦 Vendor Bank Details</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Account Holder Name</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.bankAccountHolderName || "--"}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bank Name</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.bankName || "--"}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bank Account Number</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.bankAccountNumber || "--"}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">IFSC Code (India)</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.bankIfscCode || "--"}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Branch Name</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.bankBranchName || "--"}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Account Type</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.bankAccountType || "--"}
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Contact Information */}
              <div className="wizard-step-content" style={{ margin: "2rem 0" }}>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="wizard-section-title">Contact Information</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Official Email</label>
                    <input
                      type="email"
                      className="form-control vendor-wizard-input"
                      value={vendor.officialEmail || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Secondary Email</label>
                    <input
                      type="email"
                      className="form-control vendor-wizard-input"
                      value={vendor.secondaryEmail || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Internal Representative</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.internalRepresentative || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Relationship Since</label>
                    <input
                      type="text"
                      className="form-control vendor-wizard-input"
                      value={vendor.relationshipSince || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control vendor-wizard-input"
                      rows="2"
                      value={vendor.address || ""}
                      disabled
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
