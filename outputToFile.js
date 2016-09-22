'use strict';

let co = require('co');
let denodeify = require('denodeify');
let fs = require('fs');

let writeFile = denodeify(fs.writeFile);
let filename = 'fake_messages_sent.txt';
const SHORT_MESSAGE = Math.floor(100);

module.exports = function ({users: users, firstMessages: firstMessages, firstReplies: firstReplies, furtherMessages: furtherMessages}) {
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

  return co(function * () {
    yield writeFile(filename, fileOutput);
    return;
  });

  function generateOutputLine(msg, positionNum) {
    let position;
    let msgLen = msg.len;
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

};
