const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

const db = require('./models');
dotenv.config();

const crawler = async () => {
  try {
    await db.sequelize.sync();
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080', '--disable-notifications'],
      userDataDir: 'C:\Users\zerocho\AppData\Local\Google\Chrome\User Data',
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });
    await page.goto('https://instagram.com');
    if (await page.$('a[href="/zerohch0/"]')) {
      console.log('이미 로그인 되어 있습니다.');
    } else {
      await page.waitForSelector('button.L3NKy'); // facebook으로 로그인 버튼
      await page.click('button.L3NKy');
      await page.waitForNavigation(); // facebook 로그인으로 넘어가는 것을 기다려요
      await page.waitForSelector('#email');
      await page.type('#email', process.env.EMAIL);
      await page.type('#pass', process.env.PASSWORD);
      await page.waitForSelector('#loginbutton');
      await page.click('#loginbutton');
      await page.waitForNavigation();
      console.log('로그인을 완료했습니다.');
    }

    await page.waitForSelector('input.XTCLo');
    await page.click('input.XTCLo');
    await page.keyboard.type('냥스타그램');
    await page.waitForSelector('.drKGC');
    const href = await page.evaluate(() => {
      return document.querySelector('.drKGC a:first-child').href;
    });
    await page.goto(href);

    // console.log(result.length);
    // await page.close();
    // await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();
