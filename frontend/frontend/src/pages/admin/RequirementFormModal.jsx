import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./LeadsPage.css";
import "./RequirementFormModal.css";
import { createRequirement, updateRequirement } from "../../api/requirementApi";
import { getCustomOptions, saveCustomOption } from "../../api/customOptionsApi";
import { collectCustomOptionSaves } from "../../utils/customSizeUtils";
import { getFieldsByServiceType } from "../../api/productFieldConfigApi";

const STYLE_PREF_OPTIONS = ["Minimal", "Bold", "Traditional", "Corporate", "Fun"];

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
  const [customSpecDialog, setCustomSpecDialog] = useState({
    open: false,
    field: null,
    value: "",
    isFlexCustomSize: false,
    flexWidth: "",
    flexHeight: "",
    sizeUnit: "mm",
  });
  const [depthSizeDialog, setDepthSizeDialog] = useState({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" });
  // Map of fieldKey → string[] of saved custom options for current type/subtype
  const [customOptionsByFieldKey, setCustomOptionsByFieldKey] = useState({});

  // Design section
  const [designMode, setDesignMode] = useState(""); // "design_only" | "production_only" | "design_production"
  const [designNotes, setDesignNotes] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [colourPreference, setColourPreference] = useState("");
  const [referenceNotes, setReferenceNotes] = useState("");
  const [brandColours, setBrandColours] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  // Delivery
  const [deliveryDate, setDeliveryDate] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Files
  const [files, setFiles] = useState([]);
  const isEditing = Boolean(initialRequirement?.id);

  const handleModalClose = useCallback(() => {
    if (saving) return;
    setError("");
    onClose();
  }, [onClose, saving]);


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
      setDesignMode("");
      setIsDragActive(false);
      setDeliveryDate(initialRequirement?.deliveryDate || "");
      setSpecialInstructions(initialRequirement?.specialInstructions || "");
      setFiles([]);
      setCustomSpecDialog({ open: false, field: null, value: "" });
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

  const [productFields, setProductFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  useEffect(() => {
    const resolvedId = subtypeId || typeId;
    if (!resolvedId) { setProductFields([]); return; }
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
          isHidden: f.isHidden,
          hidden: f.isHidden,
          hasUnit: f.hasUnit,
          unitOptions: f.unitOptions || [],
          defaultUnit: f.defaultUnit,
          enable3rdDimension: f.enable3rdDimension,
          thirdDimensionLabel: f.thirdDimensionLabel,
          dependsOn: f.dependsOn,
          dependsOnValue: f.dependsOnValue,
        }));
        setProductFields(mapped);
        setSpecs((prev) => {
          const next = { ...prev };
          let changed = false;
          mapped.forEach((mf) => {
            if (mf.hasUnit && mf.defaultUnit && next[`${mf.key}Unit`] === undefined) {
              next[`${mf.key}Unit`] = mf.defaultUnit;
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      })
      .catch(() => {
        if (!cancelled) setProductFields([]);
      })
      .finally(() => {
        if (!cancelled) setFieldsLoading(false);
      });
    return () => { cancelled = true; };
  }, [typeId, subtypeId]);

  // Fetch saved custom options for all allowCustom fields whenever type/subtype changes
  useEffect(() => {
    if (!typeId) { setCustomOptionsByFieldKey({}); return; }
    const allowCustomFields = (productFields || []).filter(
      (f) => f.type === "select" && f.allowCustom && !f.promptText
    );
    if (!allowCustomFields.length) { setCustomOptionsByFieldKey({}); return; }
    Promise.all(
      allowCustomFields.map((f) =>
        getCustomOptions(typeId, subtypeId || null, f.key)
          .then((opts) => [f.key, (opts || []).map((o) => o.valueRaw)])
          .catch(() => [f.key, []])
      )
    ).then((pairs) => {
      setCustomOptionsByFieldKey(Object.fromEntries(pairs));
    });
  }, [typeId, subtypeId, productFields]);

  // Clear values of fields hidden by dependsOn when parent value changes
  useEffect(() => {
    if (!productFields || productFields.length === 0) return;
    const dependentFields = productFields.filter(
      (f) => f.dependsOn && f.dependsOn.trim() !== ""
    );
    if (!dependentFields.length) return;
    setSpecs((prev) => {
      let changed = false;
      const next = { ...prev };
      dependentFields.forEach((field) => {
        if (prev[field.dependsOn] !== field.dependsOnValue && prev[field.key] !== undefined) {
          delete next[field.key];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [productFields, specs]);

  const specificationSteps = useMemo(() => {
    if (!productFields || productFields.length === 0) {
      return [{ section: "Specification", fields: [] }];
    }
    // If more than 8 fields, split into multiple tabs with smart distribution
    if (productFields.length > 8) {
      const numTabs = Math.ceil(productFields.length / 8);
      const fieldsPerTab = Math.ceil(productFields.length / numTabs);
      const chunks = [];
      for (let i = 0; i < productFields.length; i += fieldsPerTab) {
        chunks.push(productFields.slice(i, i + fieldsPerTab));
      }
      return chunks.map((chunk, idx) => ({
        section: idx === 0 ? "Specification" : `Specification ${idx + 1}`,
        fields: chunk,
      }));
    }
    return [{ section: "Specification", fields: productFields }];
  }, [productFields]);

  const specificationStepCount = specificationSteps.length;
  const firstSpecificationStep = 1;
  const designStep = firstSpecificationStep + specificationStepCount;
  const deliveryStep = designStep + 1;
  const isSpecificationStep = step >= firstSpecificationStep && step < designStep;
  const isFirstSpecificationStep = step === firstSpecificationStep;
  const currentSpecification = specificationSteps[
    Math.max(0, Math.min(step - firstSpecificationStep, specificationSteps.length - 1))
  ] || { section: "Specification", fields: [] };

  const stepLabels = useMemo(() => ([
    "Product",
    ...specificationSteps.map((section) => section.section || "Specification"),
    "Design",
    "Delivery",
  ]), [specificationSteps]);

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

  const handleSelectSpecChange = useCallback((field, value) => {
    // Handle custom size selection first so sticker size uses mm/inch instead of the generic custom popup.
    if (field.key === "size" && value === "Custom") {
      // Some products (e.g. Reflector Flex) treat size as a text custom value (sizeCustom),
      // not as width/height dimensions (customWidth/customHeight).
      if (field.customSizeMode === "text") {
        setCustomSpecDialog({
          open: true,
          field,
          value: String(specs[`${field.key}Custom`] || "").trim(),
          isFlexCustomSize: false,
          flexWidth: "",
          flexHeight: "",
          customSizeUnitLabel: "ft",
          sizeUnit: "mm",
        });
        return;
      }

      const configDims = field.customDimensions || [];
      const hasDimensionFields = configDims.length > 0
        ? true
        : (productFields || []).some((f) => f.key === "customWidth");
      const hasDepthField = configDims.length > 0
        ? (configDims.includes("Depth") || configDims.includes("depth"))
        : (productFields || []).some((f) => f.key === "customDepth");
      const unit = configDims.length > 0
        ? (field.customDimensionUnit || "mm")
        : null;

      if (hasDimensionFields) {
        if (hasDepthField) {
          setDepthSizeDialog({
            open: true,
            field,
            width: specs.customWidth || "",
            height: specs.customHeight || "",
            depth: specs.customDepth || "",
            sizeUnit: unit || "mm",
          });
          return;
        }

        setCustomSpecDialog({
          open: true,
          field,
          value: "",
          isFlexCustomSize: true,
          flexWidth: specs.customWidth || "",
          flexHeight: specs.customHeight || "",
          customSizeUnitLabel: unit || "mm",
          sizeUnit: unit || "mm",
        });
        return;
      }

      // legacy fallback — name-based detection for existing products
      const typeName = (selectedType?.name || "").toLowerCase().trim();
      const subtypeName = (selectedSubtype?.name || "").toLowerCase().trim();
      const isSticker = typeName.includes("sticker") || subtypeName.includes("sticker");
      const isCard = typeName.includes("card") || subtypeName.includes("card");
      const hasDepthFieldLegacy = (productFields || []).some((f) => f.key === "customDepth");
      const useMm = hasDepthFieldLegacy || isSticker || isCard;
      let unitLabel = "ft";
      if (isSticker) unitLabel = "mm or inch";
      else if (isCard || hasDepthFieldLegacy) unitLabel = "mm";

      if (hasDepthFieldLegacy) {
        setDepthSizeDialog({
          open: true,
          field,
          width: specs.customWidth || "",
          height: specs.customHeight || "",
          depth: specs.customDepth || "",
          sizeUnit: unit || (useMm ? "mm" : "ft"),
        });
        return;
      }

      setCustomSpecDialog({
        open: true,
        field,
        value: "",
        isFlexCustomSize: true,
        flexWidth: specs.customWidth || "",
        flexHeight: specs.customHeight || "",
        customSizeUnitLabel: unitLabel,
        sizeUnit: unit || (useMm ? "mm" : "ft"),
      });
      return;
    }

    if (field.promptText && value) {
      setCustomSpecDialog({
        open: true,
        field,
        value: String(specs[`${field.key}Text`] || "").trim(),
        isFlexCustomSize: false,
        isTextPrompt: true,
        textRows: field.textRows || 4,
        selectedOption: value,
        flexWidth: "",
        flexHeight: "",
        customSizeUnitLabel: "ft",
        sizeUnit: "mm",
      });
      return;
    }

    if (field.allowCustom && value === "Custom") {
      setCustomSpecDialog({
        open: true,
        field,
        value: String(specs[`${field.key}Custom`] || "").trim(),
        isFlexCustomSize: false,
        flexWidth: "",
        flexHeight: "",
        customSizeUnitLabel: "ft",
        sizeUnit: "mm",
      });
      return;
    }

    setSpecs((prev) => {
      const next = { ...prev, [field.key]: value };
      if (field.allowCustom && value !== "Custom") {
        delete next[`${field.key}Custom`];
        // Avoid stale custom-size fields when a non-"Custom" option is selected.
        // This matters when we inject previously-saved custom sizes as normal options.
        if (field.key === "size") {
          delete next.customWidth;
          delete next.customHeight;
          delete next.customDepth;
          delete next.customUnit;
          delete next.sizeCustom;
        }
      }
      return next;
    });
  }, [specs, productFields, selectedType, selectedSubtype]);

  const closeCustomSpecDialog = useCallback(() => {
    setCustomSpecDialog({ open: false, field: null, value: "", isFlexCustomSize: false, flexWidth: "", flexHeight: "", customSizeUnitLabel: "ft", sizeUnit: "mm" });
  }, []);

  const saveCustomSpecDialog = useCallback(() => {
    const field = customSpecDialog.field;
    if (!field) return;

    // Handle flex printing custom size
    if (customSpecDialog.isFlexCustomSize) {
      const width = String(customSpecDialog.flexWidth || "").trim();
      const height = String(customSpecDialog.flexHeight || "").trim();

      if (!width || !height) {
        setError("Please enter both width and height");
        return;
      }

      setSpecs((prev) => ({
        ...prev,
        [field.key]: "Custom",
        customWidth: width,
        customHeight: height,
        customUnit: customSpecDialog.sizeUnit,
      }));
      const sizeLabel = `${width} × ${height} ${customSpecDialog.sizeUnit}`;
      saveCustomOption(
        typeId,
        subtypeId || null,
        "size",
        sizeLabel
      ).catch(() => {});
      closeCustomSpecDialog();
      setError("");
      return;
    }

    // Handle text prompt (e.g. Dairy Customize)
    if (customSpecDialog.isTextPrompt) {
      const trimmedText = String(customSpecDialog.value || "").trim();
      setSpecs((prev) => ({
        ...prev,
        [field.key]: customSpecDialog.selectedOption,
        [`${field.key}Text`]: trimmedText,
      }));
      closeCustomSpecDialog();
      return;
    }

    // Handle regular custom field
    const trimmedValue = String(customSpecDialog.value || "").trim();
    if (!trimmedValue) {
      setSpecs((prev) => {
        const next = { ...prev };
        delete next[field.key];
        delete next[`${field.key}Custom`];
        return next;
      });
      closeCustomSpecDialog();
      return;
    }

    setSpecs((prev) => ({
      ...prev,
      [field.key]: "Custom",
      [`${field.key}Custom`]: trimmedValue,
    }));
    saveCustomOption(
      typeId,
      subtypeId || null,
      field.key,
      trimmedValue
    ).catch(() => {});
    closeCustomSpecDialog();
  }, [closeCustomSpecDialog, customSpecDialog]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (designMode !== "production_only") return;
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
    if (designMode !== "production_only") return;
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
    if (s === 0) {
      if (!categoryId || !typeId) return false;
      if (!designMode) return false;
      // If subtypes are available, must select one
      const subtypesForSelectedType = allTypes.filter((t) => String(t.parentId) === String(typeId));
      if (subtypesForSelectedType.length > 0) {
        return !!subtypeId;
      }
      return true;
    }
    if (s >= firstSpecificationStep && s < designStep) {
      if (designMode !== "design_only") {
        if (!quantity || Number(quantity) <= 0) return false;
      
      // For flex printing and agralic products with custom size, validate width and height
      if (
        specs.size === "Custom" &&
        (selectedType?.name?.toLowerCase().includes("flex") || selectedType?.name?.toLowerCase().includes("agralic"))
      ) {
        // Only enforce width/height when this product actually uses flex-dimension custom size.
        // Some products (e.g. Reflector Flex) store custom size as a text value (sizeCustom).
        const hasDimensionSizeFields = (productFields || []).some((f) => f.key === "customWidth") &&
          (productFields || []).some((f) => f.key === "customHeight");
        if (hasDimensionSizeFields) {
          return !!specs.customWidth && !!specs.customHeight && Number(specs.customWidth) > 0 && Number(specs.customHeight) > 0;
        }
      }
      }
      return true;
    }
    if (s === designStep) {
      // designMode is already required in step 0, so just check file upload for production_only
      if (designMode === "production_only") return files.length > 0;
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!canProceed(step)) {
      if (step === 0) {
        const subtypesForType = allTypes.filter((t) => String(t.parentId) === String(typeId));
        if (!categoryId || !typeId) {
          if (subtypesForType.length > 0 && !subtypeId) {
            setError("Please select a product subtype");
          } else {
            setError("Please select category and product");
          }
        } else if (!designMode) {
          setError("Please select a design mode");
        }
      }
      else if (step >= firstSpecificationStep && step < designStep) {
      if (designMode !== "design_only" && (!quantity || Number(quantity) <= 0)) {
        setError("Please enter a valid quantity");
      } else if (specs.size === "Custom" && (selectedType?.name?.toLowerCase().includes("flex") || selectedType?.name?.toLowerCase().includes("agralic"))) {
        const hasDimensionSizeFields = (productFields || []).some((f) => f.key === "customWidth") &&
          (productFields || []).some((f) => f.key === "customHeight");
        if (hasDimensionSizeFields) {
          setError("Please enter valid width and height for custom size");
        } else {
          setError("Please complete the specifications");
        }
      } else {
        setError("Please complete the specifications");
      }
      } else if (step === designStep) {
        if (designMode === "production_only" && files.length === 0) setError("Please upload at least one design file before proceeding");
      }
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, deliveryStep));
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
        designStatus: designMode || null,
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
      // Persist custom values for all allowCustom fields so they appear in future dropdowns
      if (typeId) {
        const saves = collectCustomOptionSaves(productFields || [], specs);
        saves.forEach(({ fieldKey, valueRaw }) => {
          saveCustomOption(Number(typeId), subtypeId ? Number(subtypeId) : null, fieldKey, valueRaw)
            .then((saved) => {
              setCustomOptionsByFieldKey((prev) => {
                const existing = prev[saved.fieldKey] || [];
                if (existing.includes(saved.valueRaw)) return prev;
                return { ...prev, [saved.fieldKey]: [saved.valueRaw, ...existing] };
              });
            })
            .catch(() => {});
        });
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
        className="modal fade show requirement-form-modal"
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
                onClick={handleModalClose}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
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
                        : { width: `${((step + 1) / stepLabels.length) * 100}%` }
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
                  {stepLabels.map((label, idx) => (
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
                        {/* Design Mode — at the top */}
                        <div className="col-12">
                          <div className="lead-form-field">
                            <label className="form-label fw-semibold">
                              Design Mode <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex gap-4 mt-1">
                              {[
                                { value: "design_only",      label: "Design Only" },
                                { value: "production_only",  label: "Production Only" },
                                { value: "design_production", label: "Design + Production" },
                              ].map((opt) => (
                                <div key={opt.value} className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="designMode"
                                    id={`designMode-${opt.value}`}
                                    value={opt.value}
                                    checked={designMode === opt.value}
                                    onChange={() => { setDesignMode(opt.value); setFiles([]); }}
                                  />
                                  <label className="form-check-label" htmlFor={`designMode-${opt.value}`}>
                                    {opt.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

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

                        <div className="col-md-6" style={{ visibility: typeId && subtypeOptions.length > 0 ? "visible" : "hidden" }}>
                          <div className="lead-form-field">
                            <label className="form-label fw-semibold">Sub-Product</label>
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

                      </motion.div>
                    )}

                    {/* Step 1: Product Specifications */}
                    {isSpecificationStep && (
                      <motion.div
                        key={`step-spec-${step}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        {isFirstSpecificationStep && designMode !== "design_only" && (
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
                        )}

                        {/* Product-specific fields */}
                        {fieldsLoading ? (
                          <div className="col-12 text-center py-4">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <div className="text-muted mt-2 small">Loading fields…</div>
                          </div>
                        ) : productFields.length > 0 ? (
                          [currentSpecification].flatMap((entry, sectionIndex) => {
                            const sectionFields = entry.fields.flatMap((field) => {
                              // Skip hidden fields
                              if (field.hidden) return [];

                              // dependsOn visibility check
                              if (field.dependsOn && field.dependsOn.trim() !== "") {
                                const parentValue = specs[field.dependsOn];
                                if (parentValue !== field.dependsOnValue) {
                                  return [];
                                }
                              }

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
                                // Inject saved custom options for any allowCustom field
                                const savedForField = field.allowCustom && !field.promptText
                                  ? (customOptionsByFieldKey[field.key] || [])
                                  : [];
                                const staticOpts = field.options.filter((o) => o !== "Custom");
                                const alreadyInStatic = new Set(staticOpts.map((o) => o.toLowerCase()));
                                const uniqueSaved = savedForField.filter((s) => !alreadyInStatic.has(s.toLowerCase()));
                                const effectiveOpts = [...staticOpts, ...uniqueSaved];

                                const result = [
                                  <div key={field.key} className="col-md-6">
                                    <div className="lead-form-field">
                                      <label className="form-label">{field.label}</label>
                                      <div style={{ display: "flex", alignItems: "center" }}>
                                        <select
                                          className="form-select"
                                          value={specs[field.key] || ""}
                                          onChange={(e) => handleSelectSpecChange(field, e.target.value)}
                                          title={field.allowCustom && specs[field.key] === "Custom" ? (field.key === "size" ? (specs.customWidth || specs.customHeight ? `Custom: ${specs.customWidth} ${specs.customUnit || "ft"} × ${specs.customHeight} ${specs.customUnit || "ft"}${specs.customDepth ? ` × ${specs.customDepth} ${specs.customUnit || "ft"}` : ""}` : "Custom") : `Custom: ${specs[`${field.key}Custom`] || ""}`) : ""}
                                        >
                                          <option value="">Select {field.label}</option>
                                          {specs[field.key] === "Custom" && (() => {
                                            if (field.key === "size") {
                                              if (field.customSizeMode === "text") {
                                                const customValue = specs.sizeCustom;
                                                return (
                                                  <option key="Custom" value="Custom">
                                                    {customValue ? `Custom: ${customValue}` : "Custom"}
                                                  </option>
                                                );
                                              }
                                              const width = specs.customWidth;
                                              const height = specs.customHeight;
                                              const depth = specs.customDepth;
                                              const unit = specs.customUnit || "ft";
                                              return (
                                                <option key="Custom" value="Custom">
                                                  {width || height ? `Custom: ${width} ${unit} × ${height} ${unit}${depth ? ` × ${depth} ${unit}` : ""}` : "Custom"}
                                                </option>
                                              );
                                            }
                                            const customValue = specs[`${field.key}Custom`];
                                            return (
                                              <option key="Custom" value="Custom">
                                                {customValue ? `Custom: ${customValue}` : "Custom"}
                                              </option>
                                            );
                                          })()}
                                          {effectiveOpts.map((opt) => (
                                            <option key={opt} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                        {field.allowCustom && (
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary ms-1"
                                            style={{ flexShrink: 0 }}
                                            onClick={() => handleSelectSpecChange(field, "Custom")}
                                            title="Add custom value"
                                          >
                                            <i className="ti ti-plus" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>,
                                ];

                                return result;
                              }
                              // hasUnit: render input group with unit dropdown
                              if (field.hasUnit && (field.type === "number" || field.type === "text")) {
                                return (
                                  <div key={field.key} className="col-md-6">
                                    <div className="lead-form-field">
                                      <label className="form-label">{field.label}</label>
                                      <div style={{ display: "flex", alignItems: "stretch", width: "100%" }}>
                                        <input
                                          className="form-control unit-input"
                                          type={field.type === "number" ? "number" : "text"}
                                          value={specs[field.key] ?? ""}
                                          onChange={(e) => handleSpecChange(field.key, e.target.value)}
                                          placeholder={field.placeholder || ""}
                                        />
                                        <select
                                          className="form-select unit-select"
                                          value={specs[`${field.key}Unit`] ?? field.defaultUnit ?? ""}
                                          onChange={(e) => handleSpecChange(`${field.key}Unit`, e.target.value)}
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

                              // measurement suffix for dimension fields
                              const measurementValue = specs["measurement"];
                              const isDimensionField = ["length", "width", "height", "gusset", "depth", "diameter"].includes(field.key);
                              const dimensionSuffix = isDimensionField && !field.hasUnit && measurementValue ? ` (in ${measurementValue})` : "";

                              return (
                                <div key={field.key} className="col-md-6">
                                  <div className="lead-form-field">
                                    <label className="form-label">{field.label}{dimensionSuffix}</label>
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
                            });

                            // Don't show section header if only 1 step total, or this is the first step with no previous section
                            if (specificationStepCount <= 1 || sectionIndex === 0) {
                              return sectionFields;
                            }

                            return [
                              <div key={`section-${sectionIndex}`} className="col-12 mt-1">
                                <div className="d-flex align-items-center justify-content-between">
                                  <h6 className="mb-2 fw-semibold">{entry.section}</h6>
                                </div>
                                <hr className="mt-0 mb-3" />
                              </div>,
                              ...sectionFields,
                            ];
                          })
                        ) : (
                          <div className="col-12">
                            <div className="alert alert-info py-2 mb-0">
                              No fields configured for this product
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Design */}
                    {step === designStep && (
                      <motion.div
                        key={`step-design-${step}`}
                        initial={shouldReduceMotion ? false : { opacity: 0, x: 18, filter: "blur(4px)" }}
                        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0, filter: "blur(0px)" }}
                        exit={shouldReduceMotion ? false : { opacity: 0, x: -18, filter: "blur(4px)" }}
                        transition={{ duration: 0.26, ease: "easeOut" }}
                        className="row g-3 lead-wizard-step-panel"
                      >
                        {/* Design Mode radio buttons */}
                        <div className="col-12">
                          <div className="alert alert-info py-2 mb-0">
                            <strong>Design mode:</strong>{" "}
                            {{
                              design_only: "Design Only",
                              production_only: "Production Only",
                              design_production: "Design + Production",
                            }[designMode] || designMode}
                          </div>
                        </div>

                        {/* Production Only: folder upload */}
                        {designMode === "production_only" && (
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

                        {/* Notes field for all modes */}
                        {designMode && (
                          <div className="col-12">
                            <label className="form-label">Note</label>
                            <textarea
                              className="form-control"
                              rows={3}
                              value={designNotes}
                              onChange={(e) => setDesignNotes(e.target.value)}
                              placeholder="Any instructions from customer about the design"
                            />
                          </div>
                        )}

                      </motion.div>
                    )}

                    {/* Step 3: Delivery */}
                    {step === deliveryStep && (
                      <motion.div
                        key={`step-delivery-${step}`}
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
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handleModalClose}
                    disabled={saving}
                  >
                    Close
                  </button>
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
                  {step < deliveryStep ? (
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
      {customSpecDialog.open && (
        <div
          className="modal fade show requirement-form-modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.35)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxHeight: "auto", maxWidth: "500px", display: "flex", alignItems: "center" }}>
            <div className="modal-content" style={{ maxHeight: "auto", display: "flex", flexDirection: "column", overflowY: "visible" }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {customSpecDialog.isFlexCustomSize ? "Enter Custom Size" : `Enter Custom ${customSpecDialog.field?.label}`}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeCustomSpecDialog}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body" style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>
                {customSpecDialog.isFlexCustomSize ? (
                  <>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Unit <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={customSpecDialog.sizeUnit}
                        onChange={(e) =>
                          setCustomSpecDialog((prev) => ({ ...prev, sizeUnit: e.target.value }))
                        }
                      >
                        {(customSpecDialog.field?.unitOptions?.length > 0
                          ? customSpecDialog.field.unitOptions
                          : ["mm", "cm", "ft", "inch"]
                        ).map((u) => (
                          <option key={u} value={u}>
                            {{ mm: "Millimeters (mm)", cm: "Centimeters (cm)", ft: "Feet (ft)", inch: "Inches (inch)" }[u] || u}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Width ({customSpecDialog.sizeUnit}) <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="number"
                        autoFocus
                        value={customSpecDialog.flexWidth}
                        onChange={(e) =>
                          setCustomSpecDialog((prev) => ({ ...prev, flexWidth: e.target.value }))
                        }
                        placeholder={`Enter width in ${customSpecDialog.sizeUnit}`}
                      />
                    </div>
                    <div className="lead-form-field mb-3">
                      <label className="form-label">Height ({customSpecDialog.sizeUnit}) <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        type="number"
                        value={customSpecDialog.flexHeight}
                        onChange={(e) =>
                          setCustomSpecDialog((prev) => ({ ...prev, flexHeight: e.target.value }))
                        }
                        placeholder={`Enter height in ${customSpecDialog.sizeUnit}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveCustomSpecDialog();
                          }
                        }}
                      />
                    </div>
                    {error && <div className="alert alert-danger mt-2 py-2 mb-0">{error}</div>}
                  </>
                ) : (
                  <div className="lead-form-field">
                    <label className="form-label">
                      {customSpecDialog.isTextPrompt
                        ? `${customSpecDialog.selectedOption} Details`
                        : customSpecDialog.field?.label}
                    </label>
                    {customSpecDialog.isTextPrompt ? (
                      <textarea
                        className="form-control"
                        autoFocus
                        rows={customSpecDialog.textRows || 4}
                        value={customSpecDialog.value}
                        onChange={(e) =>
                          setCustomSpecDialog((prev) => ({ ...prev, value: e.target.value }))
                        }
                        placeholder={`Enter ${customSpecDialog.selectedOption?.toLowerCase() || "details"}`}
                      />
                    ) : (
                      <input
                        className="form-control"
                        autoFocus
                        value={customSpecDialog.value}
                        onChange={(e) =>
                          setCustomSpecDialog((prev) => ({ ...prev, value: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveCustomSpecDialog();
                          }
                        }}
                        placeholder={
                          customSpecDialog.field?.customPlaceholder ||
                          `Enter ${customSpecDialog.field?.label || "value"}`
                        }
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closeCustomSpecDialog}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveCustomSpecDialog}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Depth Size popup for products with Width + Height + Depth */}
      {depthSizeDialog.open && (
        <div
          className="modal fade show requirement-form-modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Custom Size</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" })}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="modal-body" style={{ padding: "1.5rem" }}>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Unit <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    value={depthSizeDialog.sizeUnit}
                    onChange={(e) => setDepthSizeDialog((prev) => ({ ...prev, sizeUnit: e.target.value }))}
                  >
                    {(depthSizeDialog.field?.unitOptions?.length > 0
                      ? depthSizeDialog.field.unitOptions
                      : ["mm", "cm", "ft", "inch"]
                    ).map((u) => (
                      <option key={u} value={u}>
                        {{ mm: "Millimeters (mm)", cm: "Centimeters (cm)", ft: "Feet (ft)", inch: "Inches (inch)" }[u] || u}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Width ({depthSizeDialog.sizeUnit}) <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    type="number"
                    autoFocus
                    value={depthSizeDialog.width}
                    onChange={(e) => setDepthSizeDialog((prev) => ({ ...prev, width: e.target.value }))}
                    placeholder={`Enter width in ${depthSizeDialog.sizeUnit}`}
                  />
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Height ({depthSizeDialog.sizeUnit}) <span className="text-danger">*</span></label>
                  <input
                    className="form-control"
                    type="number"
                    value={depthSizeDialog.height}
                    onChange={(e) => setDepthSizeDialog((prev) => ({ ...prev, height: e.target.value }))}
                    placeholder={`Enter height in ${depthSizeDialog.sizeUnit}`}
                  />
                </div>
                <div className="lead-form-field mb-3">
                  <label className="form-label">Depth ({depthSizeDialog.sizeUnit})</label>
                  <input
                    className="form-control"
                    type="number"
                    value={depthSizeDialog.depth}
                    onChange={(e) => setDepthSizeDialog((prev) => ({ ...prev, depth: e.target.value }))}
                    placeholder={`Enter depth in ${depthSizeDialog.sizeUnit}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const w = String(depthSizeDialog.width || "").trim();
                        const h = String(depthSizeDialog.height || "").trim();
                        if (!w || !h) return;
                        setSpecs((prev) => ({
                          ...prev,
                          size: "Custom",
                          customWidth: w,
                          customHeight: h,
                          customDepth: String(depthSizeDialog.depth || "").trim(),
                          customUnit: depthSizeDialog.sizeUnit,
                        }));
                        setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" });
                      }
                    }}
                  />
                </div>
                {error && <div className="alert alert-danger mt-2 py-2 mb-0">{error}</div>}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const w = String(depthSizeDialog.width || "").trim();
                    const h = String(depthSizeDialog.height || "").trim();
                    if (!w || !h) {
                      setError("Please enter both width and height");
                      return;
                    }
                    setSpecs((prev) => ({
                      ...prev,
                      size: "Custom",
                      customWidth: w,
                      customHeight: h,
                      customDepth: String(depthSizeDialog.depth || "").trim(),
                      customUnit: depthSizeDialog.sizeUnit,
                    }));
                    setDepthSizeDialog({ open: false, width: "", height: "", depth: "", sizeUnit: "mm" });
                    setError("");
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="modal-backdrop fade show" />
    </>
  );
}
