const messageModule = require('./message.js')

function listenTest(word) {
    return messageModule.content + word;
}

module.exports = {
    listenTest
}
