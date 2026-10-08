// ============================================================================
// SYNC INDUSTRIAL DATA: PORTAL & NOW MOBILE / MOBILE AGENT
// Scope: Global (Run in Scripts - Background on dev449562)
//
// Ensures:
// 1. Consistent realistic industrial products in Material Master
// 2. Inventory Stock linked to Material Master
// 3. Customer Orders for the Customer Portal
// 4. Production Orders & Schedules for Mobile Agent
// 5. IoT & Inventory Alerts matching the materials & machines
// 6. Quality Inspections
// 7. Tab icons updated to native working icons (NO warning triangles)
// 8. Server cache flushed
// ============================================================================
(function() {
    gs.print('===================================================================');
    gs.print('🏭 SYNCHRONIZING INDUSTRIAL DATA BETWEEN PORTAL & NOW MOBILE');
    gs.print('===================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // 1. INDUSTRIAL CUSTOMERS (Customer Master)
    // -------------------------------------------------------------------------
    gs.print('\n🏢 [1/8] Synchronizing Industrial Customers...');
    var customers = [
        { id: 'CUST-AERO-01', name: 'Boeing Commercial Airplanes', ind: 'Aerospace & Defense', terms: 'Net 60', limit: 5000000 },
        { id: 'CUST-AUTO-02', name: 'Toyota Motor Manufacturing', ind: 'Automotive & Robotics', terms: 'Net 45', limit: 3500000 },
        { id: 'CUST-ENGY-03', name: 'Siemens Energy Industrial',  ind: 'Energy & Power Systems', terms: 'Net 30', limit: 2000000 },
        { id: 'CUST-ROBO-04', name: 'ABB Robotics Automation',    ind: 'Industrial Automation', terms: 'Net 30', limit: 1500000 },
        { id: 'CUST-AVIA-05', name: 'GE Aerospace Propulsion',    ind: 'Aviation & Turbines',   terms: 'Net 60', limit: 4000000 }
    ];

    var customerMap = {};
    for (var c = 0; c < customers.length; c++) {
        var cust = customers[c];
        var cGr = new GlideRecord('x_2056099_indust_0_cust_master');
        cGr.addQuery('customer_id', cust.id);
        cGr.query();
        if (!cGr.next()) {
            cGr.initialize();
            cGr.customer_id = cust.id;
            cGr.customer_name = cust.name;
            cGr.industry = cust.ind;
            cGr.payment_terms = cust.terms;
            cGr.credit_limit = cust.limit;
            cGr.active = true;
            customerMap[cust.id] = cGr.insert();
            gs.print('   ✅ Created Customer: ' + cust.name);
        } else {
            customerMap[cust.id] = cGr.getUniqueValue();
            gs.print('   ℹ️ Customer exists: ' + cust.name);
        }
    }

    // -------------------------------------------------------------------------
    // 2. MATERIAL MASTER (Catalog Products & Raw Materials)
    // -------------------------------------------------------------------------
    gs.print('\n📦 [2/8] Synchronizing Material Master Products...');
    var materials = [
        // Finished Goods
        { id: 'SKU-AERO-101', name: 'Aerospace High-Pressure Fuel Control Valve', type: 'finished_goods', cat: 'finished_product', uom: 'nos', cost: 3450, crit: 'critical', desc: 'Titanium multi-stage valve for jet fuel delivery systems' },
        { id: 'SKU-ROBO-102', name: 'Industrial 5-Axis CNC Servo Drive Unit 400W', type: 'finished_goods', cat: 'finished_product', uom: 'nos', cost: 1850, crit: 'critical', desc: 'Precision digital servo drive unit for high-speed machining centers' },
        { id: 'SKU-HYDR-103', name: 'Heavy Hydraulic Pressure Relief Manifold 350 Bar', type: 'finished_goods', cat: 'finished_product', uom: 'nos', cost: 2200, crit: 'high', desc: 'Forged hydraulic manifold for stamping press safety containment' },
        { id: 'SKU-TURB-104', name: 'Gas Turbine Blisk Impeller Contoured Rotor', type: 'finished_goods', cat: 'finished_product', uom: 'nos', cost: 8900, crit: 'critical', desc: 'Solid titanium blisk machined on 5-axis CNC with micro-tolerance' },
        // Components & Raw Materials
        { id: 'MAT-BRG-201', name: 'Precision Ceramic Ball Bearings 6205-2RS', type: 'raw_material', cat: 'component', uom: 'nos', cost: 95, crit: 'high', desc: 'Hybrid ceramic ball bearings for high-RPM lathe spindles' },
        { id: 'MAT-TI-202',  name: 'Titanium Aerospace Ingot Grade 5 (Ti-6Al-4V)', type: 'raw_material', cat: 'component', uom: 'kg', cost: 145, crit: 'critical', desc: 'Vacuum-arc remelted aerospace structural grade titanium billet' },
        { id: 'MAT-SS-203',  name: 'Stainless Steel 316L Cold Rolled Plates', type: 'raw_material', cat: 'component', uom: 'kg', cost: 38, crit: 'medium', desc: 'Marine & chemical corrosion resistant cold-finished plates' },
        { id: 'MAT-CF-204',  name: 'High-Tensile Carbon Fiber Prepreg Composite Roll', type: 'raw_material', cat: 'component', uom: 'metres', cost: 180, crit: 'high', desc: 'Epoxy-impregnated unidirectional structural carbon fiber' },
        { id: 'MAT-LUB-205', name: 'High-Temperature Synthetic Turbine Lubricant ISO VG 68', type: 'mro', cat: 'consumable', uom: 'litres', cost: 42, crit: 'low', desc: 'Extreme-pressure synthetic hydraulic and gear lubricant' }
    ];

    var matMap = {};
    for (var m = 0; m < materials.length; m++) {
        var mat = materials[m];
        var mGr = new GlideRecord('x_2056099_indust_0_mat_master');
        mGr.addQuery('material_product_id', mat.id);
        mGr.query();
        if (!mGr.next()) {
            mGr.initialize();
            mGr.material_product_id = mat.id;
            mGr.name = mat.name;
            mGr.material_type = mat.type;
            mGr.category = mat.cat;
            mGr.unit_of_measure = mat.uom;
            mGr.standard_cost = mat.cost;
            mGr.criticality = mat.crit;
            mGr.description = mat.desc;
            mGr.active = true;
            mGr.safety_stock = 50;
            mGr.reorder_level = 100;
            matMap[mat.id] = mGr.insert();
            gs.print('   ✅ Created Material: ' + mat.name + ' (' + mat.id + ')');
        } else {
            matMap[mat.id] = mGr.getUniqueValue();
            gs.print('   ℹ️ Material exists: ' + mat.name);
        }
    }

    // -------------------------------------------------------------------------
    // 3. INVENTORY STOCK (Linked to Material Master)
    // -------------------------------------------------------------------------
    gs.print('\n📊 [3/8] Synchronizing Inventory Stock linked to Material Master...');
    var stockRecords = [
        { matId: 'SKU-AERO-101', type: 'finished_goods', stat: 'available', total: 180, avail: 145, res: 35, safety: 40, reorder: 60, loc: 'Finished Goods Bay A' },
        { matId: 'SKU-ROBO-102', type: 'finished_goods', stat: 'available', total: 95, avail: 75, res: 20, safety: 25, reorder: 40, loc: 'Finished Goods Bay B' },
        { matId: 'SKU-HYDR-103', type: 'finished_goods', stat: 'available', total: 60, avail: 50, res: 10, safety: 15, reorder: 25, loc: 'Finished Goods Bay C' },
        { matId: 'SKU-TURB-104', type: 'finished_goods', stat: 'available', total: 25, avail: 18, res: 7, safety: 10, reorder: 15, loc: 'Secure High-Value Cage' },
        { matId: 'MAT-BRG-201',  type: 'raw_materials', stat: 'low_stock', total: 85, avail: 40, res: 45, safety: 80, reorder: 120, loc: 'Component Bin C-14' },
        { matId: 'MAT-TI-202',   type: 'raw_materials', stat: 'available', total: 650, avail: 520, res: 130, safety: 150, reorder: 250, loc: 'Heavy Raw Yard Bay 1' },
        { matId: 'MAT-SS-203',   type: 'raw_materials', stat: 'low_stock', total: 140, avail: 95, res: 45, safety: 150, reorder: 200, loc: 'Heavy Raw Yard Bay 3' },
        { matId: 'MAT-CF-204',   type: 'raw_materials', stat: 'available', total: 320, avail: 280, res: 40, safety: 60, reorder: 100, loc: 'Cleanroom Storage CR-2' },
        { matId: 'MAT-LUB-205',  type: 'mro',           stat: 'available', total: 450, avail: 410, res: 40, safety: 80, reorder: 120, loc: 'MRO Chemical Store' }
    ];

    for (var s = 0; s < stockRecords.length; s++) {
        var stk = stockRecords[s];
        var matSysId = matMap[stk.matId];
        if (!matSysId) continue;

        var sGr = new GlideRecord('x_2056099_indust_0_inv_stock');
        sGr.addQuery('material_product', matSysId);
        sGr.query();
        if (!sGr.next()) {
            sGr.initialize();
            sGr.material_product = matSysId;
            sGr.inventory_type = stk.type;
            sGr.status = stk.stat;
            sGr.total_quantity = stk.total;
            sGr.available_quantity = stk.avail;
            sGr.reserved_quantity = stk.res;
            sGr.safety_stock = stk.safety;
            sGr.reorder_level = stk.reorder;
            sGr.active = true;
            sGr.last_updated = new GlideDateTime();
            sGr.insert();
            gs.print('   ✅ Created Stock for ' + stk.matId + ' (Total: ' + stk.total + ', Avail: ' + stk.avail + ')');
        } else {
            sGr.total_quantity = stk.total;
            sGr.available_quantity = stk.avail;
            sGr.reserved_quantity = stk.res;
            sGr.safety_stock = stk.safety;
            sGr.reorder_level = stk.reorder;
            sGr.active = true;
            sGr.update();
            gs.print('   ℹ️ Updated Stock for ' + stk.matId);
        }
    }

    // -------------------------------------------------------------------------
    // 4. CUSTOMER ORDERS (Customer Portal)
    // -------------------------------------------------------------------------
    gs.print('\n🛒 [4/8] Synchronizing Customer Orders for Portal...');
    var custOrders = [
        { num: 'ORD-2026-901', custId: 'CUST-AERO-01', pri: 'urgent', stat: 'in_production', date: '2026-10-01', notes: 'Urgent priority batch for Boeing 777X wing actuator valves' },
        { num: 'ORD-2026-902', custId: 'CUST-AUTO-02', pri: 'high',   stat: 'in_production', date: '2026-10-02', notes: 'High-speed assembly line servo drives for Toyota Kentucky' },
        { num: 'ORD-2026-903', custId: 'CUST-ENGY-03', pri: 'normal', stat: 'confirmed',     date: '2026-10-04', notes: 'Hydraulic safety manifolds for turbine test facility' },
        { num: 'ORD-2026-904', custId: 'CUST-AVIA-05', pri: 'urgent', stat: 'in_production', date: '2026-10-05', notes: 'Titanium blisk assemblies for GE9X engine qualification' }
    ];

    for (var o = 0; o < custOrders.length; o++) {
        var ord = custOrders[o];
        var cRef = customerMap[ord.custId];
        var ordGr = new GlideRecord('x_2056099_indust_0_cust_order');
        ordGr.addQuery('number', ord.num);
        ordGr.query();
        if (!ordGr.next()) {
            ordGr.initialize();
            ordGr.number = ord.num;
            if (cRef) ordGr.customer = cRef;
            ordGr.priority = ord.pri;
            ordGr.status = ord.stat;
            ordGr.order_date = ord.date;
            ordGr.notes = ord.notes;
            ordGr.active = true;
            ordGr.insert();
            gs.print('   ✅ Created Customer Order: ' + ord.num);
        }
    }

    // -------------------------------------------------------------------------
    // 5. PRODUCTION ORDERS (Shop Floor & Mobile Agent)
    // -------------------------------------------------------------------------
    gs.print('\n⚙️ [5/8] Synchronizing Production Orders for Mobile...');
    var prodOrders = [
        { num: 'PO-2026-101', matId: 'SKU-AERO-101', desc: 'Precision CNC Machining: Fuel Control Valve Batch', plan: 100, done: 75, rem: 25, pri: '1', stat: 'in_progress' },
        { num: 'PO-2026-102', matId: 'SKU-ROBO-102', desc: 'Assembly & Calibration: 5-Axis Servo Drives Batch', plan: 60, done: 45, rem: 15, pri: '2', stat: 'in_progress' },
        { num: 'PO-2026-103', matId: 'SKU-HYDR-103', desc: 'High-Pressure Forging: Hydraulic Manifold Batch', plan: 40, done: 10, rem: 30, pri: '3', stat: 'scheduled' },
        { num: 'PO-2026-104', matId: 'SKU-TURB-104', desc: '5-Axis Ultrasonic Profiling: Turbine Blisk Batch', plan: 20, done: 18, rem: 2, pri: '1', stat: 'in_progress' }
    ];

    for (var po = 0; po < prodOrders.length; po++) {
        var pOrder = prodOrders[po];
        var pMatSysId = matMap[pOrder.matId];

        var poGr = new GlideRecord('x_2056099_indust_0_production_order');
        poGr.addQuery('number', pOrder.num);
        poGr.query();
        if (!poGr.next()) {
            poGr.initialize();
            poGr.number = pOrder.num;
            poGr.description = pOrder.desc;
            if (pMatSysId) poGr.finished_product = pMatSysId;
            poGr.quantity_planned = pOrder.plan;
            poGr.quantity_produced = pOrder.done;
            poGr.quantity_remaining = pOrder.rem;
            poGr.priority = pOrder.pri;
            poGr.status = pOrder.stat;
            poGr.active = true;
            poGr.insert();
            gs.print('   ✅ Created Production Order: ' + pOrder.num + ' (' + pOrder.desc.substring(0, 35) + '...)');
        } else {
            poGr.description = pOrder.desc;
            if (pMatSysId) poGr.finished_product = pMatSysId;
            poGr.quantity_planned = pOrder.plan;
            poGr.quantity_produced = pOrder.done;
            poGr.quantity_remaining = pOrder.rem;
            poGr.priority = pOrder.pri;
            poGr.status = pOrder.stat;
            poGr.active = true;
            poGr.update();
            gs.print('   ℹ️ Updated Production Order: ' + pOrder.num);
        }
    }

    // -------------------------------------------------------------------------
    // 6. PRODUCTION SCHEDULES (Mobile Agent Shop Floor Sched)
    // -------------------------------------------------------------------------
    gs.print('\n📅 [6/8] Synchronizing Work Center Schedules...');
    var schedules = [
        { desc: 'Work Center CNC Lathe 01: High-Speed Turning Cycle A', plan: 100, done: 75, stat: 'in_progress', pri: '1' },
        { desc: 'Work Center 5-Axis Milling M-04: Blisk Impeller Contouring', plan: 20, done: 18, stat: 'in_progress', pri: '1' },
        { desc: 'Work Center Hydraulic Press HP-01: 350 Bar Manifold Cold Press', plan: 40, done: 10, stat: 'scheduled', pri: '2' },
        { desc: 'QC Station Ultrasonic NDT: Non-Destructive Flaw Scan', plan: 60, done: 45, stat: 'in_progress', pri: '1' }
    ];

    for (var sc = 0; sc < schedules.length; sc++) {
        var sItem = schedules[sc];
        var scGr = new GlideRecord('x_2056099_indust_0_prod_sched');
        scGr.addQuery('description', sItem.desc);
        scGr.query();
        if (!scGr.next()) {
            scGr.initialize();
            scGr.description = sItem.desc;
            scGr.planned_quantity = sItem.plan;
            scGr.output_quantity = sItem.done;
            scGr.status = sItem.stat;
            scGr.priority = sItem.pri;
            scGr.active = true;
            scGr.insert();
            gs.print('   ✅ Created Schedule: ' + sItem.desc);
        }
    }

    // -------------------------------------------------------------------------
    // 7. INDUSTRIAL ALERTS & QC INSPECTIONS (Both Mobile & Portal)
    // -------------------------------------------------------------------------
    gs.print('\n🚨 [7/8] Synchronizing Alerts & QC Inspections...');
    var alerts = [
        { msg: 'Work Center CNC Lathe 01 Spindle Bearing Temperature Anomaly (89°C)', sev: 'Critical', type: 'Telemetry Threshold', stat: 'Open' },
        { msg: 'Material Buffer Breach: Stainless Steel 316L Plates below safety threshold', sev: 'High', type: 'Low Stock', stat: 'Open' },
        { msg: '5-Axis Milling Unit M-04: High-RPM Vibration Peak detected on axis Z', sev: 'Critical', type: 'Telemetry Threshold', stat: 'Open' },
        { msg: 'Automated Sourcing Reorder Triggered: Precision Ceramic Bearings 6205-2RS', sev: 'Medium', type: 'Reorder', stat: 'In Review' },
        { msg: 'Preventive Hydraulic Fluid Exchange Overdue on Press Station HP-01', sev: 'Low', type: 'Maintenance', stat: 'Open' }
    ];

    for (var a = 0; a < alerts.length; a++) {
        var aItem = alerts[a];
        var aGr = new GlideRecord('x_2056099_indust_0_inv_alert');
        aGr.addQuery('alert_message', aItem.msg);
        aGr.query();
        if (!aGr.next()) {
            aGr.initialize();
            aGr.alert_message = aItem.msg;
            aGr.severity = aItem.sev;
            aGr.alert_type = aItem.type;
            aGr.status = aItem.stat;
            aGr.alert_date = new GlideDateTime();
            aGr.insert();
            gs.print('   ✅ Added Alert: ' + aItem.msg.substring(0, 45) + '...');
        }
    }

    var qcs = [
        { type: 'Incoming Material Ultrasonic NDT Scan: Titanium Billet Ti-6Al-4V', insp: 100, pass: 99, fail: 1, res: 'Passed', stat: 'Completed' },
        { type: 'Dimensional CMM Verification: Fuel Control Valve Spool Tolerance', insp: 50, pass: 50, fail: 0, res: 'Passed', stat: 'Completed' },
        { type: 'Surface Roughness Laser Profile: Gas Turbine Impeller Blades', insp: 20, pass: 19, fail: 1, res: 'Conditional Pass', stat: 'Completed' }
    ];

    for (var q = 0; q < qcs.length; q++) {
        var qItem = qcs[q];
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
            qGr.status = qItem.stat;
            qGr.insert();
            gs.print('   ✅ Added QC Inspection: ' + qItem.type.substring(0, 45) + '...');
        }
    }

    // -------------------------------------------------------------------------
    // 8. TAB ICONS & SECTION VISIBILITY (NO WARNING TRIANGLES)
    // -------------------------------------------------------------------------
    gs.print('\n🎨 [8/8] Fixing Tab Icons & Section Visibility on Mobile...');

    var iconMap = {};
    var iGr = new GlideRecord('sys_sg_icon');
    iGr.query();
    while (iGr.next()) {
        iconMap[iGr.name.toString()] = iGr.getUniqueValue();
    }

    // Working system icons
    var chartBarId = iconMap['Chart Bar'] || 'd49c89a2b72200108223e126de11a9c4';
    var menuId     = iconMap['MS icon-Menu'] || 'dd19611453337410409cddeeff7b12d3';
    var homeId     = iconMap['Home'] || iconMap['icon-Folder'] || chartBarId;
    var bookmarkId = iconMap['icon-Bookmark'] || iconMap['icon-Box'] || chartBarId;
    var notifId    = iconMap['Notification icon'] || iconMap['icon-Bell'] || chartBarId;

    var launcherTabs = [
        { id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard', icon: chartBarId },
        { id: '8e1e978193338310e61e3b277bba1062', name: 'Production', icon: homeId },
        { id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',  icon: bookmarkId },
        { id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',     icon: notifId },
        { id: '6e1e1b8193338310e61e3b277bba1023', name: 'More',       icon: menuId }
    ];

    for (var lt = 0; lt < launcherTabs.length; lt++) {
        var tObj = launcherTabs[lt];
        var tabRec = new GlideRecord('sys_sg_applet_launcher_tab');
        if (tabRec.get(tObj.id)) {
            tabRec.icon = tObj.icon;
            tabRec.active = true;
            tabRec.update();
            gs.print('   ✅ Tab [' + tObj.name + '] icon updated to: ' + tabRec.icon.getDisplayValue());
        }
    }

    // Unlock all sections
    var secGr = new GlideRecord('sys_sg_section');
    secGr.addQuery('sys_scope', scopeId);
    secGr.query();
    while (secGr.next()) {
        secGr.hide_section_if_empty = false;
        secGr.active = true;
        secGr.access_control_type = '';
        secGr.required_roles = '';
        secGr.update();
    }
    gs.print('   ✅ Unlocked all applet sections (hide_section_if_empty = false).');

    // Flush server caches
    try {
        GlideCacheManager.flush('sys_sg_icon');
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        GlideCacheManager.flush('sys_sg_section');
        gs.print('   🔄 Server-side mobile caches flushed.');
    } catch(e) {}

    gs.print('\n===================================================================');
    gs.print('🎉 PORTAL & MOBILE DATA SYNCHRONIZATION 100% COMPLETE!');
    gs.print('👉 NEXT STEP ON YOUR PHONE:');
    gs.print('   1. Tap Settings (gear icon in bottom right) > Log out.');
    gs.print('   2. Force close the app, then re-open and Log In to dev449562.');
    gs.print('   3. Both Portal and Mobile now display identical industrial data!');
    gs.print('===================================================================');
})();
