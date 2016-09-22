'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * SubSchema for `User` schema's `member` array
 * This could be defined directly under `UserSchema` as well,
 * but then we'd have extra `_id`'s hanging around.
 */
var UserMemberSchema = new Schema({
  tag: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    required: true
  },
  relation: {
    type: String,
    enum: ['is', 'likes'],
    default: 'is',
    required: true
  },
  since: {
    type: Date,
    default: Date.now,
    required: true
  }
}, { _id: false });

/**
 * User Schema
 */
var UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
  },
  /* This is (currently) generated in users.profile.server.controller.js */
  displayName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    unique: 'Email exists already.',
    lowercase: true,
    required: true,
  },
  /* New email is stored here until it is confirmed */
  emailTemporary: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },
  tagline: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  birthdate: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['', 'male', 'female', 'other'],
    default: ''
  },
  languages: {
    type: [{
      type: String
    }],
    default: []
  },
  locationLiving: {
    type: String
  },
  locationFrom: {
    type: String
  },
  // Lowercase enforced username
  username: {
    type: String,
    unique: 'Username exists already.',
    required: true,
    lowercase: true, // Stops users creating case sensitive duplicate usernames with "username" and "USERname", via @link https://github.com/meanjs/mean/issues/147
    trim: true
  },
  // Stores unaltered original username
  displayUsername: {
    type: String,
    trim: true
  },
  // Bewelcome.org username
  extSitesBW: {
    type: String,
    trim: true
  },
  // Couchsurfing.com username
  extSitesCS: {
    type: String,
    trim: true
  },
  // Warmshowers.org username
  extSitesWS: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    default: '',
  },
  emailHash: {
    type: String
  },
  salt: {
    type: String
  },
  /* All this provider stuff relates to oauth logins, will always be local for
     Trustroots, comes from boilerplate. Will be removed one day. */
  provider: {
    type: String,
    required: true
  },
  /* Facebook, Twitter etc data is stored here. */
  providerData: {},
  additionalProvidersData: {},
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user']
  },
  /* The last time the user was logged in (uncertain if its live right now 5 Apr 2015) */
  seen: {
    type: Date
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  avatarSource: {
    type: String,
    enum: ['none', 'gravatar', 'facebook', 'local'],
    default: 'gravatar'
  },
  avatarUploaded: {
    type: Boolean,
    default: false
  },
  newsletter: {
    type: Boolean,
    default: false
  },
  /* For email confirmations */
  emailToken: {
    type: String
  },
  /* New users are public=false until they validate their email. If public=false,
     users can't email other users, can't be seen by other users. They are
     effectively black holed... */
  public: {
    type: Boolean,
    default: false
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  /* Tags & Tribes user is member of */
  member: {
    type: [UserMemberSchema]
  }
});

mongoose.model('User', UserSchema);
