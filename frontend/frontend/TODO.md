# Task: Add Preview Buttons to Requirement Files in LeadEditPage + DealEditPage

## Plan Breakdown (Approved)
1. [x] Add imports/state/modal to **LeadEditPage.jsx**:
   - Import `FilePreviewModal`
   - Add `previewFile` state
   - Add Preview button next to Download in Requirement section
   - Add `<FilePreviewModal />` at bottom

2. [ ] Add imports/state/modal to **DealEditPage.jsx**:
   - Same changes as #1 (Requirement section)

3. [ ] Test:
   - Navigate LeadEdit/DealEdit → Requirement tab
   - Verify Preview opens modal (image/PDF support)
   - Verify Download unchanged
   - Test no-file/unsupported cases

4. [ ] **attempt_completion**: "Preview buttons added to requirement files in LeadEditPage and DealEditPage. Matches production details pattern using FilePreviewModal."

**Next**: Edit LeadEditPage.jsx (add Preview buttons), then DealEditPage.jsx (full implementation)
