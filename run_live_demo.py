"""
🏛️ NASHIK ROADS & CIVIC MONITOR - AUTOMATED LIVE BROWSER DEMO & STQA TEST SUITE
--------------------------------------------------------------------------------
This script automatically:
1. Opens the live website in your default Web Browser (Chrome/Edge/Firefox) at http://localhost:5173
2. Runs the 10 automated STQA Test Cases (TC-01 to TC-10) live on screen.
"""

import webbrowser
import time
import subprocess
import sys

# Force UTF-8 stdout encoding for Windows console compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("\n" + "="*85)
    print("[NASHIK CIVIC MONITOR: AUTOMATED BROWSER LAUNCH & STQA TEST DEMO]")
    print("="*85 + "\n")

    url = "http://localhost:5173/"
    print(f"🌐 1. AUTOMATICALLY OPENING WEBSITE IN BROWSER: {url}")
    print("   Please check your browser window opening now...\n")
    
    # Open default system web browser
    webbrowser.open(url, new=2)
    
    time.sleep(2)

    print("⚡ 2. EXECUTING AUTOMATED STQA TEST CASES (TC-01 TO TC-10)...\n")
    time.sleep(1)

    # Run STQA Python test suite
    result = subprocess.run([sys.executable, "stqa_test_suite.py"], text=True)
    
    if result.returncode == 0:
        print("\n" + "="*85)
        print("✅ DEMO COMPLETE: ALL 10 TEST CASES PASSED WITH 100% SUCCESS RATE!")
        print("="*85 + "\n")
    else:
        print("\n⚠️ Test execution completed with issues.")

if __name__ == "__main__":
    main()
