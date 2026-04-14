// frontend/frontend/src/pages/admin/AddItemModal.jsx
import React, { useState, useMemo, useEffect } from "react";
import SpecsInlineForm from "./SpecsInlineForm";

// Pure helpers — defined locally to avoid coupling with QuotationPage
function findSlab(quantitySlabs, qty) {
  const list = Array.isArray(quantitySlabs) ? quantitySlabs : [];
  const n = Number(qty);
  if (!n || n <= 0) return null;
  return list.find((s) => n >= Number(s.minQty) && n <= Number(s.maxQty)) ?? null;
}

function formatCustomSize(width, height, depth, unit) {
  if (!width || !height) return "";
  return depth
    ? `${width} x ${height} x ${depth} ${unit || ""}`.trim()
    : `${width} x ${height} ${unit || ""}`.trim();
}

function getVariantSummary(variantFields) {
  const source = variantFields || {};
  const skipKeys = new Set(["customWidth", "customHeight", "customDepth", "customUnit"]);
  const entries = Object.entries(source)
    .filter(([key, value]) =>
      !key.endsWith("Custom") && !key.endsWith("Text") && !skipKeys.has(key) &&
      value !== "" && value != null
    )
    .map(([key, value]) => {
      if (value === "Custom") {
        if (key === "size") {
          const formatted = formatCustomSize(
            source.customWidth, source.customHeight, source.customDepth, source.customUnit
          );
          if (formatted) return [key, formatted];
        }
        if (source[`${key}Custom`]) return [key, source[`${key}Custom`]];
      }
      return [key, value];
    });
  if (!entries.length) return "-";
  const shown = entries.slice(0, 3).map(([, v]) => v).join(", ");
  return entries.length > 3 ? `${shown} +${entries.length - 3} more` : shown;
}

