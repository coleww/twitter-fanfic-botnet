twitter-fanfic-botnet
----------------

tool for making markov bot fan fiction communities on twitter. the bots are seeded with lines from characters from TV shows, and they reply to each other. as well as, you know, anyone else that joins the conversation.

This is intended to be totally opt-in i.e, the bots won't tweet at anyone that doesn't tweet at them. Buuuuuuut it could probably be really easily turned super annoying so I'm intentionally making the documentation kind of shite.

[![NPM](https://nodei.co/npm/twitter-fanfic-botnet.png)](https://nodei.co/npm/twitter-fanfic-botnet/)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

npm init in a folder named SOMETHING_bot

```
  "scripts": {
    "tweet": "twitterFanficBotnet"
  },
  twitterFanficBotnet: {
    twitter: {
      consumer_key: 'SPIDERS!!!!',
      consumer_secret: 'SPIDERS!!!!',
      access_token: 'SPIDERS!!!!',
      access_token_secret: 'SPIDERS!!!!'
    },
    username: 'mulder_bot',
    charnames: ['fox mulder', 'fox', 'mulder']
  }
```
  add some lines for the markov too.

do that a bunch.

write an index.js or something and call it on a cron, from there you can just pick a folder and run the tweet script. 

when a bot awakens, it will maybe tweet an update, and it'll also look at it's recent mentions and maybe reply to them. 

