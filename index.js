'use strict';

let co = require('co');

let denodeify = require('denodeify');
let fs = require('fs');

let writeFile = denodeify(fs.writeFile);
let filename = 'fake_messages_sent.txt';

const USERS = 3000;
const CHANCE_WRITE = 0.0005;
const CHANCE_REPLY = 0.4;
const MAX_FURTHER_MESSAGES = 2;
const TIME_BEGIN = (new Date('2014-12-01')).getTime();
const NOW = Date.now();
const MAX_MESSAGE_LENGTH = 1000;
const SHORT_MESSAGE = Math.floor(MAX_MESSAGE_LENGTH/4);

//
//
//create first messages
let firstMessages = [];
for(let i = 0; i < USERS; ++i) {
  for (let j = i + 1; j< USERS; ++j) {
    if(Math.random() < CHANCE_WRITE) {
      let message = {from: i, to: j, created: getRandomTimeSince(TIME_BEGIN)};
      console.log(message);
      firstMessages.push(message);
    }
  }
}

//create first replies
let firstReplies = [];
for(let msg of firstMessages) {
  if(Math.random() < CHANCE_REPLY) {
    let created = getRandomTimeSince(msg.created);
    let message = {from: msg.to, to: msg.from, created: created, replyTime: created-msg.created};
    firstReplies.push(message);
    console.log(message);
  }
}

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

//sample output
//
//**********************starts below
//# DDL
//
//CREATE DATABASE NOAA_water_database
//
//# DML
//
//# CONTEXT-DATABASE: NOAA_water_database
//
//h2o_feet,location=coyote_creek water_level=8.120,level\ description="between 6 and 9 feet" 1439856000
//h2o_feet,location=coyote_creek water_level=8.005,level\ description="between 6 and 9 feet" 1439856360

//messages_sent,position=first,msg_len_type=short msg_len=1123,reply_time= 1439856360
//
let fileOutput = `# DDL

CREATE DATABASE msg_db

# DML

# CONTEXT-DATABASE: msg_db\n\n`;

for(let msg of firstMessages) {
  fileOutput += generateOutputLine(msg, 0);
}

for(let msg of firstReplies) {
  fileOutput += generateOutputLine(msg, 1);
}

for(let msg of furtherMessages) {
  fileOutput += generateOutputLine(msg, 2);
}

co(function * () {
  yield writeFile(filename, fileOutput);
  return;
})
.catch(console.error);

function generateOutputLine(msg, positionNum) {
  let position;
  let msgLen = Math.floor(Math.random()*MAX_MESSAGE_LENGTH);
  let msgLenType = msgLen < SHORT_MESSAGE ? 'short' : 'long';
  let replyTime = Math.floor(msg.replyTime/1000)||-1;
  let fromId = msg.from;
  let toId = msg.to;
  let created = Math.floor(msg.created/1000); //miliseconds > seconds timestamp

  switch(positionNum) {
    case 0:
      position = 'first';
      break;
    case 1:
      position = 'first_reply';
      break;
    default:
      position = 'normal';
  }
  
  return `messages_sent,position=${position},msg_length_type=${msgLenType} msg_length=${msgLen},reply_time=${replyTime},id_from=${fromId},id_to=${toId} ${created}\n`;
}

function getRandomTimeSince(startPoint) {
  return Math.floor(Math.random()*(NOW-startPoint))+startPoint;
}

function generateFurtherMessages(msg) {
  //range 0..MAX_FURTHER_MESSAGES
  let furtherMessageCount = Math.floor(Math.random()*(MAX_FURTHER_MESSAGES+1));
  let furtherMessages = [];
  for(let i=0; i<furtherMessageCount; ++i) {
    let created = getRandomTimeSince(msg.created);
    let message = {from: msg.from, to: msg.to, created: created};
    furtherMessages.push(message);
    console.log(message);
  }

  return furtherMessages;
};
