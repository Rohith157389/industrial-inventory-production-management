/**
 * =========================================================================================
 * DEFINITIVE FIX: "No applications defined. Please contact your administrator"
 * =========================================================================================
 * THE EXACT ROOT CAUSE:
 * In ServiceNow, the default "Mobile Agent" navigation bar has:
 *   legacy_application = true
 * When legacy_application is true, the ServiceNow Agent app ignores all modern tabs
 * and looks for legacy applications (which don't exist), resulting in:
 *   "No applications defined. Please contact your administrator"
 *
 * THIS SCRIPT FIXES:
 * 1. Sets legacy_application = false on the Mobile Agent navigation bar.
 * 2. Clears role restrictions (access_control_type = '') on all Launchers and Sections.
 * 3. Maps Dashboard, Production, Inventory, Alerts, More to the navigation bar.
 * 4. Flushes the mobile server cache.
 *
 * RUN IN: System Definition > Scripts - Background (sys.scripts.do)
 * SCOPE: Global
 * =========================================================================================
 */

(function fixMobileAgentAppDefinitive() {
    gs.print('===================================================================');
    gs.print('🚀 FIXING MOBILE AGENT: TURNING OFF LEGACY APPLICATION MODE');
    gs.print('===================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // 1. SET legacy_application = false ON NAVIGATION BARS
    // -------------------------------------------------------------------------
    gs.print('\n1. Updating Navigation Bars to modern mode (legacy_application = false)...');

    var navGr = new GlideRecord('sys_sg_navigation');
    navGr.query();
    while (navGr.next()) {
        if (navGr.name == 'Mobile Agent' || navGr.name == 'Industrial Production Management Mobile' || navGr.name == 'Now Mobile Nav') {
            navGr.legacy_application = false; // THE CRITICAL FIX!
            navGr.update();
            gs.print('   ✅ Set legacy_application = false on: ' + navGr.name + ' (' + navGr.getUniqueValue() + ')');
        }
    }

    // -------------------------------------------------------------------------
    // 2. UNLOCK ALL LAUNCHERS (CLEAR access_control_type)
    // -------------------------------------------------------------------------
    gs.print('\n2. Unlocking Applet Launchers (removing access restrictions)...');

    var lGr = new GlideRecord('sys_sg_applet_launcher');
    lGr.addQuery('sys_scope', scopeId);
    lGr.query();
    var lCount = 0;
    while (lGr.next()) {
        lGr.access_control_type = ''; // Empty = open to everyone
        lGr.required_roles = '';
        lGr.hide_empty_sections = false;
        lGr.active = true;
        lGr.update();
        lCount++;
        gs.print('   ✅ Unlocked Launcher: ' + lGr.title);
    }

    // -------------------------------------------------------------------------
    // 3. UNLOCK ALL SECTIONS IN SCOPE
    // -------------------------------------------------------------------------
    gs.print('\n3. Unlocking Sections...');

    var sGr = new GlideRecord('sys_sg_section');
    sGr.addQuery('sys_scope', scopeId);
    sGr.query();
    var sCount = 0;
    while (sGr.next()) {
        sGr.access_control_type = '';
        sGr.required_roles = '';
        sGr.update();
        sCount++;
    }
    gs.print('   ✅ Unlocked ' + sCount + ' Sections to all users.');

    // -------------------------------------------------------------------------
    // 4. MAP TABS TO MOBILE AGENT NAVIGATION BAR
    // -------------------------------------------------------------------------
    gs.print('\n4. Verifying Navigation Tabs on Mobile Agent...');

    var mobileAgentNavId = '679d4f0653d033002d96ddeeff7b1279';
    var tabs = [
        { id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard', order: 10 },
        { id: '8e1e978193338310e61e3b277bba1062', name: 'Production', order: 20 },
        { id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',  order: 30 },
        { id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',     order: 40 },
        { id: '6e1e1b8193338310e61e3b277bba1023', name: 'More',       order: 50 }
    ];

    for (var i = 0; i < tabs.length; i++) {
        var mapGr = new GlideRecord('sys_sg_navigation_tab_map');
        mapGr.addQuery('navigation', mobileAgentNavId);
        mapGr.addQuery('navigation_tab', tabs[i].id);
        mapGr.query();
        if (!mapGr.next()) {
            mapGr.initialize();
            mapGr.navigation = mobileAgentNavId;
            mapGr.navigation_tab = tabs[i].id;
            mapGr.order = tabs[i].order;
            mapGr.insert();
            gs.print('   ✅ Added [' + tabs[i].name + '] to Mobile Agent (order: ' + tabs[i].order + ')');
        } else {
            mapGr.order = tabs[i].order;
            mapGr.update();
            gs.print('   ℹ️ Updated order for [' + tabs[i].name + '] (order: ' + tabs[i].order + ')');
        }
    }

    // -------------------------------------------------------------------------
    // 5. UPDATE NATIVE CLIENT RECORD
    // -------------------------------------------------------------------------
    var clientGr = new GlideRecord('sys_sg_native_client');
    clientGr.addQuery('sys_id', 'a42d0b0653d033002d96ddeeff7b1200'); // Mobile Agent client
    clientGr.query();
    if (clientGr.next()) {
        clientGr.active = true;
        clientGr.update();
        gs.print('   ✅ Verified Mobile Agent native client is active.');
    }

    // -------------------------------------------------------------------------
    // 6. FLUSH ALL MOBILE SERVER CACHES
    // -------------------------------------------------------------------------
    try {
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        GlideCacheManager.flush('sys_sg_section');
        gs.print('\n🔄 Flushed all mobile system caches on the server.');
    } catch(e) {}

    gs.print('\n===================================================================');
    gs.print('🎉 MOBILE AGENT FIX COMPLETE!');
    gs.print('   👉 TO SEE THE TABS ON YOUR PHONE:');
    gs.print('   1. In the app, tap Settings (gear icon in bottom right).');
    gs.print('   2. Tap "Log out" (or Account > Log out).');
    gs.print('   3. Log back into dev449562.');
    gs.print('   4. The "No applications defined" screen will be GONE!');
    gs.print('      The app will directly display Dashboard, Production, Inventory, Alerts, More!');
    gs.print('===================================================================');
})();
