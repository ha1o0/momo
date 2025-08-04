const stringUtil = require('./util/StringUtil.js')

console.log('module: ', module)

module.exports = {
  content: stringUtil.format('hello', 'message '),
}
