class celestial{
  constructor(visible, x, y, htmlElement){
    this.visible = visible;
    this.x = x;
    this.y = y;
    this.htmlElement = htmlElement;
    this.updateElement();
  }

  updateX(x){
    this.x = x;
    this.updateCelestial();
  }

  updateY(){
    this.y = 0.0493827160494 * (this.x - 45) * (this.x - 45);
  }

  updateElement(){
    this.htmlElement.style.top = this.y.toString() + "%";
    this.htmlElement.style.left = this.x.toString() + "%";

    if(this.visible == true) 
      this.htmlElement.style.visibility = "visible";
    else 
      this.htmlElement.style.visibility = "hidden"; 
  }

  updateCelestial(){
    this.updateY();
    this.updateElement();
  }

  changeVisibility(visible){
    this.visible = visible;
  }
}
function createEvent(description, start, end) {
    let strt = new Date(start); let e = new Date(end);
    let strt_pst = strt.getHours() <= 12? " AM" : " PM";
    let e_pst = e.getHours() <= 12? " AM" : " PM";
    strt = formatTimeFromDate(strt); e = formatTimeFromDate(e);
    strt = strt.substring(0, strt.length-3); e = e.substring(0, e.length-3);
    strt += strt_pst; e += e_pst;
    return `<div class="event">
                        <div style="flex-grow:0; flex-shrink:1; justify-content:flex-start;" class="flex">
                            <p class="eventstart eventitem"> ${strt} </p>
                        </div>
                        <div class= "center" style="flex-grow:1; flex-shrink:1; justify-content:center;" >
                            <p class="eventlabel eventitem">${description} </p>
                        </div>
                        <div style="flex-grow:0; flex-shrink:1;justify-content:flex-end;" class= "flex">
                            <p class="eventduration eventitem"> ${e}</p>
                        </div>
                    </div>`;
}

function button(id){
    console.log(id);
    socket.emit("task_remove", id);
    document.getElementById(id).parentElement.remove();
}
function createTaskHTML(taskname, id){
   let taskerinohtml = `  
                    <div class="task" >
                        <button class="taskbutton" id="${id}" onclick="button(this.id);" > </button>
                        <p class="tasklabel"> ${taskname} </p>
                    </div> `;
    return taskerinohtml;
}

function checkTemp(){
    if ((typeof temp == 'undefined') || (typeof tempmin == 'undefined') || (typeof tempmax == 'undefined')) return; 
    let i = 1; let w = (tempmax - tempmin)/10;
    while(i <= 10) {
        if(temp > tempmax - i*w) break; 
        i++;
    }
    i = 11 - i;
    console.log(i);
    let color = window.getComputedStyle(document.getElementById(`square${i}`)).backgroundColor;
    let c = i <= 5? 210 : 0;//255-parseInt(color.slice(4,color.length).split(",")[0]);
    document.getElementById(`square${i}`).innerHTML=`<p class="center" style="color:rgb(${c},${c},${c});">${temp}:</p>`;
    clearInterval(interv);
}
function initDate(date){
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var year = date.getFullYear();
  document.getElementById("display_date").innerHTML = month + "." + day + "." + year;
  return date;
}
function formatTimeFromDate(date) { 
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    if(hours != 12) hours %= 12;
    return formatTime(hours, minutes, seconds);
}
function formatTime(hours,minutes,seconds){
    var time = [hours,minutes,seconds];
    var timestring = "";

    for(var i = 0; i < time.length; i++){
        elstring = time[i].toString();
        if(elstring.length < 2) elstring = "0" + elstring;
        timestring += elstring + ":" 
    }
    timestring = timestring.substring(0, timestring.length-1);
    return timestring;
}

function initClock(date){

  document.getElementById("time").innerHTML = formatTimeFromDate(date);
}

function adjustCelestialToTOD(timeofdaybool){
  //true = day so hide moon and show sun
  if(timeofdaybool == true){
    moon.changeVisibility(false);
    sun.changeVisibility(true);

    document.getElementById("sunset-time").style.visibility = "visible";
    document.getElementById("sunrise-time").style.visibility = "hidden";
  } else {
    moon.changeVisibility(true);
    sun.changeVisibility(false);
    document.getElementById("sunset-time").style.visibility = "hidden";
    document.getElementById("sunrise-time").style.visibility = "visible";
  }

  
}

function convertToDec(date){
    return ( ( date.getHours() ) + ( date.getMinutes()/60 ) ) + ( date.getSeconds() / (60*60) );
}


