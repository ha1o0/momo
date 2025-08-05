// 从内部模块导入我们想暴露的函数
const { format } = require('./util/StringUtil.js');
const { add } = require('./util/CommonUtil.js');
const { listenTest } = require('./listen.js');

// 将它们统一在一个对象里导出
module.exports = {
  format,
  add,
  listenTest,
};
