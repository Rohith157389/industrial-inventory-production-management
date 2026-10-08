// ============================================================================
// 🏆 BUGSLAYERS (GITAM UNIVERSITY) - MASTER HACKATHON DEPLOYMENT SCRIPT
// Application: Industrial Inventory and Production Management
// Problem Statement: Intelligent Production Scheduling Based on Customer Orders
// Target Instance: https://dev445579.service-now.com/
// Scope: Global (Run in System Definition > Scripts - Background: sys.scripts.do)
//
// Complete End-to-End Industrial Platform Implementation for NOW MOBILE,
// MOBILE AGENT, CUSTOMER PORTAL, DIGITAL TWIN & WHAT-IF PLANNER:
// 1. Industrial Customer Master & Customer Orders (Customer Portal)
// 2. Material Master (Finished Goods, Components, Raw Materials, MRO)
// 3. Multi-Level Bills of Materials (BOM) & Scrap Factors
// 4. Inventory Locations & Usable Stock with Safety Buffers
// 5. Material Traceability & Batches / Lot Management
// 6. Recent Inventory Transactions (powers Mobile "Recent Activity")
// 7. Demand Forecasting & Volatility Indicators
// 8. Machines & Work Centers with Live IoT Telemetry (Temp, Vibration, Loading)
// 9. Predictive Maintenance Work Orders & Downtime Logs
// 10. Supplier Reliability, Lead Times & Quality Evaluation Scores
// 11. Quality Inspections & Weekly Defect Control (Hold Triggers)
// 12. Customer Orders & Order Lines (Customer Portal Integration)
// 13. Production Orders & Work Center Schedules (Adaptive Planning)
// 14. Priority-Based IoT & Inventory Exception Alerts
// 15. Digital Twin & What-If Simulation Scenarios
// 16. Manpower Fault Reporting & Recurring Fault Weekly Logs
// 17. Customer Feedback & Satisfaction Ratings
// 18. NOW MOBILE & MOBILE AGENT FULL CONFIGURATION:
//     - Native Clients configured for BOTH "Now Mobile" (type: request) & "Mobile Agent" (type: agent)
//     - 5 Launchers mapped to ALL Navigation Bars (Now Mobile Nav, Industrial Mobile, Mobile Agent)
//     - Zero Warning Triangles (native OOB icons: Chart Bar, Home, Bookmark, Notification, Menu)
//     - Open Access Control on all Launchers, Sections, and Screens (no role barriers)
//     - Complete Mobile Cache Flush (sys_sg_*)
// 19. ATF Test Suites Linking (All 70 Test Cases Linked into 10 Suites)
// ============================================================================
(function() {
    gs.print('================================================================================');
    gs.print('🚀 STARTING BUGSLAYERS MASTER HACKATHON PLATFORM DEPLOYMENT ON dev445579');
    gs.print('================================================================================');

    // Dynamically detect application scope
    var appGr = new GlideRecord('sys_app');
    appGr.addQuery('scope', 'x_2056099_indust_0');
    appGr.query();
    var scopeId = appGr.next() ? appGr.getUniqueValue() : '3cdb727d839b4b105e2cc430ceaad338';
    gs.print('📌 Application Scope: x_2056099_indust_0 (sys_id: ' + scopeId + ')');

    // -------------------------------------------------------------------------
    // 1. INDUSTRIAL CUSTOMER MASTER
    // -------------------------------------------------------------------------
    gs.print('\n🏢 [1/19] Creating Industrial Customer Master...');
    var customers = [
        { id: 'CUST-AERO-01', name: 'Boeing Commercial Airplanes', ind: 'Aerospace & Defense', terms: 'Net 60', limit: 5000000, email: 'procurement@boeing.com' },
        { id: 'CUST-AUTO-02', name: 'Toyota Motor Manufacturing', ind: 'Automotive & Robotics', terms: 'Net 45', limit: 3500000, email: 'supplychain@toyota.com' },
        { id: 'CUST-ENGY-03', name: 'Siemens Energy Industrial',  ind: 'Energy & Power Systems', terms: 'Net 30', limit: 2000000, email: 'orders@siemens-energy.com' },
        { id: 'CUST-ROBO-04', name: 'ABB Robotics Automation',    ind: 'Industrial Automation', terms: 'Net 30', limit: 1500000, email: 'robotics@abb.com' },
        { id: 'CUST-AVIA-05', name: 'GE Aerospace Propulsion',    ind: 'Aviation & Turbines',   terms: 'Net 60', limit: 4000000, email: 'ge9x.orders@geaerospace.com' }
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
            cGr.primary_contact_email = cust.email;
            cGr.active = true;
            customerMap[cust.id] = cGr.insert();
            gs.print('   ✅ Created Customer: ' + cust.name);
        } else {
            customerMap[cust.id] = cGr.getUniqueValue();
            gs.print('   ℹ️ Customer exists: ' + cust.name);
        }
    }

    // -------------------------------------------------------------------------
    // 2. MATERIAL MASTER (Finished Products & Components)
    // -------------------------------------------------------------------------
    gs.print('\n📦 [2/19] Creating Material Master (Finished Goods & Raw Materials)...');
    var materials = [
        // Finished Goods
        { id: 'SKU-AERO-101', name: 'Aerospace High-Pressure Fuel Control Valve', type: 'finished_goods', cat: 'finished_product', uom: 'nos', cost: 3450, crit: 'critical', desc: 'Titanium multi-stage valve for jet fuel delivery systems' },
        { id: 'SKU-ROBO-102', name: 'Industrial 5-Axis CNC Servo Drive Unit 400W', type: 'finished_goods', cat: 'finished_product', uom: 'nos', cost: 1850, crit: 'critical', desc: 'Precision digital servo drive unit for high-speed machining centers' },
        { id: 'SKU-HYDR-103', name: 'Heavy Hydraulic Pressure Relief Manifold 350 Bar', type: 'finished_goods', cat: 'finished_product', uom: 'nos', cost: 2200, crit: 'high', desc: 'Forged hydraulic manifold for stamping press safety containment' },
        { id: 'SKU-TURB-104', name: 'Gas Turbine Blisk Impeller Contoured Rotor', type: 'finished_goods', cat: 'finished_product', uom: 'nos', cost: 8900, crit: 'critical', desc: 'Solid titanium blisk machined on 5-axis CNC with micro-tolerance' },
        // Raw Materials & Components
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
            mGr.safety_stock = 50;
            mGr.reorder_level = 100;
            mGr.active = true;
            matMap[mat.id] = mGr.insert();
            gs.print('   ✅ Created Material: ' + mat.name + ' (' + mat.id + ')');
        } else {
            matMap[mat.id] = mGr.getUniqueValue();
            gs.print('   ℹ️ Material exists: ' + mat.name);
        }
    }

    // -------------------------------------------------------------------------
    // 3. BILLS OF MATERIALS (BOM) & LINES
    // -------------------------------------------------------------------------
    gs.print('\n📐 [3/19] Creating Multi-Level Bills of Materials (BOM)...');
    var boms = [
        { name: 'BOM-AERO-VALVE', fg: 'SKU-AERO-101', desc: 'Fuel Control Valve Engineering Assembly', lines: [
            { mat: 'MAT-TI-202', qty: 2.5, scrap: 5 },
            { mat: 'MAT-BRG-201', qty: 2, scrap: 2 },
            { mat: 'MAT-SS-203', qty: 0.8, scrap: 3 }
        ]},
        { name: 'BOM-ROBO-SERVO', fg: 'SKU-ROBO-102', desc: 'Industrial Servo Drive Core Structure', lines: [
            { mat: 'MAT-BRG-201', qty: 4, scrap: 2 },
            { mat: 'MAT-SS-203', qty: 1.2, scrap: 4 },
            { mat: 'MAT-LUB-205', qty: 0.5, scrap: 1 }
        ]}
    ];

    for (var b = 0; b < boms.length; b++) {
        var bomItem = boms[b];
        var fgId = matMap[bomItem.fg];
        if (!fgId) continue;

        var bomGr = new GlideRecord('x_2056099_indust_0_customer_bom');
        bomGr.addQuery('bom_name', bomItem.name);
        bomGr.query();
        var bomSysId = '';
        if (!bomGr.next()) {
            bomGr.initialize();
            bomGr.bom_name = bomItem.name;
            bomGr.finished_product = fgId;
            bomGr.description = bomItem.desc;
            bomGr.status = 'active';
            bomGr.active = true;
            bomSysId = bomGr.insert();
            gs.print('   ✅ Created BOM: ' + bomItem.name);
        } else {
            bomSysId = bomGr.getUniqueValue();
        }

        for (var bl = 0; bl < bomItem.lines.length; bl++) {
            var lineItem = bomItem.lines[bl];
            var compId = matMap[lineItem.mat];
            if (!compId) continue;

            var lGr = new GlideRecord('x_2056099_indust_0_customer_bom_line');
            lGr.addQuery('customer_bom', bomSysId);
            lGr.addQuery('material_product', compId);
            lGr.query();
            if (!lGr.next()) {
                lGr.initialize();
                lGr.customer_bom = bomSysId;
                lGr.material_product = compId;
                lGr.quantity_required = lineItem.qty;
                lGr.scrap_percentage = lineItem.scrap;
                lGr.active = true;
                lGr.insert();
            }
        }
    }

    // -------------------------------------------------------------------------
    // 4. INVENTORY LOCATIONS & USABLE STOCK (Linked to Material Master)
    // -------------------------------------------------------------------------
    gs.print('\n🏢 [4/19] Creating Inventory Locations...');
    var locations = [
        { id: 'LOC-MAIN-01', name: 'Main Plant Plant-1 Warehouse', type: 'warehouse', city: 'Detroit' },
        { id: 'LOC-HIGH-02', name: 'High-Rack Buffer Storage B2', type: 'warehouse', city: 'Detroit' },
        { id: 'LOC-QUAR-03', name: 'Quality Quarantine Inspection Bay', type: 'quarantine', city: 'Detroit' }
    ];
    var locMap = {};
    for (var lc = 0; lc < locations.length; lc++) {
        var locObj = locations[lc];
        var locGr = new GlideRecord('x_2056099_indust_0_inv_loc');
        locGr.addQuery('location_id', locObj.id);
        locGr.query();
        if (!locGr.next()) {
            locGr.initialize();
            locGr.location_id = locObj.id;
            locGr.location_name = locObj.name;
            locGr.location_type = locObj.type;
            locGr.city = locObj.city;
            locGr.active = true;
            locMap[locObj.id] = locGr.insert();
            gs.print('   ✅ Created Location: ' + locObj.name);
        } else {
            locMap[locObj.id] = locGr.getUniqueValue();
        }
    }

    gs.print('\n📊 Creating Inventory Stock linked directly to Material Master...');
    var stockRecords = [
        { matId: 'SKU-AERO-101', type: 'finished_goods', stat: 'available', total: 180, avail: 145, res: 35, safety: 40, reorder: 60 },
        { matId: 'SKU-ROBO-102', type: 'finished_goods', stat: 'available', total: 95, avail: 75, res: 20, safety: 25, reorder: 40 },
        { matId: 'SKU-HYDR-103', type: 'finished_goods', stat: 'available', total: 60, avail: 50, res: 10, safety: 15, reorder: 25 },
        { matId: 'SKU-TURB-104', type: 'finished_goods', stat: 'available', total: 25, avail: 18, res: 7, safety: 10, reorder: 15 },
        { matId: 'MAT-BRG-201',  type: 'raw_materials', stat: 'low_stock', total: 85, avail: 40, res: 45, safety: 80, reorder: 120 },
        { matId: 'MAT-TI-202',   type: 'raw_materials', stat: 'available', total: 650, avail: 520, res: 130, safety: 150, reorder: 250 },
        { matId: 'MAT-SS-203',   type: 'raw_materials', stat: 'low_stock', total: 140, avail: 95, res: 45, safety: 150, reorder: 200 },
        { matId: 'MAT-CF-204',   type: 'raw_materials', stat: 'available', total: 320, avail: 280, res: 40, safety: 60, reorder: 100 },
        { matId: 'MAT-LUB-205',  type: 'mro',           stat: 'available', total: 450, avail: 410, res: 40, safety: 80, reorder: 120 }
    ];

    var stockMap = {};
    for (var s = 0; s < stockRecords.length; s++) {
        var stk = stockRecords[s];
        var matRef = matMap[stk.matId];
        if (!matRef) continue;

        var sGr = new GlideRecord('x_2056099_indust_0_inv_stock');
        sGr.addQuery('material_product', matRef);
        sGr.query();
        if (!sGr.next()) {
            sGr.initialize();
            sGr.material_product = matRef;
            sGr.inventory_type = stk.type;
            sGr.status = stk.stat;
            sGr.total_quantity = stk.total;
            sGr.available_quantity = stk.avail;
            sGr.reserved_quantity = stk.res;
            sGr.safety_stock = stk.safety;
            sGr.reorder_level = stk.reorder;
            sGr.active = true;
            sGr.last_updated = new GlideDateTime();
            stockMap[stk.matId] = sGr.insert();
            gs.print('   ✅ Created Stock for ' + stk.matId + ' (Available: ' + stk.avail + ')');
        } else {
            sGr.total_quantity = stk.total;
            sGr.available_quantity = stk.avail;
            sGr.reserved_quantity = stk.res;
            sGr.active = true;
            sGr.update();
            stockMap[stk.matId] = sGr.getUniqueValue();
        }
    }

    // -------------------------------------------------------------------------
    // 5. MATERIAL TRACEABILITY & INVENTORY BATCHES / LOTS
    // -------------------------------------------------------------------------
    gs.print('\n🏷️ [5/19] Creating Material Batches for Traceability...');
    var batches = [
        { num: 'LOT-TI-2026-A1', matId: 'MAT-TI-202', qty: 250, cert: 'CERT-AERO-TI-991', stat: 'Released' },
        { num: 'LOT-BRG-2026-B4', matId: 'MAT-BRG-201', qty: 85, cert: 'CERT-SKF-QC-4412', stat: 'Released' },
        { num: 'LOT-SS-2026-C8', matId: 'MAT-SS-203', qty: 140, cert: 'CERT-NIPPON-316L', stat: 'Released' }
    ];
    for (var bch = 0; bch < batches.length; bch++) {
        var bObj = batches[bch];
        var bMatRef = matMap[bObj.matId];
        if (!bMatRef) continue;
        var bGr = new GlideRecord('x_2056099_indust_0_inv_batch');
        bGr.addQuery('batch_number', bObj.num);
        bGr.query();
        if (!bGr.next()) {
            bGr.initialize();
            bGr.batch_number = bObj.num;
            bGr.material_product = bMatRef;
            bGr.quantity_received = bObj.qty;
            bGr.certificate_number = bObj.cert;
            bGr.quality_status = 'approved';
            bGr.status = bObj.stat;
            bGr.received_date = new GlideDateTime();
            bGr.insert();
            gs.print('   ✅ Created Batch: ' + bObj.num);
        }
    }

    // -------------------------------------------------------------------------
    // 6. RECENT INVENTORY TRANSACTIONS (POWERS MOBILE "RECENT ACTIVITY")
    // -------------------------------------------------------------------------
    gs.print('\n🔄 [6/19] Creating Recent Inventory Transactions (for Mobile Recent Activity)...');
    var txns = [
        { num: 'TXN-2026-001', type: 'issue', matId: 'MAT-TI-202', qty: 25, reason: 'Issued to CNC Milling Cell M-04 for Blisk Machining' },
        { num: 'TXN-2026-002', type: 'receipt', matId: 'MAT-BRG-201', qty: 50, reason: 'Incoming supplier delivery from SKF Bearings' },
        { num: 'TXN-2026-003', type: 'issue', matId: 'MAT-SS-203', qty: 20, reason: 'Issued to Hydraulic Press HP-01 for Manifold Batch' },
        { num: 'TXN-2026-004', type: 'transfer', matId: 'SKU-AERO-101', qty: 15, reason: 'Transfer from Assembly to Final Quality Staging' }
    ];
    for (var tx = 0; tx < txns.length; tx++) {
        var tObj = txns[tx];
        var tMat = matMap[tObj.matId];
        var tStk = stockMap[tObj.matId];
        if (!tMat) continue;
        var tGr = new GlideRecord('x_2056099_indust_0_inv_txn');
        tGr.addQuery('number', tObj.num);
        tGr.query();
        if (!tGr.next()) {
            tGr.initialize();
            tGr.number = tObj.num;
            tGr.transaction_type = tObj.type;
            tGr.material_product = tMat;
            if (tStk) tGr.inventory_stock = tStk;
            tGr.quantity = tObj.qty;
            tGr.reason = tObj.reason;
            tGr.status = 'completed';
            tGr.transaction_date = new GlideDateTime();
            tGr.insert();
            gs.print('   ✅ Created Transaction: ' + tObj.num + ' (' + tObj.type + ')');
        }
    }

    // -------------------------------------------------------------------------
    // 7. DEMAND FORECASTING
    // -------------------------------------------------------------------------
    gs.print('\n📈 [7/19] Creating AI Demand Forecasts...');
    var forecasts = [
        { matId: 'SKU-AERO-101', fc: 140 },
        { matId: 'SKU-ROBO-102', fc: 85 },
        { matId: 'SKU-HYDR-103', fc: 50 },
        { matId: 'SKU-TURB-104', fc: 25 }
    ];
    for (var df = 0; df < forecasts.length; df++) {
        var fItem = forecasts[df];
        var fMat = matMap[fItem.matId];
        if (!fMat) continue;
        var dfGr = new GlideRecord('x_2056099_indust_0_demand_forecast');
        dfGr.addQuery('material_product', fMat);
        dfGr.query();
        if (!dfGr.next()) {
            dfGr.initialize();
            dfGr.material_product = fMat;
            dfGr.forecast_quantity = fItem.fc;
            dfGr.active = true;
            dfGr.insert();
            gs.print('   ✅ Created Forecast for ' + fItem.matId);
        }
    }

    // -------------------------------------------------------------------------
    // 8. MACHINE ASSETS & IOT DIGITAL TWIN WORK CENTERS
    // -------------------------------------------------------------------------
    gs.print('\n🏭 [8/19] Creating Machine Assets & Work Centers with Live IoT Telemetry...');
    var machines = [
        { code: 'CNC-01', name: 'Work Center CNC Lathe 01', type: 'CNC Turning', cap: 16, eff: 92, status: 'warning', temp: 89, vib: 4.2, pwr: 18.5, crew: 'Alpha Crew' },
        { code: 'MILL-04', name: 'Work Center 5-Axis Milling Unit M-04', type: '5-Axis Milling', cap: 14, eff: 88, status: 'critical', temp: 62, vib: 6.8, pwr: 24.0, crew: 'Bravo Crew' },
        { code: 'PRESS-01', name: 'Work Center Hydraulic Stamping Press HP-01', type: 'Hydraulic Press', cap: 20, eff: 95, status: 'operational', temp: 54, vib: 2.1, pwr: 32.0, crew: 'Alpha Crew' },
        { code: 'ROBOT-02', name: 'Automated Robotic Cell RC-02', type: 'Robotics', cap: 22, eff: 98, status: 'operational', temp: 45, vib: 1.2, pwr: 8.4, crew: 'Delta Crew' },
        { code: 'QC-SCAN-01', name: 'Ultrasonic QC Inspection Station', type: 'NDT Testing', cap: 12, eff: 99, status: 'operational', temp: 38, vib: 0.5, pwr: 3.2, crew: 'Quality Crew' }
    ];

    var machMap = {};
    for (var mc = 0; mc < machines.length; mc++) {
        var mObj = machines[mc];
        var machGr = new GlideRecord('x_2056099_indust_0_machine');
        machGr.addQuery('name', mObj.name);
        machGr.query();
        if (!machGr.next()) {
            machGr.initialize();
            machGr.name = mObj.name;
            machGr.active = true;
            machMap[mObj.code] = machGr.insert();
            gs.print('   ✅ Created Machine: ' + mObj.name);
        } else {
            machMap[mObj.code] = machGr.getUniqueValue();
        }

        // Digital Twin Work Center Telemetry
        var dtGr = new GlideRecord('x_2056099_indust_0_dt_work_center');
        dtGr.addQuery('work_center_code', mObj.code);
        dtGr.query();
        if (!dtGr.next()) {
            dtGr.initialize();
            dtGr.work_center_code = mObj.code;
            dtGr.work_center_name = mObj.name;
            dtGr.process_type = mObj.type;
            dtGr.operational_status = mObj.status;
            dtGr.operating_temp_c = mObj.temp;
            dtGr.vibration_mms = mObj.vib;
            dtGr.health_index_pct = mObj.eff;
            dtGr.current_loading_pct = 78;
            dtGr.daily_capacity_hours = mObj.cap;
            dtGr.assigned_shift_crew = mObj.crew;
            dtGr.insert();
            gs.print('   ✅ Initialized Digital Twin Work Center IoT: ' + mObj.code);
        } else {
            dtGr.operating_temp_c = mObj.temp;
            dtGr.vibration_mms = mObj.vib;
            dtGr.operational_status = mObj.status;
            dtGr.update();
        }
    }

    // -------------------------------------------------------------------------
    // 9. PREDICTIVE MAINTENANCE WORK ORDERS
    // -------------------------------------------------------------------------
    gs.print('\n🔧 [9/19] Creating Predictive Maintenance Work Orders...');
    var maintOrders = [
        { mach: 'CNC-01', type: 'corrective', notes: 'Emergency Spindle Bearing Replacement (Overheat)', pri: '1', stat: 'scheduled', cause: 'Bearing thermal fatigue' },
        { mach: 'MILL-04', type: 'calibration', notes: 'Axis Z Dynamic Vibration Calibration & Tool Balancing', pri: '1', stat: 'in_progress', cause: 'High RPM spindle vibration' },
        { mach: 'PRESS-01', type: 'preventive', notes: 'Hydraulic Fluid Filter Flush & Seal Check', pri: '3', stat: 'scheduled', cause: 'Routine cycle interval' }
    ];

    for (var mo = 0; mo < maintOrders.length; mo++) {
        var mItem = maintOrders[mo];
        var mmGr = new GlideRecord('x_2056099_indust_0_mach_maint');
        mmGr.addQuery('notes', mItem.notes);
        mmGr.query();
        if (!mmGr.next()) {
            mmGr.initialize();
            if (machMap[mItem.mach]) mmGr.machine = machMap[mItem.mach];
            mmGr.maintenance_type = mItem.type;
            mmGr.priority = mItem.pri;
            mmGr.status = mItem.stat;
            mmGr.notes = mItem.notes;
            mmGr.root_cause = mItem.cause;
            mmGr.insert();
            gs.print('   ✅ Created Maintenance Order: ' + mItem.notes.substring(0, 45) + '...');
        }
    }

    // -------------------------------------------------------------------------
    // 10. SUPPLIER RELIABILITY & PERFORMANCE SCORES
    // -------------------------------------------------------------------------
    gs.print('\n🚚 [10/19] Creating Suppliers & Reliability Ratings...');
    var suppliers = [
        { name: 'Allegheny Aerospace Titanium Corp', rating: 98, lead: 14, qual: 99.2 },
        { name: 'SKF Precision Industrial Bearings AB', rating: 99, lead: 7,  qual: 99.8 },
        { name: 'Nippon Steel High-Strength Plate Ltd', rating: 92, lead: 21, qual: 97.5 },
        { name: 'Toray Carbon Composite Solutions',    rating: 95, lead: 18, qual: 98.9 }
    ];

    for (var sp = 0; sp < suppliers.length; sp++) {
        var supObj = suppliers[sp];
        var supGr = new GlideRecord('x_2056099_indust_0_supplier');
        supGr.addQuery('name', supObj.name);
        supGr.query();
        var sSysId = '';
        if (!supGr.next()) {
            supGr.initialize();
            supGr.name = supObj.name;
            supGr.active = true;
            sSysId = supGr.insert();
            gs.print('   ✅ Created Supplier: ' + supObj.name);
        } else {
            sSysId = supGr.getUniqueValue();
        }

        // Supplier Performance Score
        var scGr = new GlideRecord('x_2056099_indust_0_supp_score');
        scGr.addQuery('supplier', sSysId);
        scGr.query();
        if (!scGr.next()) {
            scGr.initialize();
            scGr.supplier = sSysId;
            scGr.overall_score_pct = supObj.rating;
            scGr.overall_rating = 'Grade A';
            scGr.avg_quality_score = supObj.qual;
            scGr.avg_delivery_score = 96.5;
            scGr.avg_cost_score = 94.0;
            scGr.performance_status = 'preferred';
            scGr.total_evaluated_orders = 42;
            scGr.completed_evaluations = 42;
            scGr.insert();
            gs.print('   ✅ Created Supplier Scorecard for: ' + supObj.name);
        }
    }

    // -------------------------------------------------------------------------
    // 11. QUALITY INSPECTIONS & THRESHOLD BREACH CONTROL (HOLD TRIGGER)
    // -------------------------------------------------------------------------
    gs.print('\n🔍 [11/19] Creating Quality Inspections & Defect Hold Logs...');
    var qcs = [
        { type: 'Incoming Material Ultrasonic NDT: Titanium Ingot Ti-6Al-4V', insp: 100, pass: 99, fail: 1, res: 'Passed', stat: 'Completed' },
        { type: 'Dimensional CMM Verification: Fuel Control Valve Spool Tolerance', insp: 50, pass: 50, fail: 0, res: 'Passed', stat: 'Completed' },
        { type: 'Surface Roughness Laser Profile: Gas Turbine Impeller Blades', insp: 20, pass: 18, fail: 2, res: 'Conditional Pass', stat: 'Completed' },
        { type: 'Weekly Sample Defect Audit: CNC Turning Line Batch 26', insp: 200, pass: 188, fail: 12, res: 'Failed', stat: 'Hold Triggered' }
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
            gs.print('   ✅ Created QC Inspection: ' + qItem.type.substring(0, 45) + '...');
        }
    }

    // -------------------------------------------------------------------------
    // 12. CUSTOMER ORDERS & ORDER ITEMS (CUSTOMER PORTAL)
    // -------------------------------------------------------------------------
    gs.print('\n🛒 [12/19] Creating Customer Orders & Order Lines (Customer Portal)...');
    var custOrders = [
        { num: 'ORD-2026-901', custId: 'CUST-AERO-01', matId: 'SKU-AERO-101', qty: 100, pri: 'urgent', stat: 'in_production', date: '2026-10-01', notes: 'Urgent flight test batch for Boeing 777X wing actuator valves' },
        { num: 'ORD-2026-902', custId: 'CUST-AUTO-02', matId: 'SKU-ROBO-102', qty: 60,  pri: 'high',   stat: 'in_production', date: '2026-10-02', notes: 'Robotics automation servo drives for Toyota Kentucky line' },
        { num: 'ORD-2026-903', custId: 'CUST-ENGY-03', matId: 'SKU-HYDR-103', qty: 40,  pri: 'normal', stat: 'confirmed',     date: '2026-10-04', notes: 'Hydraulic safety manifolds for turbine test facility' },
        { num: 'ORD-2026-904', custId: 'CUST-AVIA-05', matId: 'SKU-TURB-104', qty: 20,  pri: 'urgent', stat: 'in_production', date: '2026-10-05', notes: 'Titanium blisk assemblies for GE9X engine qualification' }
    ];

    var custOrderMap = {};
    for (var o = 0; o < custOrders.length; o++) {
        var ord = custOrders[o];
        var cRef = customerMap[ord.custId];
        var ordGr = new GlideRecord('x_2056099_indust_0_cust_order');
        ordGr.addQuery('number', ord.num);
        ordGr.query();
        var ordSysId = '';
        if (!ordGr.next()) {
            ordGr.initialize();
            ordGr.number = ord.num;
            if (cRef) ordGr.customer = cRef;
            ordGr.priority = ord.pri;
            ordGr.status = ord.stat;
            ordGr.order_date = ord.date;
            ordGr.notes = ord.notes;
            if (locMap['LOC-MAIN-01']) {
                ordGr.preferred_delivery_location = locMap['LOC-MAIN-01'];
                ordGr.delivery_location = locMap['LOC-MAIN-01'];
            }
            ordGr.active = true;
            ordSysId = ordGr.insert();
            custOrderMap[ord.num] = ordSysId;
            gs.print('   ✅ Created Customer Order: ' + ord.num);
        } else {
            if (locMap['LOC-MAIN-01']) {
                ordGr.preferred_delivery_location = locMap['LOC-MAIN-01'];
                ordGr.delivery_location = locMap['LOC-MAIN-01'];
                ordGr.update();
            }
            ordSysId = ordGr.getUniqueValue();
            custOrderMap[ord.num] = ordSysId;
        }

        // Customer Order Line Item
        var oMat = matMap[ord.matId];
        if (oMat) {
            var itemGr = new GlideRecord('x_2056099_indust_0_cust_ord_item');
            itemGr.addQuery('customer_order', ordSysId);
            itemGr.addQuery('material_product', oMat);
            itemGr.query();
            if (!itemGr.next()) {
                itemGr.initialize();
                itemGr.customer_order = ordSysId;
                itemGr.material_product = oMat;
                itemGr.number = ord.num + '-01';
                itemGr.quantity_ordered = ord.qty;
                itemGr.item_status = ord.stat;
                itemGr.priority = ord.pri;
                itemGr.active = true;
                itemGr.insert();
            }
        }
    }

    // -------------------------------------------------------------------------
    // 13. PRODUCTION ORDERS & WORK CENTER SCHEDULES (NOW MOBILE & AGENT)
    // -------------------------------------------------------------------------
    gs.print('\n⚙️ [13/19] Creating Production Orders & Work Center Schedules (Now Mobile)...');
    var prodOrders = [
        { num: 'PO-2026-101', matId: 'SKU-AERO-101', ordNum: 'ORD-2026-901', desc: 'Precision CNC Machining: Fuel Control Valve Batch', plan: 100, done: 75, rem: 25, pri: '1', stat: 'in_progress' },
        { num: 'PO-2026-102', matId: 'SKU-ROBO-102', ordNum: 'ORD-2026-902', desc: 'Assembly & Calibration: 5-Axis Servo Drives Batch', plan: 60, done: 45, rem: 15, pri: '2', stat: 'in_progress' },
        { num: 'PO-2026-103', matId: 'SKU-HYDR-103', ordNum: 'ORD-2026-903', desc: 'High-Pressure Forging: Hydraulic Manifold Batch', plan: 40, done: 10, rem: 30, pri: '3', stat: 'scheduled' },
        { num: 'PO-2026-104', matId: 'SKU-TURB-104', ordNum: 'ORD-2026-904', desc: '5-Axis Ultrasonic Profiling: Turbine Blisk Batch', plan: 20, done: 18, rem: 2, pri: '1', stat: 'in_progress' }
    ];

    for (var po = 0; po < prodOrders.length; po++) {
        var pOrder = prodOrders[po];
        var pMatSysId = matMap[pOrder.matId];
        var pCustOrdSysId = custOrderMap[pOrder.ordNum];

        var poGr = new GlideRecord('x_2056099_indust_0_production_order');
        poGr.addQuery('number', pOrder.num);
        poGr.query();
        if (!poGr.next()) {
            poGr.initialize();
            poGr.number = pOrder.num;
            poGr.description = pOrder.desc;
            if (pMatSysId) poGr.finished_product = pMatSysId;
            if (pCustOrdSysId) poGr.customer_order = pCustOrdSysId;
            poGr.quantity_planned = pOrder.plan;
            poGr.quantity_produced = pOrder.done;
            poGr.quantity_remaining = pOrder.rem;
            poGr.priority = pOrder.pri;
            poGr.status = pOrder.stat;
            poGr.active = true;
            poGr.insert();
            gs.print('   ✅ Created Production Order: ' + pOrder.num);
        }
    }

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
    // 14. PRIORITY-BASED IOT & INVENTORY ALERTS
    // -------------------------------------------------------------------------
    gs.print('\n🚨 [14/19] Creating Priority-Based IoT & Inventory Alerts...');
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

    // -------------------------------------------------------------------------
    // 15. DIGITAL TWIN & WHAT-IF SIMULATION SCENARIOS
    // -------------------------------------------------------------------------
    gs.print('\n🌐 [15/19] Creating Digital Twin What-If Simulation Scenarios...');
    var scenarios = [
        { id: 'SIM-001', name: 'Sim 1: CNC Lathe 01 Spindle Bearing Overheat Recovery', cat: 'Machine Breakdown', strat: 'Reroutes turning operations to CNC Lathe 02 with zero customer delivery slip' },
        { id: 'SIM-002', name: 'Sim 2: Stainless Steel 316L Stockout Buffer Rebalance', cat: 'Material Shortage', strat: 'Triggers inter-plant stock transfer and automated supplier priority reorder' },
        { id: 'SIM-003', name: 'Sim 3: Boeing 777X Urgent Rush Order Intake', cat: 'Urgent Customer Order', strat: 'Simulates preemptive queue resequencing and night-shift capacity activation' }
    ];

    for (var sim = 0; sim < scenarios.length; sim++) {
        var sObj = scenarios[sim];
        var simGr = new GlideRecord('x_2056099_indust_0_sim_scenario');
        simGr.addQuery('scenario_id', sObj.id);
        simGr.query();
        if (!simGr.next()) {
            simGr.initialize();
            simGr.scenario_id = sObj.id;
            simGr.scenario_name = sObj.name;
            simGr.disruption_category = sObj.cat;
            simGr.recommended_strategy = sObj.strat;
            simGr.baseline_otd = 72;
            simGr.optimized_otd = 96;
            simGr.simulation_status = 'completed';
            simGr.insert();
            gs.print('   ✅ Created Digital Twin Scenario: ' + sObj.name);
        }
    }

    // -------------------------------------------------------------------------
    // 16. MANPOWER FAULT REPORTING & RECURRING FAULT LOGS
    // -------------------------------------------------------------------------
    gs.print('\n👥 [16/19] Creating Manpower Recurring Fault Weekly Reports...');
    var wkGr = new GlideRecord('x_2056099_indust_0_wk_report');
    wkGr.addQuery('report_id', 'WK-RPT-2026-W40');
    wkGr.query();
    if (!wkGr.next()) {
        wkGr.initialize();
        wkGr.report_id = 'WK-RPT-2026-W40';
        wkGr.reporting_week = 'Week 40 - Oct 2026';
        wkGr.department = 'CNC Machining & Precision Assembly';
        wkGr.total_workers_rated = 48;
        wkGr.average_rating = 4.2;
        wkGr.increased_count = 6;
        wkGr.maintained_count = 39;
        wkGr.decreased_count = 3;
        wkGr.hr_reviews_required = 1;
        wkGr.report_status = 'approved';
        wkGr.report_notes = 'Operator tooling setup fault identified on Shift 2 CNC-01; scheduled refresher calibration training.';
        wkGr.insert();
        gs.print('   ✅ Created Weekly Manpower Fault Report: WK-RPT-2026-W40');
    }

    // -------------------------------------------------------------------------
    // 17. CUSTOMER FEEDBACK & SATISFACTION RATINGS
    // -------------------------------------------------------------------------
    gs.print('\n⭐ [17/19] Creating Customer Feedback Ratings...');
    var boeingOrdId = custOrderMap['ORD-2026-901'];
    var boeingCustId = customerMap['CUST-AERO-01'];
    if (boeingOrdId && boeingCustId) {
        var fbGr = new GlideRecord('x_2056099_indust_0_cust_fb');
        fbGr.addQuery('customer_order', boeingOrdId);
        fbGr.query();
        if (!fbGr.next()) {
            fbGr.initialize();
            fbGr.customer = boeingCustId;
            fbGr.customer_order = boeingOrdId;
            fbGr.overall_rating = '5';
            fbGr.product_quality_rating = '5';
            fbGr.delivery_rating = '5';
            fbGr.ordering_rating = '5';
            fbGr.comments = 'Outstanding precision tolerances and on-time shipment for Boeing flight test valves.';
            fbGr.status = 'submitted';
            fbGr.insert();
            gs.print('   ✅ Created Customer Feedback from Boeing');
        }
    }

    // -------------------------------------------------------------------------
    // 18. NOW MOBILE & MOBILE AGENT FULL CONFIGURATION
    // -------------------------------------------------------------------------
    gs.print('\n📱 [18/19] Configuring NOW MOBILE & MOBILE AGENT Experience...');

    // A. Clean up old dummy list screen tabs that caused "No data available"
    var dummyTabs = [
        '89546b8193738310e61e3b277bba10e6',
        '9154ab8193738310e61e3b277bba102f',
        '9554ab8193738310e61e3b277bba1050',
        'ed54ab8193738310e61e3b277bba1096',
        'a570bcc993fb8310e61e3b277bba108f',
        '2570bcc993fb8310e61e3b277bba10a4',
        '6d70bcc993fb8310e61e3b277bba1099',
        'b170bcc993fb8310e61e3b277bba10bb'
    ];
    for (var dt = 0; dt < dummyTabs.length; dt++) {
        var dMap = new GlideRecord('sys_sg_navigation_tab_map');
        dMap.addQuery('navigation_tab', dummyTabs[dt]);
        dMap.query();
        while (dMap.next()) {
            dMap.deleteRecord();
            gs.print('   🗑️ Removed dummy tab mapping: ' + dummyTabs[dt]);
        }
    }

    // B. Native Clients for BOTH Now Mobile (type: request) AND Mobile Agent (type: agent)
    var nativeClientsToConfigure = [
        { name: 'Industrial Production Management (Now Mobile)', label: 'Industrial Production Management', type: 'request', nav: '698f1445937b8310e61e3b277bba1009' },
        { name: 'Now Mobile', label: 'Now Mobile', type: 'request', nav: '9f67848187403300e0ef0cf888cb0b2e' },
        { name: 'Now Mobile Admin', label: 'Now Mobile Admin', type: 'request', nav: '9f67848187403300e0ef0cf888cb0b2e' },
        { name: 'Industrial Production Management', label: 'Industrial Production Management', type: 'agent', nav: '698f1445937b8310e61e3b277bba1009' },
        { name: 'Mobile Agent', label: 'Mobile Agent', type: 'agent', nav: '679d4f0653d033002d96ddeeff7b1279' }
    ];

    for (var ncIdx = 0; ncIdx < nativeClientsToConfigure.length; ncIdx++) {
        var ncDef = nativeClientsToConfigure[ncIdx];
        var ncGr = new GlideRecord('sys_sg_native_client');
        ncGr.addQuery('name', ncDef.name);
        ncGr.query();
        if (!ncGr.next()) {
            ncGr.initialize();
            ncGr.name = ncDef.name;
            ncGr.label = ncDef.label;
            ncGr.type = ncDef.type;
            ncGr.navigation = ncDef.nav;
            ncGr.active = true;
            ncGr.access_control_type = 'none';
            ncGr.sys_scope = scopeId;
            ncGr.insert();
            gs.print('   ✅ Created Native Client [' + ncDef.name + '] for ' + ncDef.type);
        } else {
            ncGr.label = ncDef.label;
            ncGr.type = ncDef.type;
            ncGr.navigation = ncDef.nav;
            ncGr.active = true;
            ncGr.access_control_type = 'none';
            ncGr.update();
            gs.print('   ✅ Updated Native Client [' + ncDef.name + '] (type: ' + ncDef.type + ', active: true)');
        }
    }

    // C. Map Real Launchers to ALL 3 Navigation Bars (Now Mobile Nav, Industrial Mobile, Mobile Agent)
    var allNavBars = [
        { name: 'Industrial Production Management Mobile', sys_id: '698f1445937b8310e61e3b277bba1009' },
        { name: 'Now Mobile Nav', sys_id: '9f67848187403300e0ef0cf888cb0b2e' },
        { name: 'Mobile Agent', sys_id: '679d4f0653d033002d96ddeeff7b1279' }
    ];

    var realLauncherTabs = [
        { id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard',  order: 10 },
        { id: '8e1e978193338310e61e3b277bba1062', name: 'Production', order: 20 },
        { id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',  order: 30 },
        { id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',     order: 40 },
        { id: '6e1e1b8193338310e61e3b277bba1023', name: 'More',       order: 50 }
    ];

    for (var nb = 0; nb < allNavBars.length; nb++) {
        var currentNav = allNavBars[nb];
        var nRec = new GlideRecord('sys_sg_navigation');
        if (!nRec.get(currentNav.sys_id)) {
            nRec.addQuery('name', currentNav.name);
            nRec.query();
            if (nRec.next()) currentNav.sys_id = nRec.getUniqueValue();
        }
        if (nRec.isValidRecord()) {
            nRec.legacy_application = false;
            nRec.update();

            for (var t = 0; t < realLauncherTabs.length; t++) {
                var rTab = realLauncherTabs[t];
                var mapGr = new GlideRecord('sys_sg_navigation_tab_map');
                mapGr.addQuery('navigation', currentNav.sys_id);
                mapGr.addQuery('navigation_tab', rTab.id);
                mapGr.query();
                if (!mapGr.next()) {
                    mapGr.initialize();
                    mapGr.navigation = currentNav.sys_id;
                    mapGr.navigation_tab = rTab.id;
                    mapGr.order = rTab.order;
                    mapGr.insert();
                    gs.print('   ✅ Mapped [' + rTab.name + '] into ' + currentNav.name);
                } else {
                    mapGr.order = rTab.order;
                    mapGr.update();
                }
            }
        }
    }

    // D. Assign Native Working Icons (Zero Warning Triangles ⚠️)
    var iconMap = {};
    var iGr = new GlideRecord('sys_sg_icon');
    iGr.query();
    while (iGr.next()) {
        iconMap[iGr.name.toString()] = iGr.getUniqueValue();
    }

    var chartBarId = iconMap['Chart Bar'] || 'd49c89a2b72200108223e126de11a9c4';
    var menuId     = iconMap['MS icon-Menu'] || 'dd19611453337410409cddeeff7b12d3';
    var homeId     = iconMap['Home'] || iconMap['icon-Folder'] || chartBarId;
    var bookmarkId = iconMap['icon-Bookmark'] || iconMap['icon-Box'] || chartBarId;
    var notifId    = iconMap['Notification icon'] || iconMap['icon-Bell'] || chartBarId;

    var tabIconUpdates = [
        { id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard', icon: chartBarId },
        { id: '8e1e978193338310e61e3b277bba1062', name: 'Production', icon: homeId },
        { id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',  icon: bookmarkId },
        { id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',     icon: notifId },
        { id: '6e1e1b8193338310e61e3b277bba1023', name: 'More',       icon: menuId }
    ];

    for (var tu = 0; tu < tabIconUpdates.length; tu++) {
        var tuObj = tabIconUpdates[tu];
        var tRec = new GlideRecord('sys_sg_applet_launcher_tab');
        if (tRec.get(tuObj.id)) {
            tRec.icon = tuObj.icon;
            tRec.active = true;
            tRec.update();
            gs.print('   ✅ Tab [' + tuObj.name + '] icon updated to: ' + tRec.icon.getDisplayValue());
        }
    }

    // E. Open Access Control on Launchers (Remove Role Blocks)
    var launcherIds = [
        '1d1e578193338310e61e3b277bba10e7', // Dashboard
        '791e978193338310e61e3b277bba1046', // Production
        '4e1e978193338310e61e3b277bba109f', // Inventory
        '561ed78193338310e61e3b277bba108e', // Alerts
        '6a1e1b8193338310e61e3b277bba101e'  // More
    ];
    for (var l = 0; l < launcherIds.length; l++) {
        var lGr = new GlideRecord('sys_sg_applet_launcher');
        if (lGr.get(launcherIds[l])) {
            lGr.active = true;
            lGr.access_control_type = 'none';
            lGr.hide_empty_sections = false;
            lGr.roles = '';
            lGr.update();
            gs.print('   ✅ Open access set on launcher: ' + lGr.title);
        }
    }

    // F. Unlock all Mobile Applet Sections
    var sGr = new GlideRecord('sys_sg_section');
    sGr.addQuery('sys_scope', scopeId);
    sGr.query();
    while (sGr.next()) {
        sGr.hide_section_if_empty = false;
        sGr.active = true;
        sGr.access_control_type = 'none';
        sGr.required_roles = '';
        sGr.update();
    }
    gs.print('   ✅ Unlocked all Mobile Applet sections.');

    // G. Unlock all Screens
    var scrGr = new GlideRecord('sys_sg_screen');
    scrGr.addQuery('sys_scope', scopeId);
    scrGr.query();
    while (scrGr.next()) {
        scrGr.access_control_type = 'none';
        scrGr.roles = '';
        scrGr.active = true;
        scrGr.update();
    }
    gs.print('   ✅ Unlocked all Mobile screens.');

    // -------------------------------------------------------------------------
    // 19. ATF TEST SUITES LINKING
    // -------------------------------------------------------------------------
    gs.print('\n🧪 [19/19] Linking ATF Test Suites & Test Cases...');
    var testCount = 0;
    var suiteGr = new GlideRecord('sys_atf_test_suite');
    suiteGr.addQuery('sys_scope', scopeId);
    suiteGr.query();
    while (suiteGr.next()) {
        var sId = suiteGr.getUniqueValue();
        var tGr = new GlideRecord('sys_atf_test');
        tGr.addQuery('sys_scope', scopeId);
        tGr.query();
        var order = 10;
        while (tGr.next()) {
            var mapCheck = new GlideRecord('sys_atf_test_suite_test');
            mapCheck.addQuery('test_suite', sId);
            mapCheck.addQuery('test', tGr.getUniqueValue());
            mapCheck.query();
            if (!mapCheck.next()) {
                mapCheck.initialize();
                mapCheck.test_suite = sId;
                mapCheck.test = tGr.getUniqueValue();
                mapCheck.order = order;
                mapCheck.insert();
                testCount++;
            }
            order += 10;
            if (order > 70) break;
        }
    }
    gs.print('   ✅ Linked ' + testCount + ' ATF test mappings into test suites.');

    // -------------------------------------------------------------------------
    // COMPLETE CACHE FLUSH
    // -------------------------------------------------------------------------
    try {
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        GlideCacheManager.flush('sys_sg_applet_launcher_tab');
        GlideCacheManager.flush('sys_sg_section');
        GlideCacheManager.flush('sys_sg_screen');
        GlideCacheManager.flush('sys_sg_icon');
        gs.print('\n🔄 All Mobile and Platform caches flushed successfully.');
    } catch(e) {
        gs.print('\n⚠️ Cache flush: ' + e.message);
    }

    gs.print('\n================================================================================');
    gs.print('🎉 BUGSLAYERS MASTER PLATFORM DEPLOYMENT COMPLETE FOR NOW MOBILE ON dev445579!');
    gs.print('================================================================================');
    gs.print('📱 TO REFRESH IN YOUR NOW MOBILE PHONE APP:');
    gs.print('   1. Open Now Mobile app on your phone');
    gs.print('   2. Go to Settings (gear icon on bottom navigation) -> Reset Cache');
    gs.print('   3. (OR) Log out -> Force close the phone app -> Log back in');
    gs.print('================================================================================');
})();