function initCPS(current, ssdate, srdate){
  var sameHourMoreMinutes =  (current.getHours() == ssdate.getHours() && current.getMinutes() > ssdate.getMinutes());
  var strictlyBeforeSunset = current.getHours() < ssdate.getHours() ;
  var afterSunrise =   current.getHours() >= srdate.getHours();
  console.log(afterSunrise);
  if((strictlyBeforeSunset && !sameHourMoreMinutes) && afterSunrise)   
    timeOfDay = true;
  else
    timeOfDay = false;
  
  adjustCelestialToTOD(timeOfDay);
  //console.log(srdate);
  var srdec = convertToDec((srdate));
  var ssdec = convertToDec((ssdate))
  var currentdec = convertToDec((current));
  var daytime = ssdec - srdec;
  var nighttime = 24 - daytime;

  if(timeOfDay == true){
    var sx = (currentdec - srdec)/daytime * 90;
    //console.log(sx);
    sun.updateX(sx);
  }else{
    var mx = (currentdec - ssdec)/nighttime * 90;
    if (mx < 0) {
      mx = (currentdec + 24 - ssdec)/nighttime * 90;
    }
    moon.updateX(mx);
  }
  sun.updateCelestial();
  moon.updateCelestial();
}

var moon = new celestial(true,0,0,document.getElementById("moon"));
var sun = new celestial(true,0,0,document.getElementById("sun"));
var interv = setInterval(checkTemp, 100);
var sunrise; var sunset; var timeOfDay = true;
var socket = io();
var processorListed = false;
var SunriseSunsetListed = false;
var today = new Date();

document.getElementById("search-input").focus();
initDate(today);
initClock(today);

socket.on("cpuType", (value) => {
  //console.log("lmao");
  if(processorListed == false){
    document.getElementById("cpu-type").innerHTML = document.getElementById("cpu-type").innerHTML + value;
    processorListed = true;
  }
  socket.removeListener("cpuType");
});

socket.on("sunset-sunrise",(value)=>{
  if(SunriseSunsetListed == false){
      sunrise = new Date(value[1]); sunset = new Date(value[0]);
      //console.log(formatTimeFromDate(sunset));
      document.getElementById("sunset-time").innerHTML +=  formatTimeFromDate(sunset);
      document.getElementById("sunrise-time").innerHTML += formatTimeFromDate(sunrise);
      SunriseSunsetListed = true;
      initCPS(today,sunset,sunrise);
  } 
});
socket.on("comic_url", (url) => {
  if(url != null) {
    //document.getElementById("xkcd").attributes.src = "https:" + url;
    document.getElementById("xkcd").attributes.getNamedItem("src").value = "https:" + url;
    document.getElementById("xkcd_url").attributes.getNamedItem("href").value = "https:" + url;
    console.log(document.getElementById("xkcd").attributes.getNamedItem("src").value)
  }
});
//I named this function to Cels but it actually converts kelvin to fahrenheight... whoops...
var toCels = tmp => Math.round( (tmp - 273.15) * (9/5) + 32 );
var tempmin; var tempmax; var temp;
socket.on("forecastData", resp => {
    //resp format is [openweather obj, temp_min, temp_max, snow, rain]
    let data = resp[0]; tempmin = toCels(resp[1]); tempmax = toCels(resp[2]);
    let snow = resp[3]; let rain = resp[4];
    document.getElementById("tempmin").innerHTML = tempmin;
    document.getElementById("tempmax").innerHTML = tempmax;
    document.getElementById("windspeed").innerHTML = data.wind.speed + " m/s";
    document.getElementById("clouds").innerHTML = data.clouds.all + "%";
    document.getElementById("hum").innerHTML = data.main.humidity + "%";
    let prep_elem = document.getElementById("precipitation");
    console.log(rain);
    snow = snow/3; rain = rain/3;
    if(snow > 0) {
        prep_elem.innerHTML = "SNOW: ";
        if(snow >= 2.5){ prep_elem.innerHTML += "HEAVY";}
        else if(snow >= 1){ prep_elem.innerHTML += "MODERATE";}
        else { prep_elem.innerHTML += "LIGHT"; }
    } else if (rain > 0) {
        prep_elem.innerHTML = "RAIN: ";
        if(rain >= 10){ prep_elem.innerHTML += "HEAVY";}
        else if(rain >= 3){ prep_elem.innerHTML += "MODERATE";}
        else { prep_elem.innerHTML += "LIGHT"; }
    } else{ prep_elem.innerHTML = "NONE" }
});

socket.on("weatherData", resp => {
    temp = toCels(resp.main.temp);
});
socket.on("username", username => {
    document.getElementById("username").innerHTML = username;    
});
socket.on("tasks", tasklist => {
    let prio1 = ""; let prio2 = ""; let prio3 = ""; let prio4 = "";
    tasklist.forEach(task => {
        let task_html = createTaskHTML(task.content, task.id);
        if(task.priority == 1) prio1 += task_html;
        if(task.priority == 2) prio2 += task_html;
        if(task.priority == 3) prio3 += task_html;
        if(task.priority == 4) prio4 += task_html;
    });
    document.getElementById("taskslist").innerHTML = prio4 + prio3 + prio2 + prio1;    
});
socket.on("events", events => {
    if(!events || events.length == 0) {
    } else{
        document.getElementById("eventslist").innerHTML = "";    
        events.forEach(evnt => {
            let start = evnt.start.dateTime;
            let end = evnt.end.dateTime;
            let evnthtml = createEvent(evnt.summary, start, end);
            console.log(end);
            document.getElementById("eventslist").innerHTML += evnthtml;    
       });
    }
});

