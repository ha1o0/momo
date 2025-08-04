const commonUtil = require('./CommonUtil.js')

function format(a, b) {
    return commonUtil.add(a, b) + 'ok'
}

module.exports = {
    format
}