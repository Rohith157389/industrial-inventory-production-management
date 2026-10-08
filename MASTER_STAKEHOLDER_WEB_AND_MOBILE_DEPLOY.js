// ============================================================================
// 🏆 BUGSLAYERS - EXACT 10-SCREEN HACKNOW TEMPLATE MOBILE SUITE
// Master Deployment Script for ServiceNow dev445579 (Global Scope)
//
// Implements the EXACT 10-Screen Smart Manufacturing Mobile Application:
// 1. Dashboard: "Hello, Rohit! 👋", Factory Status Healthy, 6-KPI table (OEE 88.4%, Orders 4, Alerts 3, On-Time 92%, Downtime 197m, Inventory 83%), Critical Issues list, Production Today (37/85), AI Rec Card
// 2. Production: Orders, Schedule, Planner, What-If tabs + PO-101, PO-104, PO-102 cards + (+) FAB
// 3. Production Details: PO-2026-101 detail, Progress/BOM/Activity, Stepper, Pause & Complete buttons
// 4. What-If Simulation: Scenario, Machine, Duration, Run Simulation, Alternative A vs B, Expected Impact
// 5. Inventory: Pastel Stock Overview (Total 283, Available 210, etc.), Low Stock Items, Quick Action buttons
// 6. BOM & Material: PO-101 BOM table (Titanium, Seals, Ceramic Bearings 7/10), Shortage Request card
// 7. Alerts: Filter pills (All, Critical, Warning, Info), rich alert cards with badges
// 8. More (Menu): 2x5 colorful grid of modules (Workforce, Work Centers, Maintenance, Suppliers, Quality, etc.)
// 9. Workforce: Pastel cards (Available 42, Assigned 36, Absent 6), Skills coverage bars, Maintenance section
// 10. AI Recommendations: High/Med/Low priority cards with [Simulate] and [Approve] buttons
//
// Target Instance: https://dev445579.service-now.com/
// Scope: Global (Run in System Definition > Scripts - Background: sys.scripts.do)
// ============================================================================
(function deployTemplateMatchedMobileSuite() {
    gs.print('================================================================================');
    gs.print('🚀 DEPLOYING EXACT 10-SCREEN TEMPLATE SUITE ON dev445579');
    gs.print('================================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // 1. WORK CENTERS & SENSOR TELEMETRY
    // -------------------------------------------------------------------------
    gs.print('\n⚙️ [1/5] Ensuring Live Work Centers & Sensor Telemetry...');
    var wcMap = {};
    var workCenterDefs = [
        { id: 'WC-CNC-501',  name: '5-Axis CNC Milling Center',    type: 'cnc_machining',  status: 'breakdown',  health: 64, oee: 72.4, temp: 68.5, vib: 0.19, crew: 'Crew Alpha (8 Techs)' },
        { id: 'WC-ROBO-502', name: 'Robotic Arc Welding Cell',     type: 'welding',        status: 'breakdown',  health: 76, oee: 81.2, temp: 48.0, vib: 0.14, crew: 'Crew Beta (6 Techs)' },
        { id: 'WC-ADD-503',  name: 'Laser Powder 3D Metal Printer', type: 'additive_mfg',   status: 'running',    health: 96, oee: 91.8, temp: 31.5, vib: 0.02, crew: 'Crew Gamma (4 Techs)' },
        { id: 'WC-ASSY-504', name: 'Cleanroom Final Assembly Line', type: 'assembly',       status: 'running',    health: 98, oee: 94.2, temp: 21.8, vib: 0.01, crew: 'Crew Delta (10 Techs)' }
    ];

    for (var w = 0; w < workCenterDefs.length; w++) {
        var wDef = workCenterDefs[w];
        var wGr = new GlideRecord('x_2056099_indust_0_dt_work_center');
        wGr.addQuery('work_center_code', wDef.id);
        wGr.query();
        if (wGr.next()) {
            wGr.work_center_name = wDef.name;
            wGr.process_type = wDef.type;
            wGr.operational_status = wDef.status;
            wGr.health_index_pct = wDef.health;
            wGr.operating_temp_c = wDef.temp;
            wGr.vibration_mms = wDef.vib;
            wGr.assigned_shift_crew = wDef.crew;
            wGr.active = true;
            wGr.update();
            wcMap[wDef.id] = wGr.getUniqueValue();
        } else {
            wGr.initialize();
            wGr.work_center_code = wDef.id;
            wGr.work_center_name = wDef.name;
            wGr.process_type = wDef.type;
            wGr.operational_status = wDef.status;
            wGr.health_index_pct = wDef.health;
            wGr.operating_temp_c = wDef.temp;
            wGr.vibration_mms = wDef.vib;
            wGr.assigned_shift_crew = wDef.crew;
            wGr.active = true;
            wGr.sys_scope = scopeId;
            wcMap[wDef.id] = wGr.insert();
        }
        gs.print('   ✅ Work Center [' + wDef.id + '] Status: ' + wDef.status);
    }

    // -------------------------------------------------------------------------
    // 2. PRODUCTION ORDERS & BREAKDOWNS
    // -------------------------------------------------------------------------
    gs.print('\n⚡ [2/5] Seeding Production Orders & Breakdowns...');
    var orders = [
        { num: 'PO-2026-101', status: 'in_progress', plan: 50, prod: 31, prio: 1, desc: 'Aerospace Fuel Valve', mach: 'WC-CNC-501' },
        { num: 'PO-2026-104', status: 'scheduled',   plan: 40, prod: 0,  prio: 2, desc: 'Hydraulic Pump',       mach: 'WC-ADD-503' },
        { num: 'PO-2026-102', status: 'pending',     plan: 30, prod: 0,  prio: 2, desc: 'Gear Assembly',        mach: 'WC-ROBO-502' }
    ];

    for (var o = 0; o < orders.length; o++) {
        var oObj = orders[o];
        var oGr = new GlideRecord('x_2056099_indust_0_production_order');
        oGr.addQuery('number', oObj.num);
        oGr.query();
        if (oGr.next()) {
            oGr.status = oObj.status;
            oGr.quantity_planned = oObj.plan;
            oGr.quantity_produced = oObj.prod;
            oGr.quantity_remaining = (oObj.plan - oObj.prod);
            oGr.priority = oObj.prio;
            oGr.description = oObj.desc;
            oGr.active = true;
            oGr.update();
        }
    }

    var breakdowns = [
        {
            num: 'BD-2026-001',
            machine: wcMap['WC-CNC-501'],
            status: 'active',
            severity: 'critical',
            cat: 'unplanned_mechanical',
            type: 'spindle_bearing_failure',
            reason: 'High Spindle Vibration (0.19g > 0.12g limit) - Overheating Bearing (68.5°C)',
            impact: 'high',
            root: 'Bearing lubrication breakdown under high-feed titanium roughing',
            notes: 'Spindle thermal expansion trip activated. Line halted. Urgent ceramic bearing replacement required.',
            duration: 145
        }
    ];

    for (var b = 0; b < breakdowns.length; b++) {
        var bd = breakdowns[b];
        var bdGr = new GlideRecord('x_2056099_indust_0_mach_down');
        bdGr.addQuery('number', bd.num);
        bdGr.query();
        if (!bdGr.next()) {
            bdGr.initialize();
            bdGr.number = bd.num;
            if (bd.machine) bdGr.machine = bd.machine;
            bdGr.status = bd.status;
            bdGr.severity = bd.severity;
            bdGr.downtime_category = bd.cat;
            bdGr.downtime_type = bd.type;
            bdGr.reason = bd.reason;
            bdGr.production_impact = bd.impact;
            bdGr.root_cause = bd.root;
            bdGr.notes = bd.notes;
            bdGr.duration = bd.duration;
            bdGr.start_time = new GlideDateTime();
            bdGr.active = true;
            bdGr.sys_scope = scopeId;
            bdGr.insert();
        }
    }

    // -------------------------------------------------------------------------
    // 3. GENERATE PIXEL-PERFECT TEMPLATE HTML
    // -------------------------------------------------------------------------
    gs.print('\n🎨 [3/5] Generating Exact 10-Screen Template Mobile UI Page...');

    var templateHtml = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n' +
'  <title>ServiceNow • Smart Manufacturing</title>\n' +
'  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">\n' +
'  <style>\n' +
'    :root {\n' +
'      --bg-page: #f8fafc;\n' +
'      --bg-card: #ffffff;\n' +
'      --header-bg: #0b1a2e;\n' +
'      --text-dark: #0f172a;\n' +
'      --text-muted: #64748b;\n' +
'      --text-light: #94a3b8;\n' +
'      --border-card: #e2e8f0;\n' +
'      --border-subtle: #edf2f7;\n' +
'      --primary-blue: #2563eb;\n' +
'      --primary-hover: #1d4ed8;\n' +
'      --green-accent: #10b981;\n' +
'      --green-light: #ecfdf5;\n' +
'      --red-accent: #ef4444;\n' +
'      --red-light: #fef2f2;\n' +
'      --amber-accent: #f59e0b;\n' +
'      --amber-light: #fffbeb;\n' +
'      --purple-light: #f5f3ff;\n' +
'      --font-sans: "Plus Jakarta Sans", -apple-system, sans-serif;\n' +
'      --font-mono: "JetBrains Mono", monospace;\n' +
'    }\n' +
'    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }\n' +
'    body {\n' +
'      background: #0f172a;\n' +
'      font-family: var(--font-sans);\n' +
'      color: var(--text-dark);\n' +
'      min-height: 100vh;\n' +
'      display: flex;\n' +
'      justify-content: center;\n' +
'      align-items: flex-start;\n' +
'      padding: 0;\n' +
'    }\n' +
'    .phone-container {\n' +
'      max-width: 440px;\n' +
'      width: 100%;\n' +
'      min-height: 100vh;\n' +
'      background: #f8fafc;\n' +
'      position: relative;\n' +
'      display: flex;\n' +
'      flex-direction: column;\n' +
'      box-shadow: 0 25px 60px rgba(0,0,0,0.5);\n' +
'      border-left: 1px solid #cbd5e1;\n' +
'      border-right: 1px solid #cbd5e1;\n' +
'      overflow: hidden;\n' +
'    }\n' +
'    .app-header {\n' +
'      background: var(--header-bg);\n' +
'      color: #fff;\n' +
'      padding: 14px 18px;\n' +
'      display: flex;\n' +
'      justify-content: space-between;\n' +
'      align-items: center;\n' +
'      position: sticky;\n' +
'      top: 0;\n' +
'      z-index: 100;\n' +
'    }\n' +
'    .header-left {\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      gap: 12px;\n' +
'    }\n' +
'    .header-title-box h1 {\n' +
'      font-size: 15px;\n' +
'      font-weight: 800;\n' +
'      color: #fff;\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      gap: 6px;\n' +
'      letter-spacing: -0.01em;\n' +
'    }\n' +
'    .user-avatar {\n' +
'      width: 32px;\n' +
'      height: 32px;\n' +
'      border-radius: 50%;\n' +
'      background: #1e293b;\n' +
'      border: 1.5px solid #38bdf8;\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      justify-content: center;\n' +
'      font-size: 13px;\n' +
'      color: #fff;\n' +
'      font-weight: 700;\n' +
'    }\n' +
'    .screen-selector-bar {\n' +
'      background: #1e293b;\n' +
'      padding: 8px 14px;\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      justify-content: space-between;\n' +
'      border-bottom: 1px solid #334155;\n' +
'    }\n' +
'    .screen-select {\n' +
'      background: #0f172a;\n' +
'      color: #38bdf8;\n' +
'      border: 1px solid #334155;\n' +
'      padding: 5px 8px;\n' +
'      border-radius: 6px;\n' +
'      font-size: 11px;\n' +
'      font-weight: 700;\n' +
'      outline: none;\n' +
'      cursor: pointer;\n' +
'    }\n' +
'    .screen-flow-btn {\n' +
'      background: #059669;\n' +
'      border: none;\n' +
'      color: #fff;\n' +
'      font-size: 11px;\n' +
'      font-weight: 700;\n' +
'      padding: 5px 12px;\n' +
'      border-radius: 6px;\n' +
'      cursor: pointer;\n' +
'    }\n' +
'    .content-area {\n' +
'      flex: 1;\n' +
'      padding: 16px 16px 85px;\n' +
'      overflow-y: auto;\n' +
'    }\n' +
'    .screen-view { display: none; }\n' +
'    .screen-view.active { display: block; animation: viewIn 0.2s ease-out; }\n' +
'    @keyframes viewIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }\n' +
'    .card {\n' +
'      background: var(--bg-card);\n' +
'      border: 1px solid var(--border-card);\n' +
'      border-radius: 14px;\n' +
'      padding: 16px;\n' +
'      margin-bottom: 12px;\n' +
'      box-shadow: 0 1px 3px rgba(0,0,0,0.03);\n' +
'    }\n' +
'    .greeting-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }\n' +
'    .greeting-sub { font-size: 12px; color: var(--text-muted); margin-bottom: 14px; }\n' +
'    .sec-head {\n' +
'      display: flex;\n' +
'      justify-content: space-between;\n' +
'      align-items: center;\n' +
'      margin: 18px 0 8px;\n' +
'    }\n' +
'    .sec-title { font-size: 13px; font-weight: 800; color: #0f172a; }\n' +
'    .sec-link { font-size: 11px; font-weight: 700; color: var(--primary-blue); text-decoration: none; cursor: pointer; }\n' +
'    .kpi-box {\n' +
'      background: #ffffff;\n' +
'      border: 1px solid var(--border-card);\n' +
'      border-radius: 14px;\n' +
'      overflow: hidden;\n' +
'      margin-bottom: 14px;\n' +
'    }\n' +
'    .kpi-head-row {\n' +
'      display: flex;\n' +
'      justify-content: space-between;\n' +
'      align-items: center;\n' +
'      padding: 10px 14px;\n' +
'      border-bottom: 1px solid var(--border-subtle);\n' +
'      font-size: 12px;\n' +
'      font-weight: 700;\n' +
'    }\n' +
'    .status-healthy {\n' +
'      display: inline-flex;\n' +
'      align-items: center;\n' +
'      gap: 5px;\n' +
'      color: #059669;\n' +
'      font-size: 11px;\n' +
'      font-weight: 700;\n' +
'    }\n' +
'    .kpi-3col {\n' +
'      display: grid;\n' +
'      grid-template-columns: repeat(3, 1fr);\n' +
'      text-align: center;\n' +
'      padding: 12px 6px;\n' +
'      border-bottom: 1px solid var(--border-subtle);\n' +
'    }\n' +
'    .kpi-3col:last-child { border-bottom: none; }\n' +
'    .kpi-col .lbl { font-size: 11px; color: var(--text-muted); font-weight: 600; }\n' +
'    .kpi-col .val { font-size: 15px; font-weight: 800; color: #0f172a; margin: 3px 0 1px; font-family: var(--font-mono); }\n' +
'    .kpi-col .trend {\n' +
'      font-size: 10px;\n' +
'      font-weight: 700;\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      justify-content: center;\n' +
'      gap: 2px;\n' +
'    }\n' +
'    .trend.green { color: #059669; }\n' +
'    .trend.red { color: #dc2626; }\n' +
'    .trend.blue { color: #2563eb; }\n' +
'    .issue-item {\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      justify-content: space-between;\n' +
'      padding: 10px 0;\n' +
'      border-bottom: 1px solid var(--border-subtle);\n' +
'    }\n' +
'    .issue-item:last-child { border-bottom: none; padding-bottom: 0; }\n' +
'    .issue-left {\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      gap: 10px;\n' +
'    }\n' +
'    .dot-icon {\n' +
'      width: 10px;\n' +
'      height: 10px;\n' +
'      border-radius: 50%;\n' +
'    }\n' +
'    .dot-red { background: #ef4444; }\n' +
'    .dot-amber { background: #f59e0b; }\n' +
'    .dot-yellow { background: #eab308; }\n' +
'    .issue-name { font-size: 13px; font-weight: 700; color: #0f172a; }\n' +
'    .issue-desc { font-size: 11px; color: var(--text-muted); }\n' +
'    .pill-badge {\n' +
'      font-size: 10px;\n' +
'      font-weight: 700;\n' +
'      padding: 3px 8px;\n' +
'      border-radius: 6px;\n' +
'      text-transform: capitalize;\n' +
'    }\n' +
'    .pill-red { background: #fee2e2; color: #dc2626; }\n' +
'    .pill-amber { background: #fef3c7; color: #d97706; }\n' +
'    .pill-yellow { background: #fef9c3; color: #ca8a04; }\n' +
'    .pill-green { background: #dcfce7; color: #15803d; }\n' +
'    .pill-blue { background: #dbeafe; color: #1d4ed8; }\n' +
'    .pill-gray { background: #f1f5f9; color: #475569; }\n' +
'    .progress-track {\n' +
'      background: #e2e8f0;\n' +
'      height: 6px;\n' +
'      border-radius: 999px;\n' +
'      overflow: hidden;\n' +
'      margin: 8px 0;\n' +
'    }\n' +
'    .progress-fill {\n' +
'      height: 100%;\n' +
'      background: #10b981;\n' +
'      border-radius: 999px;\n' +
'    }\n' +
'    .ai-card {\n' +
'      background: #f0f7ff;\n' +
'      border: 1px solid #bfdbfe;\n' +
'      border-radius: 12px;\n' +
'      padding: 12px;\n' +
'      margin-top: 14px;\n' +
'    }\n' +
'    .ai-card-title {\n' +
'      font-size: 11px;\n' +
'      font-weight: 700;\n' +
'      color: #1e40af;\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      gap: 6px;\n' +
'      margin-bottom: 4px;\n' +
'    }\n' +
'    .ai-card-desc { font-size: 12px; color: #1e3a5f; margin-bottom: 8px; }\n' +
'    .ai-btn {\n' +
'      background: #2563eb;\n' +
'      color: #fff;\n' +
'      border: none;\n' +
'      padding: 8px 14px;\n' +
'      border-radius: 8px;\n' +
'      font-size: 11px;\n' +
'      font-weight: 700;\n' +
'      width: 100%;\n' +
'      cursor: pointer;\n' +
'    }\n' +
'    .segmented-control {\n' +
'      display: flex;\n' +
'      background: #e2e8f0;\n' +
'      padding: 3px;\n' +
'      border-radius: 8px;\n' +
'      gap: 3px;\n' +
'      margin-bottom: 14px;\n' +
'    }\n' +
'    .seg-btn {\n' +
'      flex: 1;\n' +
'      border: none;\n' +
'      background: transparent;\n' +
'      color: var(--text-muted);\n' +
'      font-size: 11px;\n' +
'      font-weight: 600;\n' +
'      padding: 6px 4px;\n' +
'      border-radius: 6px;\n' +
'      cursor: pointer;\n' +
'      text-align: center;\n' +
'    }\n' +
'    .seg-btn.active {\n' +
'      background: #2563eb;\n' +
'      color: #fff;\n' +
'    }\n' +
'    .fab-btn {\n' +
'      position: fixed;\n' +
'      bottom: 80px;\n' +
'      right: calc(50% - 195px);\n' +
'      width: 44px;\n' +
'      height: 44px;\n' +
'      border-radius: 50%;\n' +
'      background: #2563eb;\n' +
'      color: #fff;\n' +
'      font-size: 24px;\n' +
'      border: none;\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      justify-content: center;\n' +
'      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);\n' +
'      cursor: pointer;\n' +
'      z-index: 150;\n' +
'    }\n' +
'    .stepper-item {\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      justify-content: space-between;\n' +
'      padding: 10px 0;\n' +
'      border-bottom: 1px solid var(--border-subtle);\n' +
'    }\n' +
'    .stepper-left {\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      gap: 10px;\n' +
'      font-size: 13px;\n' +
'      font-weight: 600;\n' +
'    }\n' +
'    .pastel-grid {\n' +
'      display: grid;\n' +
'      grid-template-columns: repeat(3, 1fr);\n' +
'      gap: 10px;\n' +
'      margin-bottom: 16px;\n' +
'    }\n' +
'    .pastel-tile {\n' +
'      border-radius: 12px;\n' +
'      padding: 14px 10px;\n' +
'      text-align: center;\n' +
'    }\n' +
'    .pastel-tile .num {\n' +
'      font-size: 20px;\n' +
'      font-weight: 800;\n' +
'      font-family: var(--font-mono);\n' +
'    }\n' +
'    .pastel-tile .lbl { font-size: 11px; font-weight: 600; margin-top: 2px; }\n' +
'    .module-grid {\n' +
'      display: grid;\n' +
'      grid-template-columns: repeat(2, 1fr);\n' +
'      gap: 12px;\n' +
'    }\n' +
'    .module-tile {\n' +
'      background: #ffffff;\n' +
'      border: 1px solid var(--border-card);\n' +
'      border-radius: 12px;\n' +
'      padding: 16px 12px;\n' +
'      display: flex;\n' +
'      flex-direction: column;\n' +
'      align-items: center;\n' +
'      text-align: center;\n' +
'      cursor: pointer;\n' +
'      transition: 0.15s;\n' +
'    }\n' +
'    .module-tile:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }\n' +
'    .module-icon {\n' +
'      width: 40px;\n' +
'      height: 40px;\n' +
'      border-radius: 10px;\n' +
'      display: flex;\n' +
'      align-items: center;\n' +
'      justify-content: center;\n' +
'      font-size: 18px;\n' +
'      margin-bottom: 8px;\n' +
'    }\n' +
'    .module-name { font-size: 12px; font-weight: 700; color: #0f172a; }\n' +
'    .bottom-nav {\n' +
'      position: fixed;\n' +
'      bottom: 0;\n' +
'      left: 50%;\n' +
'      transform: translateX(-50%);\n' +
'      max-width: 440px;\n' +
'      width: 100%;\n' +
'      background: #ffffff;\n' +
'      border-top: 1px solid var(--border-card);\n' +
'      display: grid;\n' +
'      grid-template-columns: repeat(5, 1fr);\n' +
'      padding: 8px 4px 12px;\n' +
'      z-index: 200;\n' +
'    }\n' +
'    .nav-item {\n' +
'      background: transparent;\n' +
'      border: none;\n' +
'      color: #94a3b8;\n' +
'      display: flex;\n' +
'      flex-direction: column;\n' +
'      align-items: center;\n' +
'      font-size: 10px;\n' +
'      font-weight: 600;\n' +
'      cursor: pointer;\n' +
'      gap: 3px;\n' +
'      position: relative;\n' +
'    }\n' +
'    .nav-item .nav-icon { font-size: 18px; }\n' +
'    .nav-item.active { color: #2563eb; font-weight: 700; }\n' +
'    .nav-badge {\n' +
'      position: absolute;\n' +
'      top: -2px;\n' +
'      right: 18px;\n' +
'      background: #ef4444;\n' +
'      color: #fff;\n' +
'      font-size: 9px;\n' +
'      font-weight: 800;\n' +
'      border-radius: 999px;\n' +
'      padding: 1px 5px;\n' +
'    }\n' +
'    .toast-popup {\n' +
'      position: fixed;\n' +
'      top: 55px;\n' +
'      left: 50%;\n' +
'      transform: translateX(-50%) translateY(-20px);\n' +
'      background: #0f172a;\n' +
'      color: #fff;\n' +
'      border: 1px solid #38bdf8;\n' +
'      padding: 8px 18px;\n' +
'      border-radius: 999px;\n' +
'      font-size: 12px;\n' +
'      font-weight: 600;\n' +
'      box-shadow: 0 10px 25px rgba(0,0,0,0.5);\n' +
'      opacity: 0;\n' +
'      transition: 0.3s;\n' +
'      pointer-events: none;\n' +
'      z-index: 999;\n' +
'      white-space: nowrap;\n' +
'    }\n' +
'    .toast-popup.show {\n' +
'      opacity: 1;\n' +
'      transform: translateX(-50%) translateY(0);\n' +
'    }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="phone-container">\n' +
'    <header class="app-header">\n' +
'      <div class="header-left">\n' +
'        <span id="headerBackBtn" style="display:none; cursor:pointer; font-size:18px;" onclick="goBack()">&larr;</span>\n' +
'        <div class="header-title-box">\n' +
'          <h1 id="headerTitle">ServiceNow <span style="color:#10b981; font-size:10px;">● Smart Mfg</span></h1>\n' +
'        </div>\n' +
'      </div>\n' +
'      <div class="user-avatar">R</div>\n' +
'    </header>\n' +
'\n' +
'    <div class="screen-selector-bar">\n' +
'      <span style="font-size:10px; color:#94a3b8; font-weight:700;">TEMPLATE SCREEN:</span>\n' +
'      <select class="screen-select" id="screenSelector" onchange="jumpToScreen(this.value)">\n' +
'        <option value="1">1. Dashboard</option>\n' +
'        <option value="2">2. Production</option>\n' +
'        <option value="3">3. Production Details</option>\n' +
'        <option value="4">4. What-If Simulation</option>\n' +
'        <option value="5">5. Inventory</option>\n' +
'        <option value="6">6. BOM &amp; Material</option>\n' +
'        <option value="7">7. Alerts</option>\n' +
'        <option value="8">8. More (Menu)</option>\n' +
'        <option value="9">9. Workforce / Maint</option>\n' +
'        <option value="10">10. AI Recommendations</option>\n' +
'      </select>\n' +
'      <button class="screen-flow-btn" onclick="stepDemoStory()">▶ Demo Flow</button>\n' +
'    </div>\n' +
'\n' +
'    <div class="content-area">\n' +
'      <!-- SCREEN 1: DASHBOARD -->\n' +
'      <div class="screen-view active" id="view-1">\n' +
'        <div class="greeting-title">Hello, Rohit! 👋</div>\n' +
'        <div class="greeting-sub">Here\'s your production overview</div>\n' +
'\n' +
'        <div class="kpi-box">\n' +
'          <div class="kpi-head-row">\n' +
'            <span>Factory Status</span>\n' +
'            <span class="status-healthy">● Healthy</span>\n' +
'          </div>\n' +
'          <div class="kpi-3col">\n' +
'            <div class="kpi-col"><div class="lbl">OEE</div><div class="val">88.4%</div><div class="trend green">↑ 5.2%</div></div>\n' +
'            <div class="kpi-col"><div class="lbl">Orders</div><div class="val">4</div><div class="trend green">↑ 1</div></div>\n' +
'            <div class="kpi-col"><div class="lbl">Alerts</div><div class="val" style="color:#ef4444;">3</div><div class="trend red">↓ 2</div></div>\n' +
'          </div>\n' +
'          <div class="kpi-3col">\n' +
'            <div class="kpi-col"><div class="lbl">On-Time</div><div class="val" id="kpiOtd">92%</div><div class="trend green">↑ 8%</div></div>\n' +
'            <div class="kpi-col"><div class="lbl">Downtime</div><div class="val">197 min</div><div class="trend green">↓ 32%</div></div>\n' +
'            <div class="kpi-col"><div class="lbl">Inventory</div><div class="val">83%</div><div class="trend green">↑ 6%</div></div>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="sec-head">\n' +
'          <div class="sec-title">Critical Issues</div>\n' +
'          <div class="sec-link" onclick="jumpToScreen(\'7\')">View All</div>\n' +
'        </div>\n' +
'        <div class="card">\n' +
'          <div class="issue-item">\n' +
'            <div class="issue-left">\n' +
'              <div class="dot-icon dot-red"></div>\n' +
'              <div><div class="issue-name">CNC-501</div><div class="issue-desc">Machine breakdown</div></div>\n' +
'            </div>\n' +
'            <span class="pill-badge pill-red">Critical</span>\n' +
'          </div>\n' +
'          <div class="issue-item">\n' +
'            <div class="issue-left">\n' +
'              <div class="dot-icon dot-amber"></div>\n' +
'              <div><div class="issue-name">PO-2026-101</div><div class="issue-desc">At risk (delay)</div></div>\n' +
'            </div>\n' +
'            <span class="pill-badge pill-amber">High</span>\n' +
'          </div>\n' +
'          <div class="issue-item">\n' +
'            <div class="issue-left">\n' +
'              <div class="dot-icon dot-yellow"></div>\n' +
'              <div><div class="issue-name">MAT-BRG-201</div><div class="issue-desc">Low stock</div></div>\n' +
'            </div>\n' +
'            <span class="pill-badge pill-yellow">Medium</span>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="sec-head"><div class="sec-title">Production Today</div></div>\n' +
'        <div class="card">\n' +
'          <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">\n' +
'            <span>Planned: 85</span>\n' +
'            <span id="dashProdToday">Produced: 37</span>\n' +
'            <span id="dashRemToday">Remaining: 48</span>\n' +
'          </div>\n' +
'          <div class="progress-track"><div class="progress-fill" id="dashBar" style="width: 43%;"></div></div>\n' +
'        </div>\n' +
'\n' +
'        <div class="ai-card">\n' +
'          <div class="ai-card-title">✨ AI Recommendation</div>\n' +
'          <div class="ai-card-desc">Move PO-2026-101 to WC-ADD-503 due to CNC-501 failure.</div>\n' +
'          <button class="ai-btn" onclick="jumpToScreen(\'10\')">+ View Recommendation</button>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 2: PRODUCTION -->\n' +
'      <div class="screen-view" id="view-2">\n' +
'        <div class="segmented-control">\n' +
'          <button class="seg-btn active" onclick="jumpToScreen(\'2\')">Orders</button>\n' +
'          <button class="seg-btn" onclick="toast(\'Viewing Shift Schedule\')">Schedule</button>\n' +
'          <button class="seg-btn" onclick="jumpToScreen(\'10\')">Planner</button>\n' +
'          <button class="seg-btn" onclick="jumpToScreen(\'4\')">What-If</button>\n' +
'        </div>\n' +
'\n' +
'        <div class="sec-head">\n' +
'          <div class="sec-title">Production Orders</div>\n' +
'          <span style="font-size:14px; color:#64748b; cursor:pointer;">⚡</span>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="cursor:pointer;" onclick="jumpToScreen(\'3\')">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:center;">\n' +
'            <div><strong style="font-size:14px;">PO-2026-101</strong> <span class="pill-badge pill-red">P1</span></div>\n' +
'            <span class="pill-badge pill-green" id="cardStatusPO101">In Progress</span>\n' +
'          </div>\n' +
'          <div style="font-size:12px; color:#64748b; margin:2px 0 6px;">Aerospace Fuel Valve</div>\n' +
'          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">\n' +
'            <span id="cardUnitsPO101">31 / 50 units</span><span id="cardPctPO101">62%</span>\n' +
'          </div>\n' +
'          <div class="progress-track"><div class="progress-fill" id="cardFillPO101" style="width:62%;"></div></div>\n' +
'          <div style="font-size:11px; color:#64748b; margin-top:4px;">\n' +
'            ⚙️ Machine: <strong id="cardMachPO101">WC-CNC-501</strong><br>\n' +
'            ⏱️ Delivery: <span style="color:#d97706; font-weight:700;" id="cardRiskPO101">At Risk</span>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="card">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:center;">\n' +
'            <div><strong style="font-size:14px;">PO-2026-104</strong> <span class="pill-badge pill-amber">P2</span></div>\n' +
'            <span class="pill-badge pill-green">Scheduled</span>\n' +
'          </div>\n' +
'          <div style="font-size:12px; color:#64748b; margin:2px 0 6px;">Gear Assembly</div>\n' +
'          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">\n' +
'            <span>0 / 40 units</span><span>0%</span>\n' +
'          </div>\n' +
'          <div class="progress-track"><div class="progress-fill" style="width:0%;"></div></div>\n' +
'          <div style="font-size:11px; color:#64748b; margin-top:4px;">\n' +
'            ⚙️ Machine: <strong>WC-ADD-503</strong><br>\n' +
'            ⏱️ Delivery: <span style="color:#15803d; font-weight:700;">On Track</span>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="card">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:center;">\n' +
'            <div><strong style="font-size:14px;">PO-2026-102</strong> <span class="pill-badge pill-amber">P2</span></div>\n' +
'            <span class="pill-badge pill-gray">Pending</span>\n' +
'          </div>\n' +
'          <div style="font-size:12px; color:#64748b; margin:2px 0 6px;">Gear Assembly</div>\n' +
'          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700;">\n' +
'            <span>0 / 30 units</span><span>0%</span>\n' +
'          </div>\n' +
'          <div class="progress-track"><div class="progress-fill" style="width:0%;"></div></div>\n' +
'          <div style="font-size:11px; color:#64748b; margin-top:4px;">\n' +
'            ⚙️ Machine: <strong>WC-ROBO-502</strong><br>\n' +
'            ⏱️ Delivery: <span style="color:#15803d; font-weight:700;">On Track</span>\n' +
'          </div>\n' +
'        </div>\n' +
'        <button class="fab-btn" onclick="toast(\'Create new Production Order\')">+</button>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 3: PRODUCTION DETAILS -->\n' +
'      <div class="screen-view" id="view-3">\n' +
'        <div class="card">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:center;">\n' +
'            <strong style="font-size:15px;">Aerospace Fuel Valve</strong>\n' +
'            <span class="pill-badge pill-red">P1</span>\n' +
'          </div>\n' +
'          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-top:8px;">\n' +
'            <span id="detUnits">31 / 50 units</span><span id="detPct">62%</span>\n' +
'          </div>\n' +
'          <div class="progress-track"><div class="progress-fill" id="detFill" style="width:62%; background:#f43f5e;"></div></div>\n' +
'          <div style="font-size:11px; line-height:1.8; margin-top:8px;">\n' +
'            Start Date: <strong>12 Sep 2026</strong><br>\n' +
'            Due Date: <strong>20 Sep 2026</strong> <span class="pill-badge pill-amber">At Risk</span><br>\n' +
'            Machine: <strong id="detMach">WC-CNC-501</strong><br>\n' +
'            Priority: <strong style="color:#ef4444;">High</strong>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="segmented-control">\n' +
'          <button class="seg-btn active">Progress</button>\n' +
'          <button class="seg-btn" onclick="jumpToScreen(\'6\')">BOM</button>\n' +
'          <button class="seg-btn" onclick="toast(\'Viewing audit history\')">Activity</button>\n' +
'        </div>\n' +
'\n' +
'        <div class="card">\n' +
'          <div class="stepper-item">\n' +
'            <div class="stepper-left"><span style="color:#10b981;">●</span> Material Check</div>\n' +
'            <span class="pill-badge pill-green">Completed ✓</span>\n' +
'          </div>\n' +
'          <div class="stepper-item">\n' +
'            <div class="stepper-left"><span style="color:#10b981;">●</span> Production Started</div>\n' +
'            <span class="pill-badge pill-amber">In Progress</span>\n' +
'          </div>\n' +
'          <div class="stepper-item">\n' +
'            <div class="stepper-left"><span style="color:#94a3b8;">○</span> Quality Inspection</div>\n' +
'            <span class="pill-badge pill-gray">Pending</span>\n' +
'          </div>\n' +
'          <div class="stepper-item" style="border-bottom:none;">\n' +
'            <div class="stepper-left"><span style="color:#94a3b8;">○</span> Completion</div>\n' +
'            <span class="pill-badge pill-gray">Pending</span>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div style="display:flex; gap:10px; margin-top:14px;">\n' +
'          <button style="flex:1; background:#f59e0b; color:#fff; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="toast(\'⏸️ Order paused\')">Pause</button>\n' +
'          <button style="flex:1; background:#10b981; color:#fff; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="logDetailUnits()">Complete</button>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 4: WHAT-IF SIMULATION -->\n' +
'      <div class="screen-view" id="view-4">\n' +
'        <div class="card">\n' +
'          <label style="font-size:11px; font-weight:700; color:#64748b;">Scenario</label>\n' +
'          <select style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px; margin:4px 0 10px; font-weight:600;">\n' +
'            <option>🚨 Machine Failure</option>\n' +
'            <option>Material Shortage</option>\n' +
'            <option>Supplier Delay</option>\n' +
'          </select>\n' +
'\n' +
'          <label style="font-size:11px; font-weight:700; color:#64748b;">Machine</label>\n' +
'          <select style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px; margin:4px 0 10px; font-weight:600;">\n' +
'            <option>WC-CNC-501</option>\n' +
'            <option>WC-ROBO-502</option>\n' +
'          </select>\n' +
'\n' +
'          <label style="font-size:11px; font-weight:700; color:#64748b;">Duration</label>\n' +
'          <select style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:8px; margin:4px 0 14px; font-weight:600;">\n' +
'            <option>4 hours</option>\n' +
'            <option>8 hours</option>\n' +
'          </select>\n' +
'\n' +
'          <button style="width:100%; background:#2563eb; color:#fff; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="runSimulationUI()">▶ Run Simulation</button>\n' +
'        </div>\n' +
'\n' +
'        <div id="simResultsCard" style="display:none;">\n' +
'          <div class="sec-head"><div class="sec-title">Simulation Results</div></div>\n' +
'          <div class="card">\n' +
'            <div style="font-size:12px; margin-bottom:8px;">\n' +
'              <span style="color:#ef4444;">● Current Plan</span><br>\n' +
'              PO-101 &rarr; 14:00 (Halted at CNC-501)\n' +
'            </div>\n' +
'            <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:10px; margin-bottom:8px;">\n' +
'              <div style="display:flex; justify-content:space-between; align-items:center;">\n' +
'                <strong style="color:#047857; font-size:12px;">Alternative A (Recommended)</strong>\n' +
'                <span class="pill-badge pill-green">Best</span>\n' +
'              </div>\n' +
'              <div style="font-size:11px; color:#065f46; margin-top:2px;">Move to WC-ADD-503 &nbsp;|&nbsp; 🕒 15:00</div>\n' +
'            </div>\n' +
'            <div style="font-size:12px; color:#64748b; margin-bottom:12px;">\n' +
'              <span>● Alternative B</span><br>\n' +
'              Wait for CNC repair &rarr; 🕒 18:00\n' +
'            </div>\n' +
'            <button style="width:100%; background:#10b981; color:#fff; border:none; padding:8px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="applyAlternativeA()">Approve Alternative A</button>\n' +
'          </div>\n' +
'\n' +
'          <div class="sec-head"><div class="sec-title">Expected Impact</div></div>\n' +
'          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px;">\n' +
'            <div class="card" style="text-align:center; padding:10px;"><div style="font-size:10px; color:#64748b;">OTD</div><strong style="color:#10b981; font-size:14px;">+12%</strong></div>\n' +
'            <div class="card" style="text-align:center; padding:10px;"><div style="font-size:10px; color:#64748b;">Delay</div><strong style="color:#2563eb; font-size:14px;">-4h</strong></div>\n' +
'            <div class="card" style="text-align:center; padding:10px;"><div style="font-size:10px; color:#64748b;">Utilization</div><strong style="color:#8b5cf6; font-size:14px;">+8%</strong></div>\n' +
'          </div>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 5: INVENTORY -->\n' +
'      <div class="screen-view" id="view-5">\n' +
'        <div class="sec-head">\n' +
'          <div class="sec-title">Stock Overview</div>\n' +
'          <div class="sec-link" onclick="toast(\'Viewing all 283 parts\')">View All</div>\n' +
'        </div>\n' +
'        <div class="pastel-grid">\n' +
'          <div class="pastel-tile" style="background:#e0f2fe; color:#0369a1;"><div class="num">283</div><div class="lbl">Total</div></div>\n' +
'          <div class="pastel-tile" style="background:#dcfce7; color:#15803d;"><div class="num">210</div><div class="lbl">Available</div></div>\n' +
'          <div class="pastel-tile" style="background:#ffedd5; color:#c2410c;"><div class="num">43</div><div class="lbl">Reserved</div></div>\n' +
'          <div class="pastel-tile" style="background:#fee2e2; color:#b91c1c;"><div class="num">8</div><div class="lbl">Quarantine</div></div>\n' +
'          <div class="pastel-tile" style="background:#ede9fe; color:#6d28d9;"><div class="num">22</div><div class="lbl">Incoming</div></div>\n' +
'          <div class="pastel-tile" style="background:#fef9c3; color:#a16207;"><div class="num">5</div><div class="lbl">Low Stock</div></div>\n' +
'        </div>\n' +
'\n' +
'        <div class="sec-head"><div class="sec-title">Low Stock Items</div></div>\n' +
'        <div class="card">\n' +
'          <div class="issue-item">\n' +
'            <div class="issue-left">\n' +
'              <div class="dot-icon dot-red"></div>\n' +
'              <div><div class="issue-name">MAT-BRG-201</div><div class="issue-desc">Ceramic Bearing</div></div>\n' +
'            </div>\n' +
'            <div style="text-align:right;"><strong style="font-size:14px;">12</strong><br><span style="font-size:10px; color:#ef4444;">Below SS</span></div>\n' +
'          </div>\n' +
'          <div class="issue-item">\n' +
'            <div class="issue-left">\n' +
'              <div class="dot-icon dot-amber"></div>\n' +
'              <div><div class="issue-name">MAT-202</div><div class="issue-desc">Hydraulic Seal</div></div>\n' +
'            </div>\n' +
'            <div style="text-align:right;"><strong style="font-size:14px;">8</strong><br><span style="font-size:10px; color:#ef4444;">Below SS</span></div>\n' +
'          </div>\n' +
'          <div class="issue-item">\n' +
'            <div class="issue-left">\n' +
'              <div class="dot-icon dot-yellow"></div>\n' +
'              <div><div class="issue-name">MAT-205</div><div class="issue-desc">Fasteners</div></div>\n' +
'            </div>\n' +
'            <div style="text-align:right;"><strong style="font-size:14px;">25</strong><br><span style="font-size:10px; color:#ca8a04;">Low</span></div>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="sec-head"><div class="sec-title">Quick Actions</div></div>\n' +
'        <button style="width:100%; background:#fff; border:1px solid #2563eb; color:#2563eb; padding:10px; border-radius:8px; font-weight:700; margin-bottom:8px; cursor:pointer;" onclick="jumpToScreen(\'6\')">Check BOM</button>\n' +
'        <button style="width:100%; background:#fff; border:1px solid #10b981; color:#059669; padding:10px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="toast(\'Material procurement request generated\')">Request Material</button>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 6: BOM & MATERIAL -->\n' +
'      <div class="screen-view" id="view-6">\n' +
'        <div class="card">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:center;">\n' +
'            <strong style="font-size:14px;">PO-2026-101</strong>\n' +
'            <span class="sec-link" onclick="jumpToScreen(\'3\')">View Order</span>\n' +
'          </div>\n' +
'          <div style="font-size:12px; color:#64748b; margin-top:2px;">Aerospace Fuel Valve</div>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="padding:10px 14px;">\n' +
'          <table style="width:100%; border-collapse:collapse; font-size:12px;">\n' +
'            <thead>\n' +
'              <tr style="color:#64748b; text-align:left; border-bottom:1px solid #e2e8f0;">\n' +
'                <th style="padding:6px 0;">Component</th>\n' +
'                <th>Required</th>\n' +
'                <th>Available</th>\n' +
'                <th style="text-align:right;">Status</th>\n' +
'              </tr>\n' +
'            </thead>\n' +
'            <tbody>\n' +
'              <tr style="border-bottom:1px solid #f1f5f9;">\n' +
'                <td style="padding:8px 0; font-weight:600;">Titanium Body</td><td>10</td><td>10</td>\n' +
'                <td style="text-align:right; color:#10b981;">🟢</td>\n' +
'              </tr>\n' +
'              <tr style="border-bottom:1px solid #f1f5f9;">\n' +
'                <td style="padding:8px 0; font-weight:600;">Seal Assembly</td><td>10</td><td>10</td>\n' +
'                <td style="text-align:right; color:#10b981;">🟢</td>\n' +
'              </tr>\n' +
'              <tr style="border-bottom:1px solid #f1f5f9; background:#fff1f2;">\n' +
'                <td style="padding:8px 4px; font-weight:600; color:#b91c1c;">Ceramic Bearing</td><td style="color:#b91c1c;">10</td><td style="color:#b91c1c; font-weight:700;">7</td>\n' +
'                <td style="text-align:right; color:#ef4444;">🔴</td>\n' +
'              </tr>\n' +
'              <tr>\n' +
'                <td style="padding:8px 0; font-weight:600;">Fasteners</td><td>10</td><td>10</td>\n' +
'                <td style="text-align:right; color:#10b981;">🟢</td>\n' +
'              </tr>\n' +
'            </tbody>\n' +
'          </table>\n' +
'        </div>\n' +
'\n' +
'        <div class="sec-head"><div class="sec-title">Material Requests</div></div>\n' +
'        <div class="card" style="border-left:4px solid #ef4444;">\n' +
'          <div style="font-weight:700; font-size:13px;">MAT-BRG-201</div>\n' +
'          <div style="font-size:11px; color:#64748b;">Ceramic Bearing</div>\n' +
'          <div style="display:flex; justify-content:space-between; font-size:11px; margin:8px 0;">\n' +
'            <span>Required: <strong>10</strong></span>\n' +
'            <span>Available: <strong>7</strong></span>\n' +
'            <span class="pill-badge pill-red">Shortage: 3</span>\n' +
'          </div>\n' +
'          <button style="width:100%; background:#2563eb; color:#fff; border:none; padding:8px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer;" onclick="toast(\'📦 Transfer of 3 bearings requested from Bay 2\')">+ Request Material</button>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 7: ALERTS -->\n' +
'      <div class="screen-view" id="view-7">\n' +
'        <div class="segmented-control">\n' +
'          <button class="seg-btn active">All</button>\n' +
'          <button class="seg-btn">Critical</button>\n' +
'          <button class="seg-btn">Warning</button>\n' +
'          <button class="seg-btn">Info</button>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="border-left:4px solid #ef4444; cursor:pointer;" onclick="jumpToScreen(\'4\')">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:flex-start;">\n' +
'            <div>\n' +
'              <span class="pill-badge pill-red">CRITICAL</span>\n' +
'              <div style="font-weight:800; font-size:13px; margin:4px 0 2px;">CNC-501 Breakdown</div>\n' +
'              <div style="font-size:11px; color:#64748b;">Vibration exceeded threshold; 2 orders affected</div>\n' +
'              <div style="font-size:10px; color:#94a3b8; margin-top:2px;">2h ago</div>\n' +
'            </div>\n' +
'            <span style="color:#94a3b8; font-size:18px;">&rsaquo;</span>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="border-left:4px solid #f59e0b; cursor:pointer;" onclick="jumpToScreen(\'3\')">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:flex-start;">\n' +
'            <div>\n' +
'              <span class="pill-badge pill-amber">HIGH</span>\n' +
'              <div style="font-weight:800; font-size:13px; margin:4px 0 2px;">PO-2026-101 At Risk</div>\n' +
'              <div style="font-size:11px; color:#64748b;">Delivery delayed expected</div>\n' +
'              <div style="font-size:10px; color:#94a3b8; margin-top:2px;">3h ago</div>\n' +
'            </div>\n' +
'            <span style="color:#94a3b8; font-size:18px;">&rsaquo;</span>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="border-left:4px solid #eab308; cursor:pointer;" onclick="jumpToScreen(\'5\')">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:flex-start;">\n' +
'            <div>\n' +
'              <span class="pill-badge pill-yellow">MEDIUM</span>\n' +
'              <div style="font-weight:800; font-size:13px; margin:4px 0 2px;">MAT-BRG-201 Stock Low</div>\n' +
'              <div style="font-size:11px; color:#64748b;">Below safety stock level</div>\n' +
'              <div style="font-size:10px; color:#94a3b8; margin-top:2px;">5h ago</div>\n' +
'            </div>\n' +
'            <span style="color:#94a3b8; font-size:18px;">&rsaquo;</span>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="border-left:4px solid #3b82f6;">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:flex-start;">\n' +
'            <div>\n' +
'              <span class="pill-badge pill-blue">INFO</span>\n' +
'              <div style="font-weight:800; font-size:13px; margin:4px 0 2px;">Production Completed</div>\n' +
'              <div style="font-size:11px; color:#64748b;">PO-2026-099 • 25 units</div>\n' +
'              <div style="font-size:10px; color:#94a3b8; margin-top:2px;">8h ago</div>\n' +
'            </div>\n' +
'            <span style="color:#94a3b8; font-size:18px;">&rsaquo;</span>\n' +
'          </div>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 8: MORE (MENU) -->\n' +
'      <div class="screen-view" id="view-8">\n' +
'        <div class="module-grid">\n' +
'          <div class="module-tile" onclick="jumpToScreen(\'9\')">\n' +
'            <div class="module-icon" style="background:#ecfdf5; color:#059669;">👥</div>\n' +
'            <div class="module-name">Workforce</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="jumpToScreen(\'4\')">\n' +
'            <div class="module-icon" style="background:#e0f2fe; color:#0284c7;">🏭</div>\n' +
'            <div class="module-name">Work Centers</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="jumpToScreen(\'9\')">\n' +
'            <div class="module-icon" style="background:#fff7ed; color:#ea580c;">🔧</div>\n' +
'            <div class="module-name">Maintenance</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="toast(\'Supplier SKF Aerospace: OTD 94%, Quality 97%\')">\n' +
'            <div class="module-icon" style="background:#f3e8ff; color:#7e22ce;">🚚</div>\n' +
'            <div class="module-name">Suppliers</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="toast(\'Quality: Inspections Today 18, Passed 16, Failed 2\')">\n' +
'            <div class="module-icon" style="background:#fce7f3; color:#be185d;">🛡️</div>\n' +
'            <div class="module-name">Quality</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="toast(\'Analytics: Factory OEE 88.4%, Throughput +14%\')">\n' +
'            <div class="module-icon" style="background:#eff6ff; color:#1d4ed8;">📊</div>\n' +
'            <div class="module-name">Analytics</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="jumpToScreen(\'10\')">\n' +
'            <div class="module-icon" style="background:#f5f3ff; color:#6d28d9;">✨</div>\n' +
'            <div class="module-name">AI Recommendations</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="jumpToScreen(\'4\')">\n' +
'            <div class="module-icon" style="background:#ecfeff; color:#0e7490;">🌐</div>\n' +
'            <div class="module-name">Digital Twin</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="jumpToScreen(\'10\')">\n' +
'            <div class="module-icon" style="background:#fefce8; color:#a16207;">📋</div>\n' +
'            <div class="module-name">Approvals</div>\n' +
'          </div>\n' +
'          <div class="module-tile" onclick="jumpToScreen(\'2\')">\n' +
'            <div class="module-icon" style="background:#f0fdf4; color:#15803d;">📄</div>\n' +
'            <div class="module-name">Work Orders</div>\n' +
'          </div>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 9: WORKFORCE / MAINTENANCE -->\n' +
'      <div class="screen-view" id="view-9">\n' +
'        <div class="sec-head">\n' +
'          <div class="sec-title">Today\'s Workforce</div>\n' +
'          <div class="sec-link" onclick="toast(\'Viewing all 42 technicians\')">View All</div>\n' +
'        </div>\n' +
'        <div class="pastel-grid">\n' +
'          <div class="pastel-tile" style="background:#dcfce7; color:#15803d;"><div class="num">42</div><div class="lbl">Available</div></div>\n' +
'          <div class="pastel-tile" style="background:#dbeafe; color:#1d4ed8;"><div class="num">36</div><div class="lbl">Assigned</div></div>\n' +
'          <div class="pastel-tile" style="background:#ffedd5; color:#c2410c;"><div class="num">6</div><div class="lbl">Absent</div></div>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="background:#fef2f2; border:1px solid #fecaca; margin-bottom:14px;">\n' +
'          <div style="display:flex; justify-content:space-between; align-items:center;">\n' +
'            <strong style="color:#b91c1c; font-size:12px;">Overloaded</strong>\n' +
'            <span class="pill-badge pill-red">3</span>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="sec-head"><div class="sec-title">Skills Coverage</div></div>\n' +
'        <div class="card">\n' +
'          <div style="font-size:11px; font-weight:700; margin-bottom:4px; display:flex; justify-content:space-between;"><span>CNC Machining</span><span>8/10</span></div>\n' +
'          <div class="progress-track"><div class="progress-fill" style="width:80%; background:#2563eb;"></div></div>\n' +
'\n' +
'          <div style="font-size:11px; font-weight:700; margin:10px 0 4px; display:flex; justify-content:space-between;"><span>Welding</span><span>6/10</span></div>\n' +
'          <div class="progress-track"><div class="progress-fill" style="width:60%; background:#0284c7;"></div></div>\n' +
'\n' +
'          <div style="font-size:11px; font-weight:700; margin:10px 0 4px; display:flex; justify-content:space-between;"><span>Assembly</span><span>10/10</span></div>\n' +
'          <div class="progress-track"><div class="progress-fill" style="width:100%; background:#10b981;"></div></div>\n' +
'\n' +
'          <div style="font-size:11px; font-weight:700; margin:10px 0 4px; display:flex; justify-content:space-between;"><span>Maintenance</span><span>5/10</span></div>\n' +
'          <div class="progress-track"><div class="progress-fill" style="width:50%; background:#f59e0b;"></div></div>\n' +
'        </div>\n' +
'\n' +
'        <div class="sec-head"><div class="sec-title">Maintenance</div></div>\n' +
'        <div class="pastel-grid">\n' +
'          <div class="pastel-tile" style="background:#fee2e2; color:#b91c1c;"><div class="num">2</div><div class="lbl">Active</div></div>\n' +
'          <div class="pastel-tile" style="background:#dbeafe; color:#1d4ed8;"><div class="num">1</div><div class="lbl">In Progress</div></div>\n' +
'          <div class="pastel-tile" style="background:#dcfce7; color:#15803d;"><div class="num">4</div><div class="lbl">Complete</div></div>\n' +
'        </div>\n' +
'      </div>\n' +
'\n' +
'      <!-- SCREEN 10: AI RECOMMENDATIONS -->\n' +
'      <div class="screen-view" id="view-10">\n' +
'        <div class="card" style="border-left:4px solid #ef4444;" id="aiRecCard1">\n' +
'          <span class="pill-badge pill-red">HIGH PRIORITY</span>\n' +
'          <div style="font-weight:800; font-size:13px; margin:6px 0 2px;">Move PO-101 to WC-ADD-503</div>\n' +
'          <div style="font-size:11px; color:#64748b;">Reason: CNC-501 breakdown</div>\n' +
'          <div style="font-size:11px; margin:8px 0; color:#1e40af; font-weight:700;">\n' +
'            Expected impact: ↓ 4h delay &nbsp;|&nbsp; ↑ 12% OTD\n' +
'          </div>\n' +
'          <div style="display:flex; gap:8px;">\n' +
'            <button style="flex:1; background:#fff; border:1px solid #2563eb; color:#2563eb; padding:8px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="jumpToScreen(\'4\')">Simulate</button>\n' +
'            <button style="flex:1; background:#10b981; border:none; color:#fff; padding:8px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="approvePlanFromAI()">Approve</button>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="border-left:4px solid #f59e0b;">\n' +
'          <span class="pill-badge pill-amber">MEDIUM PRIORITY</span>\n' +
'          <div style="font-weight:800; font-size:13px; margin:6px 0 2px;">Order MAT-BRG-201</div>\n' +
'          <div style="font-size:11px; color:#64748b; margin-bottom:8px;">Reason: Stock below safety level</div>\n' +
'          <button style="width:100%; background:#2563eb; color:#fff; border:none; padding:8px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="toast(\'Procurement request generated for 50 Bearings\')">Create Procurement Request</button>\n' +
'        </div>\n' +
'\n' +
'        <div class="card" style="border-left:4px solid #eab308;">\n' +
'          <span class="pill-badge pill-yellow">LOW PRIORITY</span>\n' +
'          <div style="font-weight:800; font-size:13px; margin:6px 0 2px;">Optimize workforce allocation</div>\n' +
'          <div style="font-size:11px; color:#64748b; margin-bottom:8px;">Reason: Overtime allocation in Shift B</div>\n' +
'          <button style="width:100%; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:8px; border-radius:8px; font-weight:700; cursor:pointer;" onclick="jumpToScreen(\'9\')">View Details</button>\n' +
'        </div>\n' +
'      </div>\n' +
'    </div>\n' +
'\n' +
'    <nav class="bottom-nav">\n' +
'      <button class="nav-item active" id="tabNav1" onclick="jumpToScreen(\'1\')">\n' +
'        <span class="nav-icon">🏠</span>\n' +
'        <span>Dashboard</span>\n' +
'      </button>\n' +
'      <button class="nav-item" id="tabNav2" onclick="jumpToScreen(\'2\')">\n' +
'        <span class="nav-icon">🏭</span>\n' +
'        <span>Production</span>\n' +
'      </button>\n' +
'      <button class="nav-item" id="tabNav5" onclick="jumpToScreen(\'5\')">\n' +
'        <span class="nav-icon">📦</span>\n' +
'        <span>Inventory</span>\n' +
'      </button>\n' +
'      <button class="nav-item" id="tabNav7" onclick="jumpToScreen(\'7\')">\n' +
'        <span class="nav-icon">🚨</span>\n' +
'        <span class="nav-badge">3</span>\n' +
'        <span>Alerts</span>\n' +
'      </button>\n' +
'      <button class="nav-item" id="tabNav8" onclick="jumpToScreen(\'8\')">\n' +
'        <span class="nav-icon">⋮</span>\n' +
'        <span>More</span>\n' +
'      </button>\n' +
'    </nav>\n' +
'  </div>\n' +
'\n' +
'  <div class="toast-popup" id="toastPop">Action logged</div>\n' +
'\n' +
'  <script>\n' +
'    var screenHistory = [];\n' +
'    var currentScreen = "1";\n' +
'\n' +
'    function toast(txt) {\n' +
'      var t = document.getElementById("toastPop");\n' +
'      t.innerText = txt;\n' +
'      t.classList.add("show");\n' +
'      setTimeout(function() { t.classList.remove("show"); }, 3000);\n' +
'    }\n' +
'\n' +
'    function jumpToScreen(id) {\n' +
'      if (id !== currentScreen) screenHistory.push(currentScreen);\n' +
'      currentScreen = id;\n' +
'      \n' +
'      document.querySelectorAll(".screen-view").forEach(function(v) { v.classList.remove("active"); });\n' +
'      var target = document.getElementById("view-" + id);\n' +
'      if (target) target.classList.add("active");\n' +
'\n' +
'      document.getElementById("screenSelector").value = id;\n' +
'\n' +
'      var titles = {\n' +
'        "1": "ServiceNow <span style=\'color:#10b981; font-size:10px;\'>● Smart Mfg</span>",\n' +
'        "2": "Production",\n' +
'        "3": "PO-2026-101",\n' +
'        "4": "What-If Simulation",\n' +
'        "5": "Inventory",\n' +
'        "6": "BOM & Material",\n' +
'        "7": "Alerts",\n' +
'        "8": "More",\n' +
'        "9": "Workforce",\n' +
'        "10": "AI Recommendations"\n' +
'      };\n' +
'      document.getElementById("headerTitle").innerHTML = titles[id] || "ServiceNow";\n' +
'      document.getElementById("headerBackBtn").style.display = (id === "1" || id === "2" || id === "5" || id === "7" || id === "8") ? "none" : "inline";\n' +
'\n' +
'      document.querySelectorAll(".nav-item").forEach(function(n) { n.classList.remove("active"); });\n' +
'      if (id === "1") document.getElementById("tabNav1").classList.add("active");\n' +
'      else if (id === "2" || id === "3" || id === "4") document.getElementById("tabNav2").classList.add("active");\n' +
'      else if (id === "5" || id === "6") document.getElementById("tabNav5").classList.add("active");\n' +
'      else if (id === "7") document.getElementById("tabNav7").classList.add("active");\n' +
'      else if (id === "8" || id === "9" || id === "10") document.getElementById("tabNav8").classList.add("active");\n' +
'\n' +
'      window.scrollTo(0, 0);\n' +
'    }\n' +
'\n' +
'    function goBack() {\n' +
'      var prev = screenHistory.pop() || "1";\n' +
'      jumpToScreen(prev);\n' +
'    }\n' +
'\n' +
'    function runSimulationUI() {\n' +
'      document.getElementById("simResultsCard").style.display = "block";\n' +
'      toast("🔮 Simulation computed: Alternative A recommended!");\n' +
'    }\n' +
'\n' +
'    function applyAlternativeA() {\n' +
'      document.getElementById("cardMachPO101").innerText = "WC-ADD-503";\n' +
'      document.getElementById("detMach").innerText = "WC-ADD-503";\n' +
'      document.getElementById("cardRiskPO101").innerText = "On Track";\n' +
'      document.getElementById("cardRiskPO101").style.color = "#15803d";\n' +
'      document.getElementById("kpiOtd").innerText = "96%";\n' +
'      toast("✅ Alternative A applied! PO-101 routed to WC-ADD-503");\n' +
'      jumpToScreen("2");\n' +
'    }\n' +
'\n' +
'    function approvePlanFromAI() {\n' +
'      applyAlternativeA();\n' +
'      toast("✅ AI Plan Approved! Expected OTD restored to 96%");\n' +
'    }\n' +
'\n' +
'    function logDetailUnits() {\n' +
'      document.getElementById("detUnits").innerText = "36 / 50 units";\n' +
'      document.getElementById("detPct").innerText = "72%";\n' +
'      document.getElementById("detFill").style.width = "72%";\n' +
'      document.getElementById("cardUnitsPO101").innerText = "36 / 50 units";\n' +
'      document.getElementById("cardPctPO101").innerText = "72%";\n' +
'      document.getElementById("cardFillPO101").style.width = "72%";\n' +
'      document.getElementById("dashProdToday").innerText = "Produced: 42";\n' +
'      document.getElementById("dashRemToday").innerText = "Remaining: 43";\n' +
'      document.getElementById("dashBar").style.width = "49%";\n' +
'      toast("⚡ Completed 5 units for PO-2026-101");\n' +
'    }\n' +
'\n' +
'    var flowIndex = 0;\n' +
'    function stepDemoStory() {\n' +
'      flowIndex++;\n' +
'      if (flowIndex === 1) {\n' +
'        jumpToScreen("7");\n' +
'        toast("Step 1: Breakdown Alarm on CNC-501!");\n' +
'      } else if (flowIndex === 2) {\n' +
'        jumpToScreen("4");\n' +
'        runSimulationUI();\n' +
'        toast("Step 2: What-If simulation computed!");\n' +
'      } else if (flowIndex === 3) {\n' +
'        jumpToScreen("10");\n' +
'        toast("Step 3: AI recommends moving PO-101 to ADD-503!");\n' +
'      } else if (flowIndex === 4) {\n' +
'        applyAlternativeA();\n' +
'        toast("Step 4: Manager approves schedule change!");\n' +
'      } else if (flowIndex === 5) {\n' +
'        jumpToScreen("3");\n' +
'        logDetailUnits();\n' +
'        toast("Step 5: Operator executes & logs 36/50 units!");\n' +
'      } else {\n' +
'        jumpToScreen("1");\n' +
'        toast("Step 6: Dashboard live updated! Adaptive Loop complete 🎉");\n' +
'        flowIndex = 0;\n' +
'      }\n' +
'    }\n' +
'  </script>\n' +
'</body>\n' +
'</html>';

    // -------------------------------------------------------------------------
    // 4. DEPLOY TO SERVICENOW UI PAGES
    // -------------------------------------------------------------------------
    gs.print('\n📄 [4/5] Deploying to UI Pages (dashboard, mobile_execution, stakeholder_cockpit)...');
    var pages = ['mobile_execution', 'stakeholder_cockpit', 'dashboard'];
    for (var p = 0; p < pages.length; p++) {
        var pName = pages[p];
        var pGr = new GlideRecord('sys_ui_page');
        pGr.addQuery('name', pName);
        pGr.query();
        if (!pGr.next()) {
            pGr.initialize();
            pGr.name = pName;
            pGr.endpoint = 'x_2056099_indust_0_' + pName + '.do';
            pGr.category = 'general';
            pGr.direct = true;
            pGr.html = templateHtml;
            pGr.sys_scope = scopeId;
            pGr.insert();
            gs.print('   ✅ Created UI Page: x_2056099_indust_0_' + pName + '.do');
        } else {
            pGr.html = templateHtml;
            pGr.direct = true;
            pGr.update();
            gs.print('   ℹ️ Updated UI Page: x_2056099_indust_0_' + pName + '.do');
        }
    }

    // -------------------------------------------------------------------------
    // 5. NATIVE MOBILE DATA STREAMS FIX (ELIMINATE "NO DATA AVAILABLE")
    // -------------------------------------------------------------------------
    gs.print('\n📱 [5/6] Linking Master Items to All 4 Item Streams & Unlocking Launchers...');

    var streamLinks = [
        {
            stream: '49546b8193738310e61e3b277bba10d1', // Dashboard Stream
            name: 'Dashboard Stream',
            master: '7473b881933f8310e61e3b277bba1061', // Inventory Stock Card View (283 records)
            table: 'x_2056099_indust_0_inv_stock',
            order: 10
        },
        {
            stream: '5d54ab8193738310e61e3b277bba101e', // Production Stream
            name: 'Production Stream',
            master: '0e22f8cd93fb8310e61e3b277bba1025', // Production Order Card View (43 records)
            table: 'x_2056099_indust_0_production_order',
            order: 10
        },
        {
            stream: '5154ab8193738310e61e3b277bba1040', // Inventory Stream
            name: 'Inventory Stream',
            master: '7473b881933f8310e61e3b277bba1061', // Inventory Stock Card View (283 records)
            table: 'x_2056099_indust_0_inv_stock',
            order: 10
        },
        {
            stream: '1d54ab8193738310e61e3b277bba106d', // Alerts Stream
            name: 'Alerts Stream',
            master: '6fb43845933f8310e61e3b277bba10f0', // Active Alerts Card View (168 records)
            table: 'x_2056099_indust_0_alert',
            order: 10
        }
    ];

    for (var s = 0; s < streamLinks.length; s++) {
        var sl = streamLinks[s];
        var streamGr = new GlideRecord('sys_sg_item_stream');
        if (streamGr.get(sl.stream)) {
            streamGr.table = sl.table;
            streamGr.sys_scope = scopeId;
            streamGr.update();
        }

        var m2mGr = new GlideRecord('sys_sg_item_stream_m2m_master_item');
        m2mGr.addQuery('item_stream', sl.stream);
        m2mGr.addQuery('master_item', sl.master);
        m2mGr.query();
        if (!m2mGr.next()) {
            m2mGr.initialize();
            m2mGr.item_stream = sl.stream;
            m2mGr.master_item = sl.master;
            m2mGr.order = sl.order;
            m2mGr.sys_scope = scopeId;
            m2mGr.insert();
            gs.print('   ✅ Linked [' + sl.name + '] to Master Item: ' + sl.master);
        }
    }

    // Unlock Applet Launchers & Sections (remove empty role blocks)
    var lGr = new GlideRecord('sys_sg_applet_launcher');
    lGr.addQuery('sys_scope', scopeId);
    lGr.query();
    while (lGr.next()) {
        lGr.access_control_type = '';
        lGr.required_roles = '';
        lGr.hide_empty_sections = false;
        lGr.active = true;
        lGr.update();
    }

    var secGr = new GlideRecord('sys_sg_section');
    secGr.addQuery('sys_scope', scopeId);
    secGr.query();
    while (secGr.next()) {
        secGr.access_control_type = '';
        secGr.required_roles = '';
        secGr.hide_section_if_empty = false;
        secGr.active = true;
        secGr.update();
    }

    // Embed 10-Screen Suite as Mobile Button
    var btnName = 'Smart Manufacturing Executive Suite';
    var btnGr = new GlideRecord('sys_sg_button');
    btnGr.addQuery('name', btnName);
    btnGr.query();
    var btnId = '';
    if (!btnGr.next()) {
        btnGr.initialize();
        btnGr.name = btnName;
        btnGr.type = 'url';
        btnGr.link_url = 'x_2056099_indust_0_dashboard.do';
        btnGr.relative_url = true;
        btnGr.external_browser = false;
        btnGr.context = 'global';
        btnGr.active = true;
        btnGr.sys_scope = scopeId;
        btnId = btnGr.insert();
    } else {
        btnGr.type = 'url';
        btnGr.link_url = 'x_2056099_indust_0_dashboard.do';
        btnGr.relative_url = true;
        btnGr.external_browser = false;
        btnGr.active = true;
        btnGr.update();
        btnId = btnGr.getUniqueValue();
    }

    // Fix More Tab icon
    var moreTab = new GlideRecord('sys_sg_applet_launcher_tab');
    if (moreTab.get('6e1e1b8193338310e61e3b277bba1023')) {
        moreTab.icon = 'd49c89a2b72200108223e126de11a9c4';
        moreTab.update();
    }

    // Configure Native Clients
    var primaryNavBar = '698f1445937b8310e61e3b277bba1009';
    var clients = [
        { name: 'Industrial Production Management',               label: 'Industrial Production Management', type: 'agent',   nav: primaryNavBar },
        { name: 'Industrial Production Management (Now Mobile)', label: 'Industrial Production Management', type: 'request', nav: primaryNavBar },
        { name: 'Now Mobile',                                     label: 'Now Mobile',                      type: 'request', nav: primaryNavBar },
        { name: 'Now Mobile Admin',                               label: 'Now Mobile Admin',                type: 'request', nav: primaryNavBar },
        { name: 'Mobile Agent',                                   label: 'Mobile Agent',                    type: 'agent',   nav: primaryNavBar }
    ];

    for (var c = 0; c < clients.length; c++) {
        var cl = clients[c];
        var cGr = new GlideRecord('sys_sg_native_client');
        cGr.addQuery('name', cl.name);
        cGr.query();
        if (cGr.next()) {
            cGr.label = cl.label;
            cGr.type = cl.type;
            cGr.navigation = cl.nav;
            cGr.active = true;
            cGr.access_control_type = '';
            cGr.update();
        } else {
            cGr.initialize();
            cGr.name = cl.name;
            cGr.label = cl.label;
            cGr.type = cl.type;
            cGr.navigation = cl.nav;
            cGr.active = true;
            cGr.access_control_type = '';
            cGr.sys_scope = scopeId;
            cGr.insert();
        }
    }

    // Map 5 tabs across nav bars
    var finalTabs = [
        { tabId: '89546b8193738310e61e3b277bba10e6', name: 'Dashboard (Live Stream)', order: 10 },
        { tabId: '8e1e978193338310e61e3b277bba1062', name: 'Production',              order: 20 },
        { tabId: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',               order: 30 },
        { tabId: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',                  order: 40 },
        { tabId: '6e1e1b8193338310e61e3b277bba1023', name: 'More',                    order: 50 }
    ];

    var navBars = [
        '698f1445937b8310e61e3b277bba1009',
        '9f67848187403300e0ef0cf888cb0b2e',
        '679d4f0653d033002d96ddeeff7b1279'
    ];

    for (var nb = 0; nb < navBars.length; nb++) {
        var nId = navBars[nb];
        for (var ft = 0; ft < finalTabs.length; ft++) {
            var targetTab = finalTabs[ft];
            var mGr = new GlideRecord('sys_sg_navigation_tab_map');
            mGr.addQuery('navigation', nId);
            mGr.addQuery('navigation_tab', targetTab.tabId);
            mGr.query();
            if (!mGr.next()) {
                mGr.initialize();
                mGr.navigation = nId;
                mGr.navigation_tab = targetTab.tabId;
                mGr.order = targetTab.order;
                mGr.insert();
            } else {
                mGr.order = targetTab.order;
                mGr.update();
            }
        }
    }

    // -------------------------------------------------------------------------
    // 6. CACHE FLUSH
    // -------------------------------------------------------------------------
    gs.print('\n🔄 [6/6] Flushing Mobile & UI Caches...');
    try {
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_applet_tab');
        GlideCacheManager.flush('sys_sg_master_item');
        GlideCacheManager.flush('sys_sg_item_stream');
        GlideCacheManager.flush('sys_sg_item_stream_m2m_master_item');
        GlideCacheManager.flush('sys_sg_list_screen');
        GlideCacheManager.flush('sys_sg_button');
        GlideCacheManager.flush('sys_ui_page');
        GlideCacheManager.flush('sg_native_client_cache');
        GlideCacheManager.flush('sg_applet_launcher_cache');
    } catch(e) {}

    gs.print('================================================================================');
    gs.print('🎉 10-SCREEN TEMPLATE SUITE & NOW MOBILE SYNC COMPLETE!');
    gs.print('🌐 Primary Dashboard: https://dev445579.service-now.com/x_2056099_indust_0_dashboard.do');
    gs.print('🌐 Mobile Execution:  https://dev445579.service-now.com/x_2056099_indust_0_mobile_execution.do');
    gs.print('================================================================================');
})();
