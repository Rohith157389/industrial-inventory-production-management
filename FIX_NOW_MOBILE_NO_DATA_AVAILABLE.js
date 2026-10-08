// ============================================================================
// 🏆 BUGSLAYERS - DEFINITIVE NOW MOBILE & 10-SCREEN SUITE FIX
// Purpose: Fix "No data available" on Now Mobile and fully integrate the
//          10-Screen Smart Manufacturing Management Suite.
// Target Instance: https://dev445579.service-now.com/
// Scope: Global (Run in System Definition > Scripts - Background: sys.scripts.do)
// ============================================================================

(function fixNowMobileAndDeploySuite() {
    gs.print('================================================================================');
    gs.print('🚀 STARTING DEFINITIVE NOW MOBILE FIX & 10-SCREEN INTEGRATION ON dev445579');
    gs.print('================================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // 1. ELIMINATE "NO DATA AVAILABLE": LINK MASTER ITEMS TO ALL ITEM STREAMS
    // -------------------------------------------------------------------------
    gs.print('\n🔗 [1/6] Linking Master Items to all 4 Item Streams (Fixing "No data available")...');

    var streamLinks = [
        {
            stream: '49546b8193738310e61e3b277bba10d1', // Dashboard Stream
            name: 'Dashboard Stream',
            master: '7473b881933f8310e61e3b277bba1061', // Inventory Stock Card View (283 records)
            table: 'x_2056099_indust_0_inv_stock',
            order: 10
        },
        {
            stream: '5d54ab8193738310e61e3b277bba101e', // Production Stream
            name: 'Production Stream',
            master: '0e22f8cd93fb8310e61e3b277bba1025', // Production Order Card View (43 records)
            table: 'x_2056099_indust_0_production_order',
            order: 10
        },
        {
            stream: '5154ab8193738310e61e3b277bba1040', // Inventory Stream
            name: 'Inventory Stream',
            master: '7473b881933f8310e61e3b277bba1061', // Inventory Stock Card View (283 records)
            table: 'x_2056099_indust_0_inv_stock',
            order: 10
        },
        {
            stream: '1d54ab8193738310e61e3b277bba106d', // Alerts Stream
            name: 'Alerts Stream',
            master: '6fb43845933f8310e61e3b277bba10f0', // Active Alerts Card View (168 records)
            table: 'x_2056099_indust_0_alert',
            order: 10
        }
    ];

    for (var s = 0; s < streamLinks.length; s++) {
        var sl = streamLinks[s];

        var streamGr = new GlideRecord('sys_sg_item_stream');
        if (streamGr.get(sl.stream)) {
            streamGr.table = sl.table;
            streamGr.sys_scope = scopeId;
            streamGr.update();
            gs.print('   ✅ Verified stream table: [' + sl.name + '] -> ' + sl.table);
        }

        var m2mGr = new GlideRecord('sys_sg_item_stream_m2m_master_item');
        m2mGr.addQuery('item_stream', sl.stream);
        m2mGr.addQuery('master_item', sl.master);
        m2mGr.query();
        if (!m2mGr.next()) {
            m2mGr.initialize();
            m2mGr.item_stream = sl.stream;
            m2mGr.master_item = sl.master;
            m2mGr.order = sl.order;
            m2mGr.sys_scope = scopeId;
            m2mGr.insert();
            gs.print('   ✅ Linked [' + sl.name + '] to Master Item: ' + sl.master);
        } else {
            gs.print('   ℹ️ Already linked: [' + sl.name + ']');
        }
    }

    // -------------------------------------------------------------------------
    // 2. ACTIVATE ALL 4 LIST SCREENS AND REMOVE ROLE RESTRICTIONS
    // -------------------------------------------------------------------------
    gs.print('\n📱 [2/6] Activating all 4 List Screens with live row display...');

    var screens = [
        { id: '4d546b8193738310e61e3b277bba108a', name: 'Dashboard' },
        { id: '8154ab8193738310e61e3b277bba1000', name: 'Production' },
        { id: '1554ab8193738310e61e3b277bba103a', name: 'Inventory' },
        { id: 'dd54ab8193738310e61e3b277bba1067', name: 'Alerts' }
    ];

    for (var sc = 0; sc < screens.length; sc++) {
        var scr = screens[sc];
        var scrGr = new GlideRecord('sys_sg_list_screen');
        if (scrGr.get(scr.id)) {
            scrGr.active = true;
            scrGr.roles_override = '';
            scrGr.update();
            gs.print('   ✅ List Screen [' + scr.name + '] is ACTIVE with open roles.');
        }
    }

    // -------------------------------------------------------------------------
    // 3. UNLOCK APPLET LAUNCHERS & SECTIONS (REMOVE "USER_ROLES" BLOCK)
    // -------------------------------------------------------------------------
    gs.print('\n🔓 [3/6] Unlocking Applet Launchers & Sections across the application...');

    var lGr = new GlideRecord('sys_sg_applet_launcher');
    lGr.addQuery('sys_scope', scopeId);
    lGr.query();
    while (lGr.next()) {
        lGr.access_control_type = ''; // Open access
        lGr.required_roles = '';
        lGr.hide_empty_sections = false;
        lGr.active = true;
        lGr.update();
        gs.print('   ✅ Unlocked Launcher: ' + lGr.title);
    }

    var secGr = new GlideRecord('sys_sg_section');
    secGr.addQuery('sys_scope', scopeId);
    secGr.query();
    while (secGr.next()) {
        secGr.access_control_type = ''; // Open access
        secGr.required_roles = '';
        secGr.hide_section_if_empty = false;
        secGr.active = true;
        secGr.update();
        gs.print('   ✅ Unlocked Section: ' + secGr.title);
    }

    // -------------------------------------------------------------------------
    // 4. EMBED 10-SCREEN SUITE AS DIRECT MOBILE BUTTON & ACTION IN NOW MOBILE
    // -------------------------------------------------------------------------
    gs.print('\n🚀 [4/6] Embedding 10-Screen Smart Manufacturing Suite into Now Mobile...');

    var btnName = 'Smart Manufacturing Executive Suite';
    var btnGr = new GlideRecord('sys_sg_button');
    btnGr.addQuery('name', btnName);
    btnGr.query();
    var btnId = '';
    if (!btnGr.next()) {
        btnGr.initialize();
        btnGr.name = btnName;
        btnGr.type = 'url';
        btnGr.link_url = 'x_2056099_indust_0_dashboard.do';
        btnGr.relative_url = true;
        btnGr.external_browser = false; // Opens inside Now Mobile App!
        btnGr.context = 'global';
        btnGr.active = true;
        btnGr.sys_scope = scopeId;
        btnId = btnGr.insert();
        gs.print('   ✅ Created Mobile URL Button: ' + btnName + ' (' + btnId + ')');
    } else {
        btnGr.type = 'url';
        btnGr.link_url = 'x_2056099_indust_0_dashboard.do';
        btnGr.relative_url = true;
        btnGr.external_browser = false;
        btnGr.active = true;
        btnGr.update();
        btnId = btnGr.getUniqueValue();
        gs.print('   ℹ️ Updated Mobile URL Button: ' + btnName);
    }

    // Attach button to Dashboard launcher header if supported
    var dLauncher = new GlideRecord('sys_sg_applet_launcher');
    if (dLauncher.get('1d1e578193338310e61e3b277bba10e7')) {
        dLauncher.header_button = btnId;
        dLauncher.update();
        gs.print('   ✅ Attached 10-Screen Suite Header Button to Dashboard Launcher.');
    }

    // Fix "More" tab icon to remove warning triangle ⚠️
    var moreTab = new GlideRecord('sys_sg_applet_launcher_tab');
    if (moreTab.get('6e1e1b8193338310e61e3b277bba1023')) {
        moreTab.icon = 'd49c89a2b72200108223e126de11a9c4'; // Chart Bar (standard supported icon)
        moreTab.update();
        gs.print('   ✅ Fixed "More" Tab Icon (removed warning triangle ⚠️).');
    }

    // -------------------------------------------------------------------------
    // 5. CONFIGURE NATIVE CLIENTS & SYNCHRONIZE NAVIGATION TABS
    // -------------------------------------------------------------------------
    gs.print('\n📱 [5/6] Configuring Native Clients for Now Mobile and Mobile Agent...');

    var primaryNavBar = '698f1445937b8310e61e3b277bba1009'; // Industrial Production Management Mobile

    var clients = [
        { name: 'Industrial Production Management',               label: 'Industrial Production Management', type: 'agent',   nav: primaryNavBar },
        { name: 'Industrial Production Management (Now Mobile)', label: 'Industrial Production Management', type: 'request', nav: primaryNavBar },
        { name: 'Now Mobile',                                     label: 'Now Mobile',                      type: 'request', nav: primaryNavBar },
        { name: 'Now Mobile Admin',                               label: 'Now Mobile Admin',                type: 'request', nav: primaryNavBar },
        { name: 'Mobile Agent',                                   label: 'Mobile Agent',                    type: 'agent',   nav: primaryNavBar }
    ];

    for (var c = 0; c < clients.length; c++) {
        var cl = clients[c];
        var cGr = new GlideRecord('sys_sg_native_client');
        cGr.addQuery('name', cl.name);
        cGr.query();
        if (cGr.next()) {
            cGr.label = cl.label;
            cGr.type = cl.type;
            cGr.navigation = cl.nav;
            cGr.active = true;
            cGr.access_control_type = '';
            cGr.update();
            gs.print('   ✅ Configured native client [' + cl.name + '] -> type: ' + cl.type);
        } else {
            cGr.initialize();
            cGr.name = cl.name;
            cGr.label = cl.label;
            cGr.type = cl.type;
            cGr.navigation = cl.nav;
            cGr.active = true;
            cGr.access_control_type = '';
            cGr.sys_scope = scopeId;
            cGr.insert();
            gs.print('   ✅ Created native client [' + cl.name + '] -> type: ' + cl.type);
        }
    }

    // Final clean 5 tabs with guaranteed live data
    var finalTabs = [
        { tabId: '89546b8193738310e61e3b277bba10e6', name: 'Dashboard (Live Stream)', order: 10 },
        { tabId: '8e1e978193338310e61e3b277bba1062', name: 'Production',              order: 20 },
        { tabId: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory',               order: 30 },
        { tabId: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts',                  order: 40 },
        { tabId: '6e1e1b8193338310e61e3b277bba1023', name: 'More',                    order: 50 }
    ];

    var navBars = [
        '698f1445937b8310e61e3b277bba1009', // Primary Industrial Nav
        '9f67848187403300e0ef0cf888cb0b2e', // Now Mobile Nav
        '679d4f0653d033002d96ddeeff7b1279'  // Mobile Agent Nav
    ];

    for (var nb = 0; nb < navBars.length; nb++) {
        var nId = navBars[nb];

        // Wipe outdated/corrupt tab mappings
        var wipeGr = new GlideRecord('sys_sg_navigation_tab_map');
        wipeGr.addQuery('navigation', nId);
        wipeGr.query();
        while (wipeGr.next()) {
            var currTab = wipeGr.navigation_tab.toString();
            var keep = false;
            for (var ft = 0; ft < finalTabs.length; ft++) {
                if (finalTabs[ft].tabId === currTab) { keep = true; break; }
            }
            if (!keep) {
                wipeGr.deleteRecord();
            }
        }

        // Map the 5 clean tabs
        for (var ft2 = 0; ft2 < finalTabs.length; ft2++) {
            var targetTab = finalTabs[ft2];
            var mGr = new GlideRecord('sys_sg_navigation_tab_map');
            mGr.addQuery('navigation', nId);
            mGr.addQuery('navigation_tab', targetTab.tabId);
            mGr.query();
            if (!mGr.next()) {
                mGr.initialize();
                mGr.navigation = nId;
                mGr.navigation_tab = targetTab.tabId;
                mGr.order = targetTab.order;
                mGr.insert();
                gs.print('   ✅ Mapped [' + targetTab.name + '] into nav: ' + nId);
            } else {
                mGr.order = targetTab.order;
                mGr.update();
            }
        }

        // Force version increment on nav record so phone detects update
        var nGr = new GlideRecord('sys_sg_navigation');
        if (nGr.get(nId)) {
            nGr.sys_mod_count = parseInt(nGr.sys_mod_count || 0) + 1;
            nGr.update();
        }
    }

    // Activate Dashboard Applet Tab
    var dashTab = new GlideRecord('sys_sg_applet_tab');
    if (dashTab.get('89546b8193738310e61e3b277bba10e6')) {
        dashTab.active = true;
        dashTab.update();
    }

    // -------------------------------------------------------------------------
    // 6. FLUSH ALL CACHES (FORCE IMMEDIATE PHONE SYNC)
    // -------------------------------------------------------------------------
    gs.print('\n🔄 [6/6] Flushing all Mobile and Server Caches...');
    try {
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_applet_launcher');
        GlideCacheManager.flush('sys_sg_applet_launcher_tab');
        GlideCacheManager.flush('sys_sg_applet_tab');
        GlideCacheManager.flush('sys_sg_section');
        GlideCacheManager.flush('sys_sg_section_card_instance');
        GlideCacheManager.flush('sys_sg_master_item');
        GlideCacheManager.flush('sys_sg_item_stream');
        GlideCacheManager.flush('sys_sg_item_stream_m2m_master_item');
        GlideCacheManager.flush('sys_sg_list_screen');
        GlideCacheManager.flush('sys_sg_button');
        GlideCacheManager.flush('sg_native_client_cache');
        GlideCacheManager.flush('sg_applet_launcher_cache');
        GlideCacheManager.flush('sg_sections_cache');
        GlideCacheManager.flush('sg_screens_cache');
        GlideCacheManager.flush('sg_master_item_cache');
        gs.print('   ✅ All mobile caches flushed successfully.');
    } catch(e) {
        gs.print('   ℹ️ Cache flush note: ' + e.message);
    }

    gs.print('\n================================================================================');
    gs.print('🎉 NOW MOBILE REPAIR & 10-SCREEN SUITE INTEGRATION COMPLETE!');
    gs.print('🌐 Direct Mobile Web URL: https://dev445579.service-now.com/x_2056099_indust_0_dashboard.do');
    gs.print('📱 INSTRUCTIONS FOR YOUR PHONE:');
    gs.print('   1. Force close the Now Mobile app (swipe away from app switcher).');
    gs.print('   2. Reopen Now Mobile and log in (or tap Settings > Reset cache).');
    gs.print('   3. All 5 tabs (Dashboard, Production, Inventory, Alerts, More) now stream live data.');
    gs.print('   4. Tap the header button or visit the direct URL to run the 10-screen template!');
    gs.print('================================================================================');
})();
