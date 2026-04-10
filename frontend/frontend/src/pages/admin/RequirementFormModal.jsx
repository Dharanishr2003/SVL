import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./LeadsPage.css";
import { createRequirement, updateRequirement } from "../../api/requirementApi";

/* ───────── product field configs by type name ───────── */
const PRODUCT_FIELDS = {
  "visiting card": [
    { key: "finish", label: "Finish", type: "select", options: ["Matte", "Glossy", "Spot UV", "Velvet lamination"] },
    { key: "paperGsm", label: "Paper GSM", type: "select", options: ["300", "350", "400"] },
    { key: "width", label: "Width (mm)", type: "number", default: "85" },
    { key: "height", label: "Height (mm)", type: "number", default: "54" },
    { key: "printSides", label: "Print Sides", type: "select", options: ["Front only", "Front & Back"] },
    { key: "cornerStyle", label: "Corner Style", type: "select", options: ["Square", "Rounded", "Custom curve cut"] },
  ],
  "flex printing": [
    { key: "widthFt", label: "Width (ft)", type: "number" },
    { key: "heightFt", label: "Height (ft)", type: "number" },
    { key: "totalSqft", label: "Total sq.ft", type: "computed", compute: (s) => ((Number(s.widthFt) || 0) * (Number(s.heightFt) || 0)).toFixed(2) },
    { key: "printResolution", label: "Print Resolution", type: "select", options: ["720 DPI", "1440 DPI"] },
    { key: "finishing", label: "Finishing", type: "select", options: ["Hemming", "Eyelets", "Velcro", "Pocket/sleeve"] },
    { key: "usage", label: "Usage", type: "select", options: ["Indoor", "Outdoor"] },
  ],
  "sticker items": [
    { key: "shape", label: "Shape", type: "select", options: ["Rectangle", "Circle", "Square", "Custom die-cut"] },
    { key: "widthMm", label: "Width (mm)", type: "number" },
    { key: "heightMm", label: "Height (mm)", type: "number" },
    { key: "lamination", label: "Lamination", type: "select", options: ["None", "Matte", "Glossy", "UV"] },
    { key: "adhesive", label: "Adhesive", type: "select", options: ["Permanent", "Removable", "Waterproof"] },
    { key: "printColours", label: "Print Colours", type: "select", options: ["Full colour CMYK", "Single colour", "2 colour"] },
  ],
  "led sign board": [
    { key: "widthFt", label: "Width (ft)", type: "number" },
    { key: "heightFt", label: "Height (ft)", type: "number" },
    { key: "ledColour", label: "LED Colour", type: "select", options: ["White", "Warm white", "RGB multicolour", "Red", "Blue", "Green"] },
    { key: "mounting", label: "Mounting", type: "select", options: ["Wall mount", "Ceiling hang", "Stand alone", "Pole mount"] },
    { key: "powerSupply", label: "Power Supply", type: "select", options: ["Indoor 220V", "Outdoor weatherproof"] },
  ],
  "stationery": [
    { key: "size", label: "Size", type: "select", options: ["A4", "A5", "A6", "DL", "Custom"] },
    { key: "paperGsm", label: "Paper GSM", type: "select", options: ["70", "90", "130", "170", "300"] },
    { key: "pagesSheets", label: "Pages / Sheets", type: "number" },
    { key: "printSides", label: "Print Sides", type: "select", options: ["Single", "Both"] },
    { key: "binding", label: "Binding", type: "select", options: ["None", "Saddle stitch", "Perfect bind", "Spiral"] },
    { key: "coverFinish", label: "Cover Finish", type: "select", options: ["None", "Matte lamination", "Glossy lamination", "UV coating"] },
  ],
  "packaging box": [
    { key: "lengthCm", label: "Length (cm)", type: "number" },
    { key: "widthCm", label: "Width (cm)", type: "number" },
    { key: "heightCm", label: "Height (cm)", type: "number" },
    { key: "ply", label: "Ply", type: "select", options: ["Single", "3 ply", "5 ply", "7 ply"] },
    { key: "boardGsm", label: "Board GSM", type: "select", options: ["150", "200", "300", "400"] },
    { key: "print", label: "Print", type: "select", options: ["Plain", "1 colour", "2 colour", "Full colour CMYK"] },
    { key: "finish", label: "Finish", type: "select", options: ["None", "Matte lamination", "Glossy lamination", "Spot UV", "Emboss/Deboss"] },
    { key: "boxStyle", label: "Box Style", type: "select", options: ["Plain", "With window cut", "Gift finish", "With insert tray"] },
    { key: "foodSafeCoating", label: "Food Safe Coating", type: "select", options: ["Yes", "No"] },
  ],
  "fast food box": [
    { key: "material", label: "Material", type: "select", options: ["Kraft paper", "White cardboard", "Food-grade plastic", "Sugarcane bagasse", "Wooden"] },
    { key: "sizeCapacity", label: "Size / Capacity", type: "text", placeholder: "e.g. 500ml, 6 inch" },
    { key: "print", label: "Print", type: "select", options: ["No print", "1 colour logo", "Full colour branding"] },
    { key: "foodSafeLining", label: "Food Safe Lining", type: "select", options: ["Yes", "No"] },
    { key: "greaseProof", label: "Grease-proof", type: "select", options: ["Yes", "No"] },
  ],
  "zipper pouch": [
    { key: "printingType", label: "Printing Type", type: "select", options: ["Plain", "Single colour screen", "Multicolour digital", "Multicolour cylinder", "Multicolour flexo"] },
    { key: "widthMm", label: "Width (mm)", type: "number" },
    { key: "heightMm", label: "Height (mm)", type: "number" },
    { key: "gussetMm", label: "Gusset (mm)", type: "number" },
    { key: "material", label: "Material", type: "select", options: ["BOPP", "PET-PE", "Kraft paper", "Aluminium foil", "Transparent", "Matte finish"] },
    { key: "zipperColour", label: "Zipper Colour", type: "text" },
    { key: "tearNotch", label: "Tear Notch", type: "select", options: ["Yes", "No"] },
    { key: "foodGradeRequired", label: "Food Grade Required", type: "select", options: ["Yes", "No"] },
    { key: "colourMode", label: "Colour Mode", type: "select", options: ["CMYK", "Pantone", "Single spot colour"] },
    { key: "productToPack", label: "Product to be Packed", type: "text", placeholder: "e.g. dry fruits, spices, jewellery" },
  ],
  "monocotton box": [
    { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
    { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
    { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
    { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
    { key: "gsm", label: "Gsm", type: "text", placeholder: "Enter GSM" },
    { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Glossy"] },
  ],
  "branding box": [
    { key: "measurement", label: "Measurement", type: "select", options: ["mm", "cm", "inch", "feet"] },
    { key: "length", label: "Length (Size)", type: "text", placeholder: "Enter length" },
    { key: "width", label: "Width (Size)", type: "text", placeholder: "Enter width" },
    { key: "height", label: "Height (Size)", type: "text", placeholder: "Enter height" },
    { key: "gsm", label: "Gsm", type: "text", placeholder: "Enter GSM" },
    { key: "lamination", label: "Lamination", type: "select", options: ["Matt", "Glossy"] },
  ],
};

const PRINTING_GENERIC_FIELDS = [
  { key: "size", label: "Size", type: "text", placeholder: "e.g. 3.5 x 2 inch, A4, 6 x 4 ft" },
  { key: "materialOrPaper", label: "Material / Paper", type: "text", placeholder: "e.g. 300 GSM art card, vinyl, acrylic" },
  { key: "printSides", label: "Printing Sides", type: "select", options: ["Front only", "Front & Back", "Single side", "Not sure"] },
  { key: "finish", label: "Finish / Lamination", type: "text", placeholder: "e.g. matte, glossy, UV, none" },
  { key: "requirementDetails", label: "Requirement Details", type: "text", placeholder: "Any important print details" },
];

const STYLE_PREF_OPTIONS = ["Minimal", "Bold", "Traditional", "Corporate", "Fun"];

const STEP_LABELS = ["Product", "Specifications", "Design", "Delivery"];

function matchProductFields(typeName) {
  if (!typeName) return null;
  const key = typeName.trim().toLowerCase();
  if (PRODUCT_FIELDS[key]) return PRODUCT_FIELDS[key];
  for (const [k, v] of Object.entries(PRODUCT_FIELDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

function readEntryFile(entry) {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject);
  });
}

function readDirectoryEntries(directoryEntry) {
  return new Promise((resolve, reject) => {
    const reader = directoryEntry.createReader();
    const allEntries = [];

    const readBatch = () => {
      reader.readEntries(
        (entries) => {
          if (!entries.length) {
            resolve(allEntries);
            return;
          }
          allEntries.push(...entries);
          readBatch();
        },
        (error) => reject(error),
      );
    };

    readBatch();
  });
}

async function collectDroppedFiles(items) {
  const collected = [];

  const walkEntry = async (entry) => {
    if (!entry) return;
    if (entry.isFile) {
      const file = await readEntryFile(entry);
      collected.push(file);
      return;
    }
    if (entry.isDirectory) {
      const entries = await readDirectoryEntries(entry);
      for (const child of entries) {
        // eslint-disable-next-line no-await-in-loop
        await walkEntry(child);
      }
    }
  };

  if (items && items.length > 0) {
    for (const item of Array.from(items)) {
      const entry = typeof item.webkitGetAsEntry === "function"
        ? item.webkitGetAsEntry()
        : null;
      if (entry) {
        // eslint-disable-next-line no-await-in-loop
        await walkEntry(entry);
        continue;
      }
      const file = item.getAsFile?.();
      if (file) {
        collected.push(file);
      }
    }
  }

  return collected;
}

export default function RequirementFormModal({
  show,
  onClose,
  leadId,
  onSaved,
  initialRequirement = null,
  serviceCategories = [],
  serviceTypes = [],
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Master data (provided by parent, no fetch needed)
  const categories = serviceCategories;
  const allTypes = serviceTypes;

  // Selections
  const [categoryId, setCategoryId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [subtypeId, setSubtypeId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [specs, setSpecs] = useState({});

  // Design section
  const designStatus = "full_design";
  const setDesignStatus = () => {};
  const [designNotes, setDesignNotes] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [colourPreference, setColourPreference] = useState("");
  const [referenceNotes, setReferenceNotes] = useState("");
  const [brandColours, setBrandColours] = useState("");
  const [useDesignFolderUpload, setUseDesignFolderUpload] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // Delivery
  const [deliveryDate, setDeliveryDate] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Files
  const [files, setFiles] = useState([]);
  const isEditing = Boolean(initialRequirement?.id);


  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setStep(0);
      setError("");
      let parsedSpecs = {};
      try {
        parsedSpecs = initialRequirement?.specs
          ? JSON.parse(initialRequirement.specs)
          : {};
      } catch {
        parsedSpecs = {};
      }
      setCategoryId(initialRequirement?.categoryId ? String(initialRequirement.categoryId) : "");
      setTypeId(initialRequirement?.typeId ? String(initialRequirement.typeId) : "");
      setSubtypeId(initialRequirement?.subtypeId ? String(initialRequirement.subtypeId) : "");
      setQuantity(
        initialRequirement?.quantity != null ? String(initialRequirement.quantity) : "",
      );
      setSpecs(parsedSpecs);
      setDesignNotes(initialRequirement?.designNotes || "");
      setStylePreference(initialRequirement?.stylePreference || "");
      setColourPreference(initialRequirement?.colourPreference || "");
      setReferenceNotes(initialRequirement?.referenceNotes || "");
      setBrandColours(initialRequirement?.brandColours || "");
      setUseDesignFolderUpload(false);
      setIsDragActive(false);
      setDeliveryDate(initialRequirement?.deliveryDate || "");
      setSpecialInstructions(initialRequirement?.specialInstructions || "");
      setFiles([]);
    }
  }, [show, initialRequirement]);

  // Derived lists
  const typeOptions = useMemo(() => {
    if (!categoryId) return [];
    return allTypes.filter(
      (t) => String(t.categoryId) === String(categoryId) && !t.parentId,
    );
  }, [allTypes, categoryId]);

  const subtypeOptions = useMemo(() => {
    if (!typeId) return [];
    return allTypes.filter((t) => String(t.parentId) === String(typeId));
  }, [allTypes, typeId]);

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === String(categoryId)),
    [categories, categoryId],
  );
  const selectedType = useMemo(
    () => allTypes.find((t) => String(t.id) === String(typeId)),
    [allTypes, typeId],
  );
  const selectedSubtype = useMemo(
    () => allTypes.find((t) => String(t.id) === String(subtypeId)),
    [allTypes, subtypeId],
  );

  const productFields = useMemo(() => {
    const categoryName = selectedCategory?.name?.trim().toLowerCase();
    if (categoryName === "printing") {
      return PRINTING_GENERIC_FIELDS;
    }
    return matchProductFields(selectedType?.name);
  }, [selectedCategory, selectedType]);

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    const parts = ["SVL"];
    if (selectedCategory) parts.push(selectedCategory.name);
    if (selectedType) parts.push(selectedType.name);
    if (selectedSubtype) parts.push(selectedSubtype.name);
    return parts.join(" > ");
  }, [selectedCategory, selectedType, selectedSubtype]);

  const handleCategoryChange = (id) => {
    setCategoryId(id);
    setTypeId("");
    setSubtypeId("");
    setSpecs({});
  };

  const handleTypeChange = (id) => {
    setTypeId(id);
    setSubtypeId("");
    setSpecs({});
  };

  const handleSpecChange = useCallback((key, value) => {
    setSpecs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!useDesignFolderUpload) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (!useDesignFolderUpload) return;
    try {
      const droppedFiles = await collectDroppedFiles(e.dataTransfer?.items);
      if (droppedFiles.length > 0) {
        setFiles((prev) => [...prev, ...droppedFiles]);
        return;
      }
      const fallbackFiles = Array.from(e.dataTransfer?.files || []);
      if (fallbackFiles.length > 0) {
        setFiles((prev) => [...prev, ...fallbackFiles]);
      }
    } catch {
      const fallbackFiles = Array.from(e.dataTransfer?.files || []);
      if (fallbackFiles.length > 0) {
        setFiles((prev) => [...prev, ...fallbackFiles]);
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation per step
  const canProceed = (s) => {
    switch (s) {
      case 0:
        return !!categoryId && !!typeId;
      case 1:
        return !!quantity && Number(quantity) > 0;
      case 2:
        return !useDesignFolderUpload || files.length > 0;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed(step)) {
      if (step === 0) setError("Please select category and product");
      else if (step === 1) setError("Please enter a valid quantity");
      else if (step === 2) setError("Please upload at least one design file before proceeding");
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (!leadId) return;
    setError("");
    setSaving(true);
    try {
      const data = {
        leadId,
        categoryId: Number(categoryId),
        typeId: Number(typeId),
        subtypeId: subtypeId ? Number(subtypeId) : null,
        quantity: Number(quantity) || 0,
        specs: JSON.stringify(specs),
        designStatus: null,
        designNotes: designNotes || null,
        fileFormat: null,
        colourMode: null,
        stylePreference: stylePreference || null,
        colourPreference: colourPreference || null,
        referenceNotes: referenceNotes || null,
        brandColours: brandColours || null,
        deliveryDate: deliveryDate || null,
        specialInstructions: specialInstructions || null,
      };
      if (isEditing) {
        await updateRequirement(initialRequirement.id, data, files);
      } else {
        await createRequirement(data, files);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to save requirement";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const shouldReduceMotion = false;

  return (
    <>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEditing ? "Edit Requirement" : "Add Requirement"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={saving}
              />
            </div>
            <div className="modal-body">
              <div className="lead-wizard">
                {/* Breadcrumb */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <small className="text-muted">{breadcrumb}</small>
                  {step > 0 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0"
                      onClick={() => {
                        setStep(0);
                        setError("");
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {error && (
                  <div className="alert alert-danger py-2 mb-3" role="alert">
                    {error}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="lead-wizard-progress-bar">
                  <motion.div
                    className="lead-wizard-progress"
                    initial={shouldReduceMotion ? false : { width: "0%" }}
                    animate={
                      shouldReduceMotion
                        ? {}
                        : { width: `${((step + 1) / STEP_LABELS.length) * 100}%` }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>

                {/* Step Circles */}
                <motion.div
                  className="lead-wizard-circles"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                >
                  {STEP_LABELS.map((label, idx) => (
                    <div
                      key={label}
                      className="lead-wizard-circle-item"
                      onClick={() => {
                        if (idx < step) {
                          setStep(idx);
                          setError("");
                        }
                      }}
                      style={{ cursor: idx < step ? "pointer" : "default" }}
                    >
                      <motion.div
                        className={`lead-wizard-circle${step >= idx ? " active" : ""}`}
                        initial={shouldReduceMotion ? false : { scale: 0.94 }}
                        animate={shouldReduceMotion ? {} : { scale: 1 }}
                        transition={{ duration: 0.2, delay: 0.08 + idx * 0.02 }}
                      >
                        <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {idx + 1}
                        </span>
                      </motion.div>
                      <div className="lead-wizard-circle-label">{label}</div>
                    </div>
                  ))}
                </motion.div>

                {/* Step Content */}
                <motion.div
                  className="lead-create-grid"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.1 }}
                >
                  <AnimatePresence mode="wait">
                    {/* Step 0: Product Selection */}
                    {step === 0 && (
                      <motion.div
                        key="step-0"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label fw-semibold">
                              Category <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={categoryId}
                              onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                              <option value="">Select category</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
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
                              value={typeId}
                              onChange={(e) => handleTypeChange(e.target.value)}
                              disabled={!categoryId}
                            >
                              <option value="">Select product</option>
                              {typeOptions.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {typeId && subtypeOptions.length > 0 && (
                          <div className="col-md-6">
                            <div className="lead-form-field">
                              <label className="form-label fw-semibold">Sub-type</label>
                              <select
                                className="form-select"
                                value={subtypeId}
                                onChange={(e) => setSubtypeId(e.target.value)}
                              >
                                <option value="">Select sub-type</option>
                                {subtypeOptions.map((st) => (
                                  <option key={st.id} value={st.id}>
                                    {st.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {selectedCategory && (
                          <div className="col-12">
                            <div className="alert alert-info py-2 mb-0">
                              {selectedType
                                ? `Selected flow: ${selectedCategory.name} / ${selectedType.name}${selectedSubtype ? ` / ${selectedSubtype.name}` : ""}`
                                : `Select a product under ${selectedCategory.name} to continue.`}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 1: Product Specifications */}
                    {step === 1 && (
                      <motion.div
                        key="step-1"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label">
                              Quantity <span className="text-danger">*</span>
                            </label>
                            <input
                              className="form-control"
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="Enter quantity"
                            />
                          </div>
                        </div>

                        {/* Sub-type dropdown if present and not shown in step 0 */}
                        {selectedSubtype && (
                          <div className="col-md-6">
                            <div className="lead-form-field">
                              <label className="form-label">Selected Sub-type</label>
                              <input
                                className="form-control"
                                value={selectedSubtype.name}
                                readOnly
                              />
                            </div>
                          </div>
                        )}

                        {/* Product-specific fields */}
                        {productFields ? (
                          productFields.map((field) => {
                            if (field.type === "computed") {
                              const val = field.compute(specs);
                              return (
                                <div key={field.key} className="col-md-6">
                                  <div className="lead-form-field">
                                    <label className="form-label">{field.label}</label>
                                    <input
                                      className="form-control"
                                      value={val}
                                      readOnly
                                    />
                                  </div>
                                </div>
                              );
                            }
                            if (field.type === "select") {
                              return (
                                <div key={field.key} className="col-md-6">
                                  <div className="lead-form-field">
                                    <label className="form-label">{field.label}</label>
                                    <select
                                      className="form-select"
                                      value={specs[field.key] || ""}
                                      onChange={(e) =>
                                        handleSpecChange(field.key, e.target.value)
                                      }
                                    >
                                      <option value="">Select {field.label}</option>
                                      {field.options.map((opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            }
                            // text / number
                            return (
                              <div key={field.key} className="col-md-6">
                                <div className="lead-form-field">
                                  <label className="form-label">{field.label}</label>
                                  <input
                                    className="form-control"
                                    type={field.type === "number" ? "number" : "text"}
                                    value={specs[field.key] ?? (field.default || "")}
                                    onChange={(e) =>
                                      handleSpecChange(field.key, e.target.value)
                                    }
                                    placeholder={field.placeholder || ""}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="col-12">
                            <div className="alert alert-info py-2 mb-0">
                              No product-specific fields configured for this type. You can still add quantity and proceed.
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Design */}
                    {step === 2 && (
                      <motion.div
                        key="step-2"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        {false && (<div className="col-12">
                          <label className="form-label fw-semibold">
                            Design Status <span className="text-danger">*</span>
                          </label>
                          <div className="d-flex flex-wrap gap-2 mb-3">
                            {[
                              { value: "full_design", label: "Customer has full design ready" },
                              { value: "logo_only", label: "Customer has logo only — we design the rest" },
                              { value: "no_design", label: "No design — we design everything" },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                className={`btn btn-sm ${designStatus === opt.value ? "btn-primary" : "btn-outline-secondary"}`}
                                onClick={() => setDesignStatus(opt.value)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>)}

                        <div className="col-12">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="designFolderUploadSwitch"
                              checked={useDesignFolderUpload}
                              onChange={(e) => setUseDesignFolderUpload(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="designFolderUploadSwitch">
                              Customer has design folder
                            </label>
                          </div>
                          <small className="text-muted">
                            Turn this on to upload all design files together as a folder.
                          </small>
                        </div>

                        {useDesignFolderUpload && (
                          <div className="col-12">
                            <label className="form-label fw-semibold">Design Folder</label>
                            <label
                              className={`w-100 rounded-3 p-4 text-center ${isDragActive ? "border border-primary bg-light" : "border border-secondary-subtle"}`}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              style={{ cursor: "pointer", borderStyle: "dashed" }}
                            >
                              <input
                                type="file"
                                className="d-none"
                                multiple
                                webkitdirectory=""
                                directory=""
                                onChange={handleFileChange}
                              />
                              <div className="fw-semibold mb-1">
                                Drag and drop the design folder here
                              </div>
                              <small className="text-muted">
                                or click this area to choose the folder
                              </small>
                            </label>
                            {files.length > 0 && (
                              <div className="mt-2">
                                {files.map((f, i) => (
                                  <div
                                    key={`${f.name}-${i}`}
                                    className="d-flex align-items-center gap-2 py-1"
                                  >
                                    <i className="ti ti-folder text-muted" />
                                    <span className="text-truncate" style={{ maxWidth: 320 }}>
                                      {f.name}
                                    </span>
                                    <small className="text-muted">
                                      ({(f.size / 1024).toFixed(1)} KB)
                                    </small>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger ms-auto"
                                      onClick={() => removeFile(i)}
                                    >
                                      <i className="ti ti-x" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Option A: Full design */}
                        {designStatus === "full_design" && (
                          <>
                            <div className="col-12">
                              <label className="form-label">Note</label>
                              <textarea
                                className="form-control"
                                rows={3}
                                value={designNotes}
                                onChange={(e) => setDesignNotes(e.target.value)}
                                placeholder="Any instructions from customer about the file"
                              />
                            </div>
                          </>
                        )}

                        {/* Option B: Logo only */}
                        {designStatus === "logo_only" && (
                          <>
                            <div className="col-md-6">
                              <label className="form-label">Brand Colours</label>
                              <input
                                className="form-control"
                                value={brandColours}
                                onChange={(e) => setBrandColours(e.target.value)}
                                placeholder='e.g. Red #E63E2A, White'
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Reference / Inspiration</label>
                              <textarea
                                className="form-control"
                                rows={2}
                                value={referenceNotes}
                                onChange={(e) => setReferenceNotes(e.target.value)}
                                placeholder="Customer's design preferences"
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Note</label>
                              <textarea
                                className="form-control"
                                rows={2}
                                value={designNotes}
                                onChange={(e) => setDesignNotes(e.target.value)}
                                placeholder="Additional notes"
                              />
                            </div>
                          </>
                        )}

                        {/* Option C: No design */}
                        {designStatus === "no_design" && (
                          <>
                            <div className="col-md-6">
                              <label className="form-label">Style Preference</label>
                              <select
                                className="form-select"
                                value={stylePreference}
                                onChange={(e) => setStylePreference(e.target.value)}
                              >
                                <option value="">Select style</option>
                                {STYLE_PREF_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Colour Preference</label>
                              <input
                                className="form-control"
                                value={colourPreference}
                                onChange={(e) => setColourPreference(e.target.value)}
                                placeholder="Preferred colours"
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Reference Links or Notes</label>
                              <textarea
                                className="form-control"
                                rows={3}
                                value={referenceNotes}
                                onChange={(e) => setReferenceNotes(e.target.value)}
                                placeholder="Reference links, inspiration, or notes"
                              />
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}

                    {/* Step 3: Delivery */}
                    {step === 3 && (
                      <motion.div
                        key="step-3"
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        <div className="col-md-6">
                          <div className="lead-form-field">
                            <label className="form-label">Delivery Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label">Special Instructions</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value)}
                            placeholder="Any special instructions for this order"
                            style={{ resize: "vertical" }}
                          />
                        </div>

                        <div className="col-12">
                          <div className="alert alert-secondary py-2 mb-0">
                            Files are handled in the Design step. No extra file upload is needed here.
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Wizard Navigation */}
                <motion.div
                  className="lead-wizard-nav"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: 0.18 }}
                >
                  {step > 0 ? (
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={handleBack}
                      disabled={saving}
                    >
                      Previous
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={saving}
                    >
                      {saving
                        ? (isEditing ? "Updating..." : "Saving...")
                        : (isEditing ? "Update Requirement" : "Save Requirement")}
                    </button>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
