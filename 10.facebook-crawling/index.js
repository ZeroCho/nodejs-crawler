const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1920,1080', '--disable-notifications'] });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });
    await page.goto('https://facebook.com');
    const id = process.env.EMAIL;
    const password = process.env.PASSWORD;
    // await page.evaluate((id, password) => {
    //   document.querySelector('#email').value = id;
    //   document.querySelector('#pass').value = password;
    //   document.querySelector('#loginbutton').click();
    // }, id, password);
    await page.type('#email', process.env.EMAIL);
    await page.type('#pass', process.env.PASSWORD);
    await page.waitFor(1000);
    await page.click('#loginbutton');
    await page.waitForResponse((response) => {
      return response.url().includes('login_attempt');
    });
    await page.waitFor(1000);
    await page.keyboard.press('Escape');

    await page.evaluate(() => {

    });

    // await page.click('#userNavigationLabel');
    // await page.waitForSelector('li.navSubmenu:last-child');
    // await page.waitFor(3000);
    // // await page.click('li.navSubmenu:last-child');
    // await page.evaluate(() => {
    //   document.querySelector('li.navSubmenu:last-child').click();
    // });
    // await page.waitFor(3000);
    // await page.close();
    // await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();
