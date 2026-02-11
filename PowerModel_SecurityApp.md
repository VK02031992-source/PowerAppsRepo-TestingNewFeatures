# PowerApps Implementation Guide: Security Management App

This guide provides step-by-step instructions and Power Fx formulas to convert the **RLS/CLS Security HTML Prototype** (`RLS_CLS_New_Mockups.html`) into a fully functional **PowerApps Canvas App**.

## 1. App Initialization & Theming

### App.OnStart
Place this code in the `OnStart` property of the `App` object. This sets up the Lam Research color palette and initializes the sample data exactly as it appears in the HTML mockups.

```powerfx
// --- 1. Theme Configuration (Lam Research Palette) ---
Set(varTheme, {
    Slate: ColorValue("rgba(106, 120, 133, 1)"),      // --lam-slate
    Midnight: ColorValue("rgba(36, 36, 55, 1)"),   // --lam-midnight
    Sand: ColorValue("rgba(230, 227, 220, 1)"),       // --lam-sand
    Mint: ColorValue("rgba(108, 227, 198, 1)"),       // --lam-mint
    DarkGreen: ColorValue("rgba(32, 167, 133, 1)"),  // --lam-dark-green
    Black: ColorValue("rgba(0, 0, 0, 1)"),
    White: ColorValue("rgba(255, 255, 255, 1)"),
    LightGray: ColorValue("#F3F2F1"),  // --neutral-lighter
    Danger: ColorValue("#A4262C")      // --lam-cancel-fill (approx)
});

// --- 2. Navigation State ---
Set(varCurrentScreen, "RLS_Landing"); // Options: RLS_Landing, RLS_Permissions, CLS_Landing, CLS_Members

// --- 3. Data Initialization (Market Data for Cascading Dropdowns) ---
ClearCollect(colMarketData, 
    {Customer: "UMC", MarketSegment: "FOUNDRY", CustomerNode: "28NM", Legacy: "ADV"},
    {Customer: "Samsung", MarketSegment: "DRAM", CustomerNode: "1Z", Legacy: "ADV"},
    {Customer: "Samsung", MarketSegment: "NAND", CustomerNode: "V6", Legacy: "ADV"},
    {Customer: "Micron", MarketSegment: "DRAM", CustomerNode: "1alpha", Legacy: "ADV"},
    {Customer: "Intel", MarketSegment: "MPU", CustomerNode: "7NM", Legacy: "ADV"},
    {Customer: "TSMC", MarketSegment: "FOUNDRY", CustomerNode: "5NM", Legacy: "ADV"},
    {Customer: "TSMC", MarketSegment: "FOUNDRY", CustomerNode: "3NM", Legacy: "ADV"},
    {Customer: "GENERIC 200MM", MarketSegment: "OTH MEM", CustomerNode: ">16", Legacy: "LEGACY"},
    {Customer: "Taiwan Regional", MarketSegment: "FOUNDRY", CustomerNode: "L28", Legacy: "NULL"}
);

// --- 4. Business Unit Data (PG -> BU Mapping) ---
ClearCollect(colBusinessUnitData,
    {ProductGroup: "DEP", BusinessUnit: "ALD"},
    {ProductGroup: "DEP", BusinessUnit: "CMP"},
    {ProductGroup: "ETCH", BusinessUnit: "CONDUCTOR"},
    {ProductGroup: "ETCH", BusinessUnit: "DIELECTRIC"},
    {ProductGroup: "NON SAM", BusinessUnit: "RELIABILITY"},
    {ProductGroup: "OCTO", BusinessUnit: "SOFTWARE"}
);

// --- 5. User Data (Simulated Database) ---
ClearCollect(colRLSUserData,
    {Group: "Superuser", Name: "Ajay Raj", Email: "Ajay.Raj@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "Superuser", Name: "Raghu Balasubramanian", Email: "Raghu.Balasubramanian@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "Viewer - IDEA & MPP (No Pricing/Margin)", Name: "Vikash Kumar", Email: "Vikash.Kumar@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "Viewer - IDEA & MPP with Pricing (No Margin)", Name: "Vikash Kumar", Email: "Vikash.Kumar@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "Viewer - IDEA with Cost and Tool Count", Name: "Mohammad Masood", Email: "MohammadMasood.Mohammadi@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "IDEA Editor (No Pricing/Margin)", Name: "Mohammad Masood", Email: "MohammadMasood.Mohammadi@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "IDEA Editor - with Pricing (No Margin)", Name: "Narendra Balamuri", Email: "Narendra.Balamuri@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "IDEA Editor - with Pricing & Margin No edit", Name: "Krishnambhal Gopal Krishnan Ayar", Email: "Krishnambhal.GopalakrishnanAyar@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "IDEA Editor - with Pricing & Margin Edit", Name: "Krishnambhal Gopal Krishnan Ayar", Email: "Krishnambhal.GopalakrishnanAyar@lamresearch.com", Role: "Member", Status: "Active"},
    {Group: "IDEA APP EDITOR access & MPP Access Editor. No Pricing", Name: "Narendra Balamuri", Email: "Narendra.Balamuri@lamresearch.com", Role: "Member", Status: "Active"}
);

// --- 6. Permission Data Grid (Initial State) ---
ClearCollect(colUserPermissions, 
    {Type: "Product Group", Value: "DEP", Selected: false},
    {Type: "Product Group", Value: "ETCH", Selected: false},
    {Type: "Product Group", Value: "NON SAM", Selected: false},
    {Type: "Product Group", Value: "OCTO", Selected: false},
    {Type: "Business Unit", Value: "ALD", Selected: false},
    {Type: "Business Unit", Value: "CMP", Selected: false},
    {Type: "Customer", Value: "Samsung", Selected: false},
    {Type: "Customer", Value: "TSMC", Selected: false},
    {Type: "Market Segment", Value: "DRAM", Selected: false},
    {Type: "Customer Node", Value: "7NM", Selected: false},
    {Type: "Legacy", Value: "ADV", Selected: false}
);
```

