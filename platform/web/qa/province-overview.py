"""Read-only browser regression for the complete province entry point."""
import importlib.util
import json
import math
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

spec = importlib.util.spec_from_file_location('regression', Path(__file__).with_name('release-regression.py'))
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)
BASE = os.environ.get('QA_OVERVIEW_URL', qa.PREVIEW).rstrip('/')
OUT = qa.ROOT / 'tmp/province-overview'
OUT.mkdir(parents=True, exist_ok=True)


def coordinates(value):
    if isinstance(value[0], (int, float)):
        yield value
    else:
        for child in value:
            yield from coordinates(child)


def mercator(lng, lat):
    return (lng + 180) / 360, (1 - math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) / math.pi) / 2


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path=os.environ['QA_CHROME'])
    context = qa.context_for(browser, BASE)
    page = context.new_page()
    errors, resources, lookups = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('response', lambda r: resources.append((r.url, r.status)))
    page.on('request', lambda r: lookups.append(r.url) if '/lookup/' in r.url else None)
    overview = context.request.get(BASE + '/api/v1/areas/overview').json()['data']
    assert len(overview['features']) == 124
    points = [mercator(*xy) for feature in overview['features'] for xy in coordinates(feature['geometry']['coordinates'])]
    xmin, xmax = min(x for x,y in points), max(x for x,y in points)
    ymin, ymax = min(y for x,y in points), max(y for x,y in points)

    def enter():
        page.goto(BASE + '/')
        page.locator('.login-role-card.citizen').click()
        page.locator('.map-canvas[data-map-loaded="true"][data-overview-count="124"]').wait_for(timeout=45000)
        expect(page.get_by_role('combobox', name='Chọn xã/phường')).to_be_enabled()

    for width, height in [(375,812),(812,375),(1440,900)]:
        page.set_viewport_size({'width':width,'height':height})
        enter()
        selector = page.get_by_role('combobox', name='Chọn xã/phường')
        expect(selector.locator('option')).to_have_count(125)
        expect(selector).to_have_value('')
        expect(page.locator('.map-canvas')).not_to_have_attribute('data-boundary-rendered')
        assert 'area=' not in page.url and not page.locator('.position-marker').count(), 'Default must not claim a GPS location'
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path=OUT/f'overview-{width}.png')
        for code in ['24916','24611','22945','24781']:
            selector.select_option(code)
            page.locator(f'.map-canvas[data-boundary-rendered="{code}"]').wait_for(timeout=20000)
            expect(page.locator('#area-result-title')).to_be_visible()
            assert 'area='+code in page.url
            page.get_by_role('button',name='Toàn tỉnh',exact=True).click()
            expect(selector).to_have_value('')
            expect(page.locator('.map-canvas')).not_to_have_attribute('data-boundary-rendered')
        print(f'PASS province overview + 4 regional selections + return at {width}px',flush=True)

    # Exercise an actual rendered polygon, not only a dropdown/API request.
    # Reproduce the public map's north-up fitBounds projection from source data.
    enter()
    rect = page.locator('.map-canvas canvas').bounding_box()
    scale = min((rect['width']-144)/(xmax-xmin),(rect['height']-144)/(ymax-ymin))
    center = context.request.get(BASE+'/api/v1/lookup/by-code/22945').json()['data']['center']
    x,y = mercator(center['longitude'],center['latitude'])
    px = rect['width']/2+(x-(xmin+xmax)/2)*scale
    py = rect['height']/2+(y-(ymin+ymax)/2)*scale
    before = len(lookups)
    page.locator('.map-canvas canvas').click(position={'x':px,'y':py})
    page.locator('.map-canvas[data-boundary-rendered="22945"]').wait_for(timeout=20000)
    assert any('/lookup/by-code/22945' in u for u in lookups[before:]), 'Polygon selection did not resolve its source locality'
    page.reload()
    page.locator('.login-role-card.citizen').click()
    page.locator('.map-canvas[data-boundary-rendered="22945"]').wait_for(timeout=45000)
    expect(page.get_by_role('combobox',name='Chọn xã/phường')).to_have_value('22945')
    page.get_by_role('button',name='Toàn tỉnh',exact=True).click()
    page.get_by_role('button',name='Vị trí của tôi',exact=True).click()
    page.locator('.map-canvas[data-boundary-rendered="24781"]').wait_for(timeout=20000)
    expect(page.locator('.position-marker')).to_have_count(1)
    print('PASS actual polygon click, deep-link reload, GPS selection',flush=True)

    # Network failure must be explicit and recoverable, not a blank map shell.
    context.route('**/api/v1/areas/overview',lambda route: route.fulfill(status=503,content_type='application/json',body='{}'))
    page.goto(BASE+'/')
    page.locator('.login-role-card.citizen').click()
    expect(page.locator('.overview-error')).to_be_visible()
    context.unroute('**/api/v1/areas/overview')
    page.locator('.overview-error').get_by_role('button',name='Thử lại').click()
    page.locator('.map-canvas[data-overview-count="124"]').wait_for(timeout=45000)
    expect(page.locator('.overview-error')).to_have_count(0)
    assert any('maplibre-gl-worker-' in u and status==200 for u,status in resources)
    assert any('.pbf' in u and status==200 for u,status in resources)
    assert not errors, errors
    print(json.dumps({'status':'PASS','regions':124,'viewports':3,'selections':12,'polygonClick':True,'gps':True,'retry':True,'pageErrors':errors}),flush=True)
    context.close()
    browser.close()
