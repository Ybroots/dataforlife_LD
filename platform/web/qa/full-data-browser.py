"""Supplementary release checks. Writes ONLY to an explicitly isolated QA API."""
import importlib.util
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

spec = importlib.util.spec_from_file_location('regression', Path(__file__).with_name('release-regression.py'))
qa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)
BASE = qa.PREVIEW
OUT = qa.ROOT / 'tmp/release-full-data-extra'
OUT.mkdir(parents=True, exist_ok=True)


with sync_playwright() as pw:
    officer_cookies = qa.local_session(pw, 'officer')
    officer = pw.request.new_context(base_url=BASE, storage_state={'cookies':officer_cookies, 'origins':[]})
    assert officer.get('/api/health').json().get('releaseValidation') is True
    now = datetime.now(timezone.utc)
    timestamp = str(int(now.timestamp()))
    alert_title = 'QA cảnh báo vị trí ' + timestamp
    result = officer.post('/api/v1/officer/alerts', data={
        'title':alert_title, 'summary':'Cảnh báo chỉ dùng trong database kiểm thử riêng.',
        'category':'traffic', 'riskLevel':'info', 'latitude':11.944,'longitude':108.441,
        'startsAt':(now-timedelta(minutes=1)).isoformat(), 'endsAt':(now+timedelta(hours=1)).isoformat()})
    assert result.status == 201, 'Create isolated public alert failed'
    alert = result.json()['data']
    patrol = officer.post('/api/v1/officer/patrols',data={'title':'QA tuần tra '+timestamp,'routeNote':'Kiểm thử riêng','scheduledAt':now.isoformat()})
    assert patrol.status == 201
    patrol_id = patrol.json()['data']['id']
    for action in ['start','pause','resume','checkin','complete']:
        response = officer.post(f'/api/v1/officer/patrols/{patrol_id}/actions',data={'action':action,'latitude':11.944,'longitude':108.441})
        assert response.ok, 'Patrol action failed: '+action
    assert officer.post('/api/v1/officer/shift-reports',data={'note':'QA báo cáo cuối ca trong database riêng.'}).status == 201
    for period in ['day','month','year']:
        assert officer.get('/api/v1/officer/statistics',params={'period':period}).ok
    print('PASS public alert, patrol lifecycle/GPS, shift report, day/month/year statistics',flush=True)

    browser = pw.chromium.launch(headless=True, executable_path=os.environ['QA_CHROME'])
    context = qa.context_for(browser, BASE, qa.local_session(pw,'citizen'))
    page = context.new_page()
    errors=[]
    resources=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('response',lambda response:resources.append((response.url,response.status)))
    # Search three distinct regions from the actual UI, persist via URL and reload.
    for code, width, height in [('24916',375,812),('24611',812,375),('24781',1440,900)]:
        # Select an existing source code if this deployment's canonical code differs.
        candidates = context.request.get(BASE+'/api/v1/areas',params={'query':code}).json()['data']
        assert candidates, 'Missing source code '+code
        name = candidates[0]['name']
        page.set_viewport_size({'width':width,'height':height})
        qa.enter(page,BASE,'directory','citizen')
        page.locator('#area-search').fill(code)
        page.get_by_role('option').filter(has_text=code).click()
        expect(page.locator('#area-result-title')).to_have_text(name)
        assert 'area='+code in page.url
        page.locator('.unit-directory summary').click()
        expect(page.locator('.unit-directory')).to_contain_text('12 đơn vị · 20 liên hệ')
        expect(page.locator('.unit-directory .contact-card')).to_have_count(20)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.screenshot(path=OUT/f'directory-{code}-{width}.png',full_page=True)
        page.reload()
        page.locator(f'.map-canvas[data-boundary-rendered="{code}"]').wait_for(timeout=35000)
        expect(page.locator('#area-search')).to_have_value(name)
        qa.enter(page,BASE,'alerts','citizen')
        # enter() deliberately starts a new URL: use a region deep link explicitly.
        page.goto(BASE+f'/?feature=alerts&area={code}')
        expect(page.locator('#alerts-title')).to_contain_text(name)
        page.goto(BASE+f'/?area={code}')
        page.locator(f'.map-canvas[data-boundary-rendered="{code}"]').wait_for(timeout=35000)
        page.screenshot(path=OUT/f'map-{code}-{width}.png')
    page.set_viewport_size({'width':375,'height':812})
    page.goto(BASE+'/?feature=alerts&area='+alert['areaCode'])
    expect(page.locator('.alert-demo-card').filter(has_text=alert_title)).to_be_visible()
    page.get_by_role('button',name='Xem trên bản đồ',exact=True).click()
    pin=page.locator(f'[data-map-point-id="alert:{alert["id"]}"]')
    expect(pin).to_be_visible()
    # Same-location alerts may overlap visually; keyboard access must still work.
    pin.focus()
    pin.press('Enter')
    expect(page.locator('.alert-popup')).to_contain_text(alert_title)
    expect(page.locator('.alert-popup')).to_contain_text('Cảnh báo công khai đang hiệu lực')
    page.screenshot(path=OUT/'public-alert-map.png')
    assert any('maplibre-gl-worker-' in u and status==200 for u,status in resources), 'Worker missing'
    assert any('.pbf' in u and status==200 for u,status in resources), 'Vector tiles missing'
    assert not errors, errors
    context.close()
    browser.close()
    officer.dispose()
    print(json.dumps({'status':'PASS','regionViews':3,'unitContacts':20,'mapWorker':True,'vectorTiles':True,'publicAlertPin':True,'pageErrors':errors}),flush=True)
