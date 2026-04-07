import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./CustomerWizardModal.css";

export default function CustomerWizardModal({
  wizardStep,
  form,
  setForm,
  onNext,
  onPrev,
  onSubmit,
  onClose,
  saving,
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <motion.div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        exit={shouldReduceMotion ? false : { opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <motion.div
          className="modal-dialog modal-lg"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Customer</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="customer-wizard">
              {/* Progress Bar */}
              <div className="wizard-progress-bar">
                <motion.div
                  className="wizard-progress"
                  initial={shouldReduceMotion ? false : { width: "0%" }}
                  animate={shouldReduceMotion ? {} : { width: `${((wizardStep + 1) / 3) * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>

              {/* Progress Circles */}
              <motion.div
                className="wizard-circles-container"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <div className="wizard-circle-item">
                  <motion.div
                    className={`wizard-circle ${wizardStep >= 0 ? "active" : ""}`}
                    initial={shouldReduceMotion ? false : { scale: 0.94 }}
                    animate={shouldReduceMotion ? {} : { scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.08 }}
                  >
                    <i className="ti ti-user" />
                  </motion.div>
                  <div className="wizard-circle-label">Basic Info</div>
                </div>
                <div className="wizard-circle-item">
                  <motion.div
                    className={`wizard-circle ${wizardStep >= 1 ? "active" : ""}`}
                    initial={shouldReduceMotion ? false : { scale: 0.94 }}
                    animate={shouldReduceMotion ? {} : { scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <i className="ti ti-map" />
                  </motion.div>
                  <div className="wizard-circle-label">Billing</div>
                </div>
                <div className="wizard-circle-item">
                  <motion.div
                    className={`wizard-circle ${wizardStep >= 2 ? "active" : ""}`}
                    initial={shouldReduceMotion ? false : { scale: 0.94 }}
                    animate={shouldReduceMotion ? {} : { scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.12 }}
                  >
                    <i className="ti ti-truck" />
                  </motion.div>
                  <div className="wizard-circle-label">Shipping</div>
                </div>
              </motion.div>

              {/* Step Content */}
              <motion.div
                className="wizard-step-content"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.1 }}
              >
                <AnimatePresence mode="wait">
                  {/* Step 0: Basic Info */}
                  {wizardStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                      exit={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="row g-3"
                    >
                      <div className="col-12">
                        <h6 className="fw-600 text-secondary mb-3">Personal Information</h6>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Customer Name *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.customerName}
                          onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control customer-wizard-input"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Password</label>
                        <div className="position-relative">
                          <input
                            type={form.showPassword ? "text" : "password"}
                            className="form-control customer-wizard-input"
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            className="btn btn-link p-0 text-muted"
                            style={{ position: "absolute", right: 12, top: 8 }}
                            onClick={() => setForm((f) => ({ ...f, showPassword: !f.showPassword }))}
                            aria-label={form.showPassword ? "Hide password" : "Show password"}
                          >
                            <i className={`ti ${form.showPassword ? "ti-eye-off" : "ti-eye"}`} />
                          </button>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          className="form-control customer-wizard-input"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control customer-wizard-input"
                          value={form.dob}
                          onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Type</label>
                        <select
                          className="form-select customer-wizard-input"
                          value={form.type}
                          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                        >
                          <option value="">-- Select Type --</option>
                          <option value="individual">Individual</option>
                          <option value="business">Business</option>
                          <option value="enterprise">Enterprise</option>
                          <option value="retail">Retail</option>
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Notes</label>
                        <textarea
                          className="form-control customer-wizard-input"
                          value={form.notes}
                          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                          placeholder="Enter any additional notes"
                          rows="3"
                          style={{ borderRadius: "0.75rem", minHeight: "80px" }}
                        ></textarea>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Billing Address */}
                  {wizardStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                      exit={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="row g-3"
                    >
                      <div className="col-md-6">
                        <label className="form-label">Contact Person</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.billingContactPerson}
                          onChange={(e) => setForm((f) => ({ ...f, billingContactPerson: e.target.value }))}
                          placeholder="Enter contact person name"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.billingCompany}
                          onChange={(e) => setForm((f) => ({ ...f, billingCompany: e.target.value }))}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Address Line 1 *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.billingAddress1}
                          onChange={(e) => setForm((f) => ({ ...f, billingAddress1: e.target.value }))}
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Address Line 2</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.billingAddress2}
                          onChange={(e) => setForm((f) => ({ ...f, billingAddress2: e.target.value }))}
                          placeholder="Enter additional address details"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.billingCity}
                          onChange={(e) => setForm((f) => ({ ...f, billingCity: e.target.value }))}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.billingState}
                          onChange={(e) => setForm((f) => ({ ...f, billingState: e.target.value }))}
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Pincode *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.billingPincode}
                          onChange={(e) => setForm((f) => ({ ...f, billingPincode: e.target.value }))}
                          placeholder="Enter pincode"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Country *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.billingCountry}
                          onChange={(e) => setForm((f) => ({ ...f, billingCountry: e.target.value }))}
                          placeholder="Enter country"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control customer-wizard-input"
                          value={form.billingPhone}
                          onChange={(e) => setForm((f) => ({ ...f, billingPhone: e.target.value }))}
                          placeholder="Enter phone"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control customer-wizard-input"
                          value={form.billingEmail}
                          onChange={(e) => setForm((f) => ({ ...f, billingEmail: e.target.value }))}
                          placeholder="Enter email"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Shipping Address */}
                  {wizardStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                      exit={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="row g-3"
                    >
                      <div className="col-md-6">
                        <label className="form-label">Contact Person</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.shippingContactPerson}
                          onChange={(e) => setForm((f) => ({ ...f, shippingContactPerson: e.target.value }))}
                          placeholder="Enter contact person name"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Company Name</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.shippingCompany}
                          onChange={(e) => setForm((f) => ({ ...f, shippingCompany: e.target.value }))}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Address Line 1 *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.shippingAddress1}
                          onChange={(e) => setForm((f) => ({ ...f, shippingAddress1: e.target.value }))}
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Address Line 2</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.shippingAddress2}
                          onChange={(e) => setForm((f) => ({ ...f, shippingAddress2: e.target.value }))}
                          placeholder="Enter additional address details"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.shippingCity}
                          onChange={(e) => setForm((f) => ({ ...f, shippingCity: e.target.value }))}
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.shippingState}
                          onChange={(e) => setForm((f) => ({ ...f, shippingState: e.target.value }))}
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Pincode *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.shippingPincode}
                          onChange={(e) => setForm((f) => ({ ...f, shippingPincode: e.target.value }))}
                          placeholder="Enter pincode"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Country *</label>
                        <input
                          type="text"
                          className="form-control customer-wizard-input"
                          value={form.shippingCountry}
                          onChange={(e) => setForm((f) => ({ ...f, shippingCountry: e.target.value }))}
                          placeholder="Enter country"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control customer-wizard-input"
                          value={form.shippingPhone}
                          onChange={(e) => setForm((f) => ({ ...f, shippingPhone: e.target.value }))}
                          placeholder="Enter phone"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control customer-wizard-input"
                          value={form.shippingEmail}
                          onChange={(e) => setForm((f) => ({ ...f, shippingEmail: e.target.value }))}
                          placeholder="Enter email"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Navigation Buttons */}
              <motion.div
                className="wizard-nav"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: 0.18 }}
              >
                {wizardStep > 0 ? (
                  <button className="btn btn-light" onClick={onPrev} disabled={saving}>
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="wizard-nav-spacer"></div>
                {wizardStep < 2 ? (
                  <button className="btn btn-primary" onClick={onNext} disabled={saving}>
                    Next
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={onSubmit} disabled={saving}>
                    {saving ? "Saving..." : "Create"}
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        className="modal-backdrop fade show customer-wizard-modal-backdrop"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        exit={shouldReduceMotion ? false : { opacity: 0 }}
        transition={{ duration: 0.18 }}
      />
    </>
  );
}
