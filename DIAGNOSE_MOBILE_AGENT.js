// ============================================================================
// DIAGNOSE MOBILE NAVIGATION & VERIFY ALL DATA
// Run in Scripts - Background in Scope: global
// ============================================================================
(function() {
    gs.print('=== 1. MOBILE NATIVE CLIENTS ===');
    var nc = new GlideRecord('sys_sg_native_client');
    nc.query();
    while (nc.next()) {
        gs.print('Client: [' + nc.name + '] Type: [' + nc.type + '] Active: [' + nc.active + '] Nav: [' + nc.navigation.getDisplayValue() + ' (' + nc.navigation + ')]');
    }

    gs.print('\n=== 2. NAVIGATION BARS & TAB MAPPINGS ===');
    var nav = new GlideRecord('sys_sg_navigation');
    nav.query();
    while (nav.next()) {
        gs.print('Nav: [' + nav.name + '] (sys_id: ' + nav.getUniqueValue() + ') legacy_application: [' + nav.legacy_application + ']');
        var tm = new GlideRecord('sys_sg_navigation_tab_map');
        tm.addQuery('navigation', nav.getUniqueValue());
        tm.orderBy('order');
        tm.query();
        while (tm.next()) {
            var tab = tm.navigation_tab.getRefRecord();
            var tabClass = tab.getRecordClassName();
            var screenName = '';
            var targetClass = '';
            if (tabClass === 'sys_sg_applet_launcher_tab') {
                screenName = tab.applet_launcher.getDisplayValue();
                targetClass = 'sys_sg_applet_launcher';
            } else if (tabClass === 'sys_sg_applet_tab') {
                screenName = tab.screen.getDisplayValue();
                targetClass = tab.screen.getRefRecord().getRecordClassName();
            }
            gs.print('  -> Tab [' + tm.navigation_tab.getDisplayValue() + '] (order: ' + tm.order + ', class: ' + tabClass + ') -> Target: ' + screenName + ' (' + targetClass + ') Icon: ' + tab.icon.getDisplayValue());
        }
    }

    gs.print('\n=== 3. RECORD COUNTS IN DATA TABLES ===');
    var tables = [
        'x_2056099_indust_0_inv_stock',
        'x_2056099_indust_0_inv_alert',
        'x_2056099_indust_0_production_order',
        'x_2056099_indust_0_prod_sched',
        'x_2056099_indust_0_qc_insp'
    ];
    for (var i = 0; i < tables.length; i++) {
        var gr = new GlideRecord(tables[i]);
        gr.query();
        gs.print('Table [' + tables[i] + ']: ' + gr.getRowCount() + ' records');
    }
})();
