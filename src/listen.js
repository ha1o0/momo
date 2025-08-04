const messageModule = require('./message.js')

console.log(messageModule.content)

function listenTest(word) {
    console.log('listen: ', word)
}

module.exports = {
    listenTest
}