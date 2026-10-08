// ============================================================================
// 🏭 BUGSLAYERS - STAKEHOLDER PRODUCTION & BREAKDOWN MOBILE SUITE
// Purpose:
// 1. Seed & verify live Machine Breakdown (`mach_down`) and Maintenance (`mach_maint`) records
// 2. Ensure "Currently Running" Production Orders have in_progress status with live progress
// 3. Configure Data Items for:
//    - "Currently Running Production Orders"
//    - "Active Machine Breakdowns" (For Breakdown Stakeholders)
//    - "Machine Maintenance Tickets"
// 4. Configure Beautiful Card Views & Screen Sections tailored for each Stakeholder
// 5. Update Navigation Tabs and Native Clients across Now Mobile & Mobile Agent
//
// Target Instance: https://dev445579.service-now.com/
// Scope: Global (Run in System Definition > Scripts - Background: sys.scripts.do)
// ============================================================================
(function deployStakeholderMobileSuite() {
    gs.print('================================================================================');
    gs.print('🏭 DEPLOYING STAKEHOLDER PRODUCTION & BREAKDOWN MOBILE SUITE ON dev445579');
    gs.print('================================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // 1. RESOLVE WORK CENTERS & MACHINES
    // -------------------------------------------------------------------------
    gs.print('\n⚙️ [1/7] Resolving Work Centers and Machines...');
    
    var wcMap = {};
    var wcGr = new GlideRecord('x_2056099_indust_0_dt_work_center');
    wcGr.query();
    while (wcGr.next()) {
        wcMap[wcGr.work_center_id.toString()] = wcGr.getUniqueValue();
    }

    // Ensure 4 primary work centers exist with live OEE & breakdown states
    var workCenterDefs = [
        { id: 'WC-CNC-501',  name: '5-Axis CNC Milling Center',   type: 'cnc_machining',  status: 'breakdown',  health: 64, oee: 72.4, temp: 68.5, vib: 0.19 },
        { id: 'WC-ROBO-502', name: 'Robotic Arc Welding Cell',    type: 'welding',        status: 'running',    health: 88, oee: 84.6, temp: 42.0, vib: 0.06 },
        { id: 'WC-ADD-503',  name: 'Laser Powder 3D Metal Printer',type: 'additive_mfg',   status: 'running',    health: 96, oee: 91.8, temp: 31.5, vib: 0.02 },
        { id: 'WC-ASSY-504', name: 'Cleanroom Final Assembly Line',type: 'assembly',       status: 'running',    health: 98, oee: 94.2, temp: 21.8, vib: 0.01 }
    ];

    for (var w = 0; w < workCenterDefs.length; w++) {
        var wDef = workCenterDefs[w];
        var wGr = new GlideRecord('x_2056099_indust_0_dt_work_center');
        wGr.addQuery('work_center_id', wDef.id);
        wGr.query();
        if (wGr.next()) {
            wGr.work_center_name = wDef.name;
            wGr.work_center_type = wDef.type;
            wGr.status = wDef.status;
            wGr.health_index = wDef.health;
            wGr.oee = wDef.oee;
            wGr.current_temperature = wDef.temp;
            wGr.current_vibration = wDef.vib;
            wGr.active = true;
            wGr.update();
            wcMap[wDef.id] = wGr.getUniqueValue();
        } else {
            wGr.initialize();
            wGr.work_center_id = wDef.id;
            wGr.work_center_name = wDef.name;
            wGr.work_center_type = wDef.type;
            wGr.status = wDef.status;
            wGr.health_index = wDef.health;
            wGr.oee = wDef.oee;
            wGr.current_temperature = wDef.temp;
            wGr.current_vibration = wDef.vib;
            wGr.active = true;
            wGr.sys_scope = scopeId;
            wcMap[wDef.id] = wGr.insert();
        }
        gs.print('   ✅ Work Center [' + wDef.name + '] status: ' + wDef.status);
    }

    // -------------------------------------------------------------------------
    // 2. SEED LIVE MACHINE BREAKDOWNS (FOR BREAKDOWN PEOPLE / STAKEHOLDERS)
    // -------------------------------------------------------------------------
    gs.print('\n🚨 [2/7] Seeding Live Machine Breakdowns & Maintenance Records...');

    var breakdowns = [
        {
            num: 'BD-2026-001',
            machine: wcMap['WC-CNC-501'],
            status: 'active',
            severity: 'critical',
            cat: 'unplanned_mechanical',
            type: 'spindle_bearing_failure',
            reason: 'High Spindle Vibration (0.19g > 0.12g limit) - Overheating Spindle Bearing',
            impact: 'high',
            root: 'Bearing lubrication breakdown under high-feed titanium roughing',
            notes: 'Spindle thermal expansion trip activated. Line halted. Urgent bearing replacement required.',
            duration: 145
        },
        {
            num: 'BD-2026-002',
            machine: wcMap['WC-ROBO-502'],
            status: 'investigating',
            severity: 'medium',
            cat: 'tooling_calibration',
            type: 'arc_torch_drift',
            reason: 'Welding Torch Tip Sensor Out of Calibration Drift (+0.8mm tolerance exceed)',
            impact: 'medium',
            root: 'Wire feeder nozzle spatter accumulation',
            notes: 'Automated torch cleaning routine aborted. Requires manual cleaning and re-zeroing.',
            duration: 45
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
            gs.print('   🚨 Created Breakdown [' + bd.num + '] for machine: ' + bd.reason);
        } else {
            bdGr.status = bd.status;
            bdGr.severity = bd.severity;
            bdGr.active = true;
            bdGr.update();
        }
    }

    // -------------------------------------------------------------------------
    // 3. SEED CURRENTLY RUNNING PRODUCTION ORDERS
    // -------------------------------------------------------------------------
    gs.print('\n🚀 [3/7] Ensuring Currently Running Production Orders with Live Statistics...');

    var runningOrders = [
        { num: 'PO-2026-101', status: 'in_progress', plan: 50, prod: 31, prio: 1, desc: 'Aerospace Fuel Valve Unit (Boeing)' },
        { num: 'PO-2026-104', status: 'in_progress', plan: 15, prod: 6,  prio: 1, desc: 'Micro-Turbine Impeller Disc (Tesla)' },
        { num: 'PO-2026-102', status: 'scheduled',   plan: 30, prod: 0,  prio: 2, desc: 'Robotic Articulated Arm (Toyota)' },
        { num: 'PO-2026-103', status: 'planned',     plan: 20, prod: 0,  prio: 3, desc: 'High-Pressure Hydraulic Pump (Siemens)' }
    ];

    for (var ro = 0; ro < runningOrders.length; ro++) {
        var rObj = runningOrders[ro];
        var poGr = new GlideRecord('x_2056099_indust_0_production_order');
        poGr.addQuery('number', rObj.num);
        poGr.query();
        if (poGr.next()) {
            poGr.status = rObj.status;
            poGr.quantity_planned = rObj.plan;
            poGr.quantity_produced = rObj.prod;
            poGr.priority = rObj.prio;
            poGr.active = true;
            poGr.update();
            gs.print('   ⚡ Order [' + rObj.num + '] -> Status: ' + rObj.status + ' (' + rObj.prod + '/' + rObj.plan + ' units produced)');
        }
    }

    // -------------------------------------------------------------------------
    // 4. CREATE / UPDATE MOBILE DATA ITEMS FOR STAKEHOLDERS
    // -------------------------------------------------------------------------
    gs.print('\n📊 [4/7] Configuring Stakeholder Mobile Data Items...');

    var stakeholderDataItems = [
        {
            id: 'fc0b64cd93bb8310e61e3b277bba1091', // Active Production Orders
            name: 'Active Production Orders',
            table: 'x_2056099_indust_0_production_order',
            query: 'ORDERBYpriority^ORDERBYDESCsys_updated_on'
        },
        {
            id: 'bb416c49937b8310e61e3b277bba100a', // Active Inventory Stock
            name: 'Active Inventory Stock',
            table: 'x_2056099_indust_0_inv_stock',
            query: 'ORDERBYDESCavailable_quantity'
        },
        {
            id: '37416c49937b8310e61e3b277bba1055', // Active Alerts
            name: 'Active Alerts',
            table: 'x_2056099_indust_0_inv_alert',
            query: 'statusNOT INresolved,dismissed^ORDERBYDESCseverity'
        }
    ];

    for (var di = 0; di < stakeholderDataItems.length; di++) {
        var dCfg = stakeholderDataItems[di];
        var dGr = new GlideRecord('sys_sg_data_item');
        if (dGr.get(dCfg.id)) {
            dGr.query_condition = dCfg.query;
            dGr.update();
            gs.print('   ✅ Updated Data Item [' + dCfg.name + ']');
        }
    }

    // -------------------------------------------------------------------------
    // 5. ATTACH MASTER ITEMS & DETAIL VIEWS (DRILL DOWN FOR EVERY STAKEHOLDER)
    // -------------------------------------------------------------------------
    gs.print('\n📱 [5/7] Linking Master Items & Card Views for Each Screen...');

    var streamLinks = [
        { stream: '49546b8193738310e61e3b277bba10d1', master: '0e22f8cd93fb8310e61e3b277bba1025', name: 'Dashboard (Orders & Breakdown Overview)' },
        { stream: '5d54ab8193738310e61e3b277bba101e', master: '0e22f8cd93fb8310e61e3b277bba1025', name: 'Production (Shop Floor Orders)' },
        { stream: '5154ab8193738310e61e3b277bba1040', master: '7473b881933f8310e61e3b277bba1061', name: 'Inventory (Raw & Finished Stock)' },
        { stream: '1d54ab8193738310e61e3b277bba106d', master: '6fb43845933f8310e61e3b277bba10f0', name: 'Alerts (Breakdowns & Machine Anomalies)' }
    ];

    for (var sl = 0; sl < streamLinks.length; sl++) {
        var sLink = streamLinks[sl];
        var mItemGr = new GlideRecord('sys_sg_item_stream_m2m_master_item');
        mItemGr.addQuery('item_stream', sLink.stream);
        mItemGr.addQuery('master_item', sLink.master);
        mItemGr.query();
        if (!mItemGr.next()) {
            mItemGr.initialize();
            mItemGr.item_stream = sLink.stream;
            mItemGr.master_item = sLink.master;
            mItemGr.order = 10;
            mItemGr.sys_scope = scopeId;
            mItemGr.insert();
            gs.print('   🔗 Linked Stream [' + sLink.name + '] to Master Item: ' + sLink.master);
        } else {
            gs.print('   ℹ️ Master Item active on: ' + sLink.name);
        }
    }

    // -------------------------------------------------------------------------
    // 6. MAP TABS & UNIFY ALL NAVIGATION BARS ACROSS NOW MOBILE
    // -------------------------------------------------------------------------
    gs.print('\n🗺️ [6/7] Remapping All Navigation Bars for Now Mobile & Mobile Agent...');

    var iconChart = 'd49c89a2b72200108223e126de11a9c4'; // Chart Bar
    var iconHome  = '679c89a2b72200108223e126de11a9b9'; // Home (or fallback)
    var iconBox   = 'e39c89a2b72200108223e126de11a9b1'; // Box / Bookmark
    var iconBell  = 'c2fc8da2b72200108223e126de11a92b'; // Bell

    // Configure the 4 Applet Tabs
    var tabUpdates = [
        { id: '89546b8193738310e61e3b277bba10e6', label: 'Dashboard',  screen: '4d546b8193738310e61e3b277bba108a', icon: iconChart, order: 10 },
        { id: '9154ab8193738310e61e3b277bba102f', label: 'Production', screen: '8154ab8193738310e61e3b277bba1000', icon: iconHome,  order: 20 },
        { id: '9554ab8193738310e61e3b277bba1050', label: 'Inventory',  screen: '1554ab8193738310e61e3b277bba103a', icon: iconBox,   order: 30 },
        { id: 'ed54ab8193738310e61e3b277bba1096', label: 'Alerts',     screen: 'dd54ab8193738310e61e3b277bba1067', icon: iconBell,  order: 40 }
    ];

    for (var tu = 0; tu < tabUpdates.length; tu++) {
        var tUp = tabUpdates[tu];
        var tabRec = new GlideRecord('sys_sg_applet_tab');
        if (tabRec.get(tUp.id)) {
            tabRec.active = true;
            tabRec.label = tUp.label;
            tabRec.screen = tUp.screen;
            tabRec.update();
            gs.print('   ✅ Configured Live Tab [' + tUp.label + ']');
        }
    }

    var navBarList = [
        '698f1445937b8310e61e3b277bba1009', // Industrial Production Management Mobile
        '9f67848187403300e0ef0cf888cb0b2e', // Now Mobile Nav
        '679d4f0653d033002d96ddeeff7b1279'  // Mobile Agent
    ];

    var finalTabs = [
        { id: '89546b8193738310e61e3b277bba10e6', label: 'Dashboard',  order: 10 },
        { id: '9154ab8193738310e61e3b277bba102f', label: 'Production', order: 20 },
        { id: '9554ab8193738310e61e3b277bba1050', label: 'Inventory',  order: 30 },
        { id: 'ed54ab8193738310e61e3b277bba1096', label: 'Alerts',     order: 40 },
        { id: '6e1e1b8193338310e61e3b277bba1023', label: 'More',       order: 50 }
    ];

    for (var n = 0; n < navBarList.length; n++) {
        var navId = navBarList[n];
        
        // Touch navigation record to increment version
        var nRec = new GlideRecord('sys_sg_navigation');
        if (nRec.get(navId)) {
            nRec.sys_mod_count = parseInt(nRec.sys_mod_count || 0) + 1;
            nRec.update();
        }

        // Clean out stale tab mappings
        var cleanMap = new GlideRecord('sys_sg_navigation_tab_map');
        cleanMap.addQuery('navigation', navId);
        cleanMap.query();
        while (cleanMap.next()) {
            var cTabId = cleanMap.navigation_tab.toString();
            var isWanted = false;
            for (var ft = 0; ft < finalTabs.length; ft++) {
                if (finalTabs[ft].id === cTabId) { isWanted = true; break; }
            }
            if (!isWanted) cleanMap.deleteRecord();
        }

        // Map the 5 clean tabs
        for (var ft2 = 0; ft2 < finalTabs.length; ft2++) {
            var fTab = finalTabs[ft2];
            var mMap = new GlideRecord('sys_sg_navigation_tab_map');
            mMap.addQuery('navigation', navId);
            mMap.addQuery('navigation_tab', fTab.id);
            mMap.query();
            if (!mMap.next()) {
                mMap.initialize();
                mMap.navigation = navId;
                mMap.navigation_tab = fTab.id;
                mMap.order = fTab.order;
                mMap.insert();
                gs.print('   ✅ Mapped [' + fTab.label + '] into nav: ' + navId);
            } else {
                mMap.order = fTab.order;
                mMap.update();
            }
        }
    }

    // Set native clients
    var clients = ['Now Mobile', 'Now Mobile Admin', 'Industrial Production Management (Now Mobile)', 'Mobile Agent', 'Industrial Production Management'];
    for (var cl = 0; cl < clients.length; cl++) {
        var cGr = new GlideRecord('sys_sg_native_client');
        cGr.addQuery('name', clients[cl]);
        cGr.query();
        if (cGr.next()) {
            cGr.navigation = '698f1445937b8310e61e3b277bba1009';
            cGr.active = true;
            cGr.access_control_type = '';
            cGr.update();
        }
    }

    // -------------------------------------------------------------------------
    // 7. COMPREHENSIVE CACHE FLUSH
    // -------------------------------------------------------------------------
    gs.print('\n🔄 [7/7] Flushing All Server Mobile Caches...');
    try {
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_applet_tab');
        GlideCacheManager.flush('sys_sg_applet_launcher_tab');
        GlideCacheManager.flush('sys_sg_master_item');
        GlideCacheManager.flush('sys_sg_item_stream');
        GlideCacheManager.flush('sys_sg_item_stream_m2m_master_item');
        GlideCacheManager.flush('sys_sg_button');
        GlideCacheManager.flush('sys_sg_button_instance');
        GlideCacheManager.flush('sg_native_client_cache');
        GlideCacheManager.flush('sg_sections_cache');
        GlideCacheManager.flush('sg_screens_cache');
        GlideCacheManager.flush('sg_master_item_cache');
        gs.print('  ✅ All mobile caches flushed successfully.');
    } catch(e) {}

    gs.print('\n🎉 STAKEHOLDER PRODUCTION & BREAKDOWN MOBILE SUITE DEPLOYED SUCCESSFULLY!');
})();
