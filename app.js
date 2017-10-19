import express from 'express';
import path from 'path';
import superAgent from 'superagent';
import cheerio from 'cheerio';

const app = express();

const data = [];


const temp = ['1小时前', '2016年12月30日', '20分钟前', '6月22日', '6天前'];
const updateDate = (date) => {
  const currentDate = new Date();
  if (date.indexOf('年') > 0) {
    console.log('年:');
    let replaceDate = date.replace(/年|月|日/g, '-');
    replaceDate = replaceDate.slice(0, replaceDate.length - 1);
    return new Date(replaceDate);
  }
  if (date.indexOf('分钟') > 0) {
    console.log('分钟:');
    const time = currentDate.getTime();
    const minutes = parseInt(date) * 60 * 1000;
    return new Date(time - minutes);
    return minutes;
  }
  if (date.indexOf('小时') > 0) {
    console.log('小时:');
    const time = currentDate.getTime();
    const hours = parseInt(date) * 60 * 60 * 1000;
    return new Date(time - hours);
    return hours;
  }
  if (date.indexOf('天') > 0) {
    console.log('天:');
    const time = currentDate.getTime();
    const days = parseInt(date) * 24 * 60 * 60 * 1000;
    return new Date(time - days);
  }
  if (date.indexOf('月') > 0) {
    console.log('月:');
    let replaceMonth = date.replace(/年|月|日/g, '-');
    replaceMonth = currentDate.getFullYear() + '-' + replaceMonth.slice(0, replaceMonth.length - 1);
    return new Date(replaceMonth);
  }
  if (date.indexOf('秒') || date.indexOf('刚刚')) {
    console.log('刚刚:');
    return currentDate;
  }
};
// for (let i = 0, len = temp.length; i < len; i++) {
//   let res = updateToGMT(temp[i]);
//   console.log(res);
// }
//https://segmentfault.com/t/javascript/blogs?page=1
//https://segmentfault.com/news/frontend?page=1
const dataFromSegmentfault = () => {
  // const url = "https://segmentfault.com/t/javascript/blogs?page=1";
  // 小于1天，用 小时
  // 小于7天，就 天，
  // 大于等于 7天， 用 月份/日期
  // 不在今年， 用 年/月/日
  const url = "https://segmentfault.com/news/frontend?page=1"
  superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        return console.log(err);
      }

      // http://www.cnblogs.com/zichi/p/5135636.html 中文乱码？不，是 HTML 实体编码！解决exec正则匹配导致的问题

      const $ = cheerio.load(documents.text, {decodeEntities: false});
      const $news = $('.news__list');
      const $newsList = $news.find('.news__item');
      for (let i = 0, len = $newsList.length; i < len; i++) {
        const $item = $newsList.eq(i);
        const $title = $item.find('.news__item-title a');

        const title = $title.text();
        const url = $title.attr('href');

        const $meta = $item.find('.news__item-meta span').eq(0);
        let metaHtml = $meta.html();
        metaHtml = metaHtml.replace(/\n/g, '');

        const pattern = /(<a)(.*?)(>)(.*?)(<\/a>)(.*?)(\s+.*?)/;
        const execRes = pattern.exec(metaHtml);
        const author = execRes[4];
        const createDate = updateDate(execRes[6]);

        const hotNumber = $item.find('.news__bookmark-text').text();
        data.push({
          title,
          author,
          url,
          createDate
        })
      }
      console.log(data);
      // const $blog = $('#blog');
      // const $articles = $blog.find('.stream-list__item');
      // console.log($articles);
      // console.log($articles.length);
      // for(let i = 0; i < $articles.length; i++) {
      //   // const temp = {};
      //   const $index = $articles.eq(i);
      //   const title = $index.find('.title a').text();
      //   const url = $index.find('h2.title a').attr('href');
      //   const author = $index.find('ul.author img').attr('alt');
      //   const desc = $index.find('.excerpt').text();
      //   console.log(url);
      //   console.log(author);
      //   console.log(desc);
      //   data.push({title,url,author,desc});
      // }
      // console.log(data);
    })
};

// cnblogs
const dataFromCnblogs = () => {
  const url = "https://www.cnblogs.com/?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex=1&ParentCategoryId=0";
  superAgent
    .get(url)
    .end((err, documents) => {
      if (err) {
        return console.log(err);
      }
      // console.log(documents.text);
      const $ = cheerio.load(documents.text);
      const $blog = $('#post_list');
      const articles = $blog.find('a');
      console.log(articles);
      console.log(articles.length);
    })
};


dataFromSegmentfault();
// dataFromCnblogs();



const server = app.listen(7000, function () {
  const port = server.address().port;
  console.log('Example app listening at http://%s:%s', 'localhost', port);
});