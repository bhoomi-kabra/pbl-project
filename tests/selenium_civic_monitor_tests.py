"""
🏛️ Nashik Roads & Civic Monitor - Automated Selenium WebDriver Test Suite
========================================================================
Tool: Selenium WebDriver (Python)
Browsers Supported: Google Chrome / Microsoft Edge
Target URL: http://localhost:5173

Execution:
  python tests/selenium_civic_monitor_tests.py
"""

import sys
import time
import os

# Set UTF-8 encoding for Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("\n" + "="*80)
print("🚀 NASHIK CIVIC MONITOR: SELENIUM WEBDRIVER AUTOMATED E2E UI TEST SUITE")
print("="*80 + "\n")

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.edge.options import Options as EdgeOptions
except ImportError:
    print("❌ Selenium package is not yet installed in your Python environment.")
    print("👉 Please run: pip install selenium")
    print("💡 Alternatively, you can run the ready-to-use Node.js test suite:")
    print("   node tests/run_pbl_test_suite.js\n")
    sys.exit(0)

def get_driver():
    """Initializes Chrome or Edge WebDriver with fallback"""
    # Try Chrome first
    try:
        chrome_options = ChromeOptions()
        chrome_options.add_argument("--start-maximized")
        chrome_options.add_argument("--disable-infobars")
        chrome_options.add_argument("--disable-notifications")
        # chrome_options.add_argument("--headless=new") # Uncomment for headless execution
        driver = webdriver.Chrome(options=chrome_options)
        print("  ✓ Initialized Google Chrome WebDriver successfully.")
        return driver
    except Exception as e:
        print(f"  ⚠ Chrome launch notice: {e}. Trying Microsoft Edge...")

    # Fallback to Edge
    try:
        edge_options = EdgeOptions()
        edge_options.add_argument("--start-maximized")
        driver = webdriver.Edge(options=edge_options)
        print("  ✓ Initialized Microsoft Edge WebDriver successfully.")
        return driver
    except Exception as e:
        print(f"❌ Failed to launch browser driver: {e}")
        print("💡 Ensure Chrome or Edge is installed. Or run 'node tests/run_pbl_test_suite.js'")
        sys.exit(1)

