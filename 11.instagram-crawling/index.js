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
    let result = [];
    let prevPostId = '';
    while (result.length < 10) {
      const moreButton = await page.$('button.sXUSN'); // 더보기 버튼 클릭
      if (moreButton) {
        await page.evaluate((btn) => btn.click(), moreButton);
      }
      const newPost = await page.evaluate(() => {
        const article = document.querySelector('article:first-child');
        const postId = article.querySelector('.c-Yi7') && article.querySelector('.c-Yi7').href.split('/').slice(-2, -1)[0];
        const name = article.querySelector('h2') && article.querySelector('h2').textContent;
        const img = article.querySelector('.KL4Bh img') && article.querySelector('.KL4Bh img').src;
        const content = article.querySelector('.C4VMK > span') && article.querySelector('.C4VMK > span').textContent;
        const commentTags = article.querySelectorAll('ul li:not(:first-child)');
        let comments = [];
        commentTags.forEach((c) => {
          const name = c.querySelector('.C4VMK h3') && c.querySelector('.C4VMK h3').textContent;
          const comment = c.querySelector('.C4VMK > span') && c.querySelector('.C4VMK > span').textContent;
          comments.push({
            name, comment,
          });
        });
        return {
          postId, name, img, content, comments,
        }
      });
      if (newPost.postId !== prevPostId) {
        console.log(newPost);
        if (!result.find((v) => v.postId === newPost.postId)) {
          const exist = await db.Instagram.findOne({ where: { postId: newPost.postId } });
          if (!exist) {
            result.push(newPost);
          }
        }
      }
      await page.waitFor(1000);
      await page.evaluate(() => {
        const article = document.querySelector('article:first-child');
        const heartBtn = article.querySelector('.coreSpriteHeartOpen span');
        if (heartBtn.className.includes('outline')) {
          heartBtn.click();
        }
      });
      prevPostId = newPost.postId;
      await page.waitFor(1000);
      await page.evaluate(() => {
        window.scrollBy(0, 800);
      });
    }
    await Promise.all(result.map((r) => {
      return db.Instagram.create({
        postId: r.postId,
        media: r.img,
        writer: r.name,
        content: r.content,
      });
    }));

    console.log(result.length);
    await page.close();
    await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();
