'use strict';
var mongoose = require('mongoose');
var co = require('co');

mongoose.Promise = Promise;

require('./message.server.model.js');
require('./user.server.model.js');
var User = mongoose.model('User');
var Message = mongoose.model('Message');


module.exports = function ({users: users, firstMessages: firstMessages, firstReplies:firstReplies, furtherMessages: furtherMessages}) {

  mongoose.connect('mongodb://localhost/trustroots-dev');

  return co(function * () {
    //console.log(yield User.create(getUserData('test1')));
    //var users = yield User.find();
    //this is how to find oldest object;
    //console.log(yield User.findOne().sort({created: 1}));

    //let [from, to] = users;
    //let msg = {
    //  from: from._id,
    //  to: to._id,
    //  created: Date.now(),
    //  len: 200
    //}

    //delete the previous database
    yield new Promise(function (resolve, reject) {
      mongoose.connection.once('connected', () => {
        mongoose.connection.db.dropDatabase(function (err, resp) {
          if(err) return reject(err);
          console.log('*****************database deleted********************');
          return resolve(resp);
        });
      });
    });

    //create users
    let userIds = [];
    console.log('creating users in mongodb');
    for(let i = 0; i<users; ++i) {
      //create user and get the response property _id to variable id
      var {_id: id} = yield User.create(getUserData(`influx${i}`));
      userIds.push(id);
      if(i % Math.ceil(users/10) === 0) {
        console.log(`${i/users*100}%`);
      }
    }
    console.log('finished creating users');

    //create messages
    let allMsg = firstMessages.concat(firstReplies, furtherMessages);
    let allMsgLen = allMsg.length;

    console.log('creating messages in mongodb')
    let progress = 0;

    for(let msg of allMsg) {
      let {_id: msgId} = yield Message.create(getMessageData({from: userIds[msg.from], to: userIds[msg.to], len: msg.len, created: msg.created}));
      if(progress % Math.ceil(allMsgLen/10) === 0) {
        console.log(`${Math.floor(progress/allMsgLen*100)}%`);
      }
      progress++;
    }
    console.log('100%');

    //console.log(yield User.create(getUserData('test1')));
    console.log('****************finished****************');
    mongoose.disconnect();
  })
  .catch(function (e) {
    console.error(e);
    mongoose.disconnect();
    console.log('****************errored****************');
  });

  console.log('****************end****************');
}

function getUserData(username) {
  return {
    emailHash: '485d7838d251db2e71e6499135e90fa0',
    salt: 'EKGmRLjsJvm12tm0NYrBNg==',
    displayUsername: username,
    displayName: username,
    provider: 'local',
    username: username,
    email: `${username}@example.net`,
    member: [],
    public: true,
    newsletter: false,
    avatarUploaded: false,
    avatarSource: 'gravatar',
    roles: [ 'user' ],
    password: '1V2GYBajeBgtE7GkkQWw5a25isltgGUNkZZvsTFe4n0tgmLZb8b7Z500TLVR2sX53KRbgqoXzcsIHYkV/PB5Gw==',
    languages: [],
    gender: '',
    description: '',
    tagline: '',
    emailTemporary: '',
    lastName: username,
    firstName: username
  };
}

function getMessageData({from: from, to: to, len: len, created: created}) {
  created = created ? new Date(created) : undefined;

  return {
    userFrom: from,
    userTo: to,
    notified: false,
    read: false,
    content: 'a'.repeat(len),
    created: created
  };
}
