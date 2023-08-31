const nodemailer = require('nodemailer');
const superagent = require('superagent'); //发送网络请求获取DOM
const cheerio = require('cheerio'); //能够像Jquery一样方便获取DOM节点
const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置
const schedule = require("node-schedule"); //定时器任务库



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
      resolve(tips);
    });
  });
  return p;
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
          PollutionLevel: $(eachLi[4])
            .find("strong")
            .attr("class")
        });
      });
      resolve(threeDaysData);
    });
  });
  return p;
}

// 发送邮件
function sendEmail (HtmlData) {
  const template = ejs.compile(
    fs.readFileSync(path.resolve(__dirname, "email.ejs"), "utf8")
  );
  const html = template(HtmlData);
  // 创建一个邮件传输对象
  const transporter = nodemailer.createTransport({
    service: '163',
    auth: {
      user: 'chao1109355524@163.com', // 发送邮件的邮箱
      pass: 'SHGEDHRTKNBQWPQB', // 邮箱密码或授权码
    },
  });

  // 邮件选项
  const mailOptions = {
    from: 'chao1109355524@163.com', // 发送者邮箱
    to: '13582910998@163.com', // 接收者邮箱
    subject: '美好的一天开始了', // 邮件主题
    html: html
  };

  // 发送邮件
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('邮件发送成功 ID：', info.messageId);
  });
}
// 聚合
function getAllDataAndSendMail () {
  let HtmlData = {};
  Promise.all([getOneData(), getWeatherTips(), getWeatherData()]).then(
    function (data) {
      HtmlData["todayOneData"] = data[0];
      HtmlData["weatherTip"] = data[1];
      HtmlData["threeDaysData"] = data[2];
      sendEmail(HtmlData);
    }
  ).catch(function (err) {
    getAllDataAndSendMail(); //再次获取
    console.log('获取数据失败： ', err);
  });
}
let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = 8;
rule.minute = 30;
console.log('NodeMail: 开始等待目标时刻...')
let j = schedule.scheduleJob(rule, function() {
  console.log("执行任务");
  getAllDataAndSendMail();
});
