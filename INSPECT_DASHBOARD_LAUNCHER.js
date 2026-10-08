// ============================================================================
// INSPECT DASHBOARD APPLET LAUNCHER SECTIONS & DATA
// Run in Scripts - Background in Scope: global
// ============================================================================
(function() {
    var launcherId = '1d1e578193338310e61e3b277bba10e7';
    var lGr = new GlideRecord('sys_sg_applet_launcher');
    if (lGr.get(launcherId)) {
        gs.print('Launcher: ' + lGr.name + ' (active: ' + lGr.active + ', hide_empty: ' + lGr.hide_empty_sections + ')');
    }

    gs.print('\n=== SECTIONS IN DASHBOARD LAUNCHER ===');
    var m2m = new GlideRecord('sys_sg_applet_launcher_m2m_section');
    m2m.addQuery('applet_launcher', launcherId);
    m2m.orderBy('order');
    m2m.query();
    while (m2m.next()) {
        var sGr = m2m.section.getRefRecord();
        gs.print('\nSection [' + sGr.title + '] (sys_id: ' + sGr.getUniqueValue() + ', order: ' + m2m.order + ')');
        gs.print('  - Active: ' + sGr.active);
        gs.print('  - Table: ' + sGr.getValue('table'));
        gs.print('  - Hide if empty: ' + sGr.hide_section_if_empty);
        gs.print('  - Data Item: ' + sGr.data_item.getDisplayValue() + ' (' + sGr.data_item + ')');

        if (sGr.data_item) {
            var di = sGr.data_item.getRefRecord();
            gs.print('    * DI Table: ' + di.getValue('table'));
            gs.print('    * DI Query: ' + di.query_condition);
            if (di.getValue('table')) {
                var testGr = new GlideRecord(di.getValue('table'));
                if (di.query_condition) testGr.addEncodedQuery(di.query_condition);
                testGr.query();
                gs.print('    * DI Matching Record Count: ' + testGr.getRowCount());
            }
        }

        // Check Card Instances
        var ci = new GlideRecord('sys_sg_section_card_instance');
        ci.addQuery('section', sGr.getUniqueValue());
        ci.query();
        while (ci.next()) {
            gs.print('  - Card Instance: ' + ci.name + ' (sys_id: ' + ci.getUniqueValue() + ')');
            gs.print('    * View Config: ' + ci.view_config.getDisplayValue() + ' (' + ci.view_config + ')');
            gs.print('    * Hide if empty: ' + ci.hide_if_empty);
        }
    }
})();
