// Inspect Navigation Tabs and their targets
(function() {
    var navId = '698f1445937b8310e61e3b277bba1009';
    var mapGr = new GlideRecord('sys_sg_navigation_tab_map');
    mapGr.addQuery('navigation', navId);
    mapGr.orderBy('order');
    mapGr.query();
    
    gs.print('=== NAVIGATION TAB MAP FOR ' + navId + ' ===');
    while (mapGr.next()) {
        var tabId = mapGr.navigation_tab.toString();
        gs.print('\nOrder: ' + mapGr.order + ' | Tab ID: ' + tabId);
        
        // Check if sys_sg_applet_launcher_tab
        var altGr = new GlideRecord('sys_sg_applet_launcher_tab');
        if (altGr.get(tabId)) {
            gs.print('  Type: sys_sg_applet_launcher_tab');
            gs.print('  Label: ' + altGr.label);
            gs.print('  Launcher: ' + altGr.applet_launcher.getDisplayValue() + ' (' + altGr.applet_launcher + ')');
        }
        
        // Check if sys_sg_applet_tab
        var atGr = new GlideRecord('sys_sg_applet_tab');
        if (atGr.get(tabId)) {
            gs.print('  Type: sys_sg_applet_tab');
            gs.print('  Label: ' + atGr.label);
            gs.print('  Screen: ' + atGr.screen.getDisplayValue() + ' (' + atGr.screen + ')');
            gs.print('  Screen Class: ' + atGr.screen.sys_class_name);
        }
    }
})();
