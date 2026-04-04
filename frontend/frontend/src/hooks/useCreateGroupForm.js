import { useState } from "react";

const EMPTY_FORM = {
  name: "",
};

const EMPTY_SCOPE = {
  institutionId: "",
  departmentId: "",
  teamIds: [],
  memberScope: "NONE",
};

export const useCreateGroupForm = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [createScope, setCreateScope] = useState(EMPTY_SCOPE);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  // Reset form state
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setCreateScope(EMPTY_SCOPE);
    setFormError("");
    setSelectedTeamId("");
  };

  // Open modal
  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Update form field
  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError("");
  };

  // Update scope field
  const updateScope = (updates) => {
    setCreateScope((prev) => ({ ...prev, ...updates }));
    if (formError) setFormError("");
  };

  const handleTeamSelect = (teamId) => {
    const nextTeamId = String(teamId || "");
    setSelectedTeamId(nextTeamId);
    if (!nextTeamId) return;
    setCreateScope((prev) => {
      const alreadySelected = prev.teamIds.some((id) => String(id) === nextTeamId);
      return alreadySelected
        ? prev
        : { ...prev, teamIds: [...prev.teamIds, nextTeamId] };
    });
    if (formError) setFormError("");
    setSelectedTeamId("");
  };

  const removeTeam = (teamId) => {
    const nextTeamId = String(teamId || "");
    setCreateScope((prev) => ({
      ...prev,
      teamIds: prev.teamIds.filter((id) => String(id) !== nextTeamId),
    }));
    if (formError) setFormError("");
  };

  // Validate form
  const validateForm = () => {
    if (!form.name.trim()) {
      setFormError("Group name is required");
      return false;
    }
    return true;
  };

  // Get formatted scope for API
  const getFormattedScope = () => ({
    institutionId: createScope.institutionId || "",
    departmentId: createScope.departmentId || "",
    teamIds: Array.isArray(createScope.teamIds) ? createScope.teamIds : [],
    memberScope: String(createScope.memberScope || "NONE").toUpperCase(),
  });

  return {
    // Form state
    form,
    setForm,
    createScope,
    setCreateScope,
    showModal,
    setShowModal,
    formError,
    setFormError,
    selectedTeamId,
    setSelectedTeamId,

    // Form methods
    updateFormField,
    updateScope,
    validateForm,
    handleTeamSelect,
    removeTeam,
    openModal,
    closeModal,
    resetForm,
    getFormattedScope,

    // Constants
    EMPTY_FORM,
    EMPTY_SCOPE,
  };
};
