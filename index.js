'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var arDrone = require('ar-drone');
var debug = require('debug')('meshblu-drone-army');

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      required: true,
      enum: ["takeoff", "land", "reset", "disableEmergency"]
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
  debug('message.payload.action', message.payload.action);
  this.client[message.payload.action]();
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
  this.client = arDrone.createClient(this.options);
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
