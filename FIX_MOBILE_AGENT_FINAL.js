/**
 * =========================================================================================
 * FIX: "No applications defined. Please contact your administrator"
 * =========================================================================================
 * ROOT CAUSES RESOLVED:
 * 1. sys_sg_native_client had type='request' (Now Mobile) instead of type='agent' (ServiceNow Agent app).
 * 2. sys_sg_applet_launcher had access_control_type='user_roles' with EMPTY required_roles,
 *    causing ServiceNow to block display for all users.
 * 3. sys_sg_section had access_control_type='user_roles' with empty required_roles,
 *    hiding all sections and producing an empty launcher.
 *
 * HOW TO EXECUTE:
 * 1. Open: https://dev449562.service-now.com/sys.scripts.do
 * 2. Set Scope to: Global
 * 3. Paste this script and click "Run script".
 * 4. ON YOUR PHONE: Log out and log back in, or tap Settings > Reset cache.
 * =========================================================================================
 */

(function fixMobileAgentApp() {
    gs.print('===================================================================');
    gs.print('🚀 FIXING "NO APPLICATIONS DEFINED" FOR SERVICENOW AGENT');
    gs.print('===================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // 1. FIX SYS_SG_NATIVE_CLIENT (SET TYPE TO 'agent')
    // -------------------------------------------------------------------------
    gs.print('\n📱 [1/4] Configuring Native Clients for Mobile Agent & Now Mobile...');

    var clientGr = new GlideRecord('sys_sg_native_client');
    clientGr.addQuery('name', 'Industrial Production Management');
    clientGr.query();
    if (clientGr.next()) {
        clientGr.label = 'Industrial Production Management';
        clientGr.type = 'agent'; // CRITICAL: Must be 'agent' for ServiceNow Agent app!
        clientGr.active = true;
        clientGr.access_control_type = '';
        clientGr.required_roles = '';
        clientGr.update();
        gs.print('   ✅ Updated client [Industrial Production Management] -> type: "agent"');
    } else {
        clientGr.initialize();
        clientGr.name = 'Industrial Production Management';
        clientGr.label = 'Industrial Production Management';
        clientGr.type = 'agent';
        clientGr.active = true;
        clientGr.navigation = '698f1445937b8310e61e3b277bba1009';
        clientGr.sys_scope = scopeId;
        clientGr.insert();
        gs.print('   ✅ Created client [Industrial Production Management] -> type: "agent"');
    }

    // Ensure a second client exists for Now Mobile (type: 'request') so both apps work
    var reqClientGr = new GlideRecord('sys_sg_native_client');
    reqClientGr.addQuery('name', 'Industrial Production Management (Now Mobile)');
    reqClientGr.query();
    if (!reqClientGr.next()) {
        reqClientGr.initialize();
        reqClientGr.name = 'Industrial Production Management (Now Mobile)';
        reqClientGr.label = 'Industrial Production Management';
        reqClientGr.type = 'request';
        reqClientGr.active = true;
        reqClientGr.navigation = '9f67848187403300e0ef0cf888cb0b2e';
        reqClientGr.sys_scope = scopeId;
        reqClientGr.insert();
        gs.print('   ✅ Created client [Industrial Production Management (Now Mobile)] -> type: "request"');
    }

    // -------------------------------------------------------------------------
    // 2. CLEAR ACCESS CONTROL ON APPLET LAUNCHERS (ALLOW ALL USERS)
    // -------------------------------------------------------------------------
    gs.print('\n🔓 [2/4] Clearing access barriers on Applet Launchers...');

    var launcherGr = new GlideRecord('sys_sg_applet_launcher');
    launcherGr.addQuery('sys_scope', scopeId);
    launcherGr.query();
    var launchersFixed = 0;
    while (launcherGr.next()) {
        launcherGr.access_control_type = ''; // Empty = Open to everyone (OOB pattern)
        launcherGr.required_roles = '';
        launcherGr.hide_empty_sections = false;
        launcherGr.active = true;
        launcherGr.update();
        launchersFixed++;
        gs.print('   ✅ Unlocked Launcher: ' + launcherGr.title);
    }

    // -------------------------------------------------------------------------
    // 3. CLEAR ACCESS CONTROL ON ALL SECTIONS
    // -------------------------------------------------------------------------
    gs.print('\n🔓 [3/4] Clearing access barriers on Sections...');

    var sectionGr = new GlideRecord('sys_sg_section');
    sectionGr.addQuery('sys_scope', scopeId);
    sectionGr.query();
    var sectionsFixed = 0;
    while (sectionGr.next()) {
        sectionGr.access_control_type = '';
        sectionGr.required_roles = '';
        sectionGr.update();
        sectionsFixed++;
    }
    gs.print('   ✅ Unlocked ' + sectionsFixed + ' Sections to all users.');

    // -------------------------------------------------------------------------
    // 4. MAP LAUNCHER TABS TO BOTH NAVIGATION BARS
    // -------------------------------------------------------------------------
    gs.print('\n🔗 [4/4] Ensuring navigation tabs in Mobile Agent & Industrial Nav...');

    var navBars = [
        { name: 'Mobile Agent', sys_id: '679d4f0653d033002d96ddeeff7b1279' },
        { name: 'Industrial Production Management Mobile', sys_id: '698f1445937b8310e61e3b277bba1009' }
    ];

    var tabs = [
        { id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard', order: 10 },
        { id: '8e1e978193338310e61e3b277bba1062', name: 'Production', order: 20 },
        { id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',  order: 30 },
        { id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',     order: 40 },
        { id: '6e1e1b8193338310e61e3b277bba1023', name: 'More',       order: 50 }
    ];

    for (var nb = 0; nb < navBars.length; nb++) {
        var nRec = new GlideRecord('sys_sg_navigation');
        if (!nRec.get(navBars[nb].sys_id)) {
            nRec.addQuery('name', navBars[nb].name);
            nRec.query();
            if (nRec.next()) {
                navBars[nb].sys_id = nRec.getUniqueValue();
            }
        }

        for (var tb = 0; tb < tabs.length; tb++) {
            var mapGr = new GlideRecord('sys_sg_navigation_tab_map');
            mapGr.addQuery('navigation', navBars[nb].sys_id);
            mapGr.addQuery('navigation_tab', tabs[tb].id);
            mapGr.query();
            if (!mapGr.next()) {
                mapGr.initialize();
                mapGr.navigation = navBars[nb].sys_id;
                mapGr.navigation_tab = tabs[tb].id;
                mapGr.order = tabs[tb].order;
                mapGr.insert();
                gs.print('   ✅ Mapped [' + tabs[tb].name + '] to ' + navBars[nb].name);
            }
        }
    }

    // -------------------------------------------------------------------------
    // 5. FLUSH SERVER-SIDE CACHES
    // -------------------------------------------------------------------------
    try {
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        GlideCacheManager.flush('sys_sg_section');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        gs.print('\n🔄 Flushed all mobile system caches on the server.');
    } catch(e) {}

    gs.print('\n===================================================================');
    gs.print('🎉 MOBILE AGENT FIX COMPLETE!');
    gs.print('   👉 WHAT TO DO ON YOUR PHONE NOW:');
    gs.print('   1. In your mobile app, tap Settings (gear icon in bottom right).');
    gs.print('   2. Tap "Log out" (or Account > Log out).');
    gs.print('   3. Log back in to dev449562.');
    gs.print('   4. The "Applications" screen will now display the Industrial Production Management application!');
    gs.print('===================================================================');
})();
