# Industrial Operations & Inventory Desktop Dashboard
## Universal Deployment Pack for ServiceNow

This installer pack allows you to deploy or restore the complete **Industrial Enterprise Operations Desktop Dashboard** onto any ServiceNow instance (Utah, Vancouver, Washington DC, Xanadu) in under 15 seconds.

---

### Pack Contents

| File | Purpose | When to Use |
| :--- | :--- | :--- |
| **`install_industrial_dashboard.js`** | Self-contained ServiceNow Background Script (`~170 KB`) | **Fastest (Recommended)**: Copy & paste into `sys.scripts.do` |
| **`deploy_to_instance.py`** | 1-Click Automated Python Deployer | Deploy automatically from your terminal |
| **`Industrial_Dashboard_UpdateSet.xml`** | ServiceNow Retrieved Update Set XML | Classic import via **Retrieved Update Sets** |
| **`industrial_dashboard_ui_page.xml`** | Native ServiceNow XML UI Page Export | Import directly via **UI Pages > Import XML** |
| **`preview_offline.html`** | Standalone Offline Dashboard | Double-click to view & test immediately in Chrome / Edge without ServiceNow |

---

### Key Features Included

1. **Clean Navigation with Native Icons**:
   - Zero mojibake or corrupt characters (pure numeric HTML entities).
   - Crisp icons for Dashboard, Customer Orders, Production & Machines, Schedule Planner, Inventory, Procurement, Suppliers, Alerts, Demand Forecasting, and Digital Twin.
2. **Customer Orders with Live Data**:
   - Complete data rows for all 55 customer orders.
   - Populated **Product** names (e.g. `Gate Valve 100mm`, `Valve Manifold`, `Actuated Valve Assembly`) and **Quantity** metrics.
   - Real-time search filter input (`Search orders...`).
3. **Interactive Detail Popups**:
   - Clicking any order (`ORD-2026-001`), material code (`RM-ACT-007`), or work order (`PROD-2026-091`) launches a floating detail modal with complete telemetry.
   - Dismissible via Backdrop click, Close button, or `Esc` key.
4. **Inventory Health & Material Codes**:
   - Displays real material codes (`RM-ACT-007`, `RM-STL-002`, `RM-GSK-006`, `FG-VALVE-200`, `RM-WIR-009`).
   - Optimal / Below SS / Critical Shortage status badges and surplus tracking.
5. **Production & Machines Telemetry**:
   - Non-zero execution progress metrics (e.g. `29 (58%)`, `75 (100%)`).
   - Priority badges and color-coded status badges (`In Progress`, `Completed`, `Scheduled`).

---

### Method 1: Background Script (Recommended - 15 Seconds)

1. Open your ServiceNow instance and log in as `admin`.
2. Navigate to: **System Definition** > **Scripts - Background** (`https://<instance>.service-now.com/sys.scripts.do`).
3. Keep the **in scope** dropdown set to: `global`.
4. Open **`install_industrial_dashboard.js`**, select all (`Ctrl + A`), copy, and paste into the editor.
5. Click **Run script**.
6. The script will automatically detect the scope, update/create the UI pages, flush caches, and print your direct dashboard launch URLs!

---

### Method 2: 1-Click Python Deployer

Run the automated deployer from your terminal:

```bash
cd dashboard_installer_pack
python deploy_to_instance.py --instance https://<your-instance>.service-now.com --user admin --password "YourPassword"
```

The script logs into the instance, deploys the dashboard, flushes the cache, and verifies HTTP 200.

---

### Method 3: Update Set XML Import

1. In ServiceNow, navigate to: **System Update Sets** > **Retrieved Update Sets** (`sys_remote_update_set_list.do`).
2. Click **Import Update Set from XML**.
3. Choose the file: **`Industrial_Dashboard_UpdateSet.xml`** and click **Upload**.
4. Open the retrieved update set: **"Industrial Operations - Desktop Dashboard Pack v1.0"**.
5. Click **Preview Update Set**, resolve any collisions, and click **Commit Update Set**.

---

### Method 4: UI Page Direct XML Import

1. Navigate to: **System UI** > **UI Pages** (`sys_ui_page_list.do`).
2. Right-click any column header and select **Import XML**.
3. Choose **`industrial_dashboard_ui_page.xml`** and upload.

---

### Launching the Dashboard

Once deployed, access the dashboard at:
- `https://<your-instance>.service-now.com/x_2056099_indust_0_dashboard.do`
- `https://<your-instance>.service-now.com/industrial_dashboard.do`
