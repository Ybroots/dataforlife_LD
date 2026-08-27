from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def env_value(name: str) -> str:
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        if line.startswith(name + "="):
            return line.split("=", 1)[1].strip()
    raise RuntimeError(f"Missing {name}")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        device_scale_factor=1,
        locale="vi-VN",
        geolocation={"latitude": 11.944, "longitude": 108.441},
        permissions=["geolocation"],
    )
    page = context.new_page()
    console_errors: list[str] = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    page.goto("http://127.0.0.1:5173/?feature=reports", wait_until="networkidle")
    if page.get_by_role("button", name="Người dân").count():
        page.get_by_role("button", name="Người dân").click()
    page.get_by_text("Bạn phải đăng nhập VNeID thì mới có thể gửi phản ánh.", exact=True).wait_for()
    assert page.locator('input[name="summary"]').count() == 0
    assert page.locator(".workflow-map-canvas").count() == 0
    assert page.locator(".citizen-feature-auth-gate").is_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    page.screenshot(path=str(ROOT / "e2e" / "artifacts" / "citizen-report-public-mobile.png"), full_page=True)
    page.locator(".citizen-feature-auth-gate button").click()
    page.locator('input[name="username"]').fill(env_value("API_CITIZEN_USERNAME"))
    page.locator('input[name="password"]').fill(env_value("API_CITIZEN_PASSWORD"))
    page.locator('form button[type="submit"]').click()
    page.locator(".citizen-session-button").wait_for()
    page.get_by_role("heading", name="Nội dung, vị trí và xác nhận").wait_for()

    page.goto("http://127.0.0.1:5173/?feature=alerts", wait_until="networkidle")
    page.get_by_role("heading", name="Cảnh báo khu vực").wait_for()
    assert page.get_by_text("Dữ liệu do cán bộ trực ban phát hành trong phạm vi địa bàn.").is_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    page.screenshot(path=str(ROOT / "e2e" / "artifacts" / "citizen-alerts-mobile.png"), full_page=True)

    page.goto("http://127.0.0.1:5173/?portal=police", wait_until="networkidle")
    if page.get_by_role("button", name="Cán bộ Công an").count():
        page.get_by_role("button", name="Cán bộ Công an").click()
    if page.locator('input[name="username"]').count():
        page.locator('input[name="username"]').fill(env_value("API_OFFICER_USERNAME"))
        page.locator('input[name="password"]').fill(env_value("API_OFFICER_PASSWORD"))
        page.locator('form button[type="submit"]').click()
    page.get_by_role("button", name="Nghiệp vụ", exact=True).wait_for()
    page.get_by_role("button", name="Nghiệp vụ", exact=True).click()
    page.get_by_role("heading", name="Nghiệp vụ địa bàn").wait_for()
    assert page.get_by_text("Phát hành cảnh báo khu vực").is_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    page.get_by_role("tab", name="Tuần tra").click()
    assert page.get_by_text("Lập lịch tuần tra").is_visible()
    page.screenshot(path=str(ROOT / "e2e" / "artifacts" / "police-operations-mobile.png"), full_page=True)

    unexpected_errors = [item for item in console_errors if "401 (Unauthorized)" not in item]
    assert not unexpected_errors, unexpected_errors
    print("extended-ui-ok: citizen alerts + officer operations at 390x844")
    browser.close()
