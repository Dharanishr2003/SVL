# Backend Implementation Guide - Status Validation with Flow Rules

## Overview

This guide explains the backend implementation of **data-driven status validation** for Lead and Deal management systems. The system ensures that status transitions validate business requirements (like 100% payment) without hardcoding rules.

## Files Created

### 1. **FlowValidationConfig.java** (Java Configuration Class)
**Location:** `src/main/java/com/nexorcrm/backend/config/FlowValidationConfig.java`

This class defines the default flow rules with validation requirements for both Lead and Deal flows.

**Key Methods:**
- `getDefaultLeadFlowRules()` - Returns Lead flow rules with validation properties
- `getDefaultDealFlowRules()` - Returns Deal flow rules with validation properties
- `getDefaultLeadStatuses()` - List of available Lead statuses
- `getDefaultDealStatuses()` - List of available Deal statuses

**Key Features:**
- ✅ No database dependency - rules defined in code
- ✅ Easy to extend - add new rules by modifying this class
- ✅ Portable - can be moved to another system as-is
- ✅ Type-safe - uses Java's Map structure which Jackson serializes to JSON

**Example Rule Structure:**
```java
Map<String, Object> rule = new HashMap<>();
rule.put("status", "delivery");
rule.put("next", Map.of("completed", "Completed"));
rule.put("requirePayment100Percent", true);  // Validation property
rule.put("requireDesignUpload", false);
rule.put("requireFields", Arrays.asList("totalAmount"));
```

### 2. **FlowRulesInitializationService.java** (Service)
**Location:** `src/main/java/com/nexorcrm/backend/service/FlowRulesInitializationService.java`

Initializes the default flow rules in the database when the application starts.

**Key Methods:**
- `initializeLeadFlowRules()` - Initializes Lead flow (ID=1)
- `initializeDealFlowRules()` - Initializes Deal flow (ID=2)
- `initializeAllFlowRules()` - Initializes both (called on startup)

**How It Works:**
1. Checks if flow rules already exist in the database
2. If rules are empty, initializes them with default values from FlowValidationConfig
3. If rules already exist, skips initialization (non-destructive)
4. Logs status to console for visibility

**Note:** LeadFlowConfig table is shared:
- ID=1: Lead flow configuration
- ID=2: Deal flow configuration

### 3. **ApplicationStartupListener.java** (Spring Event Listener)
**Location:** `src/main/java/com/nexorcrm/backend/config/ApplicationStartupListener.java`

Automatically initializes flow rules when the application starts.

**How It Works:**
- Listens for `ApplicationReadyEvent` (fires when Spring Boot app is fully started)
- Calls `FlowRulesInitializationService.initializeAllFlowRules()`
- Logs initialization progress to console
- Won't prevent app startup if initialization fails (graceful degradation)

## Integration Steps

### Step 1: Verify Database Schema
No database schema changes needed! The existing `lead_flow_config` table works with validation properties because rules are stored as JSON.

**Existing table structure (no migration needed):**
```sql
CREATE TABLE lead_flow_config (
    id BIGINT PRIMARY KEY,
    default_group_id BIGINT,
    rules_json LONGTEXT,  -- Stores JSON rules with validation properties
    statuses_json LONGTEXT,
    updated_by VARCHAR(120),
    updated_at TIMESTAMP
);
```

### Step 2: Copy Java Files
Copy these three files to your backend project:
```
FlowValidationConfig.java → src/main/java/com/nexorcrm/backend/config/
FlowRulesInitializationService.java → src/main/java/com/nexorcrm/backend/service/
ApplicationStartupListener.java → src/main/java/com/nexorcrm/backend/config/
```

### Step 3: Verify Dependencies
Ensure these dependencies are in your `pom.xml` (should already exist):
```xml
<!-- Jackson for JSON serialization -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <!-- Version managed by Spring Boot -->
</dependency>

<!-- Spring Boot -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

### Step 4: Run the Application
When you start the application:

```
========================================
Initializing Flow Rules with Validations
========================================
Initializing Lead Flow Rules with validation requirements...
✓ Lead Flow Rules initialized successfully
Initializing Deal Flow Rules with validation requirements...
✓ Deal Flow Rules initialized successfully
========================================
✓ Flow Rules Initialization Complete
========================================
```

### Step 5: Verify Rules in Database
Query the database to see the initialized rules:

```sql
SELECT id, rules_json FROM lead_flow_config WHERE id IN (1, 2);
```

You should see JSON like:
```json
{
  "status": "delivery",
  "next": {"completed": "Completed"},
  "requirePayment100Percent": true
}
```

## How Validation Works (End-to-End)

### 1. Backend (Server-Side)
```
Application Startup
  ↓
ApplicationStartupListener.onApplicationReady()
  ↓
FlowRulesInitializationService.initializeAllFlowRules()
  ↓
Check if rules exist in lead_flow_config (id=1,2)
  ↓
If empty → Initialize with FlowValidationConfig defaults
If already set → Skip initialization
  ↓