---

## 2. Main Layout Structure (Screen 1)
Create a new screen named `Screen_Main`.

### A. Sidebar Component
1. Add a **Container** (Align Left, Width: 250, Height: Parent.Height).
2. Insert a **Vertical Gallery** (`galSidebar`):
    *   **Items**:
        ```powerfx
        Table(
            {Title: "RLS Security Landing Page", ID: "RLS_Landing"},
            {Title: "CLS Security Landing Page", ID: "CLS_Landing"}
        )
        ```
    *   **TemplateFill**: `If(varCurrentScreen = ThisItem.ID || (varCurrentScreen = "RLS_Permissions" && ThisItem.ID="RLS_Landing") || (varCurrentScreen = "CLS_Members" && ThisItem.ID="CLS_Landing"), Color.AliceBlue, Transparent)`
    *   **OnSelect**: `Set(varCurrentScreen, ThisItem.ID)`

---

## 3. RLS Logic & Components

### A. RLS Landing View
Create a **Container** (`conRLSLanding`) inside the main area.
*   **Visible**: `varCurrentScreen = "RLS_Landing"`

1.  **Dropdown (`ddRLSGroup`)**:
    *   **Items**: `Distinct(colRLSUserData, Group)`
2.  **Gallery (`galRLSUsers`)**:
    *   **Items**: `Filter(colRLSUserData, Group = ddRLSGroup.Selected.Result)`
    *   **Fields**: Name, Email, Role, Status.
    *   **OnSelect**: 
        ```powerfx
        Set(varSelectedRLSUser, ThisItem);
        Set(varCurrentScreen, "RLS_Permissions");
        ```

### B. User RLS Permissions View
Create a **Container** (`conRLSPermissions`) inside the main area.
*   **Visible**: `varCurrentScreen = "RLS_Permissions"`

#### 1. The 6-Column Grid
Use a **Horizontal Container** containing 6 **Vertical Containers** (Flexible Width On).
Inside each specific container (e.g., `conPG`), add a **Gallery** (`galPG`):
*   **Items**: `Filter(colUserPermissions, Type = "Product Group")`
*   **Controls**: Checkbox (`cbPG`)
    *   **Text**: `ThisItem.Value`
    *   **Default**: `ThisItem.Selected`
    *   **OnCheck**: `Patch(colUserPermissions, ThisItem, {Selected: true})`
    *   **OnUncheck**: `Patch(colUserPermissions, ThisItem, {Selected: false})`

*(Repeat strictly for Business Unit, Customer, Market Segment, Customer Node, Legacy)*

#### 2. Add Permission Modal (Cascading Dropdowns)
Create a **Container** (`conModalAdd`) covering the screen.
*   **Visible**: `locShowAddModal`
*   **Fill**: `RGBA(0,0,0,0.4)` (Overlay)

