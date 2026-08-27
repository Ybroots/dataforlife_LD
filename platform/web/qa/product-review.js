// Run with an authenticated LOCAL fixture session:
// playwright-cli -s=design run-code --filename=platform/web/qa/product-review.js
async page => {
  const {origin, hostname} = await page.evaluate(() => ({origin: location.origin, hostname: location.hostname}));
  if (!['127.0.0.1', 'localhost'].includes(hostname)) throw new Error('Local fixture only');
  const errors = [];
  const checks = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({latitude: 11.944, longitude: 108.438, accuracy: 15});
  await page.emulateMedia({reducedMotion: 'reduce'});
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const sizes = [[320,568], [375,812], [768,1024], [1024,768], [1440,900], [812,375]];
  for (const [width, height] of sizes) {
    await page.setViewportSize({width, height});
    for (const feature of ['directory', 'reports', 'sos', 'account']) {
      await page.goto(`${origin}/?feature=${feature}`);
      await page.locator(feature === 'directory' ? '.map-canvas canvas' : '.feature-page').waitFor();
      await settle();
      const metrics = await page.evaluate(() => {
        const map = document.querySelector('.map-pane');
        return {overflow: document.documentElement.scrollWidth > innerWidth, mapHeight: map?.getBoundingClientRect().height};
      });
      assert(!metrics.overflow, `${feature}: overflow at ${width}x${height}`);
      if (feature === 'directory') {
        assert(metrics.mapHeight > height * .65, `Map not dominant at ${width}x${height}`);
        assert(await page.locator('.map-assistant-button').count() === 0, 'Secondary floating assistant returned');
        await page.getByRole('button', {name:'Mở danh bạ địa bàn',exact:true}).click();
        assert(await page.locator('#directory-results').isVisible(), 'Directory does not open');
        await page.getByRole('button', {name:'Thu gọn danh bạ',exact:true}).first().click();
        assert(!(await page.locator('#directory-results').isVisible()), 'Directory does not collapse');
      }
      checks.push(`${feature} ${width}x${height}: pass`);
    }
  }
  await page.setViewportSize({width: 375, height: 812});
  await page.goto(`${origin}/?feature=sos`);
  await page.locator('.sos-ready-status.ready').waitFor();
  const countBefore = (await (await page.request.get(`${origin}/api/v1/citizen/sos`)).json()).data.length;
  await page.locator('.sos-hold-button').focus();
  await page.keyboard.down('Space');
  await page.keyboard.up('Space');
  const countAfter = (await (await page.request.get(`${origin}/api/v1/citizen/sos`)).json()).data.length;
  assert(countBefore === countAfter, 'Short hold created SOS');
  checks.push('SOS short keyboard press: no request sent');
  await page.getByRole('button', {name:'Tính năng',exact:true}).click();
  await page.getByRole('button', {name:'Hướng dẫn sử dụng',exact:true}).click();
  await page.locator('.tour-card').waitFor();
  const titles = [];
  for (let step = 0; step < 6; step++) {
    titles.push(await page.locator('.tour-card h2').innerText());
    if (step > 0) {
      const spotlight = await page.locator('.tour-spotlight').boundingBox();
      assert(spotlight && spotlight.width > 20 && spotlight.height > 20, `Tour target ${step} is hidden`);
      if (step === 5) assert(spotlight.y > 700, 'Mobile account spotlight did not follow bottom navigation');
    }
    await page.locator('.tour-next').click();
  }
  assert(!(await page.locator('.tour-card').isVisible()), 'Tour did not finish');
  assert(titles[4] === 'Trở về vị trí hiện tại', 'Tour points to removed assistant');
  checks.push('6-step tour complete; location replaces removed floating assistant');
  assert(errors.length === 0, errors.join('\n'));
  return {checks, pageErrors: errors};
}
