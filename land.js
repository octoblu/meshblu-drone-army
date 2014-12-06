'use strict';
var arDrone = require('ar-drone');

var client = arDrone.createClient();
client.up(0);
client.land();
