const superagent = require('superagent'); //发送网络请求获取DOM
const cheerio = require('cheerio'); //能够像Jquery一样方便获取DOM节点

const OneUrl = "http://wufazhuce.com/"; //ONE的web版网站
const WeatherUrl = "https://tianqi.moji.com/weather/china/hebei/luannan-county/"; //滦南天气预报网站

// 获取ONE内容
function getOneData () {
  let p = new Promise((resolve, reject) => {
    superagent.get(OneUrl).end(function (err, res) {
      // 抛错拦截
      if (err) {
        reject(err);
      }
      let $ = cheerio.load(res.text);
      let selectItem = $('#carousel-one .carousel-inner .item');
      let todayOne = selectItem[0]; //获取轮播图第一个页面，也就是当天更新的内容
      let todayOneData = {
        imgUrl: $(todayOne)
          .find(".fp-one-imagen")
          .attr("src"),
        type: $(todayOne)
          .find(".fp-one-imagen-footer")
          .text()
          .replace(/(^\s*)|(\s*$)/g, ""),
        text: $(todayOne)
          .find(".fp-one-cita")
          .text()
          .replace(/(^\s*)|(\s*$)/g, "")
      };
      resolve(todayOneData);
    });
  });
  return p;
}

// 获取天气提醒
function getWeatherTips () {
  let p = new Promise((resolve, reject) => {
    superagent.get(WeatherUrl).end(function (err, res) {
      if (err) {
        reject(err);
      }
      let $ = cheerio.load(res.text);
      let tips = '';
      let weatherTip = $(".wea_tips").find("em").text();
      let weatherTitle = $(".wea_tips").find("span").text();
      tips = weatherTitle + ': ' + weatherTip;
      console.log(tips);
      resolve(tips);
    });
  });
}
// 获取天气预报
function getWeatherData () {
  let p = new Promise((resolve, reject) => {
    superagent.get(WeatherUrl).end(function (err, res) {
      if (err) {
        reject(err);
      }
      let threeDaysData = [];
      let $ = cheerio.load(res.text);
      $('.forecast .days').each(function (i, elem) {
        let eachLi = $(elem).find('li');
        threeDaysData.push({
          Day: $(eachLi[0]).text().replace(/(^\s*)|(\s*$)/g, ""),
          WeatherImgUrl: $(eachLi[1]).find('img').attr('src'),
          WeatherText: $(eachLi[1]).text().replace(/(^\s*)|(\s*$)/g, ""),
          Temperature: $(eachLi[2]).text().replace(/(^\s*)|(\s*$)/g, ""),
          WindDirection: $(eachLi[3]).find('em').text().replace(/(^\s*)|(\s*$)/g, ""),
          WindLevel: $(eachLi[3]).find('b').text().replace(/(^\s*)|(\s*$)/g, ""),
          Pollution: $(eachLi[4]).text().replace(/(^\s*)|(\s*$)/g, ""),
        });
      });
      resolve(threeDaysData);
    });
  });
}