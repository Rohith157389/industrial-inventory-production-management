const https = require('https');

const auth = Buffer.from('admin:Revanth@2006').toString('base64');
const host = 'dev449829.service-now.com';

function apiRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, raw: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function fixMobileNavigation() {
  console.log('=== Configuring Mobile Navigation for Both Mobile Agent & Now Mobile ===');

  // Navigation Bars:
  // Mobile Agent Nav: 679d4f0653d033002d96ddeeff7b1279
  // Now Mobile Nav:   9f67848187403300e0ef0cf888cb0b2e

  // Launcher Tabs to Add:
  const tabs = [
    { id: 'e51e978193338310e61e3b277bba1024', name: 'Dashboard', orderAgent: 10, orderNow: 20 },
    { id: '8e1e978193338310e61e3b277bba1062', name: 'Production', orderAgent: 20, orderNow: 30 },
    { id: 'd61e978193338310e61e3b277bba10e1', name: 'Inventory', orderAgent: 30, orderNow: 40 },
    { id: 'd21ed78193338310e61e3b277bba10d5', name: 'Alerts', orderAgent: 40, orderNow: 50 },
    { id: '6e1e1b8193338310e61e3b277bba1023', name: 'More', orderAgent: 50, orderNow: 55 }
  ];

  const targetNavBars = [
    { navId: '679d4f0653d033002d96ddeeff7b1279', label: 'Mobile Agent Nav', orderField: 'orderAgent' },
    { navId: '9f67848187403300e0ef0cf888cb0b2e', label: 'Now Mobile Nav', orderField: 'orderNow' }
  ];

  // Fetch existing maps
  const existingRes = await apiRequest({
    hostname: host,
    path: '/api/now/table/sys_sg_navigation_tab_map?sysparm_limit=100&sysparm_fields=sys_id,navigation,navigation_tab',
    headers: { 'Authorization': 'Basic ' + auth, 'Accept': 'application/json' }
  });

  const existingSet = new Set();
  if (existingRes.data && existingRes.data.result) {
    existingRes.data.result.forEach(r => {
      const nav = r.navigation?.value || r.navigation;
      const tab = r.navigation_tab?.value || r.navigation_tab;
      existingSet.add(`${nav}:${tab}`);
    });
  }

  for (const nb of targetNavBars) {
    for (const t of tabs) {
      const key = `${nb.navId}:${t.id}`;
      if (existingSet.has(key)) {
        console.log(`[EXISTS] Tab "${t.name}" already in ${nb.label}`);
        continue;
      }

      console.log(`Adding Tab "${t.name}" to ${nb.label}...`);
      const payload = JSON.stringify({
        navigation: nb.navId,
        navigation_tab: t.id,
        order: t[nb.orderField]
      });

      const res = await apiRequest({
        hostname: host,
        path: '/api/now/table/sys_sg_navigation_tab_map',
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + auth,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, payload);

      if (res.status === 201) {
        console.log(` -> SUCCESS! Created mapping with sys_id: ${res.data.result.sys_id}`);
      } else {
        console.error(` -> FAILED (${res.status}):`, res.data || res.raw);
      }
    }
  }

  // Also make sure Industrial Production Management native client is enabled with type agent
  console.log('\nUpdating native client config for Industrial Production Management...');
  const patchPayload = JSON.stringify({
    label: 'Industrial Production Management',
    active: 'true'
  });
  await apiRequest({
    hostname: host,
    path: '/api/now/table/sys_sg_native_client/8464134593bf4310e61e3b277bba106d',
    method: 'PATCH',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(patchPayload)
    }
  }, patchPayload);

  console.log('Mobile Navigation setup complete!');
}

fixMobileNavigation().catch(console.error);
