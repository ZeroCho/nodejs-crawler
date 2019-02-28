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
    await page.evaluate(() => {
      (() => {
        const box = document.createElement('div');
        box.classList.add('mouse-helper');
        const styleElement = document.createElement('style');
        styleElement.innerHTML = `
          .mouse-helper {
            pointer-events: none;
            position: absolute;
            z-index: 100000;
            top: 0;
            left: 0;
            width: 20px;
            height: 20px;
            background: rgba(0,0,0,.4);
            border: 1px solid white;
            border-radius: 10px;
            margin-left: -10px;
            margin-top: -10px;
            transition: background .2s, border-radius .2s, border-color .2s;
          }
          .mouse-helper.button-1 {
            transition: none;
            background: rgba(0,0,0,0.9);
          }
          .mouse-helper.button-2 {
            transition: none;
            border-color: rgba(0,0,255,0.9);
          }
          .mouse-helper.button-3 {
            transition: none;
            border-radius: 4px;
          }
          .mouse-helper.button-4 {
            transition: none;
            border-color: rgba(255,0,0,0.9);
          }
          .mouse-helper.button-5 {
            transition: none;
            border-color: rgba(0,255,0,0.9);
          }
          `;
        document.head.appendChild(styleElement);
        document.body.appendChild(box);
        document.addEventListener('mousemove', event => {
          box.style.left = event.pageX + 'px';
          box.style.top = event.pageY + 'px';
          updateButtons(event.buttons);
        }, true);
        document.addEventListener('mousedown', event => {
          updateButtons(event.buttons);
          box.classList.add('button-' + event.which);
        }, true);
        document.addEventListener('mouseup', event => {
          updateButtons(event.buttons);
          box.classList.remove('button-' + event.which);
        }, true);
        function updateButtons(buttons) {
          for (let i = 0; i < 5; i++)
            box.classList.toggle('button-' + i, !!(buttons & (1 << i)));
        }
      })();
    });
    await page.type('#email', process.env.EMAIL);
    await page.type('#pass', process.env.PASSWORD);
    await page.hover('#loginbutton');
    await page.waitFor(1000);
    await page.mouse.move(1000, 40);
    await page.waitFor(1000);
    await page.mouse.click(1000, 40);
    // await page.click('#loginbutton');
    await page.waitForResponse((response) => {
      return response.url().includes('login_attempt');
    });
    await page.waitFor(3000);
    await page.keyboard.press('Escape');
    await page.click('#userNavigationLabel');
    await page.waitForSelector('li.navSubmenu:last-child');
    await page.waitFor(3000);
    // await page.click('li.navSubmenu:last-child');
    await page.evaluate(() => {
      document.querySelector('li.navSubmenu:last-child').click();
    });
    await page.waitFor(3000);
    await page.close();
    await browser.close();
  } catch (e) {
    console.error(e);
  }
};

crawler();
