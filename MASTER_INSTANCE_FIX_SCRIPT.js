/**
 * =========================================================================================
 * SERVICENOW MASTER INSTANCE FIX SCRIPT
 * =========================================================================================
 * Scope: Industrial Inventory and Production Management (x_2056099_indust_0 / Global)
 * Target Tables: 
 *   - sys_sg_navigation_tab_map (Mobile Navigation Tabs)
 *   - sys_sg_native_client (Mobile Client Configuration)
 *   - sys_atf_test_suite (ATF Suite Parent Hierarchy)
 *   - sys_atf_test_suite_test (ATF Test Suite - Test M2M Linkages)
 *
 * HOW TO EXECUTE IN ANY SERVICENOW INSTANCE:
 * 1. Open your instance in a browser: https://<instance-name>.service-now.com/
 * 2. In the Left Navigation Filter, type: Scripts - Background
 *    (or go directly to URL: https://<instance-name>.service-now.com/sys.scripts.do)
 * 3. Select Scope: "Global" or "Industrial Inventory and Production Management"
 * 4. Paste this entire script into the text area.
 * 5. Click "Run script".
 * =========================================================================================
 */

(function runMasterInstanceFix() {
    gs.print('===================================================================');
    gs.print('🚀 STARTING SERVICENOW MASTER CONFIGURATION FIX');
    gs.print('===================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338'; // Industrial Inventory and Production Management

    // -------------------------------------------------------------------------
    // PART 1: FIX MOBILE NAVIGATION (NOW MOBILE & MOBILE AGENT)
    // -------------------------------------------------------------------------
    gs.print('\n📱 [PART 1/3] Configuring Mobile Navigation Bars...');

    var navBars = [
        { name: 'Mobile Agent', sys_id: '679d4f0653d033002d96ddeeff7b1279', label: 'Mobile Agent' },
        { name: 'Now Mobile Nav', sys_id: '9f67848187403300e0ef0cf888cb0b2e', label: 'Now Mobile' }
    ];

    var mobileTabs = [
        { sys_id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard', orderAgent: 10, orderNow: 20 },
        { sys_id: '8e1e978193338310e61e3b277bba1062', name: 'Production', orderAgent: 20, orderNow: 30 },
        { sys_id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',  orderAgent: 30, orderNow: 40 },
        { sys_id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',     orderAgent: 40, orderNow: 50 },
        { sys_id: '6e1e1b8193338310e61e3b277bba1023', name: 'More',       orderAgent: 50, orderNow: 55 }
    ];

    var tabsLinked = 0;
    for (var n = 0; n < navBars.length; n++) {
        var nb = navBars[n];
        
        // Find Navigation record
        var navGr = new GlideRecord('sys_sg_navigation');
        var navFound = false;
        if (navGr.get(nb.sys_id)) {
            navFound = true;
        } else {
            navGr.addQuery('name', nb.name);
            navGr.query();
            if (navGr.next()) {
                navFound = true;
                nb.sys_id = navGr.getUniqueValue();
            }
        }

        if (!navFound) {
            gs.print('   ⚠️ Navigation bar "' + nb.name + '" not found in this instance. Skipping.');
            continue;
        }

        for (var t = 0; t < mobileTabs.length; t++) {
            var tab = mobileTabs[t];
            
            // Check if tab exists
            var tabGr = new GlideRecord('sys_sg_navigation_tab');
            var tabFound = false;
            if (tabGr.get(tab.sys_id)) {
                tabFound = true;
            } else {
                tabGr.addQuery('label', tab.name);
                tabGr.addQuery('sys_scope', scopeId);
                tabGr.query();
                if (tabGr.next()) {
                    tabFound = true;
                    tab.sys_id = tabGr.getUniqueValue();
                }
            }

            if (!tabFound) {
                gs.print('   ⚠️ Tab "' + tab.name + '" not found. Skipping.');
                continue;
            }

            // Check if mapping already exists
            var mapGr = new GlideRecord('sys_sg_navigation_tab_map');
            mapGr.addQuery('navigation', nb.sys_id);
            mapGr.addQuery('navigation_tab', tab.sys_id);
            mapGr.query();
            if (!mapGr.next()) {
                mapGr.initialize();
                mapGr.navigation = nb.sys_id;
                mapGr.navigation_tab = tab.sys_id;
                mapGr.order = (nb.label === 'Mobile Agent') ? tab.orderAgent : tab.orderNow;
                var mapId = mapGr.insert();
                if (mapId) {
                    tabsLinked++;
                    gs.print('   ✅ Added [' + tab.name + '] to ' + nb.label + ' (order: ' + mapGr.order + ')');
                }
            } else {
                gs.print('   ℹ️ [' + tab.name + '] already mapped in ' + nb.label);
            }
        }
    }

    // Update Mobile Native Client
    var clientGr = new GlideRecord('sys_sg_native_client');
    clientGr.addQuery('name', 'Industrial Production Management');
    clientGr.query();
    if (clientGr.next()) {
        clientGr.label = 'Industrial Production Management';
        clientGr.active = true;
        clientGr.update();
        gs.print('   ✅ Updated sys_sg_native_client "Industrial Production Management" label and active status.');
    }

    // -------------------------------------------------------------------------
    // PART 2: FIX ATF MASTER SUITE HIERARCHY
    // -------------------------------------------------------------------------
    gs.print('\n🏆 [PART 2/3] Linking Child ATF Suites to Master Suite...');

    var masterSuiteId = 'e1a078fac3af0710239a32f1b4020000';
    var childSuiteIds = [
        'e1a078fac3af0710239a32f1b4020001', // Suite 1: Customer Demand
        'e1a078fac3af0710239a32f1b4020002', // Suite 2: Inventory BOM
        'e1a078fac3af0710239a32f1b4020003', // Suite 3: Machinery IoT
        'e1a078fac3af0710239a32f1b4020004', // Suite 4: Workforce Quality
        'e1a078fac3af0710239a32f1b4020005', // Suite 5: Supplier Reliability
        'e1a078fac3af0710239a32f1b4020006', // Suite 6: Capacity Bottlenecks
        'e1a078fac3af0710239a32f1b4020007', // Suite 7: AI Planning Rescheduling
        'e1a078fac3af0710239a32f1b4020008', // Suite 8: Digital Twin Mobile GenAI
        'e3a99b1047bb0710527276a4416d43f0', // Industrial Digital Twin Sandbox
        '5bfcfad007a14dc095c88b512a258266', // Procurement Application
        '9f4afc1a7baf49989383dd179d859be2'  // Customer Portal
    ];

    var suitesUpdated = 0;
    for (var s = 0; s < childSuiteIds.length; s++) {
        var csGr = new GlideRecord('sys_atf_test_suite');
        if (csGr.get(childSuiteIds[s])) {
            if (csGr.parent != masterSuiteId) {
                csGr.parent = masterSuiteId;
                csGr.update();
                suitesUpdated++;
                gs.print('   ✅ Linked Suite [' + csGr.name + '] -> Master Suite');
            } else {
                gs.print('   ℹ️ Suite [' + csGr.name + '] already linked to Master Suite');
            }
        }
    }

    // -------------------------------------------------------------------------
    // PART 3: LINK ALL 70 ATF TEST CASES TO THEIR SUITES
    // -------------------------------------------------------------------------
    gs.print('\n🔬 [PART 3/3] Synchronizing all 70 ATF Test Cases into Suites...');

    var testMappings = [
        // Suite 1: Customer Demand & Order Fulfillment ATF Suite (e1a078fac3af0710239a32f1b4020001)
        { suite: 'e1a078fac3af0710239a32f1b4020001', test: 'e1a078fac3af0710239a32f1b4021001', name: 'TC-POS-01: Valid Customer Order Intake & Priority SLA', order: 10 },
        { suite: 'e1a078fac3af0710239a32f1b4020001', test: 'e1a078fac3af0710239a32f1b4021002', name: 'TC-NEG-01: Past-Due or Unfulfillable Delivery Date Rejection', order: 20 },
        { suite: 'e1a078fac3af0710239a32f1b4020001', test: 'e1a078fac3af0710239a32f1b4021003', name: 'TC-POS-02: Weighted Historical Demand Forecasting', order: 30 },
        { suite: 'e1a078fac3af0710239a32f1b4020001', test: 'e1a078fac3af0710239a32f1b4021004', name: 'TC-NEG-02: Zero-History Volatility Fallback Handling', order: 40 },

        // Suite 2: Inventory, BOM & Material Traceability ATF Suite (e1a078fac3af0710239a32f1b4020002)
        { suite: 'e1a078fac3af0710239a32f1b4020002', test: 'e1a078fac3af0710239a32f1b4022001', name: 'TC-POS-03: Stock Allocation with Safety Buffer Preservation', order: 50 },
        { suite: 'e1a078fac3af0710239a32f1b4020002', test: 'e1a078fac3af0710239a32f1b4022002', name: 'TC-NEG-03: Stockout Preemption & Quarantine Stock Isolation', order: 60 },
        { suite: 'e1a078fac3af0710239a32f1b4020002', test: 'e1a078fac3af0710239a32f1b4022003', name: 'TC-POS-04: Multi-Level BOM Explosion Resolver', order: 70 },
        { suite: 'e1a078fac3af0710239a32f1b4020002', test: 'e1a078fac3af0710239a32f1b4022004', name: 'TC-NEG-04: Circular BOM Definition & Missing Part Detection', order: 80 },
        { suite: 'e1a078fac3af0710239a32f1b4020002', test: 'e1a078fac3af0710239a32f1b4022005', name: 'TC-POS-14: Complete Digital Genealogy Forward/Backward Trace', order: 90 },
        { suite: 'e1a078fac3af0710239a32f1b4020002', test: 'e1a078fac3af0710239a32f1b4022006', name: 'TC-NEG-14: Broken Traceability Chain Enforcement', order: 100 },

        // Suite 3: Machinery, IoT & Predictive Maintenance ATF Suite (e1a078fac3af0710239a32f1b4020003)
        { suite: 'e1a078fac3af0710239a32f1b4020003', test: 'e1a078fac3af0710239a32f1b4023001', name: 'TC-POS-06: Live IoT Telemetry Ingestion (Normal Conditions)', order: 110 },
        { suite: 'e1a078fac3af0710239a32f1b4020003', test: 'e1a078fac3af0710239a32f1b4023002', name: 'TC-NEG-06: Critical Thermal & Vibration Breach Alerting', order: 120 },
        { suite: 'e1a078fac3af0710239a32f1b4020003', test: 'e1a078fac3af0710239a32f1b4023003', name: 'TC-POS-07: Automated Maintenance Work Order Dispatch', order: 130 },
        { suite: 'e1a078fac3af0710239a32f1b4020003', test: 'e1a078fac3af0710239a32f1b4023004', name: 'TC-NEG-07: Machine Down Dynamic Schedule Lockout', order: 140 },
        { suite: 'e1a078fac3af0710239a32f1b4020003', test: 'e1a078fac3af0710239a32f1b4023005', name: 'TC-POS-09: Downtime Incident Logging & Categorization', order: 150 },
        { suite: 'e1a078fac3af0710239a32f1b4020003', test: 'e1a078fac3af0710239a32f1b4023006', name: 'TC-NEG-09: Recurring Operator Fault Spike Warning', order: 160 },

        // Suite 4: Workforce Planning & Quality Control ATF Suite (e1a078fac3af0710239a32f1b4020004)
        { suite: 'e1a078fac3af0710239a32f1b4020004', test: 'e1a078fac3af0710239a32f1b4024001', name: 'TC-POS-08: Shift Crew Skill & Capacity Matching', order: 170 },
        { suite: 'e1a078fac3af0710239a32f1b4020004', test: 'e1a078fac3af0710239a32f1b4024002', name: 'TC-NEG-08: Uncertified Operator Skill Mismatch Rejection', order: 180 },
        { suite: 'e1a078fac3af0710239a32f1b4020004', test: 'e1a078fac3af0710239a32f1b4024003', name: 'TC-POS-11: Quality Batch Inspection Pass & Release', order: 190 },
        { suite: 'e1a078fac3af0710239a32f1b4020004', test: 'e1a078fac3af0710239a32f1b4024004', name: 'TC-NEG-11: Defect Scrap Quarantine & Rework Routing', order: 200 },
        { suite: 'e1a078fac3af0710239a32f1b4020004', test: 'e1a078fac3af0710239a32f1b4024005', name: 'TC-POS-12: Weekly Rolling Defect Rate Within Safety Limit', order: 210 },
        { suite: 'e1a078fac3af0710239a32f1b4020004', test: 'e1a078fac3af0710239a32f1b4024006', name: 'TC-NEG-12: Defect Threshold Breach & Production Line Hold', order: 220 },

        // Suite 5: Supplier Reliability & Dynamic Sourcing ATF Suite (e1a078fac3af0710239a32f1b4020005)
        { suite: 'e1a078fac3af0710239a32f1b4020005', test: '6d1daa6b2f9f407ea5d7c3e995f830b6', name: 'Connected Chain End-to-End Test', order: 230 },
        { suite: 'e1a078fac3af0710239a32f1b4020005', test: 'a4e70ef75bed4a558798efcc6886a482', name: 'Supplier Threshold Alert Test', order: 240 },
        { suite: 'e1a078fac3af0710239a32f1b4020005', test: 'b201fd33cd5245f5b0bdc4e236114815', name: 'Procurement E2E Lifecycle Test', order: 245 },
        { suite: 'e1a078fac3af0710239a32f1b4020005', test: '67859c4f22ae482390b38b513cf28b91', name: 'Auto-Select Best Supplier Test', order: 248 },

        // Suite 6: Capacity, Bottlenecks & Real-Time Monitoring ATF Suite (e1a078fac3af0710239a32f1b4020006)
        { suite: 'e1a078fac3af0710239a32f1b4020006', test: 'e1a078fac3af0710239a32f1b4026001', name: 'TC-POS-15: Balanced Work Center Load Distribution', order: 250 },
        { suite: 'e1a078fac3af0710239a32f1b4020006', test: 'e1a078fac3af0710239a32f1b4026002', name: 'TC-NEG-15: Bottleneck Overload Detection & Visual Warning', order: 260 },
        { suite: 'e1a078fac3af0710239a32f1b4020006', test: 'e1a078fac3af0710239a32f1b4026003', name: 'TC-POS-20: Real-Time Telemetry Stream Ingestion', order: 270 },
        { suite: 'e1a078fac3af0710239a32f1b4020006', test: 'e1a078fac3af0710239a32f1b4026004', name: 'TC-NEG-20: Sensor Heartbeat Signal Loss Timeout', order: 280 },
        { suite: 'e1a078fac3af0710239a32f1b4020006', test: 'e1a078fac3af0710239a32f1b4026005', name: 'TC-POS-21: Executive Control Tower OEE & OTD Aggregation', order: 290 },
        { suite: 'e1a078fac3af0710239a32f1b4020006', test: 'e1a078fac3af0710239a32f1b4026006', name: 'TC-NEG-21: Delivery At-Risk Executive Notification', order: 300 },

        // Suite 7: AI Planning, Rescheduling & Work Order Execution ATF Suite (e1a078fac3af0710239a32f1b4020007)
        { suite: 'e1a078fac3af0710239a32f1b4020007', test: 'e1a078fac3af0710239a32f1b4027001', name: 'TC-POS-05: Constraint-Feasible Schedule Generation', order: 310 },
        { suite: 'e1a078fac3af0710239a32f1b4020007', test: 'e1a078fac3af0710239a32f1b4027002', name: 'TC-NEG-05: Overlapping Resource Collision Prevention', order: 320 },
        { suite: 'e1a078fac3af0710239a32f1b4020007', test: 'e1a078fac3af0710239a32f1b4027003', name: 'TC-POS-17: Priority Rush Order Resequencing', order: 330 },
        { suite: 'e1a078fac3af0710239a32f1b4020007', test: 'e1a078fac3af0710239a32f1b4027004', name: 'TC-NEG-17: Multi-Machine Failure Infeasibility Warning', order: 340 },
        { suite: 'e1a078fac3af0710239a32f1b4020007', test: 'e1a078fac3af0710239a32f1b4027005', name: 'TC-POS-18: Approved Schedule Work Order Release', order: 350 },
        { suite: 'e1a078fac3af0710239a32f1b4020007', test: 'e1a078fac3af0710239a32f1b4027006', name: 'TC-NEG-18: Zero-Stock Work Order Material Hold', order: 360 },

        // Suite 8: Digital Twin, What-If, Mobile & GenAI Suite (e1a078fac3af0710239a32f1b4020008)
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028001', name: 'TC-POS-16: Non-Destructive What-If Simulation Sandboxing', order: 370 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028002', name: 'TC-NEG-16: Unmitigated Baseline Operational Drop Warning', order: 380 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028003', name: 'TC-POS-19: Mobile 1-Tap Operation Completion', order: 390 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028004', name: 'TC-NEG-19: Unauthorized Role Action Rejection', order: 400 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028005', name: 'TC-POS-22: GenAI Natural Language Intent Extraction', order: 410 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028006', name: 'TC-NEG-22: Ambiguous / Malformed Prompt Rejection', order: 420 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028007', name: 'TC-POS-23: Nominal Cycle Time Recalibration via EMA', order: 430 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028008', name: 'TC-NEG-23: Telemetry Extreme Outlier Filtering', order: 440 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028009', name: 'TC-POS-13: Priority Multi-Tier Alert Escalation', order: 450 },
        { suite: 'e1a078fac3af0710239a32f1b4020008', test: 'e1a078fac3af0710239a32f1b4028010', name: 'TC-NEG-13: Duplicate Alert Storm Suppression', order: 460 },

        // Industrial Digital Twin & What-If Sandbox ATF Suite (e3a99b1047bb0710527276a4416d43f0)
        { suite: 'e3a99b1047bb0710527276a4416d43f0', test: '67a9db1047bb0710527276a4416d4335', name: 'ATF-DT-01: Digital Twin Work Centers & IoT Telemetry Validation', order: 470 },
        { suite: 'e3a99b1047bb0710527276a4416d43f0', test: 'f7a9db1047bb0710527276a4416d4378', name: 'ATF-DT-02: Machine Fleet Status & Automated Downtime Dispatch', order: 480 },
        { suite: 'e3a99b1047bb0710527276a4416d43f0', test: '40b9db1047bb0710527276a4416d43c8', name: 'ATF-DT-03: What-If Disruption Modeling & Multi-Strategy Generation', order: 490 },
        { suite: 'e3a99b1047bb0710527276a4416d43f0', test: '84b9db1047bb0710527276a4416d43f2', name: 'ATF-DT-04: SourcingEngine Adaptive Rescheduling & Recovery Engine', order: 500 },
        { suite: 'e3a99b1047bb0710527276a4416d43f0', test: '00b91f1047bb0710527276a4416d4342', name: 'ATF-DT-05: Inter-Plant Buffer Stock Rebalance & Sourcing Hedge', order: 510 },
        { suite: 'e3a99b1047bb0710527276a4416d43f0', test: '9cb91f1047bb0710527276a4416d435f', name: 'ATF-DT-06: UI Page Integrity & Visual Component Verification', order: 520 },
        { suite: 'e3a99b1047bb0710527276a4416d43f0', test: 'e1a078fac3af0710239a32f1b4012001', name: 'ATF-DT-07: Prompt GenAI, Multi-Resequencing & IoT Streaming Validation', order: 530 },
        { suite: 'e3a99b1047bb0710527276a4416d43f0', test: 'e1a078fac3af0710239a32f1b4013001', name: 'Order Lifecycle E2E: Create Customer Order to Production Schedule', order: 540 },

        // Procurement Application Test Suite (5bfcfad007a14dc095c88b512a258266)
        { suite: '5bfcfad007a14dc095c88b512a258266', test: '6d1daa6b2f9f407ea5d7c3e995f830b6', name: 'Connected Chain End-to-End Test', order: 550 },
        { suite: '5bfcfad007a14dc095c88b512a258266', test: 'a4e70ef75bed4a558798efcc6886a482', name: 'Supplier Threshold Alert Test', order: 560 },
        { suite: '5bfcfad007a14dc095c88b512a258266', test: 'b201fd33cd5245f5b0bdc4e236114815', name: 'Procurement E2E Lifecycle Test', order: 570 },
        { suite: '5bfcfad007a14dc095c88b512a258266', test: '67859c4f22ae482390b38b513cf28b91', name: 'Auto-Select Best Supplier Test', order: 580 },

        // Customer Portal (9f4afc1a7baf49989383dd179d859be2)
        { suite: '9f4afc1a7baf49989383dd179d859be2', test: '70e03858fc8e42e58be8340392694b1a', name: 'ATF-CP-01: Customer Portal Identity & Dashboard', order: 590 },
        { suite: '9f4afc1a7baf49989383dd179d859be2', test: 'ee47cf49e13e498e9c2c55306ed8487b', name: 'ATF-CP-02: Product Catalog Browsing', order: 600 },
        { suite: '9f4afc1a7baf49989383dd179d859be2', test: 'd1ec4f0a11074ed59a458a2defea0560', name: 'ATF-CP-03: Product Detail to Cart', order: 610 },
        { suite: '9f4afc1a7baf49989383dd179d859be2', test: '75ed3fa4a206424e857006edbccca65d', name: 'ATF-CP-04: Customer Order Submission', order: 620 },
        { suite: '9f4afc1a7baf49989383dd179d859be2', test: 'ff62096f71334557a9a5ea68d7c08b6e', name: 'ATF-CP-05: Customer Order Isolation', order: 630 },
        { suite: '9f4afc1a7baf49989383dd179d859be2', test: 'd77ffdd23afe44f384598d9cc5545437', name: 'ATF-CP-06: Customer Order Detail', order: 640 },

        // Customer Portal UI (543a6589bcb84f56bec4801d354e3335)
        { suite: '543a6589bcb84f56bec4801d354e3335', test: '1a940c2524284aeb817137abd9fe7dc5', name: 'ATF-CP-UI-01: Customer Portal Dashboard UI', order: 650 },
        { suite: '543a6589bcb84f56bec4801d354e3335', test: 'bf9b70ab62534a39a710e62f9c172ef4', name: 'ATF-CP-UI-02: Product Catalog UI', order: 660 },
        { suite: '543a6589bcb84f56bec4801d354e3335', test: 'f6b0200300434f60a85302a6ee4e596f', name: 'ATF-CP-UI-03: Product Detail and Cart UI', order: 670 },
        { suite: '543a6589bcb84f56bec4801d354e3335', test: '196e157663fb473993ff4f9aa7be08a0', name: 'ATF-CP-UI-04: Cart to Customer Order UI', order: 680 },
        { suite: '543a6589bcb84f56bec4801d354e3335', test: '2c11c7fa41dc41c081f0ba64fd5ba963', name: 'ATF-CP-UI-05: My Orders UI', order: 690 },
        { suite: '543a6589bcb84f56bec4801d354e3335', test: '3fcc98c653204b5aa0167d89f49f3c6d', name: 'ATF-CP-UI-06: Customer Order Detail UI', order: 700 },
        { suite: '543a6589bcb84f56bec4801d354e3335', test: '126f6e7ec6ec45dd9e077b161161056c', name: 'ATF-CP-UI-07: Customer Portal Navigation', order: 710 },
        { suite: '543a6589bcb84f56bec4801d354e3335', test: 'b62459484e4c41b68e6e6ce087cda99e', name: 'ATF-CP-UI-08: Customer Portal Account-Not-Linked UI', order: 720 }
    ];

    var testsCreated = 0;
    var testsExisting = 0;

    for (var i = 0; i < testMappings.length; i++) {
        var tm = testMappings[i];
        var linkGr = new GlideRecord('sys_atf_test_suite_test');
        linkGr.addQuery('test_suite', tm.suite);
        linkGr.addQuery('test', tm.test);
        linkGr.query();

        if (!linkGr.next()) {
            linkGr.initialize();
            linkGr.test_suite = tm.suite;
            linkGr.test = tm.test;
            linkGr.order = tm.order;
            linkGr.abort_on_failure = false;
            linkGr.sys_scope = scopeId;
            var newLinkId = linkGr.insert();
            if (newLinkId) {
                testsCreated++;
                gs.print('   ✅ [LINKED] Test: ' + tm.name + ' (sys_id: ' + newLinkId + ')');
            } else {
                gs.print('   ⚠️ [FAILED] Could not link: ' + tm.name);
            }
        } else {
            testsExisting++;
        }
    }

    gs.print('\n===================================================================');
    gs.print('🎉 MASTER CONFIGURATION FIX COMPLETE!');
    gs.print('   📱 Mobile Tabs Linked: ' + tabsLinked);
    gs.print('   🏆 Child Suites Linked to Master: ' + suitesUpdated);
    gs.print('   🔬 ATF Tests Linked Newly: ' + testsCreated);
    gs.print('   🔬 ATF Tests Already Linked: ' + testsExisting);
    gs.print('   🔬 Total ATF Mappings Verified: ' + (testsCreated + testsExisting));
    gs.print('===================================================================');
})();
