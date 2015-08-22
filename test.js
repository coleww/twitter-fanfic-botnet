var tap = require('tap')

var twitterFanficBotnet = require('./')

tap.test('does the thing', function (t) {
  t.plan(1)
  t.equal(twitterFanficBotnet('world'), 'hello world', 'does it')
})
