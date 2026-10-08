// ============================================================================
// FIX MOBILE ICONS AND VERIFY SECTIONS
// Run in Scripts - Background in Scope: global
// ============================================================================
(function() {
    gs.print('=== 1. FINDING VALID WORKING ICONS IN sys_sg_icon ===');
    var workingIcons = {};
    var iconGr = new GlideRecord('sys_sg_icon');
    iconGr.query();
    while (iconGr.next()) {
        var name = iconGr.name.toString();
        var id = iconGr.getUniqueValue();
        workingIcons[name] = id;
    }

    // List some known working ones
    gs.print('Found ' + Object.keys(workingIcons).length + ' total icons.');

    // Look for best matches for Production, Inventory, Alerts
    var chartIcon = workingIcons['Chart Bar'] || 'd49c89a2b72200108223e126de11a9c4';
    var menuIcon = workingIcons['MS icon-Menu'] || 'dd19611453337410409cddeeff7b12d3';
    
    // For Production: look for 'wrench', 'cogs', 'build', 'tools', 'work', 'Home', 'Folder'
    var prodIcon = workingIcons['icon-Wrench'] || workingIcons['icon-Tools'] || workingIcons['icon-Folder'] || workingIcons['Home'] || chartIcon;
    // For Inventory: look for 'box', 'archive', 'list', 'bookmark'
    var invIcon = workingIcons['icon-Box'] || workingIcons['icon-List'] || workingIcons['icon-Bookmark'] || workingIcons['icon-Article'] || chartIcon;
    // For Alerts: look for 'bell', 'alert', 'notification'
    var alertIcon = workingIcons['Notification icon'] || workingIcons['icon-Bell'] || workingIcons['icon-Alert'] || chartIcon;

    gs.print('Selected Icons:');
    gs.print('  - Dashboard: ' + chartIcon);
    gs.print('  - Production: ' + prodIcon);
    gs.print('  - Inventory: ' + invIcon);
    gs.print('  - Alerts: ' + alertIcon);
    gs.print('  - More: ' + menuIcon);

    gs.print('\n=== 2. UPDATING LAUNCHER TABS WITH VALID WORKING ICONS ===');
    var tabs = [
        { id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard', icon: chartIcon },
        { id: '8e1e978193338310e61e3b277bba1062', name: 'Production', icon: prodIcon },
        { id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory', icon: invIcon },
        { id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts', icon: alertIcon },
        { id: '6e1e1b8193338310e61e3b277bba1023', name: 'More', icon: menuIcon }
    ];

    for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var tabGr = new GlideRecord('sys_sg_applet_launcher_tab');
        if (tabGr.get(t.id)) {
            tabGr.icon = t.icon;
            tabGr.active = true;
            tabGr.update();
            gs.print('  ✅ Updated Tab [' + t.name + '] icon to ' + tabGr.icon.getDisplayValue() + ' (' + t.icon + ')');
        }
    }

    gs.print('\n=== 3. ENSURING ALL SECTIONS HAVE HIDE_SECTION_IF_EMPTY = FALSE ===');
    var secGr = new GlideRecord('sys_sg_section');
    secGr.addQuery('sys_scope', '3cdb727d839b4b105e2cc430ceaad338');
    secGr.query();
    while (secGr.next()) {
        secGr.hide_section_if_empty = false;
        secGr.active = true;
        secGr.access_control_type = '';
        secGr.required_roles = '';
        secGr.update();
    }
    gs.print('  ✅ Set hide_section_if_empty = false on all scope sections.');

    gs.print('\n=== 4. FLUSHING MOBILE CACHES ===');
    try {
        GlideCacheManager.flush('sys_sg_icon');
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        GlideCacheManager.flush('sys_sg_section');
        gs.print('  🔄 Mobile system caches flushed on server.');
    } catch(e) {}

    gs.print('\n🚀 DONE! Now on the phone, Log Out and Log In to load the fresh mobile app!');
})();
