import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options as ChromeOptions

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

output_dir = r"c:\Users\BHOOMI KABRA\Desktop\Desktop\pbl project\pgl project assignments\Design Screenshots"
os.makedirs(output_dir, exist_ok=True)

chrome_options = ChromeOptions()
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--window-size=1440,900")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

driver = webdriver.Chrome(options=chrome_options)
wait = WebDriverWait(driver, 10)

try:
    print("[1] Opening http://localhost:5173 ...")
    driver.get("http://localhost:5173")
    time.sleep(2)

    # 1. Open Complaint Modal via "+ Report Grievance" button
    print("[2] Opening Complaint Modal...")
    report_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Report Grievance') or contains(., 'Report Hazard')]")))
    report_btn.click()
    time.sleep(1.5)

    # Try entering Hirawadi Road
    try:
        inputs = driver.find_elements(By.TAG_NAME, "input")
        for inp in inputs:
            placeholder = inp.get_attribute("placeholder") or ""
            if "College" in placeholder or "Road" in placeholder or "location" in placeholder.lower():
                inp.clear()
                inp.send_keys("Hirawadi Road / Vidhate Nagar")
                break
        time.sleep(1)
    except Exception as e:
        print(f"Input fill note: {e}")

    complaint_path = os.path.join(output_dir, "03_complaint_modal_landmark_snapping.png")
    driver.save_screenshot(complaint_path)
    print(f"  ✓ Saved: {complaint_path}")

    # Close modal by pressing Escape or clicking outside
    driver.find_element(By.TAG_NAME, "body").send_keys("\uE00C") # ESC key
    time.sleep(1)

    # 2. Click AI Chatbot Assistant Button
    print("[3] Clicking NMC Smart AI Civic Assistant button...")
    try:
        bot_btn = driver.find_element(By.XPATH, "//button[contains(., 'Smart AI') or contains(., 'Civic Assistant')]")
        bot_btn.click()
        time.sleep(1.5)
        bot_path = os.path.join(output_dir, "04_ai_smart_chatbot.png")
        driver.save_screenshot(bot_path)
        print(f"  ✓ Saved: {bot_path}")
    except Exception as e:
        print(f"Bot click note: {e}")

    # Close Chatbot
    driver.find_element(By.TAG_NAME, "body").send_keys("\uE00C")
    time.sleep(1)

    # 3. Switch to GIS Map and scroll to Verification Tracker
    print("[4] Scrolling to 'Closed != Resolved' Verification Tracker...")
    map_tab = driver.find_element(By.XPATH, "//button[contains(., 'GIS Map') or contains(., 'Interactive GIS')]")
    map_tab.click()
    time.sleep(2)

    # Scroll down to Verification Tracker
    driver.execute_script("window.scrollTo(0, 850);")
    time.sleep(1.5)
    tracker_path = os.path.join(output_dir, "05_verification_tracker_audit.png")
    driver.save_screenshot(tracker_path)
    print(f"  ✓ Saved: {tracker_path}")

    print("\n✅ All screenshots captured cleanly!")

except Exception as err:
    print(f"Error: {err}")
finally:
    driver.quit()
