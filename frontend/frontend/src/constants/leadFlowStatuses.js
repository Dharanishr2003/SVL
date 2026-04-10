export const LEAD_FLOW_STATUSES = [
  "New Lead",
  "Attempted",
  "Interested",
  "Requirement",
  "Design",
  "Rejected",
];

export const DEAL_FLOW_STATUSES = [
  "Design",
  "Production",
  "Accounts",
];

/**
 * Maps each requirement-type-sensitive status to the requirement types it applies to.
 * Statuses NOT listed here are visible for ALL requirement types (no filtering).
 * 
 * Design + Production:
 *   - Shows only "Design" status to user (they manually move to Design)
 *   - After design upload, system auto-transitions to "Production"
 *   - "Production" is NOT selectable by user for this type
 */
export const STATUS_REQUIREMENT_TYPE_MAP = {
  "Design":      ["Design"],
  "Production":  ["Production"],
};

/**
 * Filters a list of allowed-next statuses based on the deal's requirement type.
 * Statuses that have no entry in STATUS_REQUIREMENT_TYPE_MAP pass through unfiltered.
 */
export function filterStatusesByRequirementType(statuses, requirementType) {
  if (!requirementType || !Array.isArray(statuses)) return statuses || [];
  const rt = requirementType.trim();
  return statuses.filter((s) => {
    const allowed = STATUS_REQUIREMENT_TYPE_MAP[s];
    // If no mapping exists for this status, it's visible for every requirement type
    if (!allowed) return true;
    return allowed.includes(rt);
  });
}
