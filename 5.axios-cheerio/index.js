const xlsx = require('xlsx');
const axios = require('axios');
const cheerio = require('cheerio');

const workbook = xlsx.readFile('xlsx/data.xlsx');
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws);

const crawler = async () => {
  await Promise.all(records.map(async (r) => {
    const response = await axios.get(r.링크);
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const text = $('.score.score_left .star_score').text();
      console.log(r.제목, '평점', text.trim());
    }
  }));
};
crawler();
