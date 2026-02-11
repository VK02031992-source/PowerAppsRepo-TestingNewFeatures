# Power Apps Security Screen Implementation Guide

Follow these steps to rebuild the "Lam Research Security Management App" in Power Apps Canvas Studio.

## Step 1: App Initialization (OnStart)

Select the **App** object in the Tree View and set the `OnStart` property to the following code. This initializes the color theme, mock market data, and user permissions structures.

```powerfx
// 1. Define Lam Research Theme Colors
Set(gblTheme, {
    Primary1: ColorValue("rgba(106, 120, 133, 1)"), // Slate
    Primary2: ColorValue("rgba(36, 36, 55, 1)"),   // Midnight (Main Background/Header)
    Primary3: ColorValue("rgba(230, 227, 220, 1)"), // Sand
    Primary4: ColorValue("rgba(108, 227, 198, 1)"), // Mint
    Secondary1: ColorValue("rgba(32, 167, 133, 1)"), // Dark Green
    White: White,
    Black: Black,
    Gray: ColorValue("#edebe9"),
    Red: ColorValue("#8C2132"),
    LightBlue: ColorValue("#eff6fc")
});

// 2. Initialize Market Data Hierarchy (Reference Data)
// Fields: Customer -> Market Segment -> Customer Node -> Advance/Legacy
ClearCollect(colMarketData, 
    {Cust: "UMC", Mkt: "FOUNDRY", Node: "7NM", Legacy: "ADV"},
    {Cust: "Samsung", Mkt: "NAND", Node: ">16", Legacy: "LEGACY"},
    {Cust: "Samsung", Mkt: "DRAM", Node: "D0B 6F2", Legacy: "ADV"},
    {Cust: "Micron", Mkt: "DRAM", Node: "110S", Legacy: "LEGACY"},
    {Cust: "Kioxia", Mkt: "NAND", Node: "BICS3", Legacy: "LEGACY"},
    {Cust: "SK hynix", Mkt: "NAND", Node: "32L", Legacy: "LEGACY"},
    {Cust: "SMIC", Mkt: "FOUNDRY", Node: "10NM", Legacy: "ADV"},
    {Cust: "Micron", Mkt: "DRAM", Node: "200S", Legacy: "ADV"},
    {Cust: "TSMC", Mkt: "FOUNDRY", Node: "N2", Legacy: "ADV"},
    {Cust: "Nanya", Mkt: "DRAM", Node: "130S", Legacy: "ADV"},
    {Cust: "Taiwan Regional", Mkt: "FOUNDRY", Node: "L28", Legacy: "NULL"}, // Will be filtered out
    {Cust: "GENERIC 200MM", Mkt: "DRAM", Node: "PROJECT", Legacy: "NOT APPLICABLE"} // Will be filtered out
);

// 3. Initialize Business Unit Data (Dropdown Dependencies)
// Product Group -> Business Unit
ClearCollect(colBusUnits,
    {PG: "DEP", BU: "PVD"}, {PG: "DEP", BU: "PECVD"}, {PG: "DEP", BU: "CLEAN"},
    {PG: "ETCH", BU: "DIELECTRIC"}, {PG: "ETCH", BU: "CONDUCTOR"}, {PG: "ETCH", BU: "SIG"},
    {PG: "NON SAM", BU: "BONDING"}, {PG: "NON SAM", BU: "CMP"},
    {PG: "OCTO", BU: "AETHER"}
);

// 4. Initialize User RLS Permissions (The 6-Column Grid Data)
// We use a normalized structure where Type defines the column (PG, BU, Cust, etc.)
ClearCollect(colUserPermissions, 
    {Type: "PG", Value: "DEP", Selected: false},
    {Type: "PG", Value: "ETCH", Selected: false},
    {Type: "BU", Value: "PVD", Selected: false},
    {Type: "BU", Value: "CLEAN", Selected: false},
    {Type: "Cust", Value: "Samsung", Selected: false},
    {Type: "Cust", Value: "TSMC", Selected: false},
    {Type: "Mkt", Value: "NAND", Selected: false},
    {Type: "Node", Value: "7NM", Selected: false},
    {Type: "Legacy", Value: "ADV", Selected: false}
);

// 5. Initialize Mock Users for Screen 1
ClearCollect(colRLSUsers,
    {Group: "Superuser", Name: "Ajay Raj", Role: "Member"},
    {Group: "Superuser", Name: "Raghu Balasubramanian", Role: "Member"},
    {Group: "Viewer - IDEA", Name: "Vikash Kumar", Role: "Member"},
    {Group: "Viewer - IDEA", Name: "Mohammad Masood", Role: "Member"}
);
```

