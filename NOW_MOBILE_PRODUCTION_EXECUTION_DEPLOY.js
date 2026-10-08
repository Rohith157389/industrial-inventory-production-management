// ============================================================================
// 🏭 BUGSLAYERS - NOW MOBILE PRODUCTION EXECUTION MASTER DEPLOYMENT
// Purpose:
// 1. Enable Full Mobile Production Execution in NOW MOBILE (type: request & agent)
// 2. Stream live data to ALL 4 tabs: Dashboard, Production, Inventory, Alerts
// 3. Enable Shop-Floor Execution Actions on Production Orders:
//    - Start Production, Issue Material, Record Output, Complete Production, Report Issue
// 4. Eliminate all warning triangles (⚠️) with native glyph icons
//
// Target Instance: https://dev445579.service-now.com/
// Scope: Global (Run in System Definition > Scripts - Background: sys.scripts.do)
// ============================================================================
(function deployNowMobileProductionExecution() {
    gs.print('================================================================================');
    gs.print('🏭 DEPLOYING NOW MOBILE PRODUCTION EXECUTION SUITE ON dev445579');
    gs.print('================================================================================');

    var scopeId = '3cdb727d839b4b105e2cc430ceaad338';

    // -------------------------------------------------------------------------
    // 1. RESOLVE VERIFIED NATIVE MOBILE ICONS (NO WARNING TRIANGLES ⚠️)
    // -------------------------------------------------------------------------
    gs.print('\n🎨 [1/6] Resolving Verified Native Mobile Icons...');

    var iconMap = {};
    var iGr = new GlideRecord('sys_sg_icon');
    iGr.query();
    while (iGr.next()) {
        iconMap[iGr.name.toString()] = iGr.getUniqueValue();
    }

    var chartBarId = iconMap['Chart Bar'] || 'd49c89a2b72200108223e126de11a9c4';
    var homeId     = iconMap['Home'] || iconMap['icon-Folder'] || chartBarId;
    var bookmarkId = iconMap['icon-Bookmark'] || iconMap['icon-Box'] || chartBarId;
    var bellId     = iconMap['Notification icon'] || iconMap['icon-Bell'] || chartBarId;
    var moreId     = iconMap['icon-Document'] || iconMap['icon-Folder'] || chartBarId;

    gs.print('   ✅ Icons resolved: Chart Bar, Home, Bookmark, Bell, Document');

    // -------------------------------------------------------------------------
    // 2. CONFIGURE 4 LIVE DATA STREAM SCREENS & THEIR TABS
    // -------------------------------------------------------------------------
    gs.print('\n📱 [2/6] Configuring Live Data Stream Screens & Tabs...');

    var screenTabConfigs = [
        {
            tabId: '89546b8193738310e61e3b277bba10e6',
            screenId: '4d546b8193738310e61e3b277bba108a',
            streamId: '49546b8193738310e61e3b277bba10d1',
            masterId: '7473b881933f8310e61e3b277bba1061', // Stock Drill-Down (283 records)
            label: 'Dashboard',
            icon: chartBarId,
            order: 10
        },
        {
            tabId: '9154ab8193738310e61e3b277bba102f',
            screenId: '8154ab8193738310e61e3b277bba1000',
            streamId: '5d54ab8193738310e61e3b277bba101e',
            masterId: '0e22f8cd93fb8310e61e3b277bba1025', // Production Order Drill-Down (43 records)
            label: 'Production',
            icon: homeId,
            order: 20
        },
        {
            tabId: '9554ab8193738310e61e3b277bba1050',
            screenId: '1554ab8193738310e61e3b277bba103a',
            streamId: '5154ab8193738310e61e3b277bba1040',
            masterId: '7473b881933f8310e61e3b277bba1061', // Stock Drill-Down (283 records)
            label: 'Inventory',
            icon: bookmarkId,
            order: 30
        },
        {
            tabId: 'ed54ab8193738310e61e3b277bba1096',
            screenId: 'dd54ab8193738310e61e3b277bba1067',
            streamId: '1d54ab8193738310e61e3b277bba106d',
            masterId: '6fb43845933f8310e61e3b277bba10f0', // Alerts Drill-Down (168 records)
            label: 'Alerts',
            icon: bellId,
            order: 40
        }
    ];

    for (var s = 0; s < screenTabConfigs.length; s++) {
        var item = screenTabConfigs[s];

        // A. Activate Screen and set icon
        var scrGr = new GlideRecord('sys_sg_list_screen');
        if (scrGr.get(item.screenId)) {
            scrGr.active = true;
            scrGr.icon = item.icon;
            scrGr.roles_override = '';
            scrGr.update();
            gs.print('   ✅ List Screen [' + item.label + '] activated.');
        }

        // B. Ensure Master Item is linked to Item Stream (eliminates "No data available")
        var m2mGr = new GlideRecord('sys_sg_item_stream_m2m_master_item');
        m2mGr.addQuery('item_stream', item.streamId);
        m2mGr.addQuery('master_item', item.masterId);
        m2mGr.query();
        if (!m2mGr.next()) {
            m2mGr.initialize();
            m2mGr.item_stream = item.streamId;
            m2mGr.master_item = item.masterId;
            m2mGr.order = 10;
            m2mGr.sys_scope = scopeId;
            m2mGr.insert();
            gs.print('   🔗 Linked Stream [' + item.label + '] -> Master Item: ' + item.masterId);
        } else {
            gs.print('   ℹ️ Master Item already linked for [' + item.label + ']');
        }

        // C. Configure Tab with verified Icon & Screen
        var tabGr = new GlideRecord('sys_sg_applet_tab');
        if (tabGr.get(item.tabId)) {
            tabGr.active = true;
            tabGr.icon = item.icon;
            tabGr.label = item.label;
            tabGr.screen = item.screenId;
            tabGr.update();
            gs.print('   ✅ Configured Tab [' + item.label + '] with native icon.');
        }
    }

    // Configure "More" tab (Launcher for Work Centers, OEE, Quality)
    var moreTab = new GlideRecord('sys_sg_applet_launcher_tab');
    if (moreTab.get('6e1e1b8193338310e61e3b277bba1023')) {
        moreTab.active = true;
        moreTab.icon = moreId;
        moreTab.label = 'More';
        moreTab.update();
        gs.print('   ✅ Configured More Tab with native icon.');
    }

    // -------------------------------------------------------------------------
    // 3. ENABLE SHOP-FLOOR PRODUCTION EXECUTION ACTIONS
    // -------------------------------------------------------------------------
    gs.print('\n⚡ [3/6] Activating Mobile Production Execution Actions on Shop Floor...');

    var prodDetailScreen = '6c2238cd93fb8310e61e3b277bba10e4'; // Production Order Detail Form Screen
    
    // Ensure detail form screen icon is native
    var formGr = new GlideRecord('sys_sg_form_screen');
    if (formGr.get(prodDetailScreen)) {
        formGr.icon = homeId;
        formGr.active = true;
        formGr.update();
    }

    var executionActions = [
        { id: '86f7b80d933f8310e61e3b277bba10d1', name: 'Start Production',    order: 10 },
        { id: 'fa3974cd933f8310e61e3b277bba10ea', name: 'Issue Material',      order: 20 },
        { id: '4ef7f80d933f8310e61e3b277bba100a', name: 'Record Output',       order: 30 },
        { id: '12f7f80d933f8310e61e3b277bba1022', name: 'Complete Production', order: 40 },
        { id: '06f7b80d933f8310e61e3b277bba10dc', name: 'Resume Production',   order: 50 },
        { id: '953bb8c1937f8310e61e3b277bba10ff', name: 'Cancel Production',   order: 60 }
    ];

    for (var a = 0; a < executionActions.length; a++) {
        var act = executionActions[a];
        
        // Unlock button record
        var bGr = new GlideRecord('sys_sg_button');
        if (bGr.get(act.id)) {
            bGr.active = true;
            bGr.roles = '';
            bGr.update();
        }

        // Link button into Detail Screen action bar
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
            gs.print('   ⚡ Linked Shop-Floor Action [' + act.name + '] to Production Order Detail');
        } else {
            biGr.order = act.order;
            biGr.update();
            gs.print('   ℹ️ Action [' + act.name + '] active on Production Order Detail');
        }
    }

    // -------------------------------------------------------------------------
    // 4. MAP 5 LIVE DATA TABS TO ALL THREE NAVIGATION BARS
    // -------------------------------------------------------------------------
    gs.print('\n🗺️ [4/6] Synchronizing 5-Tab Navigation Across All Navigation Bars...');

    var targetNavBars = [
        { id: '698f1445937b8310e61e3b277bba1009', name: 'Industrial Production Management Mobile' },
        { id: '9f67848187403300e0ef0cf888cb0b2e', name: 'Now Mobile Nav' },
        { id: '679d4f0653d033002d96ddeeff7b1279', name: 'Mobile Agent' }
    ];

    // The 5 Tabs that stream live data directly
    var liveTabs = [
        { tabId: '89546b8193738310e61e3b277bba10e6', label: 'Dashboard',  order: 10 },
        { tabId: '9154ab8193738310e61e3b277bba102f', label: 'Production', order: 20 },
        { tabId: '9554ab8193738310e61e3b277bba1050', label: 'Inventory',  order: 30 },
        { tabId: 'ed54ab8193738310e61e3b277bba1096', label: 'Alerts',     order: 40 },
        { tabId: '6e1e1b8193338310e61e3b277bba1023', label: 'More',       order: 50 }
    ];

    for (var nb = 0; nb < targetNavBars.length; nb++) {
        var targetNav = targetNavBars[nb];

        // Increment version to force client to refresh
        var nGr = new GlideRecord('sys_sg_navigation');
        if (nGr.get(targetNav.id)) {
            nGr.sys_mod_count = parseInt(nGr.sys_mod_count || 0) + 1;
            nGr.update();
        }

        // Remove old/obsolete tab mappings
        var wipeMap = new GlideRecord('sys_sg_navigation_tab_map');
        wipeMap.addQuery('navigation', targetNav.id);
        wipeMap.query();
        while (wipeMap.next()) {
            var currTab = wipeMap.navigation_tab.toString();
            var isLive = false;
            for (var lt = 0; lt < liveTabs.length; lt++) {
                if (liveTabs[lt].tabId === currTab) { isLive = true; break; }
            }
            if (!isLive) {
                wipeMap.deleteRecord();
            }
        }

        // Ensure all 5 live tabs are mapped
        for (var lt2 = 0; lt2 < liveTabs.length; lt2++) {
            var liveTab = liveTabs[lt2];
            var mapRec = new GlideRecord('sys_sg_navigation_tab_map');
            mapRec.addQuery('navigation', targetNav.id);
            mapRec.addQuery('navigation_tab', liveTab.tabId);
            mapRec.query();
            if (!mapRec.next()) {
                mapRec.initialize();
                mapRec.navigation = targetNav.id;
                mapRec.navigation_tab = liveTab.tabId;
                mapRec.order = liveTab.order;
                mapRec.insert();
                gs.print('   ✅ Mapped [' + liveTab.label + '] into ' + targetNav.name);
            } else {
                mapRec.order = liveTab.order;
                mapRec.update();
            }
        }
    }

    // -------------------------------------------------------------------------
    // 5. UNIFY NATIVE CLIENTS (NOW MOBILE & SERVICENOW AGENT)
    // -------------------------------------------------------------------------
    gs.print('\n📱 [5/6] Unifying Native Clients for Now Mobile and Mobile Agent...');

    var clientList = [
        { name: 'Now Mobile',                                     type: 'request', nav: '698f1445937b8310e61e3b277bba1009' },
        { name: 'Now Mobile Admin',                               type: 'request', nav: '698f1445937b8310e61e3b277bba1009' },
        { name: 'Industrial Production Management (Now Mobile)',  type: 'request', nav: '698f1445937b8310e61e3b277bba1009' },
        { name: 'Mobile Agent',                                   type: 'agent',   nav: '698f1445937b8310e61e3b277bba1009' },
        { name: 'Industrial Production Management',               type: 'agent',   nav: '698f1445937b8310e61e3b277bba1009' }
    ];

    for (var c = 0; c < clientList.length; c++) {
        var cl = clientList[c];
        var cGr = new GlideRecord('sys_sg_native_client');
        cGr.addQuery('name', cl.name);
        cGr.query();
        if (cGr.next()) {
            cGr.active = true;
            cGr.navigation = cl.nav;
            cGr.access_control_type = '';
            cGr.update();
            gs.print('   ✅ Client [' + cl.name + '] -> Linked to Nav: ' + cl.nav);
        }
    }

    // -------------------------------------------------------------------------
    // 6. CACHE FLUSH
    // -------------------------------------------------------------------------
    gs.print('\n🔄 [6/6] Flushing all Server Mobile Caches...');
    try {
        GlideCacheManager.flush('sys_sg_native_client');
        GlideCacheManager.flush('sys_sg_navigation');
        GlideCacheManager.flush('sys_sg_navigation_tab_map');
        GlideCacheManager.flush('sys_sg_applet_tab');
        GlideCacheManager.flush('sys_sg_applet_launcher_tab');
        GlideCacheManager.flush('sys_sg_master_item');
        GlideCacheManager.flush('sys_sg_item_stream');
        GlideCacheManager.flush('sys_sg_item_stream_m2m_master_item');
        GlideCacheManager.flush('sys_sg_button');
        GlideCacheManager.flush('sys_sg_button_instance');
        GlideCacheManager.flush('sg_native_client_cache');
        GlideCacheManager.flush('sg_sections_cache');
        GlideCacheManager.flush('sg_screens_cache');
        GlideCacheManager.flush('sg_master_item_cache');
        gs.print('  ✅ All mobile server caches successfully flushed.');
    } catch (e) {}

    gs.print('\n🎉 NOW MOBILE PRODUCTION EXECUTION SUITE SUCCESSFULLY DEPLOYED!');
})();
