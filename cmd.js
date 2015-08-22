#!/usr/bin/env node

var lines = require('./lines')
var markov = require('markov');
var m = markov(3);
var after = require('after')
var loaded = false
var fs = require('fs')
var reqy = require('require-module')
var charMap = {}
var allTheNames = []
fs.readdirSync('..').forEach(function (folder) {
  if (folder.indexOf('_bot') !== -1) {
    var deets = reqy('../' + folder + '/package.json' )['twitterFanficBotnet']
    charMap[deets.username] = deets.charnames
    allTheNames = allTheNames.concat(charnames)
  }
})

console.log('CHARMAP:', charMap)

var Twit = require('twit')
var packageJSON = reqy('./package.json')
config = packageJSON['twitterFanficBotnet']
var T = new Twit(config.twitter)

var init = after(lines.length, function () {
  var ogToot = createToot()
  T.post('statuses/update', {status: ogToot}, function (err, data, response) { // post the next line in reply to the most recent one
    if (err) {
      throw err
    } else {
      console.log(data)
    }
  })
  loaded = true
  console.log('loaded markov')
  T.get('statuses/user_timeline', {screen_name: config.username}, function (err, datum, response) {
    if (err) {
      throw err
    } else {
      console.log('got last tweet id')
      T.get('statuses/mentions_timeline', {since_id: datum[0].id_str}, function (err, data, response){
        if (err) {
          throw err
        } else {
          console.log('got recent mentions')
          data.forEach(function (toot) {
            var reply = createReply(toot.text)
            var text = '@' + toot.user.screen_name + ' ' + reply
            var id = toot.id_str
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
          })
        }
      })
    }
  })
})

console.log('seeding markov')
lines.forEach(function (line) {
  m.seed(line, init)
})

function createReply (text) {
  // markov funs!
  return charMapIfy(m.respond(text, 12))
}

function createToot () {
  return charMapIfy(m.fill(m.pick(), 16))
}

function charMapIfy (text) {
  var justTheseNames = allTheNames.filter(function (name) {
    return text.toLowerCase().match(name)
  }).sort(function (a, b) {
    return b.length - a.length
  })
  if (justTheseNames.length) {
    return text.replace(new Regexp(justTheseNames[0], 'i'), '@' + findKey(justTheseNames[0])) // the longest match found
  } else {
    return text
  }
}

function findKey (name) {
  return Object.keys(charMap).filter(function (k) {
    return charMap[k].indexOf(name) !== -1
  })[0]
}
