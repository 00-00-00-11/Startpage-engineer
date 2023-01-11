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

function initDate(date){
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var year = date.getFullYear();
  document.getElementById("display_date").innerHTML = month + "." + day + "." + year;
  return date;
}

function formatTime(hours,minutes,seconds){
    var time = [hours,minutes,seconds];
    var timestring = "";

    for(var i = 0; i < time.length; i++){
        elstring = time[i].toString();
        if(elstring.length < 2 && i != 0) elstring = "0" + elstring;
        timestring += elstring + ":" 
    }
    timestring = timestring.substring(0, timestring.length-1);
    return timestring;
}

function initClock(date){
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  hours %= 12;

  document.getElementById("time").innerHTML = formatTime(hours,minutes,seconds);
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
  
  if((  current.getHours() < ssdate.getHours()  || (current.getHours() == ssdate.getHours() && current.getMinutes() > ssdate.getMinutes())) &&   current.getHours() >= srdate.getHours()  ) 
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
    console.log(mx);
    moon.updateX(mx);
  }
  sun.updateCelestial();
  moon.updateCelestial();
}


var moon = new celestial(true,0,0,document.getElementById("moon"));
var sun = new celestial(true,0,0,document.getElementById("sun"));

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
      console.log(value[1]);
      var val = formatTime(sunrise.getHours() ,sunrise.getMinutes(), sunrise.getSeconds());
      document.getElementById("sunset-time").innerHTML +=  formatTime(sunset.getHours() ,sunset.getMinutes(), sunset.getSeconds());
      document.getElementById("sunrise-time").innerHTML += val;
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

var toCels = tmp => Math.round( (tmp - 273.15) * (9/5) + 32 );
socket.on("forecastData", data => {
  console.log(data);
  document.getElementById("tempmin").innerHTML = toCels(data.main.temp_min);
  document.getElementById("tempmax").innerHTML = toCels(data.main.temp_max);
  document.getElementById("windspeed").innerHTML = data.wind.speed + " m/s";
  document.getElementById("clouds").innerHTML = data.clouds.all + "%";
  document.getElementById("hum").innerHTML = data.main.humidity + "%";
});
