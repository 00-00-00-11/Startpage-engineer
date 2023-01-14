const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const {google} = require('googleapis');

server.listen(PORT, async (req, re) =>{
    const auth = new google.auth.GoogleAuth({ 
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/calendar",
    });
    const client = await auth.getClient();
    const calendar = google.calendar({version: "v3", auth:client});
    let td = new Date();
    let tmrw = new Date(td.getTime() + 24*60*60*1000);
    console.log(tmrw.toString());
    const res = await calendar.events.list({
        calendarId: 'sebastiancardesc@berkeley.edu',
        timeMin: td.toISOString(),
        timeMax : tmrw.toISOString(), 
        singleEvents: true,
        orderBy: 'startTime',
    });
    const events = res.data.items;
    console.log(events);
});
