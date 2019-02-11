const xlsx = require('xlsx');
const puppeteer = require('puppeteer');
const add_to_sheet = require('./add_to_sheet');

const workbook = xlsx.readFile('xlsx/data.xlsx'); // TODO: 왜 한 페이지에서 크롤링 하는지 이유 설명하기(메모리, rate-limit)
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws);

const crawler = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  add_to_sheet(ws, 'C1', 's', '평점');
  for (const [i, r] of records.entries()) {
    await page.goto(r.링크);
    const text = await page.evaluate(() => {
      const score = document.querySelector('.score.score_left .star_score');
      return score.textContent;
    });
    if (text) {
      const newCell = 'C' + (i + 2);
      console.log(r.제목, '평점', text.trim(), newCell);
      add_to_sheet(ws, newCell, 'n', text.trim());
    }
    await page.waitFor(1000);
  }
  await page.close();
  await browser.close();
  xlsx.writeFile(workbook, 'xlsx/result.xlsx');
};
crawler();
