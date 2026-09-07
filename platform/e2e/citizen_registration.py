from pathlib import Path
from time import time

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "http://127.0.0.1:5173/"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 390, "height": 844}, locale="vi-VN")
    page = context.new_page()
    browser_errors: list[str] = []
    page.on("pageerror", lambda error: browser_errors.append(str(error)))
    page.on(
        "console",
        lambda message: browser_errors.append(message.text)
        if message.type == "error" and "401 (Unauthorized)" not in message.text
        else None,
    )
    page.add_init_script("localStorage.setItem('cskv-citizen-tour-v1', 'completed')")
    page.goto(BASE_URL, wait_until="networkidle")
    page.get_by_role("button", name="Đăng nhập hoặc đăng ký").click()
    page.get_by_role("tab", name="Đăng ký").click()
    phone = f"0987{str(int(time() * 1000))[-6:]}"
    password = "CongDan@2026"
    page.get_by_label("Họ và tên").fill("Nguyễn Văn An")
    page.get_by_label("Số điện thoại").fill(phone)
    page.get_by_label("Mật khẩu", exact=True).fill(password)
    page.get_by_label("Nhập lại mật khẩu").fill("MatKhauKhongKhop1")
    page.get_by_role("button", name="Tạo tài khoản").click()
    page.get_by_text("Mật khẩu nhập lại chưa khớp.", exact=True).wait_for()
    page.get_by_label("Nhập lại mật khẩu").fill(password)
    page.get_by_role("button", name="Tạo tài khoản").click()
    page.get_by_role("button", name="Tài khoản", exact=True).click()
    page.get_by_role("heading", name="Nguyễn Văn An", exact=True).wait_for()
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    artifact = ROOT / "test-results" / "citizen-registration-mobile.png"
    artifact.parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(artifact), full_page=True)
    page.get_by_role("button", name="Đăng xuất tài khoản").click()
    page.get_by_role("button", name="Tài khoản", exact=True).click()
    page.get_by_role("button", name="Đăng nhập hoặc đăng ký", exact=True).click()
    page.get_by_label("Số điện thoại").fill(phone)
    page.get_by_label("Mật khẩu", exact=True).fill(password)
    page.get_by_role("button", name="Đăng nhập", exact=True).click()
    page.get_by_role("heading", name="Nguyễn Văn An", exact=True).wait_for()
    assert not browser_errors, browser_errors
    browser.close()
    print("citizen-registration-ok")