---

## Step 2: Screen 1 - RLS Landing Page

1.  **Header**: Add a Rectangle (Top) with Fill: `gblTheme.Primary2`. Add Label "Lam Research Security Management App" (Color: `gblTheme.White`).
2.  **Left Nav**: Add Vertical Container. Add button "RLS Security Landing Page" (Fill: `If(locCurrentScreen="RLS", gblTheme.LightBlue, gblTheme.White)`).
3.  **Dropdown (Group Selection)**:
    *   **Name**: `drp_ADGroups`
    *   **Items**: `Distinct(colRLSUsers, Group)`
4.  **Gallery (User List)**:
    *   **Name**: `gal_RLSUsers`
    *   **Items**: `Filter(colRLSUsers, Group = drp_ADGroups.Selected.Result)`
    *   **OnSelect** (On the arrow or row):
        ```powerfx
        Set(locSelectedUser, ThisItem);
        Set(locCurrentScreen, "RLS_Permissions");
        Navigate(scr_RLS_Permissions, ScreenTransition.Fade);
        ```

---

## Step 3: Screen 2 - User RLS Permissions Grid

This screen contains the 6-column independent checkbox lists.

### A. The 6-Column Grid Setup
Use a **Horizontal Container** to hold 6 **Vertical Flexible Galleries**.

**Common Properties for Galleries:**
*   **TemplateSize**: 40
*   **Padding**: 0

| Column | Gallery Name | Items Property |
| :--- | :--- | :--- |
| **Product Group** | `gal_PG` | `Filter(colUserPermissions, Type="PG")` |
| **Business Unit** | `gal_BU` | `Filter(colUserPermissions, Type="BU")` |
| **Customer** | `gal_Cust` | `Filter(colUserPermissions, Type="Cust")` |
| **Market Segment** | `gal_Mkt` | `Filter(colUserPermissions, Type="Mkt")` |
| **Customer Node** | `gal_Node` | `Filter(colUserPermissions, Type="Node")` |
| **Advc/Legacy** | `gal_Legacy` | `Filter(colUserPermissions, Type="Legacy")` |

**Inside Each Gallery (Add a Checkbox control):**
*   **Text**: `ThisItem.Value`
*   **Default**: `ThisItem.Selected`
*   **OnCheck**: `Patch(colUserPermissions, ThisItem, {Selected: true})`
*   **OnUncheck**: `Patch(colUserPermissions, ThisItem, {Selected: false})`

---

### B. "Add Permission" Modal (Popup)

Create a Container (`con_AddModal`) with `Visible` property controlled by variable `locShowAddModal`.

**Dropdowns inside the Modal (Cascading Logic):**

1.  **Product Group** (`dd_PG`) -> Items: `["DEP", "ETCH", "NON SAM", "OCTO"]`
2.  **Business Unit** (`dd_BU`) -> Items: 
    ```powerfx
    Distinct(Filter(colBusUnits, PG = dd_PG.Selected.Value), BU)
    ```
3.  **Customer** (`dd_Cust`) -> Items: `Distinct(colMarketData, Cust)`
4.  **Market Segment** (`dd_Mkt`) -> Items: 
    ```powerfx
    Distinct(Filter(colMarketData, Cust = dd_Cust.Selected.Result), Mkt)
    ```
