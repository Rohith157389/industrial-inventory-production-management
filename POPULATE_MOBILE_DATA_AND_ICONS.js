/**
 * =========================================================================================
 * POPULATE MOBILE OPERATIONAL DATA & RESOLVE TAB ICONS
 * =========================================================================================
 * This script:
 * 1. Creates the 3 missing tab icons (Toolbox, Clipboard, Bell) so the warning triangles
 *    disappear from Production, Inventory, and Alerts.
 * 2. Populates realistic operational data into:
 *    - x_2056099_indust_0_inv_alert (Active & Critical Alerts)
 *    - x_2056099_indust_0_inv_stock (Available Stock & Low Stock Items)
 *    - x_2056099_indust_0_production_order (Active Production Orders)
 *    - x_2056099_indust_0_prod_sched (Production Schedules)
 *    - x_2056099_indust_0_qc_insp (Quality Inspections)
 * 3. Flushes mobile caches so data immediately appears on Dashboard, Production,
 *    Inventory, and Alerts on your phone.
 *
 * RUN IN: System Definition > Scripts - Background (sys.scripts.do)
 * SCOPE: Global
 * =========================================================================================
 */

(function populateMobileDataAndIcons() {
    gs.print('===================================================================');
    gs.print('🚀 STARTING MOBILE OPERATIONAL DATA & ICON POPULATION');
    gs.print('===================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // PART 1: FIX TAB ICONS (REMOVE WARNING TRIANGLES)
    // -------------------------------------------------------------------------
    gs.print('\n🎨 [1/3] Creating Missing Tab Icons in sys_sg_icon...');

    var icons = [
        {
            sys_id: 'dcf7c650770311109560df454b5a995a',
            name: 'Toolbox',
            type: 'font',
            icon: '{"Shape":"Circle","FontName":"now-mobile-icons","Value":"e915","FontColor":"#54AC98","BackgroundColor":"#54AC98","Name":"Toolbox"}'
        },
        {
            sys_id: '6eeef10673b52010a59b4c5353f6a76c',
            name: 'MS icon-Clipboard-Solid',
            type: 'font',
            icon: '{"Shape":"Circle","FontName":"now-mobile-icons-buttons","Value":"e916","Name":"icon-Clipboard-Solid"}'
        },
        {
            sys_id: 'c2fc8da2b72200108223e126de11a92b',
            name: 'Bell',
            type: 'image',
            icon: '{"Name":"Bell"}'
        }
    ];

    for (var i = 0; i < icons.length; i++) {
        var ic = icons[i];
        var iconGr = new GlideRecord('sys_sg_icon');
        if (!iconGr.get(ic.sys_id)) {
            iconGr.initialize();
            iconGr.setNewGuidValue(ic.sys_id);
            iconGr.name = ic.name;
            iconGr.type = ic.type;
            iconGr.icon = ic.icon;
            iconGr.insert();
            gs.print('   ✅ Created Icon: ' + ic.name + ' (' + ic.sys_id + ')');
        } else {
            iconGr.name = ic.name;
            iconGr.type = ic.type;
            iconGr.icon = ic.icon;
            iconGr.update();
            gs.print('   ℹ️ Icon already exists: ' + ic.name);
        }
    }

    // -------------------------------------------------------------------------
    // PART 2: POPULATE OPERATIONAL DATA
    // -------------------------------------------------------------------------
    gs.print('\n📦 [2/3] Populating Operational Data for Mobile Applets...');

    // 2A. Inventory Alerts (Feeds Dashboard & Alerts tabs)
    var alertData = [
        { msg: 'Line 2 CNC Lathe Spindle Bearing Overheat (88°C)', sev: 'Critical', status: 'Open', type: 'Telemetry Threshold' },
        { msg: 'Material Buffer Stock Breach: Aluminum Alloy 6061-T6 below Safety Level', sev: 'High', status: 'Open', type: 'Low Stock' },
        { msg: 'Scheduled Preventive Maintenance Overdue: 5-Axis Milling Unit M-04', sev: 'Medium', status: 'In Review', type: 'Maintenance' },
        { msg: 'Automated Sourcing Reorder Triggered: Stainless Steel 316L Plates', sev: 'Low', status: 'Open', type: 'Reorder' },
        { msg: 'Vibration Anomaly Detected on Hydraulic Press Station 1', sev: 'Critical', status: 'Open', type: 'Telemetry Threshold' }
    ];

    for (var a = 0; a < alertData.length; a++) {
        var aItem = alertData[a];
        var aGr = new GlideRecord('x_2056099_indust_0_inv_alert');
        aGr.addQuery('alert_message', aItem.msg);
        aGr.query();
        if (!aGr.next()) {
            aGr.initialize();
            aGr.alert_message = aItem.msg;
            aGr.severity = aItem.sev;
            aGr.status = aItem.status;
            aGr.alert_type = aItem.type;
            aGr.alert_date = new GlideDateTime();
            aGr.insert();
            gs.print('   ✅ Created Alert: ' + aItem.msg.substring(0, 45) + '...');
        }
    }

    // 2B. Inventory Stock (Feeds Dashboard & Inventory tabs)
    var stockData = [
        { mat: 'Titanium Aerospace Ingot Grade 5', total: 450, avail: 420, reserved: 30, safety: 100, status: 'In Stock' },
        { mat: 'Stainless Steel 316L Cold Rolled Plates', total: 120, avail: 95, reserved: 25, safety: 150, status: 'Low Stock' },
        { mat: 'Industrial Servo Drive Motor 400W AC', total: 85, avail: 65, reserved: 20, safety: 30, status: 'In Stock' },
        { mat: 'Hydraulic High-Pressure Relief Valve 350 Bar', total: 340, avail: 310, reserved: 30, safety: 50, status: 'In Stock' },
        { mat: 'Precision Ceramic Ball Bearings 6205-2RS', total: 45, avail: 20, reserved: 25, safety: 80, status: 'Low Stock' },
        { mat: 'High-Tensile Carbon Fiber Prepreg Roll', total: 210, avail: 190, reserved: 20, safety: 60, status: 'In Stock' }
    ];

    for (var s = 0; s < stockData.length; a++, s++) {
        var sItem = stockData[s];
        var sGr = new GlideRecord('x_2056099_indust_0_inv_stock');
        sGr.addQuery('material_product', sItem.mat);
        sGr.query();
        if (!sGr.next()) {
            sGr.initialize();
            sGr.material_product = sItem.mat;
            sGr.total_quantity = sItem.total;
            sGr.available_quantity = sItem.avail;
            sGr.reserved_quantity = sItem.reserved;
            sGr.safety_stock = sItem.safety;
            sGr.status = sItem.status;
            sGr.active = true;
            sGr.insert();
            gs.print('   ✅ Created Stock Item: ' + sItem.mat);
        }
    }

    // 2C. Production Orders (Feeds Production tab)
    var prodOrders = [
        { desc: 'PO-2026-001: Precision High-Pressure Valve Assembly Batch', plan: 500, done: 380, rem: 120, pri: 'Urgent', status: 'In Progress' },
        { desc: 'PO-2026-002: Turbine Shaft 5-Axis CNC Milling Execution', plan: 250, done: 190, rem: 60, pri: 'High', status: 'In Progress' },
        { desc: 'PO-2026-003: Titanium Impeller Blisk Multi-Axis Contouring', plan: 100, done: 45, rem: 55, pri: 'Normal', status: 'Released' },
        { desc: 'PO-2026-004: Aerospace Hydraulic Manifold CNC Routing', plan: 300, done: 280, rem: 20, pri: 'Urgent', status: 'In Progress' }
    ];

    for (var p = 0; p < prodOrders.length; p++) {
        var pItem = prodOrders[p];
        var pGr = new GlideRecord('x_2056099_indust_0_production_order');
        pGr.addQuery('description', pItem.desc);
        pGr.query();
        if (!pGr.next()) {
            pGr.initialize();
            pGr.description = pItem.desc;
            pGr.quantity_planned = pItem.plan;
            pGr.quantity_produced = pItem.done;
            pGr.quantity_remaining = pItem.rem;
            pGr.priority = pItem.pri;
            pGr.status = pItem.status;
            pGr.active = true;
            pGr.insert();
            gs.print('   ✅ Created Production Order: ' + pItem.desc.substring(0, 45) + '...');
        }
    }

    // 2D. Production Schedule (Feeds Production tab Schedule section)
    var schedData = [
        { desc: 'M-01 CNC Lathe: Work Center Turning Cycle A', plan: 500, out: 380, pri: 'High', status: 'In Progress' },
        { desc: 'M-04 5-Axis Milling: Work Center Finish Machining', plan: 250, out: 190, pri: 'Urgent', status: 'In Progress' },
        { desc: 'QC Station 1: Ultrasonic Non-Destructive Testing', plan: 100, out: 45, pri: 'Normal', status: 'Scheduled' }
    ];

    for (var sc = 0; sc < schedData.length; sc++) {
        var scItem = schedData[sc];
        var scGr = new GlideRecord('x_2056099_indust_0_prod_sched');
        scGr.addQuery('description', scItem.desc);
        scGr.query();
        if (!scGr.next()) {
            scGr.initialize();
            scGr.description = scItem.desc;
            scGr.planned_quantity = scItem.plan;
            scGr.output_quantity = scItem.out;
            scGr.priority = scItem.pri;
            scGr.status = scItem.status;
            scGr.active = true;
            scGr.insert();
            gs.print('   ✅ Created Production Schedule: ' + scItem.desc);
        }
    }

    // 2E. Quality Inspections (Feeds Dashboard Quality section)
    var qcData = [
        { type: 'Incoming Material Inspection', insp: 100, pass: 98, fail: 2, res: 'Passed', status: 'Completed' },
        { type: 'In-Process Dimensional Verification', insp: 50, pass: 50, fail: 0, res: 'Passed', status: 'Completed' },
        { type: 'Final Surface Finish & Roughness Check', insp: 75, pass: 73, fail: 2, res: 'Conditional Pass', status: 'Completed' }
    ];

    for (var q = 0; q < qcData.length; q++) {
        var qItem = qcData[q];
        var qGr = new GlideRecord('x_2056099_indust_0_qc_insp');
        qGr.addQuery('inspection_type', qItem.type);
        qGr.query();
        if (!qGr.next()) {
            qGr.initialize();
            qGr.inspection_type = qItem.type;
            qGr.quantity_inspected = qItem.insp;
            qGr.quantity_passed = qItem.pass;
            qGr.quantity_failed = qItem.fail;
            qGr.result = qItem.res;
            qGr.status = qItem.status;
            qGr.insert();
            gs.print('   ✅ Created Quality Inspection: ' + qItem.type);
        }
    }

    // -------------------------------------------------------------------------
    // PART 3: FLUSH CACHES
    // -------------------------------------------------------------------------
    gs.print('\n🔄 [3/3] Flushing Mobile System Caches...');
    try {
        GlideCacheManager.flush('sys_sg_icon');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        GlideCacheManager.flush('sys_sg_section');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        gs.print('   ✅ Flushed mobile caches successfully.');
    } catch(e) {}

    gs.print('\n===================================================================');
    gs.print('🎉 MOBILE DATA & ICONS POPULATED!');
    gs.print('   👉 On your mobile phone: Simply SWIPE DOWN to refresh!');
    gs.print('   The cards, graphs, orders, alerts, and proper icons will now display!');
    gs.print('===================================================================');
})();
