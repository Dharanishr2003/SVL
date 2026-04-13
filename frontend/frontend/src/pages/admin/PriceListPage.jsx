import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/admin/PageHeader";
import { matchProductFields } from "../../utils/productFieldConfigs";
import { getPriceList, savePriceEntry, deletePriceEntry } from "../../api/priceListApi";
import { getServiceCategories } from "../../api/serviceCategoriesApi";
import { getServiceTypes } from "../../api/serviceTypesApi";
import "./PriceListPage.css";

const STEP_LABELS = ["Product Type", "Variant Details", "Pricing", "Added Products"];

/* ── helpers ──────────────────────────────────────────────────────────── */
function emptyForm() {
  return {
    categoryId: "",
    typeId: "",
    subtypeId: "",
    variantFields: {},
    quantitySlabs: [{ minQty: "", maxQty: "", pricePerPiece: "" }],
  };
}

function variantSummary(variantFields) {
  const source = variantFields || {};
  const SKIP = new Set(["customWidth", "customHeight", "customDepth", "customUnit"]);
  const entries = Object.entries(source)
    .filter(([key, v]) => !key.endsWith("Custom") && !key.endsWith("Text") && !SKIP.has(key) && v !== "" && v != null)
    .map(([key, v]) => {
      if (v === "Custom") {
        if (key === "size" && source.customWidth && source.customHeight) {
          const d = source.customDepth;
          const u = source.customUnit || "";
          return [key, d ? `${source.customWidth} × ${source.customHeight} × ${d} ${u}`.trim() : `${source.customWidth} × ${source.customHeight} ${u}`.trim()];
        }
        if (source[`${key}Custom`]) return [key, source[`${key}Custom`]];
      }
      return [key, v];
    });
  if (!entries.length) return "—";
  const shown = entries.slice(0, 3).map(([, v]) => v).join(", ");
  return entries.length > 3 ? `${shown} +${entries.length - 3} more` : shown;
}

function validateStep(step, form, subtypeOptions) {
  if (step === 0) {
    if (!form.categoryId) return "Please select a category.";
    if (!form.typeId) return "Please select a product type.";
    if (subtypeOptions.length > 0 && !form.subtypeId) return "Please select a sub-product.";
  }
  if (step === 2) {
    const valid = form.quantitySlabs.filter(
      (s) => s.minQty !== "" && s.maxQty !== "" && s.pricePerPiece !== "" && Number(s.pricePerPiece) > 0
    );
    if (!valid.length) return "Add at least one quantity slab with min qty, max qty and price.";
    for (const s of valid) {
      if (Number(s.minQty) >= Number(s.maxQty)) return "Min qty must be less than max qty in each slab.";
    }
  }
  return null;
}