export default function AddItemModal({ open, priceList = [], prefill, onConfirm, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [selectedSubtypeId, setSelectedSubtypeId] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [specs, setSpecs] = useState({});
  const [error, setError] = useState("");
  const [priceUpdated, setPriceUpdated] = useState(false);

  // Reset and apply prefill each time modal opens
  useEffect(() => {
    if (!open) return;
    const hasType = prefill?.typeId != null;
    const hasProduct = prefill?.productId != null;
    setStep(hasProduct ? 3 : hasType ? 2 : 1);
    setSelectedTypeId(prefill?.typeId ?? null);
    setSelectedSubtypeId(prefill?.subtypeId ?? null);
    setSelectedEntryId(prefill?.productId ?? null);
    setQuantity(prefill?.quantity != null ? String(prefill.quantity) : "");
    setSpecs(prefill?.specs ?? {});
    setError("");
    setPriceUpdated(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived: unique types from price list
  const types = useMemo(() => {
    const seen = new Map();
    for (const p of priceList) {
      if (!seen.has(p.typeId)) seen.set(p.typeId, { id: p.typeId, name: p.typeName });
    }
    return [...seen.values()];
  }, [priceList]);

  // Derived: unique subtypes for selected type
  const subtypes = useMemo(() => {
    if (!selectedTypeId) return [];
    const filtered = priceList.filter((p) => Number(p.typeId) === Number(selectedTypeId));
    const seen = new Map();
    for (const p of filtered) {
      const key = p.subtypeId ?? "__none__";
      if (!seen.has(key)) seen.set(key, { id: p.subtypeId, name: p.subtypeName });
    }
    return [...seen.values()];
  }, [priceList, selectedTypeId]);

  // Derived: candidate price entries for selected type + subtype
  const candidates = useMemo(() => {
    if (!selectedTypeId) return [];
    return priceList.filter((p) => {
      const typeMatch = Number(p.typeId) === Number(selectedTypeId);
      const subMatch =
        selectedSubtypeId == null
          ? p.subtypeId == null
          : Number(p.subtypeId) === Number(selectedSubtypeId);
      return typeMatch && subMatch;
    });
  }, [priceList, selectedTypeId, selectedSubtypeId]);

  const selectedEntry = useMemo(
    () => candidates.find((c) => Number(c.id) === Number(selectedEntryId)) ?? null,
    [candidates, selectedEntryId]
  );

  const selectedTypeName = useMemo(
    () => types.find((t) => Number(t.id) === Number(selectedTypeId))?.name ?? "",
    [types, selectedTypeId]
  );

  const selectedSubtypeName = useMemo(
    () => subtypes.find((s) => s.id === selectedSubtypeId)?.name ?? null,
    [subtypes, selectedSubtypeId]
  );

  // Auto-pricing — reacts to every quantity keystroke
  const slab = useMemo(
    () => findSlab(selectedEntry?.quantitySlabs, quantity),
    [selectedEntry, quantity]
  );

  const unitPrice = useMemo(() => {
    if (!slab) return null;
    const v = Number(slab.pricePerPiece);
    return Number.isFinite(v) ? v : null;
  }, [slab]);

  const lineTotal = useMemo(
    () => (unitPrice != null && quantity ? Number(quantity) * unitPrice : null),
    [unitPrice, quantity]
  );

  // Auto-advance step 2 when there is only one subtype option
  useEffect(() => {
    if (subtypes.length === 1) {
      setSelectedSubtypeId(subtypes[0].id);
      setSelectedEntryId(null);
      setStep(3);
    }
  }, [subtypes]); // step removed — subtypes changes when type changes, which is when auto-advance should run

  function handleSelectType(typeId) {
    setSelectedTypeId(typeId);
    setSelectedSubtypeId(null);
    setSelectedEntryId(null);
    setError("");
    setStep(2);
  }

  function handleSelectSubtype(subtypeId) {
    setSelectedSubtypeId(subtypeId);
    setSelectedEntryId(null);
    setError("");
    setStep(3);
  }

  function handleQuantityChange(e) {
    setQuantity(e.target.value);
    // Show "Price updated" indicator only during edits where original price existed
    if (prefill?.unitPrice != null) setPriceUpdated(true);
  }

  function handleConfirm() {
    setError("");

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (!selectedEntry) {
      setError("Please select a product variant.");
      return;
    }

    const resolvedUnitPrice = unitPrice ?? 0;
    const pricingStatus = unitPrice != null ? "PRICED" : "UNPRICED";

    // Build optionsSummary for line items table and PDF
    const specParts = Object.entries(specs)
      .filter(([, v]) => v !== "" && v != null)
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 6);
    const variantSummary = getVariantSummary(selectedEntry.variantFields);
    const variantPart = variantSummary !== "-" ? `Variant: ${variantSummary}` : "";
    const optionsSummary = [...specParts, variantPart].filter(Boolean).join(", ") || "-";

    const productName = [selectedTypeName, selectedSubtypeName].filter(Boolean).join(" - ");

    onConfirm({
      id: prefill?.id ?? `item-${Date.now()}`,
      productId: Number(selectedEntry.id),
      typeId: selectedEntry.typeId,
      subtypeId: selectedEntry.subtypeId ?? null,
      typeName: selectedEntry.typeName,
      subtypeName: selectedEntry.subtypeName ?? null,
      productName: productName || selectedTypeName,
      quantity: qty,
      unitPrice: resolvedUnitPrice,
      pricePerUnit: resolvedUnitPrice, // kept for PDF compatibility (quotationUtils uses pricePerUnit)
      lineTotal: qty * resolvedUnitPrice,
      pricingStatus,
      specs,
      variantFields: selectedEntry.variantFields ?? {},
      optionsSummary,
      designCost: prefill?.designCost ?? 0,
      priceListEntryId: Number(selectedEntry.id),
    });
  }

  if (!open) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{prefill?.id ? "Edit Item" : "Add Item"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* Step breadcrumb */}
              <div className="d-flex gap-2 align-items-center mb-4 small">
                <span className={step >= 1 ? "fw-semibold text-primary" : "text-muted"}>
                  1. Product Type
                </span>
                <i className="ti ti-chevron-right text-muted" />
                <span className={step >= 2 ? "fw-semibold text-primary" : "text-muted"}>
                  2. Subtype
                </span>
                <i className="ti ti-chevron-right text-muted" />
                <span className={step >= 3 ? "fw-semibold text-primary" : "text-muted"}>
                  3. Variant & Qty
                </span>
              </div>

              {/* Step 1: Type selection */}
              {step === 1 && (
                <div>
                  <p className="text-muted mb-3">Select a product category:</p>
                  {types.length === 0 && (
                    <div className="alert alert-warning">No products in price list yet.</div>
                  )}
                  <div className="row g-2">
                    {types.map((t) => (
                      <div key={t.id} className="col-6 col-md-4">
                        <div
                          role="button"
                          className={`border rounded p-3 text-center${Number(selectedTypeId) === Number(t.id) ? " border-primary bg-primary bg-opacity-10" : ""}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectType(t.id)}
                        >
                          {t.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Subtype selection */}
              {step === 2 && (
                <div>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 mb-3 text-decoration-none"
                    onClick={() => { setSelectedSubtypeId(null); setStep(1); }}
                  >
                    ← Back
                  </button>
                  <p className="text-muted mb-3">Select a subtype:</p>
                  <div className="row g-2">
                    {subtypes.map((s) => (
                      <div key={s.id ?? "__none__"} className="col-6 col-md-4">
                        <div
                          role="button"
                          className={`border rounded p-3 text-center${selectedSubtypeId === s.id ? " border-primary bg-primary bg-opacity-10" : ""}`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectSubtype(s.id)}
                        >
                          {s.name || "(Default)"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Variant + Qty + Specs */}
              {step === 3 && (
                <div>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 mb-3 text-decoration-none"
                    onClick={() => {
                      setSelectedEntryId(null);
                      setStep(subtypes.length > 1 ? 2 : 1);
                    }}
                  >
                    ← Back
                  </button>

                  {/* Variant table */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Variant</label>
                    {candidates.length === 0 ? (
                      <div className="alert alert-warning mb-0">
                        No products configured for this combination.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover table-bordered align-middle mb-0">
                          <thead>
                            <tr>
                              <th style={{ width: 36 }}></th>
                              <th>Variant</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidates.map((c) => {
                              const isSelected = Number(selectedEntryId) === Number(c.id);
                              return (
                                <tr
                                  key={c.id}
                                  role="button"
                                  style={{ cursor: "pointer", background: isSelected ? "var(--bs-primary-bg-subtle, #e8f0fe)" : "" }}
                                  onClick={() => setSelectedEntryId(c.id)}
                                >
                                  <td className="text-center">
                                    <input type="radio" readOnly checked={isSelected} onChange={() => {}} />
                                  </td>
                                  <td>{getVariantSummary(c.variantFields)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Quantity + live price */}
                  <div className="row g-3 mb-3 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={quantity}
                        onChange={handleQuantityChange}
                        min={1}
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div className="col-md-8">
                      <div className="border rounded p-2 bg-light">
                        {unitPrice != null ? (
                          <div className="d-flex justify-content-between align-items-center">
                            <span>
                              Rs.&nbsp;{unitPrice.toFixed(2)} / piece
                              &nbsp;→&nbsp;
                              <strong>Rs.&nbsp;{(lineTotal ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                            </span>
                            {priceUpdated && (
                              <span className="text-muted small ms-2">Price updated</span>
                            )}
                          </div>
                        ) : quantity && selectedEntry ? (
                          <span className="badge bg-danger">PRICE NOT FOUND for this quantity</span>
                        ) : (
                          <span className="text-muted small">Enter quantity to see price</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline specs */}
                  {selectedTypeName && (
                    <div className="border-top pt-3">
                      <div className="fw-semibold mb-2">
                        Customization&nbsp;
                        <span className="text-muted small fw-normal">(optional)</span>
                      </div>
                      <SpecsInlineForm typeName={selectedTypeName} specs={specs} onChange={setSpecs} />
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="alert alert-danger mt-3 mb-0">
                  <i className="ti ti-alert-circle me-2"></i>{error}
                </div>
              )}
            </div>

            {/* Footer only shown on step 3 */}
            {step === 3 && (
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirm}>
                  {prefill?.id ? "Update Item" : "Add Item"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
