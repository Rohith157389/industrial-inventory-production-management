#!/usr/bin/env python3
"""
1-Click Automated Industrial Dashboard Deployer for ServiceNow.
Usage:
    python deploy_to_instance.py --instance https://devXXXXXX.service-now.com --user admin --password "YourPassword"
"""
import argparse
import sys
import re
import requests

def main():
    parser = argparse.ArgumentParser(description="Deploy Industrial Operations Dashboard to any ServiceNow instance")
    parser.add_argument("--instance", required=True, help="ServiceNow instance URL (e.g. https://dev12345.service-now.com)")
    parser.add_argument("--user", default="admin", help="ServiceNow Admin Username (default: admin)")
    parser.add_argument("--password", required=True, help="ServiceNow Admin Password")
    args = parser.parse_args()

    base_url = args.instance.rstrip('/')
    session = requests.Session()

    print(f"[*] Authenticating to {base_url} as {args.user}...")
    login_url = f"{base_url}/login.do"
    r = session.post(login_url, data={
        'user_name': args.user,
        'user_password': args.password,
        'sys_action': 'sysverb_login'
    }, timeout=30)

    if 'glide_user' not in session.cookies and 'JSESSIONID' not in session.cookies:
        # Fallback query check
        r_check = session.get(f"{base_url}/sys.scripts.do", timeout=30)
        if 'sysverb_run' not in r_check.text:
            print("[-] Login failed. Please check your credentials.")
            sys.exit(1)

    print("[+] Successfully authenticated.")

    # Read the background script
    script_path = "install_industrial_dashboard.js"
    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            script_code = f.read()
    except Exception as e:
        print(f"[-] Could not read {script_path}: {e}")
        sys.exit(1)

    # Get g_ck user token
    r_form = session.get(f"{base_url}/sys.scripts.do", timeout=30)
    token_match = re.search(r"var g_ck = '([^']+)';", r_form.text)
    token = token_match.group(1) if token_match else ''

    print("[*] Executing deployment script via sys.scripts.do...")
    payload = {
        'script': script_code,
        'runscript': 'Run script',
        'sysparm_ck': token,
        'sys_scope': 'global'
    }
    r_exec = session.post(f"{base_url}/sys.scripts.do", data=payload, timeout=60)
    
    if 'DASHBOARD DEPLOYED SUCCESSFULLY' in r_exec.text or 'Updated UI Page' in r_exec.text:
        print("[+] SUCCESS: Industrial Dashboard deployed successfully!")
    else:
        print("[*] Script completed. Inspecting output:")
        for line in r_exec.text.splitlines():
            if 'Script:' in line or 'Updated' in line or 'Created' in line:
                clean_line = re.sub(r'<[^>]+>', '', line).strip()
                print(f"    {clean_line}")

    # Flush cache
    print("[*] Flushing cache...")
    try:
        session.get(f"{base_url}/cache.do", timeout=30)
    except Exception:
        pass

    # Verify live dashboard
    dash_url = f"{base_url}/x_2056099_indust_0_dashboard.do"
    r_dash = session.get(dash_url, timeout=30)
    if r_dash.status_code == 200:
        print(f"[+] Verified Dashboard Live: {dash_url} (HTTP 200)")
    else:
        print(f"[*] Dashboard URL: {dash_url} (HTTP {r_dash.status_code})")

if __name__ == '__main__':
    main()