/* ── sub-components ───────────────────────────────────────────────────── */
function StepCircles({ step }) {
  return (
    <>
      <div className="lead-wizard-progress-bar">
        <div
          className="lead-wizard-progress"
          style={{ width: `${(step / (STEP_LABELS.length - 1)) * 100}%` }}
        />
      </div>
      <div className="lead-wizard-circles">
        {STEP_LABELS.map((label, i) => (
          <div className="lead-wizard-circle-item" key={label}>
            <div className={`lead-wizard-circle${step >= i ? " active" : ""}`}>
              <span>{i + 1}</span>
            </div>
            <div className="lead-wizard-circle-label">{label}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function VariantField({ field, value, variantFields, onChange }) {
  if (field.hidden) return null;

  if (field.type === "select") {
    const opts = field.options || [];

    return (
      <div className="col-md-6">
        <div className="lead-form-field">
          <label className="form-label">{field.label}</label>
          <select
            className="form-select"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
          >
            <option value="">-- Select --</option>
            {opts.map((o) => {
              if (o === "Custom" && field.allowCustom && value === "Custom") {
                if (field.key === "size") {
                  const width = variantFields.customWidth;
                  const height = variantFields.customHeight;
                  const depth = variantFields.customDepth;
                  const unit = variantFields.customUnit || "ft";
                  return (
                    <option key={o} value={o}>
                      {width || height ? `Custom: ${width} ${unit} × ${height} ${unit}${depth ? ` × ${depth} ${unit}` : ""}` : "Custom"}
                    </option>
                  );
                }
                const customValue = variantFields[`${field.key}Custom`];
                return (
                  <option key={o} value={o}>
                    {customValue ? `Custom: ${customValue}` : "Custom"}
                  </option>
                );
              }
              return (
                <option key={o} value={o}>{o}</option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="col-md-6">
      <div className="lead-form-field">
        <label className="form-label">{field.label}</label>
        <input
          type={field.type === "number" ? "number" : "text"}
          className="form-control"
          placeholder={field.placeholder || ""}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />
      </div>
    </div>
  );
}
function WizardModal({ title, form, setForm, step, setStep, onClose, onSave, onPersist, error, categories, allTypes, isAddMode }) {
  const [sessionItems, setSessionItems] = useState([]);
  const [customSpecDialog, setCustomSpecDialog] = useState({
    open: false, field: null, value: "",
    isFlexCustomSize: false, isTextPrompt: false,
    flexWidth: "", flexHeight: "", sizeUnit: "mm",
    customSizeUnitLabel: "ft", textRows: 4, selectedOption: "",
  });
  const [depthSizeDialog, setDepthSizeDialog] = useState({
    open: false, width: "", height: "", depth: "", sizeUnit: "mm",
  });
  const [dialogError, setDialogError] = useState("");

  const typeOptions = useMemo(
    () => allTypes.filter((t) => String(t.categoryId) === String(form.categoryId) && !t.parentId),
    [allTypes, form.categoryId]
  );
  const subtypeOptions = useMemo(
    () => allTypes.filter((t) => String(t.parentId) === String(form.typeId)),
    [allTypes, form.typeId]
  );

  const selectedType = useMemo(
    () => allTypes.find((t) => String(t.id) === String(form.typeId)),
    [allTypes, form.typeId]
  );
  const selectedSubtype = useMemo(
    () => allTypes.find((t) => String(t.id) === String(form.subtypeId)),
    [allTypes, form.subtypeId]
  );

  const fields = useMemo(
    () => matchProductFields(
      selectedType?.name,
      selectedSubtype?.name,
      selectedType?.fieldConfigKey,
      selectedSubtype?.fieldConfigKey,
    ),
    [selectedType, selectedSubtype]
  );

  function handleCategoryChange(catId) {
    setForm((p) => ({
      ...p,
      categoryId: catId,
      typeId: "",
      subtypeId: "",
      variantFields: {},
    }));
  }

  function handleTypeChange(tId) {
    setForm((p) => ({
      ...p,
      typeId: tId,
      subtypeId: "",
      variantFields: {},
    }));
  }

  function closeCustomSpecDialog() {
    setCustomSpecDialog({
      open: false, field: null, value: "",
      isFlexCustomSize: false, isTextPrompt: false,
      flexWidth: "", flexHeight: "", sizeUnit: "mm",
      customSizeUnitLabel: "ft", textRows: 4, selectedOption: "",
    });
    setDialogError("");
  }

  const handleVariantChange = (field, val) => {
    if (field.key === "size" && val === "Custom") {
      const typeName = (selectedType?.name || "").toLowerCase();
      const subtypeName = (selectedSubtype?.name || "").toLowerCase();
      const isSticker = typeName.includes("sticker") || subtypeName.includes("sticker");
      const isCard = typeName.includes("card") || subtypeName.includes("card");
      const hasDepthField = (fields || []).some((f) => f.key === "customDepth");
      const useMm = hasDepthField || isSticker || isCard;
      let unitLabel = "ft";
      if (isSticker) unitLabel = "mm or inch";
      else if (isCard || hasDepthField) unitLabel = "mm";

      if (hasDepthField) {
        setDepthSizeDialog({
          open: true,
          width: form.variantFields.customWidth || "",
          height: form.variantFields.customHeight || "",
          depth: form.variantFields.customDepth || "",
          sizeUnit: useMm ? "mm" : "ft",
        });
        return;
      }

      setCustomSpecDialog({
        open: true, field,
        value: "", isFlexCustomSize: true, isTextPrompt: false,
        flexWidth: form.variantFields.customWidth || "",
        flexHeight: form.variantFields.customHeight || "",
        customSizeUnitLabel: unitLabel,
        sizeUnit: useMm ? "mm" : "ft",
        textRows: 4, selectedOption: "",
      });
      return;
    }

    if (field.promptText && val) {
      setCustomSpecDialog({
        open: true, field,
        value: String(form.variantFields[`${field.key}Text`] || "").trim(),
        isFlexCustomSize: false, isTextPrompt: true,
        textRows: field.textRows || 4,
        selectedOption: val,
        flexWidth: "", flexHeight: "",
        customSizeUnitLabel: "ft", sizeUnit: "mm",
      });
      return;
    }

    if (field.allowCustom && val === "Custom") {
      setCustomSpecDialog({
        open: true, field,
        value: String(form.variantFields[`${field.key}Custom`] || "").trim(),
        isFlexCustomSize: false, isTextPrompt: false,
        flexWidth: "", flexHeight: "",
        customSizeUnitLabel: "ft", sizeUnit: "mm",
        textRows: 4, selectedOption: "",
      });
      return;
    }

    setForm((p) => {
      const next = { ...p.variantFields, [field.key]: val };
      if (field.allowCustom && val !== "Custom") {
        delete next[`${field.key}Custom`];
      }
      return { ...p, variantFields: next };
    });
  };

  function saveCustomSpecDialog() {
    const field = customSpecDialog.field;
    if (!field && !customSpecDialog.isFlexCustomSize) return;

    if (customSpecDialog.isFlexCustomSize) {
      const w = String(customSpecDialog.flexWidth || "").trim();
      const h = String(customSpecDialog.flexHeight || "").trim();
      if (!w || !h) { setDialogError("Please enter both width and height"); return; }
      setForm((p) => ({
        ...p,
        variantFields: { ...p.variantFields, size: "Custom", customWidth: w, customHeight: h, customUnit: customSpecDialog.sizeUnit },
      }));
      closeCustomSpecDialog();
      return;
    }

    if (customSpecDialog.isTextPrompt) {
      const text = String(customSpecDialog.value || "").trim();
      setForm((p) => ({
        ...p,
        variantFields: { ...p.variantFields, [field.key]: customSpecDialog.selectedOption, [`${field.key}Text`]: text },
      }));
      closeCustomSpecDialog();
      return;
    }

    const val = String(customSpecDialog.value || "").trim();
    setForm((p) => {
      const next = { ...p.variantFields };
      if (!val) {
        delete next[field.key];
        delete next[`${field.key}Custom`];
      } else {
        next[field.key] = "Custom";
        next[`${field.key}Custom`] = val;
      }
      return { ...p, variantFields: next };
    });
    closeCustomSpecDialog();
  }

  const handleSlabChange = (i, field, val) =>
    setForm((p) => {
      const slabs = [...p.quantitySlabs];
      slabs[i] = { ...slabs[i], [field]: val };
      return { ...p, quantitySlabs: slabs };
    });

  const addSlab = () =>
    setForm((p) => ({
      ...p,
      quantitySlabs: [...p.quantitySlabs, { minQty: "", maxQty: "", pricePerPiece: "" }],
    }));

  const removeSlab = (i) =>
    setForm((p) => ({ ...p, quantitySlabs: p.quantitySlabs.filter((_, idx) => idx !== i) }));

  function handleSavePrice() {
    const err = validateStep(2, form, subtypeOptions);
    if (err) return;

    const validSlabs = form.quantitySlabs
      .filter((s) => s.minQty !== "" && s.maxQty !== "" && s.pricePerPiece !== "")
      .map((s) => ({
        minQty: Number(s.minQty),
        maxQty: Number(s.maxQty),
        pricePerPiece: Number(s.pricePerPiece),
      }));

    const entry = {
      categoryId: form.categoryId,
      typeId: form.typeId,
      subtypeId: form.subtypeId || null,
      typeName: selectedType?.name || "",
      subtypeName: selectedSubtype?.name || "",
      variantFields: form.variantFields,
      quantitySlabs: validSlabs,
    };

    if (isAddMode) {
      setSessionItems((p) => [...p, entry]);
      setStep(3);
    } else {
      onSave("save", subtypeOptions);
    }
  }

  function handleDone() {
    if (isAddMode && onPersist && sessionItems.length > 0) {
      onPersist(sessionItems);
    }
    onClose();
  }

  function handleAddItem() {
    setForm((p) => ({
      ...p,
      variantFields: {},
      quantitySlabs: [{ minQty: "", maxQty: "", pricePerPiece: "" }],
    }));
    setStep(1);
  }

  return (
    <>
      <div className="modal fade show lead-create-modal" style={{ display: "block" }} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body lead-create-shell service-types-modal-body">
              <div className="lead-wizard">
                  <StepCircles step={step} />

                  {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

                  <div className="lead-create-grid">
                    {/* Step 0 — Category / Type / Subtype */}
                    {step === 0 && (
                      <div className="row g-3 lead-wizard-step-panel">
                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label fw-semibold">
                              Category <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={form.categoryId}
                              onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                              <option value="">Select category</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label fw-semibold">
                              Product <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={form.typeId}
                              onChange={(e) => handleTypeChange(e.target.value)}
                              disabled={!form.categoryId}
                            >
                              <option value="">Select product</option>
                              {typeOptions.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {form.typeId && subtypeOptions.length > 0 && (
                          <div className="col-md-6">
                            <div className="lead-form-field">
                              <label className="form-label fw-semibold">Sub-Product</label>
                              <select
                                className="form-select"
                                value={form.subtypeId}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    subtypeId: e.target.value,
                                    variantFields: {},
                                  }))
                                }
                              >
                                <option value="">Select sub-type</option>
                                {subtypeOptions.map((st) => (
                                  <option key={st.id} value={st.id}>{st.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 1 — Variant Details */}
                    {step === 1 && (
                      <div className="row g-3 lead-wizard-step-panel">
                        {fields.length === 0 ? (
                          <div className="col-12">
                            <p className="text-muted">No variant fields for this product type.</p>
                          </div>
                        ) : (
                          fields.map((field) => (
                            !field.hidden && (
                              <VariantField
                                key={field.key}
                                field={field}
                                value={form.variantFields[field.key] ?? ""}
                                variantFields={form.variantFields}
                                onChange={handleVariantChange}
                              />
                            )
                          ))
                        )}
                      </div>
                    )}

                    {/* Step 2 — Pricing */}
                    {step === 2 && (
                      <div className="row g-3 lead-wizard-step-panel">
                        <div className="col-12">
                          <label className="form-label">
                            Quantity Slabs <span className="text-danger">*</span>
                          </label>
                          <table className="price-list-slab-table">
                            <thead>
                              <tr>
                                <th>Min Qty</th>
                                <th>Max Qty</th>
                                <th>Price / Piece (₹)</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {form.quantitySlabs.map((slab, i) => (
                                <tr key={i}>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control"
                                      placeholder="e.g. 1"
                                      min="0"
                                      value={slab.minQty}
                                      onChange={(e) => handleSlabChange(i, "minQty", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control"
                                      placeholder="e.g. 100"
                                      min="0"
                                      value={slab.maxQty}
                                      onChange={(e) => handleSlabChange(i, "maxQty", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      className="form-control"
                                      placeholder="e.g. 5.00"
                                      min="0"
                                      step="0.01"
                                      value={slab.pricePerPiece}
                                      onChange={(e) => handleSlabChange(i, "pricePerPiece", e.target.value)}
                                    />
                                  </td>
                                  <td style={{ width: 40 }}>
                                    {form.quantitySlabs.length > 1 && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-link text-danger p-0"
                                        onClick={() => removeSlab(i)}
                                      >
                                        <i className="ti ti-trash" />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button
                            type="button"
                            className="btn btn-outline-primary price-list-add-slab-btn"
                            onClick={addSlab}
                          >
                            <i className="ti ti-plus me-1" />Add Slab
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                    {/* Step 3 — Added Products (add mode only) */}
                    {step === 3 && isAddMode && (
                      <div className="price-list-added-items">
                        <table className="table price-list-added-table mb-3">
                          <thead>
                            <tr>
                              <th style={{ width: 60 }}>#</th>
                              <th>Product</th>
                              <th>Variant Details</th>
                              <th>Qty Slabs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessionItems.map((item, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td className="fw-semibold">
                                  {item.typeName}
                                  {item.subtypeName && (
                                    <span className="text-muted fw-normal"> / {item.subtypeName}</span>
                                  )}
                                </td>
                                <td>
                                  <small className="text-muted">{variantSummary(item.variantFields)}</small>
                                </td>
                                <td>
                                  {(item.quantitySlabs || []).map((s, i) => (
                                    <div key={i}>
                                      <small>{s.minQty}–{s.maxQty} pcs: ₹{s.pricePerPiece}/pc</small>
                                    </div>
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="lead-wizard-nav">
                    {step > 0 && step < 3 ? (
                      <button type="button" className="btn btn-light" onClick={() => setStep((s) => s - 1)}>
                        Previous
                      </button>
                    ) : step === 3 ? (
                      <button type="button" className="btn btn-light" onClick={() => setStep(2)}>
                        Previous
                      </button>
                    ) : (
                      <div />
                    )}
                    {step < 2 ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onSave("next", subtypeOptions)}
                      >
                        Next
                      </button>
                    ) : step === 2 ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSavePrice}
                      >
                        Save Price
                      </button>
                    ) : (
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={handleAddItem}
                        >
                          <i className="ti ti-plus me-1" />Add Item
                        </button>
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={handleDone}
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </div>
      </div>
      <div className="modal-backdrop fade show lead-create-backdrop" />

      {customSpecDialog.open && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.35)", zIndex: 1070 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {customSpecDialog.isFlexCustomSize ? "Enter Custom Size" : `Enter Custom ${customSpecDialog.field?.label}`}
                </h5>
                <button type="button" className="btn-close" onClick={closeCustomSpecDialog} />
              </div>
              <div className="modal-body" style={{ padding: "1.5rem" }}>
                {customSpecDialog.isFlexCustomSize ? (
                  <>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Unit <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={customSpecDialog.sizeUnit}
                        onChange={(e) => setCustomSpecDialog((p) => ({ ...p, sizeUnit: e.target.value }))}
                      >
                        <option value="mm">Millimeters (mm)</option>
                        <option value="cm">Centimeters (cm)</option>
                        <option value="ft">Feet (ft)</option>
                        <option value="inch">Inches (inch)</option>
                      </select>
                    </div>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Width ({customSpecDialog.sizeUnit}) <span className="text-danger">*</span></label>
                      <input
                        className="form-control" type="number" autoFocus
                        value={customSpecDialog.flexWidth}
                        onChange={(e) => setCustomSpecDialog((p) => ({ ...p, flexWidth: e.target.value }))}
                        placeholder={`Enter width in ${customSpecDialog.sizeUnit}`}
                      />
                    </div>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Height ({customSpecDialog.sizeUnit}) <span className="text-danger">*</span></label>
                      <input
                        className="form-control" type="number"
                        value={customSpecDialog.flexHeight}
                        onChange={(e) => setCustomSpecDialog((p) => ({ ...p, flexHeight: e.target.value }))}
                        placeholder={`Enter height in ${customSpecDialog.sizeUnit}`}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveCustomSpecDialog(); } }}
                      />
                    </div>
                    {dialogError && <div className="alert alert-danger py-2 mb-0">{dialogError}</div>}
                  </>
                ) : (
                  <div className="lead-form-field">
                    <label className="form-label">
                      {customSpecDialog.isTextPrompt ? `${customSpecDialog.selectedOption} Details` : customSpecDialog.field?.label}
                    </label>
                    {customSpecDialog.isTextPrompt ? (
                      <textarea
                        className="form-control" autoFocus
                        rows={customSpecDialog.textRows || 4}
                        value={customSpecDialog.value}
                        onChange={(e) => setCustomSpecDialog((p) => ({ ...p, value: e.target.value }))}
                        placeholder={`Enter ${customSpecDialog.selectedOption?.toLowerCase() || "details"}`}
                      />
                    ) : (
                      <input
                        className="form-control" autoFocus
                        value={customSpecDialog.value}
                        onChange={(e) => setCustomSpecDialog((p) => ({ ...p, value: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveCustomSpecDialog(); } }}
                        placeholder={customSpecDialog.field?.customPlaceholder || `Enter ${customSpecDialog.field?.label || "value"}`}
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={closeCustomSpecDialog}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={saveCustomSpecDialog}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {depthSizeDialog.open && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1070 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Custom Size</h5>
                <button type="button" className="btn-close"
                  onClick={() => { setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" }); setDialogError(""); }}
                />
              </div>
              <div className="modal-body" style={{ padding: "1.5rem" }}>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Unit <span className="text-danger">*</span></label>
                  <select className="form-select" value={depthSizeDialog.sizeUnit}
                    onChange={(e) => setDepthSizeDialog((p) => ({ ...p, sizeUnit: e.target.value }))}
                  >
                    <option value="mm">Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="ft">Feet (ft)</option>
                    <option value="inch">Inches (inch)</option>
                  </select>
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Width ({depthSizeDialog.sizeUnit}) <span className="text-danger">*</span></label>
                  <input className="form-control" type="number" autoFocus value={depthSizeDialog.width}
                    onChange={(e) => setDepthSizeDialog((p) => ({ ...p, width: e.target.value }))}
                    placeholder={`Enter width in ${depthSizeDialog.sizeUnit}`}
                  />
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Height ({depthSizeDialog.sizeUnit}) <span className="text-danger">*</span></label>
                  <input className="form-control" type="number" value={depthSizeDialog.height}
                    onChange={(e) => setDepthSizeDialog((p) => ({ ...p, height: e.target.value }))}
                    placeholder={`Enter height in ${depthSizeDialog.sizeUnit}`}
                  />
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Depth ({depthSizeDialog.sizeUnit})</label>
                  <input className="form-control" type="number" value={depthSizeDialog.depth}
                    onChange={(e) => setDepthSizeDialog((p) => ({ ...p, depth: e.target.value }))}
                    placeholder={`Enter depth in ${depthSizeDialog.sizeUnit}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const w = String(depthSizeDialog.width || "").trim();
                        const h = String(depthSizeDialog.height || "").trim();
                        if (!w || !h) { setDialogError("Please enter both width and height"); return; }
                        setForm((p) => ({ ...p, variantFields: { ...p.variantFields, size: "Custom", customWidth: w, customHeight: h, customDepth: String(depthSizeDialog.depth || "").trim(), customUnit: depthSizeDialog.sizeUnit } }));
                        setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" });
                        setDialogError("");
                      }
                    }}
                  />
                </div>
                {dialogError && <div className="alert alert-danger py-2 mb-0">{dialogError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light"
                  onClick={() => { setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" }); setDialogError(""); }}
                >Cancel</button>
                <button type="button" className="btn btn-primary"
                  onClick={() => {
                    const w = String(depthSizeDialog.width || "").trim();
                    const h = String(depthSizeDialog.height || "").trim();
                    if (!w || !h) { setDialogError("Please enter both width and height"); return; }
                    setForm((p) => ({ ...p, variantFields: { ...p.variantFields, size: "Custom", customWidth: w, customHeight: h, customDepth: String(depthSizeDialog.depth || "").trim(), customUnit: depthSizeDialog.sizeUnit } }));
                    setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" });
                    setDialogError("");
                  }}
                >Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Main page ────────────────────────────────────────────────────────── */
export default function PriceListPage() {
  const [rows, setRows] = useState(() => getPriceList());
  const [search, setSearch] = useState("");

  // Service data
  const [categories, setCategories] = useState([]);
  const [allTypes, setAllTypes] = useState([]);

  useEffect(() => {
    Promise.all([getServiceCategories(), getServiceTypes()])
      .then(([cats, types]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setAllTypes(Array.isArray(types) ? types : []);
      })
      .catch(() => {});
  }, []);

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm());
  const [addStep, setAddStep] = useState(0);
  const [addError, setAddError] = useState("");

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm());
  const [editStep, setEditStep] = useState(0);
  const [editError, setEditError] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = () => setRows(getPriceList());

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.typeName || "").toLowerCase().includes(q) ||
        (r.subtypeName || "").toLowerCase().includes(q) ||
        Object.values(r.variantFields || {}).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  /* ── wizard action handler ── */
  function handleWizardAction(action, form, step, setStep, setError, entryId, subtypeOptions) {
    const err = validateStep(step, form, subtypeOptions);
    if (err) { setError(err); return; }
    setError("");

    if (action === "next") {
      setStep((s) => s + 1);
      return;
    }

    // Edit mode only (add mode uses onPersist callback)
    const selectedType = allTypes.find((t) => String(t.id) === String(form.typeId));
    const selectedSubtype = allTypes.find((t) => String(t.id) === String(form.subtypeId));

    const validSlabs = form.quantitySlabs
      .filter((s) => s.minQty !== "" && s.maxQty !== "" && s.pricePerPiece !== "")
      .map((s) => ({
        minQty: Number(s.minQty),
        maxQty: Number(s.maxQty),
        pricePerPiece: Number(s.pricePerPiece),
      }));

    savePriceEntry({
      ...(entryId ? { id: entryId } : {}),
      categoryId: form.categoryId,
      typeId: form.typeId,
      subtypeId: form.subtypeId || null,
      typeName: selectedType?.name || "",
      subtypeName: selectedSubtype?.name || "",
      variantFields: form.variantFields,
      quantitySlabs: validSlabs,
    });
    reload();
    setShowEdit(false);
  }

  function handleAddItemSaved(entries) {
    entries.forEach((entry) => savePriceEntry(entry));
    reload();
  }

  /* ── open edit ── */
  function openEdit(row) {
    setEditForm({
      categoryId: row.categoryId || "",
      typeId: row.typeId || "",
      subtypeId: row.subtypeId || "",
      variantFields: { ...(row.variantFields || {}) },
      quantitySlabs: (row.quantitySlabs || [{ minQty: "", maxQty: "", pricePerPiece: "" }]).map((s) => ({
        minQty: String(s.minQty ?? ""),
        maxQty: String(s.maxQty ?? ""),
        pricePerPiece: String(s.pricePerPiece ?? ""),
      })),
    });
    setEditingId(row.id);
    setEditStep(0);
    setEditError("");
    setShowEdit(true);
  }

  /* ── delete ── */
  function handleDelete() {
    deletePriceEntry(deleteTarget.id);
    reload();
    setDeleteTarget(null);
  }

  return (
    <div className="products-shell">
      <PageHeader
        title="Price List"
        breadcrumb={[
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "Services", path: "" },
          { label: "Price List", path: "" },
        ]}
      />

      <div className="leads-page-body">
        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <button
            className="btn btn-success leads-toolbar-btn leads-primary-action"
            onClick={() => {
              setAddForm(emptyForm());
              setAddStep(0);
              setAddError("");
              setShowAdd(true);
            }}
          >
            <i className="ti ti-plus me-1" />
            Add Price
          </button>
        </div>

        {/* Search */}
        <div className="leads-search-row">
          <div className="leads-search-box">
            <label className="mb-0 leads-search-label">Search</label>
            <input
              className="form-control leads-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or variant..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="leads-table-wrap">
          <table className="table leads-table mb-0">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Product</th>
                <th>Variant Details</th>
                <th>Qty Slabs</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No price entries yet. Click "Add Price" to get started.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={row.id}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">
                      {row.typeName || "—"}
                      {row.subtypeName && (
                        <span className="text-muted fw-normal"> / {row.subtypeName}</span>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">{variantSummary(row.variantFields)}</small>
                    </td>
                    <td>
                      {(row.quantitySlabs || []).map((s, i) => (
                        <div key={i}>
                          <small>{s.minQty}–{s.maxQty} pcs: ₹{s.pricePerPiece}/pc</small>
                        </div>
                      ))}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm d-inline-flex align-items-center justify-content-center me-1"
                        style={{ backgroundColor: "#6f65d6", color: "#fff", width: 32, height: 32, padding: 0, borderRadius: 4, border: "none" }}
                        onClick={() => openEdit(row)}
                        title="Edit"
                      >
                        <i className="ti ti-edit" style={{ fontSize: 14 }} />
                      </button>
                      <button
                        className="btn btn-sm d-inline-flex align-items-center justify-content-center"
                        style={{ backgroundColor: "#e74c3c", color: "#fff", width: 32, height: 32, padding: 0, borderRadius: 4, border: "none" }}
                        onClick={() => setDeleteTarget(row)}
                        title="Delete"
                      >
                        <i className="ti ti-trash" style={{ fontSize: 14 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <WizardModal
          title="Add Price Entry"
          form={addForm}
          setForm={setAddForm}
          step={addStep}
          setStep={setAddStep}
          onClose={() => setShowAdd(false)}
          error={addError}
          categories={categories}
          allTypes={allTypes}
          isAddMode={true}
          onSave={(action, subtypeOptions) =>
            handleWizardAction(action, addForm, addStep, setAddStep, setAddError, null, subtypeOptions)
          }
          onPersist={handleAddItemSaved}
        />
      )}

      {/* Edit Modal */}
      {showEdit && (
        <WizardModal
          title="Edit Price Entry"
          form={editForm}
          setForm={setEditForm}
          step={editStep}
          setStep={setEditStep}
          onClose={() => setShowEdit(false)}
          error={editError}
          categories={categories}
          allTypes={allTypes}
          isAddMode={false}
          onSave={(action, subtypeOptions) =>
            handleWizardAction(action, editForm, editStep, setEditStep, setEditError, editingId, subtypeOptions)
          }
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <>
          <div className="modal fade show lead-create-modal" style={{ display: "block" }} tabIndex="-1">
            <div className="modal-dialog modal-sm modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Price Entry</h5>
                  <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)} />
                </div>
                <div className="modal-body">
                  <p className="mb-0">
                    Delete price entry for{" "}
                    <strong>{deleteTarget.typeName || "this entry"}</strong>
                    {deleteTarget.subtypeName && (
                      <> / <strong>{deleteTarget.subtypeName}</strong></>
                    )}
                    ? This cannot be undone.
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show lead-create-backdrop" />
        </>
      )}
    </div>
  );
}



