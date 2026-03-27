import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getStockCategories,
  getStockItems,
  createStockItem,
  updateStockItem,
} from "../../api/stocksApi";
import PageHeader from "../../components/admin/PageHeader";
import { extractApiErrorMessage } from "../../utils/errorMessage";
import { useToast } from "../../components/system/ToastProvider";

function renderField(cat, values, onChange) {
  const { fields } = cat;
  return fields.map((f) => {
    const key = f.name;
    const val = values[key] || "";
    if (f.type === "text") {
      return (
        <div className="mb-3" key={key}>
          <label className="form-label">{key}</label>
          <input
            type="text"
            className="form-control"
            value={val}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </div>
      );
    }
    if (f.type === "number") {
      return (
        <div className="mb-3" key={key}>
          <label className="form-label">{key}</label>
          <input
            type="number"
            className="form-control"
            value={val}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </div>
      );
    }
    if (f.type === "number-unit") {
      return (
        <div className="mb-3" key={key}>
          <label className="form-label">{key} ({f.unit || ""})</label>
          <input
            type="number"
            className="form-control"
            value={val}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </div>
      );
    }
    if (f.type === "dropdown") {
      return (
        <div className="mb-3" key={key}>
          <label className="form-label">{key}</label>
          <select
            className="form-select"
            value={val}
            onChange={(e) => onChange(key, e.target.value)}
          >
            <option value="">Select</option>
            {(f.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  });
}

export default function StockItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [itemData, setItemData] = useState({});
  const [selectedCat, setSelectedCat] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const cats = await getStockCategories();
      const its = await getStockItems();
      if (!active) return;
      setCategories(cats);
      setItems(its);
      if (id) {
        const existing = its.find((i) => String(i.id) === String(id));
        if (existing) {
          setItemData(existing);
          setSelectedCat(cats.find((c) => c.id === existing.categoryId) || null);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!selectedCat) {
      showError("Select a category");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        categoryId: selectedCat.id,
        name: itemData.name || "",
        quantity: itemData.quantity || 0,
        minThreshold: itemData.minThreshold || 0,
        values: itemData.values || {},
      };
      if (id) {
        await updateStockItem(Number(id), payload);
      } else {
        await createStockItem(payload);
      }
      navigate("/stocks");
    } catch (e) {
      showError(extractApiErrorMessage(e, "Failed to save item"));
    } finally {
      setSaving(false);
    }
  };

  const onFieldChange = (key, value) => {
    setItemData((prev) => ({
      ...prev,
      values: { ...(prev.values || {}), [key]: value },
    }));
  };

  return (
    <div className="container-fluid">
      <PageHeader
        title={id ? "Edit Stock Item" : "Add Stock Item"}
        breadcrumb={[
          { label: "Dashboard", path: "/admin-dashboard" },
          { label: "Stocks", path: "/stocks" },
          { label: id ? "Edit" : "Add", path: "" },
        ]}
      />
      <div className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={selectedCat?.id || ""}
                onChange={(e) => {
                  const cat = categories.find(
                    (c) => String(c.id) === String(e.target.value),
                  );
                  setSelectedCat(cat || null);
                }}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedCat && (
              <>{renderField(selectedCat, itemData.values || {}, onFieldChange)}</>
            )}
            <div className="col-md-4">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                value={itemData.quantity || ""}
                onChange={(e) =>
                  setItemData((p) => ({ ...p, quantity: e.target.value }))
                }
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Minimum Threshold</label>
              <input
                type="number"
                className="form-control"
                value={itemData.minThreshold || ""}
                onChange={(e) =>
                  setItemData((p) => ({ ...p, minThreshold: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
