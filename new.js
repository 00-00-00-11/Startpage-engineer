const http = require('http');
const path = require('path');
const osUtils = require('os-utils');
const os = require('os');
const geoip = require('ipapi.co');
const publicIp = require('public-ip');
const { getSunrise, getSunset } = require('sunrise-sunset-js');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const server = http.createServer(app);
const IP2LOC = require('ip2location-nodejs');
const APPID = "627dd26ec6398215229e708af7b02c8d";
const todoist_key = "50d98b9cf46e2b96603c41f6777b78e61d5f21f6";

var todoist_url = `https://api.todoist.com/rest/v2/tasks`

let config = {
    url: `${todoist_url}`,
    headers: {
        'Authorization': `Bearer ${todoist_key}`,
    }
}
console.log(config.headers);
let data = {
  //  'sync_token': '*',
   // 'resource_types': '["all"]',
}
axios(config).then( resp => {
     console.log(resp);
});
