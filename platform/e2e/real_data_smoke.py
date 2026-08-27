from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
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
        page.goto(BASE_URL, wait_until="domcontentloaded")
        try:
            page.wait_for_load_state("networkidle", timeout=15_000)
        except PlaywrightTimeoutError:
            # Raster tiles may continue loading; app/API readiness is asserted below.
            pass

        page.get_by_role("button", name="Dùng vị trí của tôi").click()
        page.locator("#area-result-title").wait_for()
        assert page.locator("#area-result-title").inner_text() == "Xuân Hương - Đà Lạt"
        assert page.get_by_text("Mã địa bàn 24781").is_visible()
        assert page.locator(".contact-card").count() == 2
        assert page.locator(".demo-notice").count() == 0
        assert page.get_by_text("Trụ sở Công an Xuân Hương - Đà Lạt", exact=True).is_visible()
        page.screenshot(path=str(ARTIFACT_DIR / "real-data-desktop.png"), full_page=True)

        context.close()
        browser.close()


if __name__ == "__main__":
    main()
