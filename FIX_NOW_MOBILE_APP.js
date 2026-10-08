/**
 * =========================================================================================
 * FIX NOW MOBILE & SERVICENOW AGENT DISPLAY SCRIPT
 * =========================================================================================
 * This script ensures the mobile application appears on BOTH:
 *   1. "ServiceNow Agent" app (fulfiller client, type: agent)
 *   2. "Now Mobile" app (requestor client, type: request)
 *
 * It removes role barriers, activates clients, links navigation tabs,
 * and flushes the system mobile cache.
 *
 * Run in: System Definition > Scripts - Background (sys.scripts.do)
 * =========================================================================================
 */

(function fixNowMobileApp() {
    gs.print('===================================================================');
    gs.print('📱 STARTING NOW MOBILE & MOBILE AGENT REPAIR');
    gs.print('===================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // 1. UPDATE / ENSURE NATIVE CLIENTS FOR BOTH AGENT AND NOW MOBILE
    gs.print('\n1. Configuring Native Clients (sys_sg_native_client)...');

    // Existing client
    var clientGr = new GlideRecord('sys_sg_native_client');
    clientGr.addQuery('name', 'Industrial Production Management');
    clientGr.query();
    if (clientGr.next()) {
        clientGr.label = 'Industrial Production Management';
        clientGr.active = true;
        clientGr.type = 'agent'; // Set to 'agent' for ServiceNow Agent app
        clientGr.access_control_type = 'none';
        clientGr.update();
        gs.print('   ✅ Configured client [Industrial Production Management] for ServiceNow Agent (type: agent)');
    }

    // Ensure client for Now Mobile (type: request) exists as well
    var nowClientGr = new GlideRecord('sys_sg_native_client');
    nowClientGr.addQuery('name', 'Industrial Production Management - Now Mobile');
    nowClientGr.query();
    if (!nowClientGr.next()) {
        nowClientGr.initialize();
        nowClientGr.name = 'Industrial Production Management - Now Mobile';
        nowClientGr.label = 'Industrial Production Management';
        nowClientGr.active = true;
        nowClientGr.type = 'request'; // For Now Mobile app
        nowClientGr.navigation = '9f67848187403300e0ef0cf888cb0b2e'; // Now Mobile Nav
        nowClientGr.sys_scope = scopeId;
        nowClientGr.access_control_type = 'none';
        var nowClientId = nowClientGr.insert();
        gs.print('   ✅ Created Now Mobile native client: ' + nowClientId + ' (type: request)');
    } else {
        nowClientGr.label = 'Industrial Production Management';
        nowClientGr.active = true;
        nowClientGr.type = 'request';
        nowClientGr.access_control_type = 'none';
        nowClientGr.update();
        gs.print('   ℹ️ Updated Now Mobile native client.');
    }

    // 2. OPEN ACCESS CONTROL ON APPLET LAUNCHERS (REMOVE ROLE BLOCKS)
    gs.print('\n2. Removing role barriers from Applet Launchers...');
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
            lGr.access_control_type = 'none'; // Allow all users
            lGr.hide_empty_sections = false;
            lGr.update();
            gs.print('   ✅ Open access set on launcher: ' + lGr.title);
        }
    }

    // 3. VERIFY AND MAP ALL TABS INTO NAVIGATION BARS
    gs.print('\n3. Verifying Navigation Tab Mappings...');
    var navBars = [
        { name: 'Mobile Agent', sys_id: '679d4f0653d033002d96ddeeff7b1279' },
        { name: 'Now Mobile Nav', sys_id: '9f67848187403300e0ef0cf888cb0b2e' },
        { name: 'Industrial Production Management Mobile', sys_id: '698f1445937b8310e61e3b277bba1009' }
    ];

    var tabs = [
        { sys_id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard', order: 10 },
        { sys_id: '8e1e978193338310e61e3b277bba1062', name: 'Production', order: 20 },
        { sys_id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',  order: 30 },
        { sys_id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',     order: 40 },
        { sys_id: '6e1e1b8193338310e61e3b277bba1023', name: 'More',       order: 50 }
    ];

    var linkedCount = 0;
    for (var nbIdx = 0; nbIdx < navBars.length; nbIdx++) {
        var currentNav = navBars[nbIdx];
        var navRecord = new GlideRecord('sys_sg_navigation');
        if (!navRecord.get(currentNav.sys_id)) {
            navRecord.addQuery('name', currentNav.name);
            navRecord.query();
            if (!navRecord.next()) continue;
            currentNav.sys_id = navRecord.getUniqueValue();
        }

        for (var tIdx = 0; tIdx < tabs.length; tIdx++) {
            var tabItem = tabs[tIdx];
            var mapQuery = new GlideRecord('sys_sg_navigation_tab_map');
            mapQuery.addQuery('navigation', currentNav.sys_id);
            mapQuery.addQuery('navigation_tab', tabItem.sys_id);
            mapQuery.query();
            if (!mapQuery.next()) {
                mapQuery.initialize();
                mapQuery.navigation = currentNav.sys_id;
                mapQuery.navigation_tab = tabItem.sys_id;
                mapQuery.order = tabItem.order;
                var inserted = mapQuery.insert();
                if (inserted) {
                    linkedCount++;
                    gs.print('   ✅ Mapped [' + tabItem.name + '] into ' + currentNav.name);
                }
            }
        }
    }

    // 4. FLUSH CACHE
    gs.print('\n4. Flushing Mobile Cache...');
    try {
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        gs.print('   ✅ Mobile server caches flushed successfully.');
    } catch(e) {
        gs.print('   ℹ️ Cache flush note: ' + e.message);
    }

    gs.print('\n===================================================================');
    gs.print('🎉 MOBILE REPAIR COMPLETE!');
    gs.print('   👉 CRITICAL STEP ON YOUR PHONE:');
    gs.print('   1. In your mobile app, tap "Settings" (gear icon) on bottom right.');
    gs.print('   2. Tap "Reset cache" (or Developer > Reset Cache), or Log out and Log back in.');
    gs.print('===================================================================');
})();