**Dropdown Logics:**
1.  `ddAddPG`: Items `["DEP", "ETCH", "NON SAM", "OCTO"]`
2.  `ddAddBU`: Items `Filter(colBusinessUnitData, ProductGroup = ddAddPG.Selected.Value)`
3.  `ddAddCust`: Items `Distinct(colMarketData, Customer)`
4.  `ddAddMkt`: Items `Distinct(Filter(colMarketData, Customer = ddAddCust.Selected.Result), MarketSegment)`
5.  `ddAddNode`: Items `Distinct(Filter(colMarketData, Customer = ddAddCust.Selected.Result && MarketSegment = ddAddMkt.Selected.Result), CustomerNode)`
6.  `ddAddLegacy`: Items 
    ```powerfx
    Filter(Distinct(colMarketData, Legacy), Result <> "NULL" && Result <> "NOT APPLICABLE")
    ```

**Submit Button OnSelect:**
```powerfx
// Add all non-blank selections to the permissions collection
If(!IsBlank(ddAddPG.Selected.Value), Collect(colUserPermissions, {Type: "Product Group", Value: ddAddPG.Selected.Value, Selected: false}));
If(!IsBlank(ddAddBU.Selected.BusinessUnit), Collect(colUserPermissions, {Type: "Business Unit", Value: ddAddBU.Selected.BusinessUnit, Selected: false}));
If(!IsBlank(ddAddCust.Selected.Result), Collect(colUserPermissions, {Type: "Customer", Value: ddAddCust.Selected.Result, Selected: false}));
If(!IsBlank(ddAddMkt.Selected.Result), Collect(colUserPermissions, {Type: "Market Segment", Value: ddAddMkt.Selected.Result, Selected: false}));
If(!IsBlank(ddAddNode.Selected.Result), Collect(colUserPermissions, {Type: "Customer Node", Value: ddAddNode.Selected.Result, Selected: false}));
If(!IsBlank(ddAddLegacy.Selected.Result), Collect(colUserPermissions, {Type: "Legacy", Value: ddAddLegacy.Selected.Result, Selected: false}));

UpdateContext({locShowAddModal: false});
```

#### 3. Delete Permission Modal
Create a **Container** (`conModalDel`).
*   **Visible**: `locShowDelModal`
*   **Trigger**: Delete Button `DisplayMode`: `If(CountRows(Filter(colUserPermissions, Selected)) > 0, DisplayMode.Edit, DisplayMode.Disabled)`

**Delete Button OnSelect:**
```powerfx
RemoveIf(colUserPermissions, Selected = true);
UpdateContext({locShowDelModal: false});
```

---

## 4. CLS Logic & Components

### A. CLS Landing View
Create a **Container** (`conCLSLanding`) inside the main area.
*   **Visible**: `varCurrentScreen = "CLS_Landing"`

**Card Gallery (`galCLSCards`):**
*   **Items**: `GroupBy(colRLSUserData, "Group", "GroupData")`
*   **WrapCount**: 3
*   **Template**:
    *   **Rectangle (Header)**: Fill `varTheme.Midnight`, Height 5.
    *   **Label (Title)**: `ThisItem.Group`
    *   **Label (Count)**: `CountRows(ThisItem.GroupData) & " Member(s)"`
    *   **OnSelect**: 
        ```powerfx
        Set(varSelectedCLSGroup, ThisItem.Group); 
        Set(varCurrentScreen, "CLS_Members");
        ```

### B. CLS Members View
Create a **Container** (`conCLSMembers`) inside the main area.
*   **Visible**: `varCurrentScreen = "CLS_Members"`

**Header**: Button/Icon "Back" (`Set(varCurrentScreen, "CLS_Landing")`).

**Members Gallery (`galCLSMembers`):**
*   **Items**: `Filter(colRLSUserData, Group = varSelectedCLSGroup)`
*   **Controls**: Name, Email, Role Labels + **Trash Icon**.
*   **Trash Icon OnSelect**: `Remove(colRLSUserData, ThisItem)`

**Add User Modal (CLS):**
*   **Dropdown (`ddNewUser`)**: List of potential users.
*   **Add Button**:
    ```powerfx
    Patch(colRLSUserData, Defaults(colRLSUserData), {
        Group: varSelectedCLSGroup,
        Name: ddNewUser.Selected.Name,
        Email: ddNewUser.Selected.Email,
        Role: "Member",
        Status: "Active"
    });
    UpdateContext({locShowAddUserModal: false});
    ```
