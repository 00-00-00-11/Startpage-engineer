const weather_id = ""; //paste your openweathermaps api key here
const todoist_key = ""; //paste your todoist api key here
const credentials_path = "";
const calendarId = "";

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
const {google} = require('googleapis');
let getData = html => {
  const $ = cheerio.load(html);
  return $("#comic").children("img:first").attr("src");
}

let ip2loc = new IP2LOC.IP2Location();
ip2loc.open('./ip.bin');

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;


var histogramLength = 61;
var cpuHist = [];
var interval = 500;
var io = require("socket.io")(server);
var comic_url = null;
var random_xkcd_url = "https://c.xkcd.com/random/comic"
var xkcd_url = "https://www.xkcd.com"

for( var i = 0; i < histogramLength; i++) cpuHist[i] = [i,0];

server.listen(PORT, async () =>{ 
    console.log(`Server running on port ${PORT}`);
    io.on('connection', async function (socket) {
        //Google API Stuff (AKA, Itinerary Stuff client side)
        if(credentials_path.length != 0) {
            const auth = new google.auth.GoogleAuth({ 
                keyFile: credentials_path,
                scopes: "https://www.googleapis.com/auth/calendar",
            });
            const client = await auth.getClient();
            const calendar = google.calendar({version: "v3", auth:client});
            let td = new Date();
            let tmrw = new Date(td.getTime() + 24*60*60*1000);
            const res = await calendar.events.list({
                calendarId,
                timeMin: td.toISOString(),
                timeMax : tmrw.toISOString(), 
                singleEvents: true,
                orderBy: 'startTime',
            });
            const events = res.data.items;
            socket.emit("events", events);
        }
        //todoist api stuff (AKA, Task Stuff client side)
        if(todoist_key.length != 0) {
            var todoist_url = `https://api.todoist.com/rest/v2/tasks`

            let config = {
                url: `${todoist_url}`,
                headers: {
                    'Authorization': `Bearer ${todoist_key}`,
                }
            }
            axios(config).then( resp => {
                socket.emit("tasks",resp.data);
            }).catch( () => { });
        } 
        publicIp.v4().then(
            (v4)=>{
                //weather and sunset data, Planetary Report client side
                var longi = ip2loc.getLongitude(v4);
                var lat = ip2loc.getLatitude(v4);

                var sunset = getSunset(lat, longi);
                var sunrise = getSunrise(lat,longi);
                
                socket.emit("sunset-sunrise",[sunset,sunrise]);
                
                var weather_url = `http://api.openweathermap.org/data/2.5/weather?`
                                    + `lat=${lat}&lon=${longi}&appid=${weather_id}`;
                var forecast_url = `http://api.openweathermap.org/data/2.5/forecast?`
                                    + `lat=${lat}&lon=${longi}&appid=${weather_id}`;
                if(weather_id.length != 0){
                    axios.get(forecast_url).then( 
                        resp => {
                         //console.log(resp.data.list[0]);
                         let temp_min = 10000; let temp_max = -1; let rain = -1; let snow = -1;
                         for(let i = 0; i < resp.data.list.length; i++) {
                            temp_min = Math.min(resp.data.list[i].main.temp, temp_min); 
                            temp_max = Math.max(resp.data.list[i].main.temp, temp_max); 
                            if(resp.data.list[i].snow != undefined){
                                snow = Math.max(resp.data.list[i].snow['3h'], snow);  
                            }
                            if(resp.data.list[i].rain != undefined){
                                rain = Math.max(resp.data.list[i].rain['3h'], rain);  
                            }
                         }
                         socket.emit("forecastData", [resp.data.list[0], temp_min, temp_max, snow, rain]);
                    }).catch( () => { });

                    axios.get(weather_url).then( resp => {
                         socket.emit("weatherData", resp.data);
                    }).catch( () => { });
                }
            }).catch( () => { });
            
            

        socket.emit("cpuType", os.cpus()[0].model);
        socket.emit("username", os.userInfo().username);
        axios.get(random_xkcd_url).then( 
            resp => {
          xkcd_url = resp.request.res.responseUrl
        }).catch( () => { });

        axios.get(xkcd_url)
             .then(response =>{
               //console.log(response.data);
               comic_url = getData(response.data);
             })
             .catch(error => {
               console.log(error);
             });
        socket.emit("comic_url", comic_url);

              
        //sets interval to check cpu usage
        
        //console.log(os.userInfo().username);
        var intv = setInterval(
            () => {
                osUtils.cpuUsage((value) => {
                    updateHist(Math.round(value*100));
                    io.emit("cpu histogram", cpuHist);
                    io.emit("currentUsage",value);
                });
            }, 
            interval);
        
        socket.on("disconnect", ()=>{
            clearInterval(intv);
            delete socket;
        });

        socket.on("task_remove", id => {
            //console.log(id);
            axios.post(todoist_url + `/${id}/close`,{},config).then( 
                resp => {
                 //console.log(resp);
            }).catch(err => { console.log(err); });
        });
        
    });
});

function updateHist(cpuLoad){
    if(cpuHist.length >= histogramLength) 
        cpuHist.shift();
    
    cpuHist.push([0,cpuLoad]);

    for(var i = 0; i< histogramLength; i++)
        cpuHist[i][0] = i;
}


