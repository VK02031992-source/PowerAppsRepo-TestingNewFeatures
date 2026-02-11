# Row Level Security (RLS) and Column Level Security (CLS) Implementation Guide

## Overview
This document outlines the implementation of Row Level Security and Column Level Security for the PowerApps data model based on role-based permissions.

## Security Model Architecture

### 1. Security Layers

#### **Object-Level Security**
Controls access to entire screens/objects within the application
- **Edit Permission**: Ability to modify data
- **View Permission**: Ability to see data (read-only)

#### **Row-Level Security**
Filters data at the row level based on specific criteria
- BI (Business Intelligence data)
- Market Segment
- Customer
- Customer Node
- Legacy Address
- Last Price Row

#### **Column-Level Security**
Controls visibility and editability of specific columns
- Lan Margin
- Lan Cost
- Comp Price/Row
- Comp Margin

---

## 2. Role Definitions

### **Superuser**
**Full administrative access**
- ✅ All object edit and view permissions
- ✅ Access to all row-level data
- ✅ Access to all columns (pricing, margin, cost)

### **Viewer - IDEA & MPP (No Pricing/Margin)**
**Basic viewing without sensitive financial data**
- ✅ View IDEA Analytics
- ❌ No access to pricing screens
- ❌ No access to LastPriceRow
- ❌ No access to any pricing/margin columns

### **Viewer - IDEA & MPP with Pricing (No Margin)**
**Enhanced viewing with pricing information**
- ✅ View IDEA Analytics
- ✅ View Loan and Corest Pricing Screens
- ✅ Access to all row-level filters including LastPriceRow
- ✅ Can see CompPriceRow column
- ❌ Cannot see margin or cost columns

### **Viewer - IDEA with Cost and Tool Count**
**Specialized viewer with cost visibility**
- ✅ View IDEA Analytics
- ✅ View pricing screens
- ✅ Access to most row-level data (except LastPriceRow)
- ✅ Can see LanCost column
- ❌ Cannot see margin or pricing columns

### **IDEA Editor (No Pricing/Margin)**
**Basic editing without financial data**
- ✅ Edit IDEA Analytics
- ❌ No pricing screen access
- ❌ No LastPriceRow access
- ❌ No pricing/margin/cost column access

### **IDEA Editor - with Pricing (No Margin)**
**Editor with pricing visibility**
- ✅ Edit IDEA Analytics
- ✅ View Loan and Corest Pricing Screens
- ✅ Access to all row-level data
- ✅ Can see CompPriceRow column
- ❌ Cannot see margin or cost columns

### **IDEA Editor - with Pricing & Margin (No Edit)**
**Full visibility, restricted editing**
- ✅ Edit IDEA Analytics
- ✅ Access to all row-level data
- ✅ Can VIEW: LanMargin, CompPriceRow, CompMargin
- ❌ Cannot EDIT margin fields

### **IDEA Editor - with Pricing & Margin Edit**
**Full editing capabilities**
- ✅ Edit IDEA Analytics
- ✅ Edit Loan and Corest Pricing Screens
- ✅ Access to all row-level data
- ✅ Can VIEW and EDIT: LanMargin, CompPriceRow, CompMargin

### **IDEA_APP EDITOR access & MPP Access_Editor_No Pricing**
**Editor without pricing information**
- ✅ Edit IDEA Analytics
- ✅ Access to most row-level data (except LastPriceRow)
- ❌ No pricing/margin/cost column access

---

## 3. Implementation Approaches

### **Power BI / SQL Server RLS**
```sql
-- Example RLS Predicate Function
CREATE FUNCTION Security.fn_SecurityPredicate(@Username AS VARCHAR(100))
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS SecurityPredicate
WHERE 
    -- Superuser has access to all
    @Username IN (SELECT Username FROM Security.Users WHERE RoleCode = 'SUPERUSER')
    OR
    -- Check specific row-level permissions
    EXISTS (
        SELECT 1 
        FROM Security.Users u
        INNER JOIN Security.RowLevelPermissions rlp ON u.RoleID = rlp.RoleID
        WHERE u.Username = @Username AND rlp.HasAccess = 1
    );
```

### **PowerApps Column Visibility**
```javascript
// Example: Show/Hide column based on user role
If(
    User().Role = "SUPERUSER" || 
    User().Role = "IDEA_EDITOR_PRICING_MARGIN_EDIT",
    true, // Show LanMargin column
    false // Hide LanMargin column
)
```

