const http = require('http');
const path = require('path');
const osUtils = require('os-utils');
const os = require('os');
const geoip = require('geoip-lite');
const publicIp = require('public-ip');
const { getSunrise, getSunset } = require('sunrise-sunset-js');
const express = require('express');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 5000;


var histogramLength = 61;
var cpuHist = [];
var interval = 500;
var io = require("socket.io")(server);



for( var i = 0; i < histogramLength; i++) cpuHist[i] = [i,0];

server.listen(PORT, () =>{ 
    console.log(`Server running on port ${PORT}`);
    io.on('connection', function (socket) {
        
        publicIp.v4().then(
            (v4)=>{
                var ll =  geoip.lookup(v4).ll;
                var longi = ll[1];
                var lat = ll[0];

                var sunset = getSunset(lat, longi);
                var sunrise = getSunrise(lat,longi);
                
                socket.emit("sunset-sunrise",[sunset,sunrise]);
            }).catch(
                () => {

                }
            );
            

        socket.emit("cpuType", os.cpus()[0].model);
        
        //sets interval to check cpu usage
        
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
        
    });
});

function updateHist(cpuLoad){
    if(cpuHist.length >= histogramLength) 
        cpuHist.shift();
    
    cpuHist.push([0,cpuLoad]);

    for(var i = 0; i< histogramLength; i++)
        cpuHist[i][0] = i;
}


