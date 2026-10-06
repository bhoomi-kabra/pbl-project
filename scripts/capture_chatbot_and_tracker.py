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

def capture_chatbot():
    opts = ChromeOptions()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1440,900")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=opts)
    try:
        driver.get("http://localhost:5173")
        time.sleep(2)
        # Click Chatbot button
        btn = driver.find_element(By.XPATH, "//button[contains(., 'Smart AI') or contains(., 'Civic Assistant')]")
        btn.click()
        time.sleep(2)
        path = os.path.join(output_dir, "04_ai_smart_chatbot.png")
        driver.save_screenshot(path)
        print(f"✓ Chatbot screenshot captured: {path}")
    finally:
        driver.quit()

def capture_tracker_and_admin():
    opts = ChromeOptions()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1440,900")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    driver = webdriver.Chrome(options=opts)
    try:
        driver.get("http://localhost:5173")
        time.sleep(2)
        # Click GIS Map tab
        map_tab = driver.find_element(By.XPATH, "//button[contains(., 'GIS Map') or contains(., 'Interactive GIS')]")
        map_tab.click()
        time.sleep(2)
        
        # Scroll to Verification Tracker
        driver.execute_script("window.scrollTo(0, 950);")
        time.sleep(2)
        path = os.path.join(output_dir, "05_verification_tracker_audit.png")
        driver.save_screenshot(path)
        print(f"✓ Verification Tracker screenshot captured: {path}")

        # Also Sign In as Admin to capture Admin Dashboard
        print("Logging in as Admin...")
        signin_btn = driver.find_element(By.XPATH, "//button[contains(., 'Sign In') or contains(., 'Register')]")
        signin_btn.click()
        time.sleep(1.5)

        # Click "Municipal Officer" tab or button in modal
        try:
            admin_tab = driver.find_element(By.XPATH, "//button[contains(., 'Officer') or contains(., 'Admin')]")
            admin_tab.click()
            time.sleep(1)
            # Submit admin form
            login_submit = driver.find_element(By.XPATH, "//button[contains(., 'Officer Sign In') or contains(., 'Admin Sign In') or contains(., 'Sign In as')]")
            login_submit.click()
            time.sleep(2)
            
            # Switch to Admin Dashboard tab
            admin_dash_btn = driver.find_element(By.XPATH, "//button[contains(., 'Municipal Admin') or contains(., 'Control Center')]")
            admin_dash_btn.click()
            time.sleep(2)
            admin_path = os.path.join(output_dir, "06_municipal_admin_dashboard.png")
            driver.save_screenshot(admin_path)
            print(f"✓ Admin Dashboard screenshot captured: {admin_path}")
        except Exception as e:
            print(f"Admin capture notice: {e}")

    finally:
        driver.quit()

if __name__ == '__main__':
    capture_chatbot()
    capture_tracker_and_admin()
