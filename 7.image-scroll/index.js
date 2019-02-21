const puppeteer = require('puppeteer'); // TODO: postman으로 요청 보냈을 때 없는 거 확인하기

const crawler = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://unsplash.com');
  let result = [];
  while (result.length <= 20) {
    const srcs = await page.evaluate(() => {
      window.scrollTo(0, 0);
      const imgEls = document.querySelectorAll('._1pn7R'); // 사이트 바뀌었을 때 클래스 적절히 바꿔줘야함
      let imgs = [];
      if (imgEls && imgEls.length) {
        imgEls.forEach((v) => {
          let src = v.querySelector('figure img._2zEKz').src;
          if (src) {
            imgs.push(src);
          }
          v.parentNode.removeChild(v);
        });
      }
      window.scrollBy(0, 100);
      return imgs;
    });
    result = result.concat(srcs);
    await page.waitForSelector('._1pn7R');
    await page.waitFor(1000);
  }
  console.log(result);
};
crawler();
