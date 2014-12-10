'use strict';
var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var arDrone      = require('ar-drone');
var _            = require('lodash');
var debug        = require('debug')('meshblu-drone-army:index');

var BASIC_ACTIONS     = ["takeoff", "land", "stop", "reset", "disableEmergency"];
var VECTOR_ACTIONS    = ["front", "back", "left", "right", "clockwise", "counterClockwise"];
var ANIMATION_ACTIONS = ["animate"];

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      required: true,
      enum: _.union(BASIC_ACTIONS, VECTOR_ACTIONS, ANIMATION_ACTIONS)
    },
    speed: {
      type: 'integer',
      required: false
    },
    animation: {
      type: 'string',
      required: false,
      enum: ['phiM30Deg', 'phi30Deg', 'thetaM30Deg', 'theta30Deg', 'theta20degYaw200deg', 'theta20degYawM200deg', 'turnaround', 'turnaroundGodown', 'yawShake', 'yawDance', 'phiDance', 'thetaDance', 'vzDance', 'wave', 'phiThetaMixed', 'doublePhiThetaMixed', 'flipAhead', 'flipBehind', 'flipLeft', 'flipRight']
    },
    duration: {
      type: 'integer',
      require: false
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    ip: {
      type: 'string',
      required: false
    }
  }
};

function Plugin(){
  var self = this;
  self.options = {};
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  debug('onMessage', message);
  var action = message.payload.action;
  var func = _.bind(this.client[action], this.client);

  if (_.contains(BASIC_ACTIONS, action)){
    return func();
  }

  if (_.contains(VECTOR_ACTIONS, action)){
    return func(message.payload.speed);
  }

  if (_.contains(ANIMATION_ACTIONS, action)){
    return func(message.payload.animation, message.payload.duration);
  }

  debug('No matching action found, cowardly doing nothing.');
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  debug('setOptions', options)
  this.options = options;
  this.client = arDrone.createClient(this.options);
  this.client.on('navdata', function(data){
    debug('navdata', data);
  });
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