5.  **Customer Node** (`dd_Node`) -> Items: 
    ```powerfx
    Distinct(Filter(colMarketData, Cust = dd_Cust.Selected.Result && Mkt = dd_Mkt.Selected.Result), Node)
    ```
6.  **Advance/Legacy** (`dd_Legacy`) -> Items: 
    ```powerfx
    Filter(
        Distinct(Filter(colMarketData, Cust = dd_Cust.Selected.Result && Mkt = dd_Mkt.Selected.Result && Node = dd_Node.Selected.Result), Legacy),
        Result <> "NULL" && Result <> "NOT APPLICABLE"
    )
    ```

**"Submit" Button Logic:**
Checks if values exist before adding to avoid duplicates.

```powerfx
// Add Product Group
If(!IsBlank(dd_PG.Selected.Value) && IsBlank(LookUp(colUserPermissions, Type="PG" && Value=dd_PG.Selected.Value)),
    Collect(colUserPermissions, {Type: "PG", Value: dd_PG.Selected.Value, Selected: false})
);

// Add Business Unit
If(!IsBlank(dd_BU.Selected.Result) && IsBlank(LookUp(colUserPermissions, Type="BU" && Value=dd_BU.Selected.Result)),
    Collect(colUserPermissions, {Type: "BU", Value: dd_BU.Selected.Result, Selected: false})
);

// Add Customer
If(!IsBlank(dd_Cust.Selected.Result) && IsBlank(LookUp(colUserPermissions, Type="Cust" && Value=dd_Cust.Selected.Result)),
    Collect(colUserPermissions, {Type: "Cust", Value: dd_Cust.Selected.Result, Selected: false})
);

// Add Market Segment
If(!IsBlank(dd_Mkt.Selected.Result) && IsBlank(LookUp(colUserPermissions, Type="Mkt" && Value=dd_Mkt.Selected.Result)),
    Collect(colUserPermissions, {Type: "Mkt", Value: dd_Mkt.Selected.Result, Selected: false})
);

// Add Node
If(!IsBlank(dd_Node.Selected.Result) && IsBlank(LookUp(colUserPermissions, Type="Node" && Value=dd_Node.Selected.Result)),
    Collect(colUserPermissions, {Type: "Node", Value: dd_Node.Selected.Result, Selected: false})
);

// Add Legacy
If(!IsBlank(dd_Legacy.Selected.Result) && IsBlank(LookUp(colUserPermissions, Type="Legacy" && Value=dd_Legacy.Selected.Result)),
    Collect(colUserPermissions, {Type: "Legacy", Value: dd_Legacy.Selected.Result, Selected: false})
);

// Close Modal & Reset
Reset(dd_PG); Reset(dd_BU); Reset(dd_Cust); 
Set(locShowAddModal, false);
Notify("Permissions Added Successfully", NotificationType.Success);
```

---

### C. "Delete Permission" Logic

**Delete Button Properties:**
*   **Text**: "Delete User Permission"
*   **DisplayMode**: 
    ```powerfx
    If(CountRows(Filter(colUserPermissions, Selected = true)) > 0, DisplayMode.Edit, DisplayMode.Disabled)
    ```
*   **OnSelect**: `Set(locShowDeletePopup, true)`

**Delete Confirmation Modal:**
*   **Message Label Data**:
    ```powerfx
    "Are you sure you want to delete these permissions? " & Char(13) & 
    Concat(Filter(colUserPermissions, Selected=true), Type & ": " & Value, ", " & Char(13))
    ```
*   **"Confirm" Button OnSelect**:
    ```powerfx
    RemoveIf(colUserPermissions, Selected = true);
    Set(locShowDeletePopup, false);
    Notify("Selected permissions have been removed.", NotificationType.Success);
    ```
