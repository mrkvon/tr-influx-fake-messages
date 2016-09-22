'use strict';

let co = require('co');

let outputToFile = require('./outputToFile');
let outputToMongo = require('./outputToMongo');

const USERS = 3000;
const CHANCE_WRITE = 0.0005;
const CHANCE_REPLY = 0.4;
const MAX_FURTHER_MESSAGES = 2;
const TIME_BEGIN = (new Date('2014-12-01')).getTime();
const NOW = Date.now();
const MAX_MESSAGE_LENGTH = 1000;

//
//
//create first messages
let firstMessages = [];
for(let i = 0; i < USERS; ++i) {
  for (let j = i + 1; j< USERS; ++j) {
    if(Math.random() < CHANCE_WRITE) {
      let message = {from: i, to: j, created: getRandomTimeSince(TIME_BEGIN), len: getRandomLength()};
      firstMessages.push(message);
    }
  }
}

//create first replies
let firstReplies = [];
for(let msg of firstMessages) {
  if(Math.random() < CHANCE_REPLY) {
    let created = getRandomTimeSince(msg.created);
    let message = {from: msg.to, to: msg.from, created: created, replyTime: created-msg.created, len: getRandomLength()};
    firstReplies.push(message);
  }
}


//create further messages
let furtherMessages = [];
for(let msg of firstMessages) {
  let generated = generateFurtherMessages(msg);
  for(let gn of generated) {
    furtherMessages.push(gn);
  }
}

for(let msg of firstReplies) {
  let generated = generateFurtherMessages(msg);
  for(let gn of generated) {
    furtherMessages.push(gn);
  }
}

console.log(firstMessages.length);
console.log(firstReplies.length);
console.log(furtherMessages.length);
console.log(USERS*(USERS-1)*CHANCE_WRITE*0.5);

co(function * () {
  /*
  yield outputToFile({firstMessages: firstMessages, firstReplies: firstReplies, furtherMessages: furtherMessages});
  console.log('*************written to file***************');
  // */
  yield outputToMongo({users: USERS, firstMessages: firstMessages, firstReplies: firstReplies, furtherMessages: furtherMessages});

  for(let msg of firstMessages) {
    if(msg.from < 10) {
      console.log(msg.from, msg.to);
    }
  }
})
.catch(console.error);

function getRandomTimeSince(startPoint) {
  return Math.floor(Math.random()*(NOW-startPoint))+startPoint;
}

function getRandomLength() {
  return Math.floor(Math.random()*MAX_MESSAGE_LENGTH)+1;
}

function generateFurtherMessages(msg) {
  //range 0..MAX_FURTHER_MESSAGES
  let furtherMessageCount = Math.floor(Math.random()*(MAX_FURTHER_MESSAGES+1));
  let furtherMessages = [];
  for(let i=0; i<furtherMessageCount; ++i) {
    let created = getRandomTimeSince(msg.created);
    let message = {from: msg.from, to: msg.to, created: created, len: getRandomLength()};
    furtherMessages.push(message);
  }

  return furtherMessages;
};
