import { useState } from "react";

const EMPTY_FORM = {
  name: "",
};

const EMPTY_SCOPE = {
  institutionId: "",
  departmentId: "",
  teamIds: [],
};

export const useEditGroupForm = () => {
  const [editGroup, setEditGroup] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editScope, setEditScope] = useState(EMPTY_SCOPE);
  const [formError, setFormError] = useState("");

  // Open edit modal
  const openEdit = (group) => {
    setEditGroup(group);
    setEditForm({ name: group.name || "" });
    setEditScope({
      institutionId: group.institutionId || "",
      departmentId: group.departmentId || "",
      teamIds: Array.isArray(group.teamIds) ? group.teamIds : [],
    });
    setFormError("");
  };

  // Close edit modal
  const closeEdit = () => {
    setEditGroup(null);
    setEditForm(EMPTY_FORM);
    setEditScope(EMPTY_SCOPE);
    setFormError("");
  };

  // Update form field
  const updateFormField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError("");
  };

  // Update scope field
  const updateScope = (updates) => {
    setEditScope((prev) => ({ ...prev, ...updates }));
    if (formError) setFormError("");
  };

  // Validate form
  const validateForm = () => {
    if (!editForm.name.trim()) {
      setFormError("Group name is required");
      return false;
    }
    return true;
  };

  // Get formatted scope for API
  const getFormattedScope = () => ({
    institutionId: editScope.institutionId || "",
    departmentId: editScope.departmentId || "",
    teamIds: Array.isArray(editScope.teamIds) ? editScope.teamIds : [],
  });

  return {
    // Form state
    editGroup,
    setEditGroup,
    editForm,
    setEditForm,
    editScope,
    setEditScope,
    formError,
    setFormError,

    // Form methods
    updateFormField,
    updateScope,
    validateForm,
    openEdit,
    closeEdit,
    getFormattedScope,

    // Constants
    EMPTY_FORM,
    EMPTY_SCOPE,
  };
};
