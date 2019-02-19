const puppeteer = require('puppeteer'); // TODO: postman으로 요청 보냈을 때 없는 거 확인하기

const crawler = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://unsplash.com');
  // await page.waitFor(3000);
  const result = await page.evaluate(() => {
    const imgEls = document.querySelectorAll('._1pn7R figure img');
    let imgs = [];
    if (imgEls && imgEls.length) {
      imgEls.forEach((v) => imgs.push(v.src));
    }
    return imgs;
  });
  console.log(result);
};
crawler();