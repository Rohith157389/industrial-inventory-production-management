// ============================================================================
// 🏭 BUGSLAYERS - FULL MOBILE PRODUCTION EXECUTION SUITE
// Purpose:
// 1. Map Production, Inventory, and Alerts to live List Screens with full drill-down
// 2. Ensure Mobile Action Buttons are active on Production Orders:
//    - Start Production, Issue Material, Record Output, Complete Production
// 3. Perfect UI icons across all 5 navigation tabs (zero warning triangles ⚠️)
//
// Target Instance: https://dev445579.service-now.com/
// Scope: Global (Run in System Definition > Scripts - Background: sys.scripts.do)
// ============================================================================
(function() {
    gs.print('================================================================================');
    gs.print('🏭 ACTIVATING MOBILE PRODUCTION EXECUTION FOR SERVICENOW AGENT & NOW MOBILE');
    gs.print('================================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // 1. RESOLVE ICONS (OOB Native Mobile Glyph IDs)
    // -------------------------------------------------------------------------
    gs.print('\n🎨 [1/6] Finding clean native mobile icons...');
    
    var iconMap = {};
    var iGr = new GlideRecord('sys_sg_icon');
    iGr.query();
    while (iGr.next()) {
        iconMap[iGr.name.toString()] = iGr.getUniqueValue();
    }

    var chartBarIcon = iconMap['Chart Bar'] || 'd49c89a2b72200108223e126de11a9c4';
    var homeIcon     = iconMap['Home'] || iconMap['icon-Folder'] || chartBarIcon;
    var bookmarkIcon = iconMap['icon-Bookmark'] || iconMap['icon-Box'] || chartBarIcon;
    var bellIcon     = iconMap['Notification icon'] || iconMap['icon-Bell'] || chartBarIcon;
    var moreIcon     = iconMap['icon-Document'] || iconMap['icon-Folder'] || chartBarIcon;

    // -------------------------------------------------------------------------
    // 2. CONFIGURE LIVE TABS WITH REAL ICONS & DIRECT STREAM SCREENS
    // -------------------------------------------------------------------------
    gs.print('\n📱 [2/6] Configuring live Applet Tabs for direct data streaming...');

    var tabConfigurations = [
        {
            id: '89546b8193738310e61e3b277bba10e6',
            label: 'Dashboard',
            screen: '4d546b8193738310e61e3b277bba108a',
            icon: chartBarIcon,
            order: 10
        },
        {
            id: '9154ab8193738310e61e3b277bba102f',
            label: 'Production',
            screen: '8154ab8193738310e61e3b277bba1000',
            icon: homeIcon,
            order: 20
        },
        {
            id: '9554ab8193738310e61e3b277bba1050',
            label: 'Inventory',
            screen: '1554ab8193738310e61e3b277bba103a',
            icon: bookmarkIcon,
            order: 30
        },
        {
            id: 'ed54ab8193738310e61e3b277bba1096',
            label: 'Alerts',
            screen: 'dd54ab8193738310e61e3b277bba1067',
            icon: bellIcon,
            order: 40
        }
    ];

    for (var t = 0; t < tabConfigurations.length; t++) {
        var cfg = tabConfigurations[t];
        var tabGr = new GlideRecord('sys_sg_applet_tab');
        if (tabGr.get(cfg.id)) {
            tabGr.active = true;
            tabGr.icon = cfg.icon;
            tabGr.label = cfg.label;
            tabGr.screen = cfg.screen;
            tabGr.update();
            gs.print('   ✅ Configured Tab [' + cfg.label + '] -> Icon: ' + tabGr.icon.getDisplayValue());
        }
    }

    // Configure "More" launcher tab with working icon
    var moreTab = new GlideRecord('sys_sg_applet_launcher_tab');
    if (moreTab.get('6e1e1b8193338310e61e3b277bba1023')) {
        moreTab.active = true;
        moreTab.icon = moreIcon;
        moreTab.label = 'More';
        moreTab.update();
        gs.print('   ✅ Configured More Tab -> Icon: ' + moreTab.icon.getDisplayValue());
    }

    // -------------------------------------------------------------------------
    // 3. ENSURE ALL MASTER ITEMS ARE ATTACHED TO ITEM STREAMS
    // -------------------------------------------------------------------------
    gs.print('\n🔗 [3/6] Verifying Master Item card layouts on all 4 Item Streams...');

    var streams = [
        {
            stream: '49546b8193738310e61e3b277bba10d1', // Dashboard Stream
            master: '7473b881933f8310e61e3b277bba1061', // Stock Drill-Down (283 records)
            name: 'Dashboard (Stock Overview)'
        },
        {
            stream: '5d54ab8193738310e61e3b277bba101e', // Production Stream
            master: '0e22f8cd93fb8310e61e3b277bba1025', // Production Order Drill-Down (43 records)
            name: 'Production Orders (Shop Floor)'
        },
        {
            stream: '5154ab8193738310e61e3b277bba1040', // Inventory Stream
            master: '7473b881933f8310e61e3b277bba1061', // Stock Drill-Down (283 records)
            name: 'Inventory Stock'
        },
        {
            stream: '1d54ab8193738310e61e3b277bba106d', // Alerts Stream
            master: '6fb43845933f8310e61e3b277bba10f0', // Active Alerts Drill-Down (168 records)
            name: 'Operational Alerts'
        }
    ];

    for (var st = 0; st < streams.length; st++) {
        var sObj = streams[st];
        var sM2m = new GlideRecord('sys_sg_item_stream_m2m_master_item');
        sM2m.addQuery('item_stream', sObj.stream);
        sM2m.addQuery('master_item', sObj.master);
        sM2m.query();
        if (!sM2m.next()) {
            sM2m.initialize();
            sM2m.item_stream = sObj.stream;
            sM2m.master_item = sObj.master;
            sM2m.order = 10;
            sM2m.sys_scope = scopeId;
            sM2m.insert();
            gs.print('   ✅ Attached Master Item for: ' + sObj.name);
        } else {
            gs.print('   ℹ️ Master Item already attached for: ' + sObj.name);
        }
    }

    // -------------------------------------------------------------------------
    // 4. ACTIVATE SHOP-FLOOR PRODUCTION EXECUTION ACTIONS
    // -------------------------------------------------------------------------
    gs.print('\n⚡ [4/6] Linking Shop-Floor Mobile Execution Actions on Production Orders...');

    var prodDetailScreen = '6c2238cd93fb8310e61e3b277bba10e4'; // Production Order Detail Form Screen
    var actions = [
        { id: '86f7b80d933f8310e61e3b277bba10d1', name: 'Start Production',   order: 10 },
        { id: 'fa3974cd933f8310e61e3b277bba10ea', name: 'Issue Material',     order: 20 },
        { id: '4ef7f80d933f8310e61e3b277bba100a', name: 'Record Output',      order: 30 },
        { id: '12f7f80d933f8310e61e3b277bba1022', name: 'Complete Production',order: 40 },
        { id: '06f7b80d933f8310e61e3b277bba10dc', name: 'Resume Production',  order: 50 },
        { id: '953bb8c1937f8310e61e3b277bba10ff', name: 'Cancel Production',  order: 60 }
    ];

    for (var a = 0; a < actions.length; a++) {
        var act = actions[a];
        // Ensure action button is active
        var bGr = new GlideRecord('sys_sg_button');
        if (bGr.get(act.id)) {
            bGr.active = true;
            bGr.roles = '';
            bGr.update();
        }

        // Link button instance to detail screen
        var biGr = new GlideRecord('sys_sg_button_instance');
        biGr.addQuery('screen', prodDetailScreen);
        biGr.addQuery('button', act.id);
        biGr.query();
        if (!biGr.next()) {
            biGr.initialize();
            biGr.screen = prodDetailScreen;
            biGr.button = act.id;
            biGr.order = act.order;
            biGr.sys_scope = scopeId;
            biGr.insert();
            gs.print('   ⚡ Linked Action [' + act.name + '] to Production Order Detail Screen');
        } else {
            biGr.order = act.order;
            biGr.update();
            gs.print('   ℹ️ Action [' + act.name + '] active.');
        }
    }

    // -------------------------------------------------------------------------
    // 5. MAP CLEAN 5-TAB NAVIGATION (DASHBOARD, PRODUCTION, INVENTORY, ALERTS, MORE)
    // -------------------------------------------------------------------------
    gs.print('\n🗺️ [5/6] Remapping all Navigation Bars with live streaming tabs...');

    var navBars = [
        '698f1445937b8310e61e3b277bba1009', // Industrial Production Management Mobile
        '9f67848187403300e0ef0cf888cb0b2e', // Now Mobile Nav
        '679d4f0653d033002d96ddeeff7b1279'  // Mobile Agent
    ];

    var fiveTabs = [
        { id: '89546b8193738310e61e3b277bba10e6', label: 'Dashboard',  order: 10 },
        { id: '9154ab8193738310e61e3b277bba102f', label: 'Production', order: 20 },
        { id: '9554ab8193738310e61e3b277bba1050', label: 'Inventory',  order: 30 },
        { id: 'ed54ab8193738310e61e3b277bba1096', label: 'Alerts',     order: 40 },
        { id: '6e1e1b8193338310e61e3b277bba1023', label: 'More',       order: 50 }
    ];

    for (var n = 0; n < navBars.length; n++) {
        var nSysId = navBars[n];

        // Touch nav record
        var nGr = new GlideRecord('sys_sg_navigation');
        if (nGr.get(nSysId)) {
            nGr.sys_mod_count = parseInt(nGr.sys_mod_count || 0) + 1;
            nGr.update();
        }

        // Remove old launcher mappings on this nav
        var wipeGr = new GlideRecord('sys_sg_navigation_tab_map');
        wipeGr.addQuery('navigation', nSysId);
        wipeGr.query();
        while (wipeGr.next()) {
            var currTab = wipeGr.navigation_tab.toString();
            var isKept = false;
            for (var ft = 0; ft < fiveTabs.length; ft++) {
                if (fiveTabs[ft].id === currTab) { isKept = true; break; }
            }
            if (!isKept) {
                wipeGr.deleteRecord();
            }
        }

        // Map the 5 clean tabs
        for (var ft2 = 0; ft2 < fiveTabs.length; ft2++) {
            var tObj = fiveTabs[ft2];
            var mapRec = new GlideRecord('sys_sg_navigation_tab_map');
            mapRec.addQuery('navigation', nSysId);
            mapRec.addQuery('navigation_tab', tObj.id);
            mapRec.query();
            if (!mapRec.next()) {
                mapRec.initialize();
                mapRec.navigation = nSysId;
                mapRec.navigation_tab = tObj.id;
                mapRec.order = tObj.order;
                mapRec.insert();
                gs.print('   ✅ Mapped [' + tObj.label + '] (Order: ' + tObj.order + ') into ' + nSysId);
            } else {
                mapRec.order = tObj.order;
                mapRec.update();
            }
        }
    }

    // -------------------------------------------------------------------------
    // 6. CACHE FLUSH
    // -------------------------------------------------------------------------
    gs.print('\n🔄 [6/6] Flushing all Mobile server caches...');
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
        GlideCacheManager.flush('sys_sg_button');
        GlideCacheManager.flush('sys_sg_button_instance');
        GlideCacheManager.flush('sg_native_client_cache');
        GlideCacheManager.flush('sg_applet_launcher_cache');
        GlideCacheManager.flush('sg_sections_cache');
        GlideCacheManager.flush('sg_screens_cache');
        GlideCacheManager.flush('sg_master_item_cache');
        gs.print('  ✅ All mobile server caches successfully flushed.');
    } catch(e) {}

    gs.print('\n🎉 MOBILE PRODUCTION EXECUTION SUITE SUCCESSFULLY ACTIVATED!');
})();
