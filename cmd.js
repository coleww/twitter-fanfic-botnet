#!/usr/bin/env node

var markov = require('markov')
var m = markov(~~process.argv[2] || 2)
var after = require('after')
var fs = require('fs')
var reqy = require('require-module')
var tipots = require('this-is-probably-ok-to-say');
var quidprofollow = require('quidprofollow');
var addEnd = require('add-ender')
var cap = require('capitalize')
var stops = require('stopwords').english;
var charMap = {}
var pick = require('pick-random')
fs.readdirSync('..').forEach(function (folder) {
  if (folder.indexOf('_bot') !== -1 && fs.existsSync('../' + folder + '/package.json')) {
    var deets = reqy('../' + folder + '/package.json')['twitterFanficBotnet']
    deets.charnames.forEach(function (name) {
      charMap[name] = deets.username
    })
  }
})

var Twit = require('twit')
var packageJSON = reqy('./package.json')
var config = packageJSON['twitterFanficBotnet']
var T = new Twit(config.twitter)
var lines = reqy('./lines')
if(lines.length > 500) lines = pick(lines, {count: 500})
var init = after(lines.length, function () {
  var ogToot = cap(addEnd(createToot()))
  console.log(ogToot)

  console.log('loaded markov')
  quidprofollow({twitterAPIKeys: config.twitter, retainFilter: function (uids, done) {
    var neverUnfollow = packageJSON['neverUnfollow'] || []
    done(uids.filter(function (uid) {
      return neverUnfollow.indexOf(uid) === -1
    }))
  }}, function reportResults(err, followed, unfollowed) {
    if (err) throw err
    console.log('Followed:', followed);
    console.log('Unfollowed:', unfollowed);
    T.get('statuses/user_timeline', {screen_name: config.username}, function (err, datum, response) {
      if (err) {
        throw err
      } else {
        console.log('got last tweet id')
        if (Math.random() < 0.5 && tipots(ogToot) && ogToot.length < 140) { // only sometimes
            T.post('statuses/update', {status: ogToot}, function (err, data, response) { // post the next line in reply to the most recent one
              if (err) {
                throw err
              } else {
                console.log(data)
              }
            })
        }
        T.get('statuses/mentions_timeline', {since_id: datum[0].id_str}, function (err, data, response) {
          if (err) {
            throw err
          } else {
            console.log('got recent mentions')
            data.forEach(function (toot, i) {
              if (tipots(toot.text)){
                var reply = createReply(toot.text)
                var text = addEnd('@' + toot.user.screen_name + ' ' + cap(reply))
                var id = toot.id_str
                console.log('reply to', id, text)
                if (Math.random() < 0.75 && tipots(text) && text.length < 140) {
                  setTimeout(function () {
                    console.log('firing off:', id, text)
                    T.post('statuses/update', {status: text, in_reply_to_status_id: id}, function (err, data, response) { // post the next line in reply to the most recent one
                      if (err) {
                        throw err
                      } else {
                        console.log(data)
                      }
                    })
                  }, 60 * 1000 * ((Math.random() * 5) + 1) * (i + 1))
                }
              }
            })
          }
        })
      }
    })
  })
})

console.log('seeding markov')
lines.forEach(function (line) {
  m.seed(line, init)
})

function createReply (text) {
  // markov funs!
  var toot = m.respond(text).join(' ').toLowerCase()
  while (!tipots(toot) || toot.length > 140 || stops.indexOf(toot.split(' ')[toot.split(' ').length - 1].replace(/\W/g, '')) !== -1) {
    toot = m.respond(text).join(' ').toLowerCase()
  }
  return charMapIfy(toot)
}

function createToot () {
  var toot = m.fill(m.pick()).join(' ').toLowerCase()
  while (!tipots(toot) || toot.length > 140 || stops.indexOf(toot.split(' ')[toot.split(' ').length - 1].replace(/\W/g, '')) !== -1) {
    toot = m.fill(m.pick()).join(' ').toLowerCase()
  }
  return charMapIfy(toot)
}

function charMapIfy (text) {
  var justTheseNames = Object.keys(charMap).filter(function (name) {
    return text.toLowerCase().match(name.toLowerCase())
  }).sort(function (a, b) {
    return b.length - a.length
  })
  if (justTheseNames.length) {
    return text.replace(new RegExp(justTheseNames[0], 'i'), '@' + charMap[justTheseNames[0]] + ' ') // the longest match found
  } else {
    return text
  }
}
