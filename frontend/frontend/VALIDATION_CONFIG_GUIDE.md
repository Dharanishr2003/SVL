# Status Validation Configuration Guide

## Overview
The system now supports dynamic validation rules for status transitions based on configuration from the backend flow rules. Instead of hardcoding validation logic, admins can now define validation requirements through the Flow API.

## Frontend Implementation

The validation is handled by the `validateStatusTransition()` utility function in `/src/utils/statusValidation.js`.

### Pages with Validation Support
- ✅ LeadEditPage.jsx
- ✅ DealEditPage.jsx  
- ✅ DealsPage.jsx

## Backend Configuration

### Flow Rules Endpoint
Flow rules are fetched from:
- **Leads**: `GET /api/flow` → `flow.rules[]`
- **Deals**: `GET /api/deal-flow` → `deal-flow.rules[]`

### Rule Structure

Each rule in the flow can include validation properties:

```json
{
  "status": "delivery",
  "next": {
    "completed": "Completed",
    "archived": "Archived"
  },
  "handledByGroupId": null,
  "requirePayment100Percent": true,
  "requireDesignUpload": true,
  "requireFields": ["totalAmount", "designStartAt", "designEndAt"],
  "validationMessage": "Custom validation error message (optional)"
}
```

### Validation Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `requirePayment100Percent` | boolean | Enforces payment must be 100% complete | `true` |
| `requireDesignUpload` | boolean | Enforces design must be uploaded | `true` |
| `requireFields` | string[] | List of required fields that must be filled | `["totalAmount", "designFinalFileName"]` |
| `validationMessage` | string | Custom error message to show user | `"Payment pending. Complete payment first."` |

## Common Use Cases

### Example 1: Delivery Status
Requires 100% payment completion before allowing "delivery" status:

```json
{
  "status": "delivery",
  "next": { "completed": "Completed" },
  "requirePayment100Percent": true
}
```

Error message shown to user:
```
Payment pending. Please complete 100% payment before changing status to Delivery. (Paid: $500, Total: $1000)
```

---

### Example 2: Design Status
Requires design to be uploaded:

```json
{
  "status": "design",
  "next": { "payment": "Payment" },
  "requireDesignUpload": true
}
```

---

### Example 3: Payment Status
Requires both total amount and multiple fields:

```json
{
  "status": "payment",
  "next": { "design": "Design", "production": "Production" },
  "requireFields": ["totalAmount", "designStartAt"]
}
```

---

### Example 4: Production Status
Multiple validation requirements:

```json
{
  "status": "production",
  "next": { "delivery": "Delivery" },
  "requirePayment100Percent": true,
  "requireDesignUpload": true,
  "requireFields": ["totalAmount"]
}
```

## How It Works

1. **User selects a status** from the dropdown in the edit page
2. **Frontend calls `handleStatusChange()`** → opens appropriate modal if needed
3. **User clicks "Update Status" button** → calls `saveStatus()`
4. **saveStatus() validates transition**:
   - Takes flow rule for the target status
   - Checks all validation properties
   - If any validation fails, shows error and prevents status update
5. **If validation passes**, status is updated via API

## Validation Order

The system checks validations in this order:
1. ❌ Is status provided?
2. ❌ Does status require 100% payment? Check paid vs total amount
3. ❌ Does status require design? Check if design is uploaded
4. ❌ Does status require specific fields? Check if they're filled
5. ✅ All validations pass → Allow status update

## Error Messages

System provides clear, contextual error messages:

```
// Payment validation failure
"Payment pending. Please complete 100% payment before changing status to Delivery. (Paid: $500, Total: $1000)"

// Field validation failure
"Please set the total amount before changing status to Delivery."

// Design validation failure
"Please complete design before changing status to Production"

// Missing total amount
"Please fill in totalAmount before changing status to Payment"
```

## Backend Update Example

If you're using Spring Boot, update your flow entity:

```java
@Entity
public class FlowRule {
    @Id
    private Long id;
    private String status;
    private String next; // JSON string
    
    // Add these new validation fields
    private Boolean requirePayment100Percent;
    private Boolean requireDesignUpload;
    private String requireFields; // JSON array as string
    private String validationMessage;
}
```

## Testing the Validation

To test validation locally:

1. Add these rules to `/api/deal-flow`:
```json
{
  "rules": [
    {
      "status": "delivery",
      "next": { "completed": "Completed" },
      "requirePayment100Percent": true
    },
    {
      "status": "production",
      "next": { "delivery": "Delivery" },
      "requirePayment100Percent": true,
      "requireDesignUpload": true
    }
  ]
}
```

2. Try to move a deal to "delivery" without paying 100% → See error message
3. Pay 100% → Try again → Status updates successfully

## Notes

- ✅ Non-breaking change - existing flows work without validation properties
- ✅ Validation is declarative (data-driven, not code-driven)
- ✅ Easy for admins to maintain validation rules via database/admin panel
- ✅ Same validation logic used across all pages consistently
- ✅ Clear, contextual error messages help users understand what's needed
