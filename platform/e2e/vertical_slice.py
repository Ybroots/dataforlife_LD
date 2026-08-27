from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:5173"
ARTIFACT_DIR = Path(__file__).parent / "artifacts"


def main() -> None:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 1000},
            geolocation={"latitude": 11.944, "longitude": 108.441},
            permissions=["geolocation"],
        )
        page = context.new_page()
        console_errors: list[str] = []
        failed_requests: list[str] = []
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("requestfailed", lambda request: failed_requests.append(f"{request.url}: {request.failure}"))

        page.goto(BASE_URL, wait_until="domcontentloaded")
        page.locator(".app-shell").wait_for()
        page.get_by_role("button", name="Dùng vị trí của tôi").click()
        try:
            page.locator("#area-result-title").wait_for(timeout=15_000)
        except Exception:
            page.screenshot(path=str(ARTIFACT_DIR / "vertical-slice-failure.png"), full_page=True)
            visible_error = page.locator(".error-card").inner_text() if page.locator(".error-card").count() else "no UI error"
            raise AssertionError(
                f"Lookup did not finish; UI={visible_error}; failed_requests={failed_requests}; console={console_errors}"
            )
        assert page.locator("#area-result-title").inner_text() == "Phường Xuân Hương - Đà Lạt"
        page.locator('[data-boundary-rendered="DEMO-DA-LAT"]').wait_for()
        page.wait_for_timeout(750)

        assert page.get_by_text("Địa bàn được xác định từ ranh giới GIS").is_visible()
        assert page.get_by_role("heading", name="Trụ sở Công an").is_visible()
        assert page.locator('a[href="tel:0900000000"]').is_visible()
        assert page.locator('a[href="tel:0910000000"]').is_visible()
        assert page.locator(".position-marker").count() == 1

        page.screenshot(path=str(ARTIFACT_DIR / "vertical-slice-desktop.png"), full_page=True)

        page.set_viewport_size({"width": 390, "height": 844})
        page.screenshot(path=str(ARTIFACT_DIR / "vertical-slice-mobile.png"), full_page=True)

        local_failures = [
            item for item in failed_requests
            if item.startswith(BASE_URL) and "maplibre-gl-worker.mjs" not in item
        ]
        if local_failures:
            raise AssertionError(f"Local browser requests failed: {local_failures}")
        relevant_errors = [
            item for item in console_errors
            if "tile.openstreetmap.org" not in item
            and not item.startswith("Failed to load resource: net::ERR_CONNECTION_REFUSED")
            and "ERR_BLOCKED_BY_CLIENT" not in item
        ]
        if relevant_errors:
            raise AssertionError(f"Browser console errors: {relevant_errors}")

        context.close()

        timeout_context = browser.new_context(viewport={"width": 1280, "height": 800})
        timeout_context.add_init_script(
            """
            Object.defineProperty(navigator, 'geolocation', {
              configurable: true,
              value: {
                getCurrentPosition: (_success, failure) => setTimeout(() => failure({ code: 3 }), 0)
              }
            });
            """
        )
        timeout_page = timeout_context.new_page()
        timeout_page.goto(BASE_URL, wait_until="domcontentloaded")
        timeout_page.locator(".app-shell").wait_for()
        timeout_page.get_by_role("button", name="Dùng vị trí của tôi").click()
        timeout_page.get_by_role("button", name="Thử định vị lại").wait_for()
        timeout_page.screenshot(path=str(ARTIFACT_DIR / "geolocation-timeout-recovery.png"), full_page=True)
        timeout_page.get_by_role("button", name="Dùng vị trí mẫu (local)").click()
        timeout_page.locator("#area-result-title").wait_for()
        assert timeout_page.locator("#area-result-title").inner_text() == "Phường Xuân Hương - Đà Lạt"
        timeout_context.close()

        browser.close()


if __name__ == "__main__":
    main()
