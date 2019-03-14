const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080', '--disable-notifications', '--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36');
    await page.setViewport({
      width: 1080,
      height: 1080,
    });
    await page.goto(`https://twitter.com`, {
      waitUntil: 'networkidle0',
    });
    await page.type('.LoginForm-username input', process.env.EMAIL)
    await page.type('.LoginForm-password input', process.env.PASSWORD)
    await page.waitForSelector('input[type=submit]');
    await page.click('input[type=submit]');
    await page.waitForNavigation();

    while (await page.$('.js-stream-item')) {
      const firstItem = await page.$('.js-stream-item:first-child');
      if (await page.$('.js-stream-item:first-child .js-macaw-cards-iframe-container')) {
        const tweetId = await page.evaluate((item) => {
          return item.dataset.itemId;
        }, firstItem);
        await page.evaluate(() => {
          window.scrollBy(0, 10);
        });
        await page.waitForSelector('.js-stream-item:first-child iframe');
        const iframe = await page.frames().find((frame) => frame.url().includes(tweetId));
        if (iframe) {
          const result = await iframe.evaluate(() => {
            return {
              title: document.querySelector('h2') && document.querySelector('h2').textContent,
            }
          });
          console.log(result);
        }
      }
      await page.evaluate((item) => item.parentNode.removeChild(item), firstItem);
      await page.evaluate(() => {
        window.scrollBy(0, 10);
      });
      await page.waitForSelector('.js-stream-item')
      await page.waitFor(2000);
    }

    // await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();
