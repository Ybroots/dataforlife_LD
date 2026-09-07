from pathlib import Path
from time import time
import os

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = os.environ.get("QA_BASE_URL", "http://127.0.0.1:5173/").rstrip("/") + "/"


def env_value(name: str) -> str:
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        if line.startswith(name + "="):
            return line.split("=", 1)[1].strip()
    raise RuntimeError(f"Missing {name}")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    guest_context = browser.new_context(viewport={"width": 390, "height": 844}, locale="vi-VN")
    guest = guest_context.new_page()
    guest.add_init_script("localStorage.setItem('cskv-citizen-tour-v1', 'completed')")
    guest.goto(BASE_URL, wait_until="networkidle")
    guest.get_by_role("button", name="Người dân").click()
    guest.locator(".map-canvas").wait_for()
    assert guest.locator(".map-sos-button").is_visible()
    assert guest.evaluate("document.documentElement.scrollWidth <= window.innerWidth")

    guest.get_by_role("button", name="Tài khoản", exact=True).click()
    guest.get_by_role("button", name="Đăng nhập hoặc đăng ký", exact=True).click()
    guest.get_by_role("tab", name="Đăng ký").click()
    phone = os.environ.get("QA_CITIZEN_PHONE", f"0987{str(int(time() * 1000))[-6:]}")
    guest.get_by_label("Họ và tên").fill("Nguyễn Văn An")
    guest.get_by_label("Số điện thoại").fill(phone)
    guest.get_by_label("Mật khẩu", exact=True).fill("CongDan@2026")
    guest.get_by_label("Nhập lại mật khẩu").fill("CongDan@2026")
    guest.get_by_role("button", name="Tạo tài khoản").click()
    guest.get_by_role("heading", name="Nguyễn Văn An", exact=True).wait_for()

    officer_context = browser.new_context(viewport={"width": 1366, "height": 768}, locale="vi-VN")
    officer = officer_context.new_page()
    officer.goto(f"{BASE_URL}?portal=police", wait_until="networkidle")
    entry = officer.get_by_role("button", name="Cán bộ Công an")
    if entry.count():
        entry.click()
    officer_username = os.environ.get("QA_OFFICER_USERNAME", env_value("API_OFFICER_USERNAME"))
    officer_password = os.environ.get("QA_OFFICER_PASSWORD", env_value("API_OFFICER_PASSWORD"))
    officer.locator('input[name="username"]').fill(officer_username)
    officer.locator('input[name="password"]').fill(officer_password)
    officer.locator('form button[type="submit"]').click()
    officer.locator(".police-portal").wait_for()
    assert officer.get_by_role("button", name="Mở công cụ nghiệp vụ", exact=True).is_visible()

    browser.close()
    print("account-release-smoke-ok")
