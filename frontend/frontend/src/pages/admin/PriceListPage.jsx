import { Fragment, useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/admin/PageHeader";
import { getFieldsByServiceType } from "../../api/productFieldConfigApi";
import { getPriceList, savePriceEntry, deletePriceEntry } from "../../api/priceListApi";
import { getServiceCategories } from "../../api/serviceCategoriesApi";
import { getServiceTypes } from "../../api/serviceTypesApi";
import { getCustomOptions, saveCustomOption } from "../../api/customOptionsApi";
import { collectCustomOptionSaves } from "../../utils/customSizeUtils";
import "./PriceListPage.css";

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

function variantBadges(variantFields) {
  const source = variantFields || {};
  const SKIP = new Set(["customWidth", "customHeight", "customDepth", "customUnit"]);
  return Object.entries(source)
    .filter(([key, v]) => !key.endsWith("Custom") && !key.endsWith("Text") && !SKIP.has(key) && v !== "" && v != null)
    .map(([key, v]) => {
      if (v === "Custom") {
        if (key === "size" && source.customWidth && source.customHeight) {
          const d = source.customDepth;
          const u = source.customUnit || "";
          return [key, d
            ? `${source.customWidth} × ${source.customHeight} × ${d} ${u}`.trim()
            : `${source.customWidth} × ${source.customHeight} ${u}`.trim()];
        }
        if (source[`${key}Custom`]) return [key, source[`${key}Custom`]];
      }
      return [key, v];
    });
}

function validateStep(step, form, subtypeOptions, pricingStep = 2) {
  if (step === 0) {
    if (!form.categoryId) return "Please select a category.";
    if (!form.typeId) return "Please select a product type.";
    if (subtypeOptions.length > 0 && !form.subtypeId) return "Please select a sub-product.";
  }
  if (step === pricingStep) {
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
function StepCircles({ step, stepLabels }) {
  return (
    <>
      <div className="lead-wizard-progress-bar">
        <div
          className="lead-wizard-progress"
          style={{ width: `${(step / (stepLabels.length - 1)) * 100}%` }}
        />
      </div>
      <div className="lead-wizard-circles">
        {stepLabels.map((label, i) => (
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

function VariantField({ field, value, variantFields, onChange, optionsOverride }) {
  if (field.hidden) return null;

  if (field.type === "select") {
    const opts = (optionsOverride || field.options || []).filter((o) => o !== "Custom");

    return (
      <div className="col-md-6">
        <div className="lead-form-field">
          <label className="form-label">{field.label}</label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <select
              className="form-select"
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
            >
              <option value="">-- Select --</option>
              {value === "Custom" && field.allowCustom && (() => {
                if (field.key === "size") {
                  if (field.customSizeMode === "text") {
                    const customValue = variantFields.sizeCustom;
                    return (
                      <option key="Custom" value="Custom">
                        {customValue ? `Custom: ${customValue}` : "Custom"}
                      </option>
                    );
                  }
                  const width = variantFields.customWidth;
                  const height = variantFields.customHeight;
                  const depth = variantFields.customDepth;
                  const unit = variantFields.customUnit || "ft";
                  return (
                    <option key="Custom" value="Custom">
                      {width || height ? `Custom: ${width} ${unit} × ${height} ${unit}${depth ? ` × ${depth} ${unit}` : ""}` : "Custom"}
                    </option>
                  );
                }
                const customValue = variantFields[`${field.key}Custom`];
                return (
                  <option key="Custom" value="Custom">
                    {customValue ? `Custom: ${customValue}` : "Custom"}
                  </option>
                );
              })()}
              {opts.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {field.allowCustom && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary ms-1"
                style={{ flexShrink: 0 }}
                onClick={() => onChange(field, "Custom")}
                title="Add custom value"
              >
                <i className="ti ti-plus" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (field.hasUnit && (field.type === "number" || field.type === "text")) {
    return (
      <div className="col-md-6">
        <div className="lead-form-field">
          <label className="form-label">{field.label}</label>
          <div style={{ display: "flex", alignItems: "stretch", width: "100%" }}>
            <input
              className="form-control unit-input"
              type={field.type === "number" ? "number" : "text"}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={field.placeholder || ""}
            />
            <select
              className="form-select unit-select"
              value={variantFields[`${field.key}Unit`] ?? field.defaultUnit ?? ""}
              onChange={(e) => {
                onChange({ ...field, key: `${field.key}Unit` }, e.target.value);
              }}
            >
              {(field.unitOptions || []).map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  const measurementValue = variantFields["measurement"];
  const isDimensionField = ["length", "width", "height", "gusset", "depth", "diameter"].includes(field.key);
  const dimensionSuffix = isDimensionField && !field.hasUnit && measurementValue ? ` (in ${measurementValue})` : "";

  return (
    <div className="col-md-6">
      <div className="lead-form-field">
        <label className="form-label">{field.label}{dimensionSuffix}</label>
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
  const [editingSessionIdx, setEditingSessionIdx] = useState(null);
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
  const [customOptionsByFieldKey, setCustomOptionsByFieldKey] = useState({});

  const typeOptions = useMemo(
    () => allTypes.filter((t) => String(t.categoryId) === String(form.categoryId) && !t.parentId),
    [allTypes, form.categoryId]
  );
  const subtypeOptions = useMemo(
    () => allTypes.filter((t) => String(t.parentId) === String(form.typeId)),
    [allTypes, form.typeId]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(form.categoryId)),
    [categories, form.categoryId]
  );
  const selectedType = useMemo(
    () => allTypes.find((t) => String(t.id) === String(form.typeId)),
    [allTypes, form.typeId]
  );
  const selectedSubtype = useMemo(
    () => allTypes.find((t) => String(t.id) === String(form.subtypeId)),
    [allTypes, form.subtypeId]
  );

  const [fields, setFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const variantSteps = useMemo(() => {
    if (!fields || fields.length === 0) {
      return [{ section: "Variant", fields: [] }];
    }
    if (fields.length > 8) {
      const numTabs = Math.ceil(fields.length / 8);
      const fieldsPerTab = Math.ceil(fields.length / numTabs);
      const chunks = [];
      for (let i = 0; i < fields.length; i += fieldsPerTab) {
        chunks.push(fields.slice(i, i + fieldsPerTab));
      }
      return chunks.map((chunk, idx) => ({
        section: idx === 0 ? "Variant" : `Variant ${idx + 1}`,
        fields: chunk,
      }));
    }
    return [{ section: "Variant", fields: fields }];
  }, [fields]);

  const variantStepCount = variantSteps.length;
  const firstVariantStep = 1;
  const pricingStep = firstVariantStep + variantStepCount;
  const addedStep = pricingStep + 1;

  const currentVariant = variantSteps[
    Math.max(0, Math.min(step - firstVariantStep, variantSteps.length - 1))
  ] || { section: "Variant", fields: [] };

  const isVariantStep = step >= firstVariantStep && step < pricingStep;
  const stepLabels = useMemo(() => ([
    "Product",
    ...variantSteps.map((s) => s.section),
    "Pricing",
    "Added",
  ]), [variantSteps]);

  useEffect(() => {
    const resolvedId = form.subtypeId || form.typeId;
    if (!resolvedId) { setFields([]); return; }
    let cancelled = false;
    setFieldsLoading(true);
    getFieldsByServiceType(resolvedId)
      .then((data) => {
        if (cancelled) return;
        const mapped = (data || []).map((f) => ({
          key: f.fieldKey,
          label: f.label,
          type: f.fieldType,
          options: f.options || [],
          isRequired: f.isRequired,
          placeholder: f.placeholder,
          allowCustom: f.allowCustom,
          customDimensions: f.customDimensions || ["width", "height"],
          customDimensionUnit: f.customDimensionUnit || "mm",
          customSizeMode: f.customSizeMode || null,
          hidden: f.isHidden,
          hasUnit: f.hasUnit,
          unitOptions: f.unitOptions || [],
          defaultUnit: f.defaultUnit,
          dependsOn: f.dependsOn,
          dependsOnValue: f.dependsOnValue,
        }));
        setFields(mapped);
        setForm((p) => {
          const next = { ...(p.variantFields || {}) };
          mapped.forEach((mf) => {
            if (mf.hasUnit && mf.defaultUnit && next[`${mf.key}Unit`] === undefined) {
              next[`${mf.key}Unit`] = mf.defaultUnit;
            }
          });
          return { ...p, variantFields: next };
        });
      })
      .catch(() => { if (!cancelled) setFields([]); })
      .finally(() => { if (!cancelled) setFieldsLoading(false); });
    return () => { cancelled = true; };
  }, [form.typeId, form.subtypeId]);

  // Fetch saved custom options for all allowCustom select fields for this wizard scope
  useEffect(() => {
    if (!form.typeId) { setCustomOptionsByFieldKey({}); return; }
    const allowCustomFields = (fields || []).filter((f) => f.type === "select" && f.allowCustom && !f.promptText);
    if (!allowCustomFields.length) { setCustomOptionsByFieldKey({}); return; }

    Promise.all(
      allowCustomFields.map((f) =>
        getCustomOptions(form.typeId, form.subtypeId || null, f.key)
          .then((opts) => [f.key, (opts || []).map((o) => o.valueRaw)])
          .catch(() => [f.key, []])
      )
    ).then((pairs) => {
      setCustomOptionsByFieldKey(Object.fromEntries(pairs));
    });
  }, [form.typeId, form.subtypeId, fields]);

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
      // Some products (e.g. Reflector Flex) treat size as a text custom value (sizeCustom),
      // not as width/height dimensions (customWidth/customHeight).
      if (field.customSizeMode === "text") {
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

      const configDims = field.customDimensions || [];
      const hasDimensionFields = configDims.length > 0
        ? true
        : (fields || []).some((f) => f.key === "customWidth");
      const hasDepthField = configDims.length > 0
        ? (configDims.includes("Depth") || configDims.includes("depth"))
        : (fields || []).some((f) => f.key === "customDepth");
      const unit = configDims.length > 0
        ? (field.customDimensionUnit || "mm")
        : null;

      if (hasDimensionFields) {
        if (hasDepthField) {
          setDepthSizeDialog({
            open: true,
            width: form.variantFields.customWidth || "",
            height: form.variantFields.customHeight || "",
            depth: form.variantFields.customDepth || "",
            sizeUnit: unit || "mm",
          });
          return;
        }

        setCustomSpecDialog({
          open: true, field,
          value: "", isFlexCustomSize: true, isTextPrompt: false,
          flexWidth: form.variantFields.customWidth || "",
          flexHeight: form.variantFields.customHeight || "",
          customSizeUnitLabel: unit || "mm",
          sizeUnit: unit || "mm",
          textRows: 4, selectedOption: "",
        });
        return;
      }

      // legacy fallback — name-based detection for existing products
      const typeName = (selectedType?.name || "").toLowerCase();
      const subtypeName = (selectedSubtype?.name || "").toLowerCase();
      const isSticker = typeName.includes("sticker") || subtypeName.includes("sticker");
      const isCard = typeName.includes("card") || subtypeName.includes("card");
      const hasDepthFieldLegacy = (fields || []).some((f) => f.key === "customDepth");
      const useMm = hasDepthFieldLegacy || isSticker || isCard;
      const fallbackUnit = unit || (isCard || hasDepthFieldLegacy ? "mm" : "ft");
      let unitLabel = "ft";
      if (isSticker) unitLabel = "mm or inch";
      else if (isCard || hasDepthFieldLegacy) unitLabel = "mm";

      if (hasDepthFieldLegacy) {
        setDepthSizeDialog({
          open: true,
          width: form.variantFields.customWidth || "",
          height: form.variantFields.customHeight || "",
          depth: form.variantFields.customDepth || "",
          sizeUnit: fallbackUnit || (useMm ? "mm" : "ft"),
        });
        return;
      }

      setCustomSpecDialog({
        open: true, field,
        value: "", isFlexCustomSize: true, isTextPrompt: false,
        flexWidth: form.variantFields.customWidth || "",
        flexHeight: form.variantFields.customHeight || "",
        customSizeUnitLabel: unitLabel,
        sizeUnit: fallbackUnit || (useMm ? "mm" : "ft"),
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
        if (field.key === "size") {
          delete next.customWidth;
          delete next.customHeight;
          delete next.customDepth;
          delete next.customUnit;
          delete next.sizeCustom;
        }
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
      const sizeLabel = `${w} × ${h} ${customSpecDialog.sizeUnit}`;
      saveCustomOption(
        form.typeId,
        form.subtypeId || null,
        "size",
        sizeLabel
      ).catch(() => {});
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
    if (val) {
      saveCustomOption(
        form.typeId,
        form.subtypeId || null,
        field.key,
        val
      ).catch(() => {});
    }
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
    const err = validateStep(pricingStep, form, subtypeOptions, pricingStep);
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
      if (editingSessionIdx !== null) {
        setSessionItems((p) => p.map((item, idx) => idx === editingSessionIdx ? entry : item));
        setEditingSessionIdx(null);
      } else {
        setSessionItems((p) => [...p, entry]);
      }
      setStep(addedStep);
    } else {
      onSave("save", subtypeOptions, fields, pricingStep);
    }
  }

  function handleDone() {
    if (isAddMode && onPersist && sessionItems.length > 0) {
      onPersist(sessionItems);
    }
    onClose();
  }

  function handleAddItem() {
    if (Array.isArray(sessionItems) && sessionItems.length > 0) {
      const lastItem = sessionItems[sessionItems.length - 1];
      setForm({
        categoryId: lastItem.categoryId || "",
        typeId: lastItem.typeId || "",
        subtypeId: lastItem.subtypeId || "",
        variantFields: { ...(lastItem.variantFields || {}) },
        quantitySlabs: [{ minQty: "", maxQty: "", pricePerPiece: "" }],
      });
    } else {
      setForm(emptyForm());
    }
    setEditingSessionIdx(null);
    setStep(firstVariantStep);
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
                  <StepCircles step={step} stepLabels={stepLabels} />

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

                        <div
                          className="col-md-6"
                          style={{ visibility: form.typeId && subtypeOptions.length > 0 ? "visible" : "hidden" }}
                        >
                          <div className="lead-form-field">
                            <label className="form-label fw-semibold">Sub-product</label>
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

                        {selectedCategory && (
                          <div className="col-12">
                            <div className="alert alert-info py-2 mb-0">
                              {selectedType
                                ? `Selected: ${selectedCategory.name} / ${selectedType.name}${selectedSubtype ? ` / ${selectedSubtype.name}` : ""}`
                                : `Select a product under ${selectedCategory.name} to continue.`}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 1 — Variant Details */}
                    {isVariantStep && (
                      <div className="row g-3 lead-wizard-step-panel">
                        {fieldsLoading ? (
                          <div className="col-12 text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="text-muted mt-2 small">Loading fields…</div>
                          </div>
                        ) : currentVariant.fields.length === 0 ? (
                          <div className="col-12">
                            <p className="text-muted">No variant fields for this product type.</p>
                          </div>
                        ) : (
                          currentVariant.fields.map((field) => {
                            if (field.hidden) return null;
                            if (field.dependsOn && field.dependsOn.trim() !== "") {
                              const parentValue = form.variantFields[field.dependsOn];
                              if (parentValue !== field.dependsOnValue) return null;
                            }
                            let optionsOverride = undefined;
                            if (field.type === "select" && field.allowCustom && !field.promptText) {
                              const savedForField = customOptionsByFieldKey[field.key] || [];
                              const staticOpts = (field.options || []).filter((o) => o !== "Custom");
                              const alreadyInStatic = new Set(staticOpts.map((o) => String(o).toLowerCase()));
                              const uniqueSaved = savedForField.filter((s) => !alreadyInStatic.has(String(s).toLowerCase()));
                              const hasCustomOpt = (field.options || []).includes("Custom");
                              optionsOverride = [...staticOpts, ...uniqueSaved, ...(hasCustomOpt ? ["Custom"] : [])];
                            }
                            return (
                              <VariantField
                                key={field.key}
                                field={field}
                                value={form.variantFields[field.key] ?? ""}
                                variantFields={form.variantFields}
                                onChange={handleVariantChange}
                                optionsOverride={optionsOverride}
                              />
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Step 2 — Pricing */}
                    {step === pricingStep && (
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
                    {step === addedStep && isAddMode && (
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
                    {step > 0 && step < addedStep ? (
                      <button type="button" className="btn btn-light" onClick={() => setStep((s) => s - 1)}>
                        Previous
                      </button>
                    ) : step === addedStep ? (
                      <button type="button" className="btn btn-light" onClick={() => {
                        if (Array.isArray(sessionItems) && sessionItems.length > 0) {
                          const lastIdx = sessionItems.length - 1;
                          const lastItem = sessionItems[lastIdx];
                          setForm({
                            categoryId: lastItem.categoryId || "",
                            typeId: lastItem.typeId || "",
                            subtypeId: lastItem.subtypeId || "",
                            variantFields: { ...(lastItem.variantFields || {}) },
                            quantitySlabs: (lastItem.quantitySlabs || []).map((s) => ({
                              minQty: String(s.minQty ?? ""),
                              maxQty: String(s.maxQty ?? ""),
                              pricePerPiece: String(s.pricePerPiece ?? ""),
                            })),
                          });
                          setEditingSessionIdx(lastIdx);
                        }
                        setStep(pricingStep);
                      }}>
                        Previous
                      </button>
                    ) : (
                      <div />
                    )}
                    {step < pricingStep ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => onSave("next", subtypeOptions, fields, pricingStep)}
                      >
                        Next
                      </button>
                    ) : step === pricingStep ? (
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
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [selectedSubtypeId, setSelectedSubtypeId] = useState(null);

  // Service data
  const [categories, setCategories] = useState([]);
  const [allTypes, setAllTypes] = useState([]);

  useEffect(() => {
    Promise.all([getPriceList(), getServiceCategories(), getServiceTypes()])
      .then(([priceList, cats, types]) => {
        setRows(Array.isArray(priceList) ? priceList : []);
        const catArray = Array.isArray(cats) ? cats : [];
        setCategories(catArray);
        if (catArray.length > 0) setSelectedCategoryId((prev) => prev ?? catArray[0].id);
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

  const reload = async () => {
    const data = await getPriceList();
    setRows(Array.isArray(data) ? data : []);
  };

  const filteredRows = useMemo(() => {
    let result = selectedCategoryId
      ? rows.filter((r) => String(r.categoryId) === String(selectedCategoryId))
      : rows;
    if (selectedTypeId) {
      result = result.filter((r) => String(r.typeId) === String(selectedTypeId));
    }
    if (selectedSubtypeId) {
      result = result.filter((r) => String(r.subtypeId) === String(selectedSubtypeId));
    }
    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (r) =>
          (r.typeName || "").toLowerCase().includes(q) ||
          (r.subtypeName || "").toLowerCase().includes(q) ||
          Object.values(r.variantFields || {}).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return result;
  }, [rows, search, selectedCategoryId, selectedTypeId, selectedSubtypeId]);

  const groupedRows = useMemo(() => {
    const map = new Map();
    for (const row of filteredRows) {
      const key = `${row.typeName || ""}|${row.subtypeName || ""}`;
      if (!map.has(key)) {
        map.set(key, { groupKey: key, typeName: row.typeName || "", subtypeName: row.subtypeName || "", rows: [] });
      }
      map.get(key).rows.push(row);
    }
    return Array.from(map.values());
  }, [filteredRows]);

  const typesForCategory = useMemo(
    () => allTypes.filter((t) => !t.parentId && String(t.categoryId) === String(selectedCategoryId)),
    [allTypes, selectedCategoryId]
  );

  const subtypesForType = useMemo(
    () => allTypes.filter((t) => String(t.parentId) === String(selectedTypeId)),
    [allTypes, selectedTypeId]
  );

  const selectedTypeHasSubtypes = subtypesForType.length > 0;

  const countByTypeId = useMemo(() => {
    const map = {};
    rows
      .filter((r) => String(r.categoryId) === String(selectedCategoryId))
      .forEach((r) => {
        const k = String(r.typeId);
        map[k] = (map[k] || 0) + 1;
      });
    return map;
  }, [rows, selectedCategoryId]);

  const countBySubtypeId = useMemo(() => {
    const map = {};
    rows
      .filter((r) => String(r.typeId) === String(selectedTypeId))
      .forEach((r) => {
        const k = String(r.subtypeId ?? "__none__");
        map[k] = (map[k] || 0) + 1;
      });
    return map;
  }, [rows, selectedTypeId]);

  /* ── wizard action handler ── */
  function handleWizardAction(action, form, step, setStep, setError, entryId, subtypeOptions, fieldDefs, pricingStep = 2) {
    const err = validateStep(step, form, subtypeOptions, pricingStep);
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
    }).then(() => {
      // Persist custom options for all allowCustom fields
      if (form.typeId) {
        const saves = collectCustomOptionSaves(fieldDefs || [], form.variantFields);
        saves.forEach(({ fieldKey, valueRaw }) => {
          saveCustomOption(
            Number(form.typeId),
            form.subtypeId ? Number(form.subtypeId) : null,
            fieldKey,
            valueRaw
          ).catch(() => {});
        });
      }
      reload();
      setShowEdit(false);
    }).catch(() => {});
  }

  function handleAddItemSaved(entries) {
    Promise.all(entries.map((entry) => savePriceEntry(entry))).then(() => {
      // Persist custom options for all allowCustom fields across all session entries
      entries.forEach((entry) => {
        if (!entry.typeId) return;
        const resolvedId = entry.subtypeId || entry.typeId;
        getFieldsByServiceType(resolvedId)
          .then((data) => {
            const fieldDefs = (data || []).map((f) => ({
              key: f.fieldKey, type: f.fieldType, allowCustom: f.allowCustom,
            }));
            const saves = collectCustomOptionSaves(fieldDefs, entry.variantFields);
            saves.forEach(({ fieldKey, valueRaw }) => {
              saveCustomOption(
                Number(entry.typeId),
                entry.subtypeId ? Number(entry.subtypeId) : null,
                fieldKey,
                valueRaw
              ).catch(() => {});
            });
          })
          .catch(() => {});
      });
      reload();
    }).catch(() => {});
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
    deletePriceEntry(deleteTarget.id).then(() => {
      reload();
      setDeleteTarget(null);
    }).catch(() => {});
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

        {/* Category tabs */}
        {categories.length > 0 && (
          <div style={{ marginBottom: "1.5rem", borderBottom: "1px solid #e6edf5" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategoryId(cat.id); setSelectedTypeId(null); setSelectedSubtypeId(null); }}
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: selectedCategoryId === cat.id ? "#45597a" : "transparent",
                    color: selectedCategoryId === cat.id ? "#fff" : "#666",
                    border: "none",
                    borderBottom: selectedCategoryId === cat.id ? "3px solid #45597a" : "3px solid transparent",
                    cursor: "pointer",
                    fontWeight: selectedCategoryId === cat.id ? "600" : "400",
                    transition: "all 0.2s",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Breadcrumb nav */}
        {selectedTypeId && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#666" }}>
            <button
              onClick={() => { setSelectedTypeId(null); setSelectedSubtypeId(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#45597a", fontWeight: 600, padding: 0 }}
            >
              ← Back
            </button>
            <span>/</span>
            <span
              style={{ cursor: selectedSubtypeId ? "pointer" : "default", color: selectedSubtypeId ? "#45597a" : "#333", fontWeight: selectedSubtypeId ? 400 : 600 }}
              onClick={() => selectedSubtypeId && setSelectedSubtypeId(null)}
            >
              {allTypes.find((t) => String(t.id) === String(selectedTypeId))?.name || ""}
            </span>
            {selectedSubtypeId && (
              <>
                <span>/</span>
                <span style={{ color: "#333", fontWeight: 600 }}>
                  {allTypes.find((t) => String(t.id) === String(selectedSubtypeId))?.name || ""}
                </span>
              </>
            )}
          </div>
        )}

        {/* Level 1: Type cards */}
        {!selectedTypeId && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
            {typesForCategory.length === 0 ? (
              <p style={{ color: "#999", gridColumn: "1/-1" }}>No products in this category yet.</p>
            ) : (
              typesForCategory.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTypeId(t.id); setSelectedSubtypeId(null); }}
                  style={{
                    textAlign: "left",
                    background: "#fff",
                    border: "1px solid #e0e7ef",
                    borderRadius: "10px",
                    padding: "1rem 1.25rem",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#45597a"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(69,89,122,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e7ef"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#10233f", marginBottom: "0.25rem" }}>{t.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#7b8fa8" }}>{countByTypeId[String(t.id)] || 0} entries</div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Level 2: Subtype cards */}
        {selectedTypeId && selectedTypeHasSubtypes && !selectedSubtypeId && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
            {subtypesForType.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedSubtypeId(st.id)}
                style={{
                  textAlign: "left",
                  background: "#fff",
                  border: "1px solid #e0e7ef",
                  borderRadius: "10px",
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#45597a"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(69,89,122,0.15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e0e7ef"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#10233f", marginBottom: "0.25rem" }}>{st.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#7b8fa8" }}>{countBySubtypeId[String(st.id)] || 0} entries</div>
              </button>
            ))}
          </div>
        )}

        {/* Level 3: Variant table */}
        {selectedTypeId && (!selectedTypeHasSubtypes || selectedSubtypeId) && (
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
                ) : (() => {
                  let rowNum = 0;
                  return groupedRows.map((group) => {
                    const headerLabel = group.subtypeName
                      ? `${group.typeName} — ${group.subtypeName}`
                      : group.typeName || "—";
                    return (
                      <Fragment key={group.groupKey}>
                        <tr style={{ backgroundColor: "#f0f4fa" }}>
                          <td
                            colSpan={5}
                            style={{
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              color: "#10233f",
                              padding: "0.45rem 0.75rem",
                            }}
                          >
                            {headerLabel}
                          </td>
                        </tr>
                        {group.rows.map((row) => {
                          rowNum += 1;
                          const badges = variantBadges(row.variantFields);
                          return (
                            <tr key={row.id}>
                              <td className="text-muted" style={{ fontSize: "0.82rem" }}>{rowNum}</td>
                              <td />
                              <td>
                                {badges.length === 0 ? (
                                  <small className="text-muted">—</small>
                                ) : (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    {badges.map(([k, v]) => (
                                      <span
                                        key={k}
                                        style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "3px",
                                          backgroundColor: "#eef2fb",
                                          border: "1px solid #d8e2f5",
                                          borderRadius: "6px",
                                          padding: "2px 7px",
                                          fontSize: "0.75rem",
                                          color: "#34393f",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <span style={{ color: "#7b8fa8", fontWeight: 600 }}>{k}:</span>
                                        {String(v)}
                                      </span>
                                    ))}
                                  </div>
                                )}
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
                          );
                        })}
                      </Fragment>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
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
          onSave={(action, subtypeOptions, fieldDefs, currentPricingStep) =>
            handleWizardAction(action, addForm, addStep, setAddStep, setAddError, null, subtypeOptions, fieldDefs, currentPricingStep)
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
          onSave={(action, subtypeOptions, fieldDefs, currentPricingStep) =>
            handleWizardAction(action, editForm, editStep, setEditStep, setEditError, editingId, subtypeOptions, fieldDefs, currentPricingStep)
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