Rules stored in database as JSON with validation properties
```

### 2. API Response
When frontend requests `/api/flow` or `/api/deal-flow`:

```json
{
  "defaultGroupId": null,
  "updatedBy": "SYSTEM",
  "updatedAt": "2026-03-27T10:30:00",
  "rules": [
    {
      "status": "delivery",
      "next": {"completed": "Completed"},
      "requirePayment100Percent": true
    },
    {
      "status": "payment",
      "next": {"deal": "Deal"},
      "requirePayment100Percent": false
    }
  ],
  "statuses": ["New Lead", "Attempted", "Interested", ...]
}
```

### 3. Frontend Validation
Frontend's `validateStatusTransition()` utility:
- Receives flow rules from API
- User tries to change status to "delivery"
- Looks up "delivery" rule in flowRules array
- Checks `requirePayment100Percent: true`
- Validates: `paid >= total`?
- If not → Shows error message
- If yes → Allows status change

## Customizing Validation Rules

### Option 1: Modify Java Configuration (Recommended for Portability)
Edit `FlowValidationConfig.java`:

```java
// Example: Add payment requirement to "production" status
rules.add(createRule(
    "production",
    Map.of("delivery", "Delivery", "completed", "Completed"),
    null,
    true,  // requirePayment100Percent
    true,  // requireDesignUpload
    null,
    null
));
```

Then restart the application. The `initializeLeadFlowRules()` method checks if rules already exist - if they do, it skips initialization. To apply changes, either:
- Delete the existing rules from database (set rules_json to NULL)
- Or use the Flow API (`PUT /api/flow`) to update rules manually

### Option 2: Update via API (After Initialization)
Use the Flow API to modify rules:

```bash
curl -X PUT http://localhost:8080/api/flow \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "defaultGroupId": null,
    "rules": [
      {
        "status": "delivery",
        "next": {"completed": "Completed"},
        "requirePayment100Percent": true
      }
    ],
    "statuses": ["New Lead", "Attempted", ...]
  }'
```

### Option 3: Disable Auto-Initialization
If you want to manually manage flow rules and prevent auto-initialization:

```java
// In ApplicationStartupListener.java, comment out:
// flowRulesInitializationService.initializeAllFlowRules();
```

## Validation Properties Reference

### `requirePayment100Percent`
**Type:** `Boolean`  
**When:** Status requires 100% payment completion  
**Example:** "delivery", "production"
```java
rule.put("requirePayment100Percent", true);
```
**Frontend Check:** `paid >= total`
**Error Message:** "Payment pending. Please complete 100% payment before changing status to Delivery. (Paid: $500, Total: $1000)"

---

### `requireDesignUpload`
**Type:** `Boolean`  
**When:** Status requires design to be uploaded  
**Example:** "design", "payment"
```java
rule.put("requireDesignUpload", true);
```
**Frontend Check:** Design fields exist: `designStartAt`, `designEndAt`, `designFinalFileName`
**Error Message:** "Please complete design before changing status to Production"

---

### `requireFields`
**Type:** `List<String>`  
**When:** Specific fields must be filled  
**Example:** Payment amount, design dates
```java
rule.put("requireFields", Arrays.asList("totalAmount", "designStartAt"));
```
**Frontend Check:** Each field in list exists and is non-empty  
**Error Message:** "Please fill in totalAmount before changing status to Payment"

---

### `validationMessage`
**Type:** `String`  
**When:** Custom error message  
**Example:** Domain-specific requirements
```java
rule.put("validationMessage", "Payment and design must be complete");
```
**Frontend Check:** If defined, shown instead of auto-generated message

## Troubleshooting

### Issue: Rules not initializing
**Check:**
1. Is `ApplicationStartupListener` in a package Spring scans? (Should be in `com.nexorcrm.backend.config`)
2. Are there existing rules in the database? (Check `lead_flow_config` table)
3. Do you see any ERROR logs in console?

**Solution:**
- Manually call initialization in application startup:
```java
@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(BackendApplication.class, args);
        FlowRulesInitializationService service = context.getBean(FlowRulesInitializationService.class);
        service.initializeAllFlowRules();
    }
}
```

### Issue: Changes not reflected
**Check:** Are you seeing the initialization log messages?

**Solution:**
- Initialization only runs if rules are empty
- To apply changes, set `rules_json = NULL` in database:
```sql
UPDATE lead_flow_config SET rules_json = NULL WHERE id IN (1, 2);
```
- Restart application to reinitialize with new config

### Issue: Validation not working on frontend
**Check:**
1. Are flow rules coming from API? (Check network tab in browser)
2. Does the rule have the validation property? (e.g., `requirePayment100Percent: true`)
3. Is the `statusValidation.js` utility being used? (Check imports in DealEditPage.jsx)

**Solution:**
- The frontend must import and use `validateStatusTransition` from `statusValidation.js`
- Check that the flow rule returned by API includes the validation properties

## Migration Path

If you already have custom flow rules in your database and want to keep them while adding validation:

1. **Export current rules:**
```java
// In a test or startup script
LeadFlowConfig existing = leadFlowConfigRepository.findById(1L).get();
System.out.println("Current Lead Rules: " + existing.getRulesJson());
```

2. **Add validation properties manually:**
```java
List<Map<String, Object>> rules = parseCurrentRules(existing.getRulesJson());

// Add to "delivery" rule
for (Map<String, Object> rule : rules) {
    if ("delivery".equals(rule.get("status"))) {
        rule.put("requirePayment100Percent", true);
    }
}

// Save back
existing.setRulesJson(objectMapper.writeValueAsString(rules));
leadFlowConfigRepository.save(existing);
```

3. **Or use the API:**
- Fetch current rules via `GET /api/flow`
- Add validation properties
- Post back via `PUT /api/flow`

## Summary

- ✅ **No database changes needed** - Uses existing JSON storage
- ✅ **Portable code** - Can be copied to any Spring Boot project
- ✅ **Non-destructive** - Initialization only runs on empty rules
- ✅ **Flexible** - Can customize via code, API, or database
- ✅ **Type-safe** - Java Maps serialized by Jackson to JSON
- ✅ **Automatic** - Initializes on application startup
- ✅ **Well-integrated** - Works with existing Flow infrastructure
