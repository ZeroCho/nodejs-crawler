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
    let result = [];
    while (result.length < 30) {
      await page.waitForSelector('[id^=hyperfeed_story_id]:first-child');  // 아이디는 바뀔 수 있습니다.
      const newPost = await page.evaluate(() => {
        window.scrollTo(0, 0);
        const firstFeed = document.querySelector('[id^=hyperfeed_story_id]:first-child');
        const name = firstFeed.querySelector('.fwn.fcg') && firstFeed.querySelector('.fwn.fcg').textContent;
        const content = firstFeed.querySelector('.userContent') && firstFeed.querySelector('.userContent').textContent;
        const postId = firstFeed.id.split('_').slice(-1)[0];
        return {
          name,
          content,
          postId,
        };
      });
      await page.waitFor(1000);
      result.push(newPost);
      console.log(result);
      await page.waitForSelector('[id^=hyperfeed_story_id]:first-child ._666k a'); // 선택자는 바뀔 수 있습니다.
      console.log('likebtn found');
      const likeBtn = await page.$('[id^=hyperfeed_story_id]:first-child ._666k a');
      await page.evaluate((like) => {
        const sponsor = document.querySelector('[id^=hyperfeed_story_id]:first-child').textContent.includes('SpSpSononSsosoSredredSSS');
        if (sponsor && like.getAttribute('aria-pressed') === 'true') {
          like.click()
        } else if (!sponsor && like.getAttribute('aria-pressed') === 'false') { // 좋아요가 안 되어 있으면
          like.click()
        }
      }, likeBtn);
      await page.waitFor(1000);
      console.log('likebtn clicked');
      await page.evaluate(() => {
        const firstFeed = document.querySelector('[id^=hyperfeed_story_id]:first-child');
        firstFeed.parentNode.removeChild(firstFeed);
        window.scrollBy(0, 200);
      });
      await page.waitFor(1000);
      console.log('tagRemoved');
    }
    console.log(result);
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
