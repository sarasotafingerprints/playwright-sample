require('dotenv').config();

const { getPlaywrightVersion } = require('playwright-core/lib/utils');
const { chromium } = require('playwright-extra')
const stealth = require("puppeteer-extra-plugin-stealth")()
chromium.use(stealth);

const {expect} = require("expect");

const playWrightClientVersion = getPlaywrightVersion();
console.log("playWrightClientVersion:", playWrightClientVersion);

(async () => {
  const capabilities = {
    'browserName': 'Chrome', // Browsers allowed: `Chrome`, `MicrosoftEdge`, `pw-chromium`, `pw-firefox` and `pw-webkit`
    'browserVersion': 'latest',
    'LT:Options': {
      'platform': 'Windows 10',
      'build': 'Playwright Single Build',
      'name': 'Playwright Sample Test',
      'user': 'mikesarasotafingerprints',
      'accessKey': 'Jx7ybD7j7EDnqvenT9Be5rvp25ng9aBwYlq49gEdvXFIn97Q3F',
      'network': true,
      'video': true,
      'console': true,
      'tunnel': false, // Add tunnel configuration if testing locally hosted webpage
      'tunnelName': '', // Optional
      'geoLocation': '', // country code can be fetched from https://www.lambdatest.com/capabilities-generator/
      'playwrightClientVersion': playwrightClientVersion
    }
  }

  const browser = await chromium.connect({
    wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`
  })

  const page = await browser.newPage()
  let url = "https://calendly.com/srqfingerprints/sarasota-fingerprints-appointment-walk-in/2023-09-21T17:00:00Z?first_name=Mike&last_name=Tester&email=mike@sarasotafingerprints.com";
  await page.goto(url, { waitUntil: 'networkidle' });

  let element = await page.locator('BUTTON[type="submit"]');
  await element.click();
  
  await page.waitForTimeout(6000);
  //await page.screenshot({ path: 'screenshot.png', fullPage: true });
  const title = await page.title();

  console.log(title);

  try {
    expect(title).toEqual('Confirmed - Calendly');
    // Mark the test as completed or failed
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'passed', remark: 'Title matched' } })}`)
    await teardown(page, browser)
  } catch (e) {
    await page.evaluate(_ => {}, `lambdatest_action: ${JSON.stringify({ action: 'setTestStatus', arguments: { status: 'failed', remark: e.stack } })}`)
    await teardown(page, browser)
    throw e
  }

})()

async function teardown(page, browser) {
  await page.close();
  await browser.close();
}