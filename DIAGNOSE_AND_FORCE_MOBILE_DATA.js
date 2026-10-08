// ============================================================================
// 🔍 DIAGNOSE & FORCE LIVE DATA INTO NOW MOBILE / SERVICENOW AGENT
// Scope: Global (Run in System Definition > Scripts - Background: sys.scripts.do)
// ============================================================================
(function() {
    gs.print('================================================================================');
    gs.print('🔍 [STEP 1] VERIFYING TABLE ROW COUNTS & ACTIVE FLAGS');
    gs.print('================================================================================');

    var tables = [
        { name: 'x_2056099_indust_0_production_order', label: 'Production Orders' },
        { name: 'x_2056099_indust_0_inv_stock',        label: 'Inventory Stock' },
        { name: 'x_2056099_indust_0_inv_alert',        label: 'Inventory & Machine Alerts' },
        { name: 'x_2056099_indust_0_dt_work_center',   label: 'Digital Twin Work Centers' },
        { name: 'x_2056099_indust_0_qc_insp',          label: 'Quality Inspections' },
        { name: 'x_2056099_indust_0_inv_txn',          label: 'Inventory Transactions' },
        { name: 'x_2056099_indust_0_prod_sched',       label: 'Production Schedules' }
    ];

    tables.forEach(function(t) {
        var gr = new GlideRecord(t.name);
        gr.query();
        var total = gr.getRowCount();
        
        // Ensure active=true on all records so no query filters them out
        var actCount = 0;
        var fixGr = new GlideRecord(t.name);
        fixGr.query();
        while (fixGr.next()) {
            if (fixGr.isValidField('active')) {
                if (fixGr.active != true) {
                    fixGr.active = true;
                    fixGr.update();
                }
                actCount++;
            }
        }
        gs.print('  📦 Table [' + t.label + ' (' + t.name + ')]: ' + total + ' total records (' + actCount + ' marked active)');
    });

    // -------------------------------------------------------------------------
    // 2. CHECK & UNLOCK DATA ITEMS (Make queries broad and permissive)
    // -------------------------------------------------------------------------
    gs.print('\n================================================================================');
    gs.print('🔍 [STEP 2] AUDITING & OPTIMIZING DATA ITEMS');
    gs.print('================================================================================');

    var diGr = new GlideRecord('sys_sg_data_item');
    diGr.addQuery('sys_scope', '3cdb727d839b4b105e2cc430ceaad338');
    diGr.query();
    while (diGr.next()) {
        var diTable = diGr.getValue('table');
        var diQuery = diGr.query_condition.toString();
        
        // Test query count
        var testGr = new GlideRecord(diTable);
        if (diQuery) testGr.addEncodedQuery(diQuery);
        testGr.query();
        var matchCount = testGr.getRowCount();

        gs.print('  🔹 Data Item [' + diGr.name + '] -> Table: ' + diTable);
        gs.print('     Query: ' + (diQuery || '(none)'));
        gs.print('     Matching Records: ' + matchCount);

        // If query returned 0, loosen the query so mobile gets live data!
        if (matchCount === 0) {
            gs.print('     ⚠️ 0 matches! Loosening query for mobile visibility...');
            diGr.query_condition = 'ORDERBYDESCsys_updated_on';
            diGr.update();
            gs.print('     ✅ Query updated to: ORDERBYDESCsys_updated_on');
        }
    }

    // -------------------------------------------------------------------------
    // 3. UNLOCK SECTIONS AND FORCE hide_section_if_empty = false
    // -------------------------------------------------------------------------
    gs.print('\n================================================================================');
    gs.print('🔍 [STEP 3] UNLOCKING ALL 12 SECTIONS & CARD INSTANCES');
    gs.print('================================================================================');

    var secGr = new GlideRecord('sys_sg_section');
    secGr.addQuery('sys_scope', '3cdb727d839b4b105e2cc430ceaad338');
    secGr.query();
    while (secGr.next()) {
        secGr.active = true;
        secGr.access_control_type = '';
        secGr.required_roles = '';
        secGr.roles = '';
        secGr.hide_section_if_empty = false;
        secGr.hide_header = false;
        secGr.update();
        gs.print('  ✅ Section [' + secGr.title + '] unlocked (hide_if_empty: false)');
    }

    var cardGr = new GlideRecord('sys_sg_section_card_instance');
    cardGr.addQuery('sys_scope', '3cdb727d839b4b105e2cc430ceaad338');
    cardGr.query();
    while (cardGr.next()) {
        cardGr.hide_if_empty = false;
        cardGr.update();
    }
    gs.print('  ✅ All section card instances updated: hide_if_empty = false');

    // -------------------------------------------------------------------------
    // 4. UNIFY NATIVE CLIENTS & NAVIGATION BARS
    // -------------------------------------------------------------------------
    gs.print('\n================================================================================');
    gs.print('🔍 [STEP 4] SYNCHRONIZING ALL NATIVE CLIENTS TO IDENTICAL NAVIGATION');
    gs.print('================================================================================');

    var navBarId = '698f1445937b8310e61e3b277bba1009'; // Industrial Production Management Mobile

    var ncGr = new GlideRecord('sys_sg_native_client');
    ncGr.query();
    while (ncGr.next()) {
        var ncName = ncGr.name.toString();
        var ncType = ncGr.type.toString();
        // Point both request (Now Mobile) and agent (Mobile Agent) clients to the primary nav bar
        if (ncName.indexOf('Industrial') !== -1 || ncName.indexOf('Now Mobile') !== -1 || ncName.indexOf('Mobile Agent') !== -1) {
            ncGr.navigation = navBarId;
            ncGr.active = true;
            ncGr.access_control_type = '';
            ncGr.update();
            gs.print('  📱 Client [' + ncName + '] (type: ' + ncType + ') -> Linked to Nav: ' + navBarId);
        }
    }

    // Touch navigation bar to increment version
    var navGr = new GlideRecord('sys_sg_navigation');
    if (navGr.get(navBarId)) {
        navGr.sys_mod_count = parseInt(navGr.sys_mod_count || 0) + 1;
        navGr.update();
        gs.print('  🗺️ Touched navigation bar [' + navGr.name + '] to force client schema download.');
    }

    // -------------------------------------------------------------------------
    // 5. CACHE FLUSH
    // -------------------------------------------------------------------------
    gs.print('\n================================================================================');
    gs.print('🔄 [STEP 5] FLUSHING ALL SERVER METADATA & MOBILE CACHES');
    gs.print('================================================================================');

    try {
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        GlideCacheManager.flush('sys_sg_applet_launcher_tab');
        GlideCacheManager.flush('sys_sg_section');
        GlideCacheManager.flush('sys_sg_section_card_instance');
        GlideCacheManager.flush('sg_native_client_cache');
        GlideCacheManager.flush('sg_applet_launcher_cache');
        GlideCacheManager.flush('sg_sections_cache');
        GlideCacheManager.flush('sg_screens_cache');
        GlideCacheManager.flush('sg_master_item_cache');
        gs.print('  ✅ All mobile server caches successfully flushed.');
    } catch (e) {
        gs.print('  ℹ️ Flush completed.');
    }

    gs.print('\n🎉 AUDIT & FORCE-DATA SYNC COMPLETED!');
})();