### **Dynamic Data Filtering**
```javascript
// Filter data based on row-level security
Filter(
    MainDataSource,
    Or(
        User().Role = "SUPERUSER",
        And(
            User().Role = "VIEWER_IDEA_MPP_WITH_PRICING",
            !IsBlank(LastPriceRow)
        ),
        And(
            User().Role = "VIEWER_IDEA_MPP_NO_PRICING",
            IsBlank(LastPriceRow)
        )
    )
)
```

---

## 4. Security Implementation Checklist

### ✅ **Database Layer**
- [ ] Create security schema and tables
- [ ] Define all roles in database
- [ ] Configure object permissions
- [ ] Set up row-level permissions
- [ ] Configure column-level permissions
- [ ] Create security functions and views

### ✅ **Application Layer (PowerApps)**
- [ ] Implement role-based authentication
- [ ] Configure screen visibility based on object permissions
- [ ] Apply row-level filters to all data sources
- [ ] Implement column visibility rules
- [ ] Add field-level edit restrictions
- [ ] Create permission validation functions

### ✅ **Testing**
- [ ] Test each role independently
- [ ] Verify object access restrictions
- [ ] Validate row-level filtering
- [ ] Confirm column visibility rules
- [ ] Test edit vs. view-only scenarios
- [ ] Perform security audit

---

## 5. PowerApps Implementation Example

### **OnStart Formula - Load User Permissions**
```javascript
// Load current user's role and permissions
Set(
    varUserRole,
    LookUp(
        Roles,
        Username = User().Email
    ).RoleCode
);

Set(
    varUserPermissions,
    Filter(
        PermissionMatrix,
        Username = User().Email
    )
);
```

### **Screen Visibility**
```javascript
// IDEA Analytics Screen - Visible property
varUserRole in ["SUPERUSER", "IDEA_EDITOR_NO_PRICING", 
                "IDEA_EDITOR_WITH_PRICING_NO_MARGIN", 
                "IDEA_EDITOR_PRICING_MARGIN_NO_EDIT",
                "IDEA_EDITOR_PRICING_MARGIN_EDIT"]
```

### **Column Display Mode**
```javascript
// LanMargin field - DisplayMode property
If(
    varUserRole in ["SUPERUSER", "IDEA_EDITOR_PRICING_MARGIN_EDIT"],
    DisplayMode.Edit,
    If(
        varUserRole = "IDEA_EDITOR_PRICING_MARGIN_NO_EDIT",
        DisplayMode.View,
        DisplayMode.Disabled // Hidden
    )
)
```

### **Data Source Filtering**
```javascript
// Gallery Items - Apply RLS
Filter(
    MainData,
    // Column-level filtering
    If(
        varUserRole in ["SUPERUSER", "VIEWER_IDEA_MPP_WITH_PRICING"],
        true,
        If(
            varUserRole = "VIEWER_IDEA_MPP_NO_PRICING",
            IsBlank(CompPriceRow), // Hide pricing data
            true
        )
    )
)
```

---

## 6. Security Best Practices

### **Principle of Least Privilege**
- Grant minimum required permissions
- Start with restrictive policies and expand as needed

### **Defense in Depth**
- Implement security at multiple layers (DB, App, UI)
- Never rely solely on UI-level security

### **Audit and Monitoring**
```sql
-- Create audit log table
CREATE TABLE Security.AuditLog (
    AuditID INT PRIMARY KEY IDENTITY(1,1),
    Username VARCHAR(100),
    ActionType VARCHAR(50),
    ObjectName VARCHAR(100),
    ColumnName VARCHAR(100),
    ActionTimestamp DATETIME DEFAULT GETDATE(),
    Success BIT
);
```

### **Regular Review**
- Quarterly permission audits
- Remove inactive user access
- Review and update role definitions

---

## 7. Test Scenarios

### **Test Case 1: Superuser Access**
- ✅ Can edit all objects
- ✅ Can view all rows
- ✅ Can see and edit all columns

### **Test Case 2: Viewer with No Pricing**
- ❌ Cannot access pricing screens
- ❌ Cannot see LastPriceRow data
- ❌ Pricing/margin columns are hidden

### **Test Case 3: Editor with Margin View Only**
- ✅ Can edit basic IDEA data
- ✅ Can VIEW margin columns
- ❌ Cannot EDIT margin columns

---

## Implementation Files

1. **security-permissions-config.json** - JSON configuration of all roles and permissions
2. **rls-cls-implementation.sql** - Complete SQL implementation with tables, functions, and sample data
3. This markdown document - Implementation guide and best practices

---

## Support and Maintenance

For questions or updates to the security model:
1. Review permission matrix in attached image
2. Consult security-permissions-config.json for current configuration
3. Test changes in development environment first
4. Document all security changes in audit log

---

**Last Updated:** February 10, 2026
**Version:** 1.0