def run_selenium_tests():
    driver = get_driver()
    driver.implicitly_wait(6)
    wait = WebDriverWait(driver, 10)
    
    test_results = []
    
    def log_result(test_id, name, status, reason=""):
        test_results.append({"id": test_id, "name": name, "status": status, "reason": reason})
        icon = "✓ PASS" if status == "PASS" else ("⚠ PARTIAL" if status == "PARTIAL" else "✗ FAIL")
        color = "\033[32m" if status == "PASS" else ("\033[33m" if status == "PARTIAL" else "\033[31m")
        reset = "\033[0m"
        print(f"[{test_id}] {color}{icon}{reset} : {name}")
        if reason:
            print(f"      ↳ {reason}")

    try:
        # TEST 1: Load Homepage
        print("\n--- Running Selenium UI Test Cases ---")
        driver.get("http://localhost:5173")
        time.sleep(2)
        
        if "Nashik" in driver.title or len(driver.find_elements(By.ID, "root")) > 0:
            log_result("SEL-TC-01", "Homepage Load & DOM Container Mount", "PASS")
        else:
            log_result("SEL-TC-01", "Homepage Load & DOM Container Mount", "FAIL", "Page title or #root missing")

        # TEST 2: Bilingual Marathi / English Toggle
        try:
            lang_button = driver.find_element(By.XPATH, "//button[contains(., 'मराठी') or contains(., 'English')]")
            initial_text = lang_button.text
            lang_button.click()
            time.sleep(1)
            new_text = lang_button.text
            if initial_text != new_text:
                log_result("SEL-TC-02", "Bilingual Language Switcher (EN ⇄ MR)", "PASS")
            else:
                log_result("SEL-TC-02", "Bilingual Language Switcher (EN ⇄ MR)", "PARTIAL", "Button clicked but text label did not toggle")
        except Exception as e:
            log_result("SEL-TC-02", "Bilingual Language Switcher (EN ⇄ MR)", "FAIL", str(e))

        # TEST 3: Leaflet GIS Map Interactive Container
        try:
            map_container = driver.find_element(By.CLASS_NAME, "leaflet-container")
            if map_container.is_displayed():
                log_result("SEL-TC-03", "Leaflet GIS Map Mounting & Layer Display", "PASS")
            else:
                log_result("SEL-TC-03", "Leaflet GIS Map Mounting & Layer Display", "PARTIAL", "Map mounted but container not visible")
        except Exception as e:
            log_result("SEL-TC-03", "Leaflet GIS Map Mounting & Layer Display", "FAIL", "Leaflet map container not rendered")

        # TEST 4: Open Grievance Modal
        try:
            report_btn = driver.find_element(By.XPATH, "//button[contains(., 'Report Grievance') or contains(., 'तक्रार नोंदवा')]")
            report_btn.click()
            time.sleep(1.5)
            
            modal_title = driver.find_element(By.XPATH, "//*[contains(text(), 'Citizen Grievance') or contains(text(), 'नागरी तक्रार')]")
            if modal_title:
                log_result("SEL-TC-04", "Citizen Grievance Submission Modal Trigger", "PASS")
        except Exception as e:
            log_result("SEL-TC-04", "Citizen Grievance Submission Modal Trigger", "FAIL", str(e))

        # TEST 5: Interactive Landmark Snapping (Hirawadi Road)
        try:
            loc_input = driver.find_element(By.XPATH, "//input[@placeholder='e.g. Indu Heights, Hirawadi Road, Vidhate Nagar' or contains(@placeholder, 'Hirawadi')]")
            loc_input.clear()
            loc_input.send_keys("Hirawadi Road")
            time.sleep(1)
            
            # Check if coordinates update on UI
            page_src = driver.page_source
            if "20.027" in page_src:
                log_result("SEL-TC-05", "Interactive Landmark Snapping for Hirawadi Road [20.0270, 73.8140]", "PASS")
            else:
                log_result("SEL-TC-05", "Interactive Landmark Snapping for Hirawadi Road", "PARTIAL", "Pin snapped but text display unconfirmed")
        except Exception as e:
            log_result("SEL-TC-05", "Interactive Landmark Snapping for Hirawadi Road", "FAIL", str(e))

        # TEST 6: Negative Mobile Validation Test (Known Gap / Lagging Area)
        try:
            phone_input = driver.find_element(By.XPATH, "//input[@type='tel' or contains(@placeholder, '98230XXXXX') or contains(@placeholder, 'Mobile')]")
            phone_input.clear()
            phone_input.send_keys("123") # Invalid!
            
            submit_btn = driver.find_element(By.XPATH, "//button[contains(., 'Submit') or contains(., 'नोंदवा')]")
            is_disabled = submit_btn.get_attribute("disabled")
            
            if is_disabled:
                log_result("SEL-TC-06", "Strict 10-Digit Indian Mobile Number Validation", "PASS")
            else:
                # System permits submission with invalid mobile!
                log_result("SEL-TC-06", "Strict 10-Digit Indian Mobile Number Validation", "FAIL", 
                           "LAGGING: Form permits submission with invalid 3-digit phone number '123' without regex validation (/^[6-9]\\d{9}$/)")
        except Exception as e:
            log_result("SEL-TC-06", "Strict 10-Digit Indian Mobile Number Validation", "FAIL", str(e))

        # Close Modal
        try:
            close_btn = driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Close') or contains(., 'Cancel') or contains(., 'रद्द')]")
            close_btn.click()
            time.sleep(1)
        except:
            driver.get("http://localhost:5173")
            time.sleep(1)

        # TEST 7: Executive Admin Route Guarding (Known Security Lag)
        try:
            admin_tab = driver.find_element(By.XPATH, "//button[contains(., 'Admin Portal') or contains(., 'प्रशासन')]")
            admin_tab.click()
            time.sleep(1.5)
            
            # Check if admin dashboard opened without login prompt
            if "Admin" in driver.page_source or "Executive" in driver.page_source:
                log_result("SEL-TC-07", "Role-Based Access Control (RBAC) Token Authentication Guard", "FAIL",
                           "LAGGING: Admin Portal accessible via client-side tab switch without JWT/OAuth password credentials")
            else:
                log_result("SEL-TC-07", "Role-Based Access Control (RBAC) Token Authentication Guard", "PASS")
        except Exception as e:
            log_result("SEL-TC-07", "Role-Based Access Control (RBAC) Token Authentication Guard", "FAIL", str(e))

    finally:
        driver.quit()
        print("\n" + "="*80)
        print("📊 SELENIUM TEST EXECUTION SUMMARY:")
        passed = sum(1 for t in test_results if t['status'] == 'PASS')
        partial = sum(1 for t in test_results if t['status'] == 'PARTIAL')
        failed = sum(1 for t in test_results if t['status'] == 'FAIL')
        total = len(test_results)
        print(f"   Total: {total} | Passed: {passed} | Partial: {partial} | Failed: {failed}")
        print(f"   Success Rate: {((passed/total)*100):.1f}%")
        print("="*80 + "\n")

if __name__ == "__main__":
    run_selenium_tests()
