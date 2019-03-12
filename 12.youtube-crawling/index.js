const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const fs = require('fs');
const ytdl = require('ytdl-core');

const db = require('./models');
dotenv.config();

const crawler = async () => {
  try {
    await db.sequelize.sync();
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download('639839');
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: revisionInfo.executablePath,
      args: ['--window-size=1920,1080', '--disable-notifications'],
      userDataDir: 'C:\Users\zerocho\AppData\Local\Google\Chrome\User Data',
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });
    await page.goto('https://youtube.com', {
      waitUntil: 'networkidle0',
    });
    console.log(await page.$('#avatar-btn') ? '로그인 됨' : '로그인 필요');
    if (!await page.$('#avatar-btn')) {
      await page.waitForSelector('#buttons ytd-button-renderer:last-child a')
      await page.click('#buttons ytd-button-renderer:last-child a');
      await page.waitForNavigation({
        waitUntil: 'networkidle0',
      });
      if (!await page.$('#password input')) {
        console.log('login page');
        await page.waitForSelector('#identifierId');
        await page.type('#identifierId', process.env.EMAIL);
        await page.waitForSelector('#identifierNext');
        await page.click('#identifierNext');
        await page.waitForNavigation();
      }
      console.log('navigated to pass');
      await page.waitForSelector('input[aria-label="비밀번호 입력"]');
      await page.evaluate((password) => {
        document.querySelector('input[aria-label="비밀번호 입력"]').value = password;
      }, process.env.PASSWORD);
      // await page.type('input[aria-label="비밀번호 입력"]', process.env.PASSWORD);
      await page.waitFor(3000);
      await page.waitForSelector('#passwordNext');
      await page.click('#passwordNext');
      console.log('로그인 시도');
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
      });
    }

    await page.goto('https://www.youtube.com/feed/trending');
    await page.waitForSelector('ytd-video-renderer');
    await page.click('ytd-video-renderer');
    const url = await page.url();
    // const title = await page.title();
    console.log(url);
    const info = await ytdl.getInfo(url);
    ytdl(url).pipe(fs.createWriteStream(`${info.title.replace(/\u20A9/g, '')}.mp4`));

    // await page.close();
    // await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();
