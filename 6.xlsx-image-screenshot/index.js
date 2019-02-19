const xlsx = require('xlsx');
const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');
const add_to_sheet = require('./add_to_sheet');

const workbook = xlsx.readFile('xlsx/data.xlsx'); // TODO: 왜 한 페이지에서 크롤링 하는지 이유 설명하기(메모리, rate-limit)
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws);

fs.readdir('screenshot', (err) => {
  if (err) {
    console.error('screenshot 폴더가 없어 screenshot 폴더를 생성합니다.');
    fs.mkdirSync('screenshot');
  }
});
fs.readdir('poster', (err) => {
  if (err) {
    console.error('poster 폴더가 없어 poster 폴더를 생성합니다.');
    fs.mkdirSync('poster');
  }
});

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1920,1080'] });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    add_to_sheet(ws, 'C1', 's', '평점');
    for (const [i, r] of records.entries()) {
      await page.goto(r.링크);
      const result = await page.evaluate(() => {
        let score;
        const scoreEl = document.querySelector('.score.score_left .star_score');
        if (scoreEl) {
          let score = scoreEl.textContent
        }
        let img;
        const imgEl = document.querySelector('.poster img');
        if (imgEl) {
          img = imgEl.src;
        }
        return { score, img };
      });
      if (result.score) {
        const newCell = 'C' + (i + 2);
        console.log(r.제목, '평점', result.score.trim(), newCell);
        add_to_sheet(ws, newCell, 'n', result.score.trim());
      }
      if (result.img) {
        await page.screenshot({ path: `screenshot/${r.제목}.png`, fullPage: true }); // TODO: clip 소개(x, y, width, height)
        const imgResult = await axios.get(result.img.replace(/\?.*$/, ''), {
          responseType: 'arraybuffer',
        });
        fs.writeFileSync(`poster/${r.제목}.jpg`, imgResult.data);
      }
      await page.waitFor(1000);
    }
    await page.close();
    await browser.close();
    xlsx.writeFile(workbook, 'xlsx/result.xlsx');
  } catch (e) {
    console.error(e);
  }
};
crawler();
