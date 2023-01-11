setInterval(runLoop, 1000);
setInterval(slowerFunctions, 10000);

function runLoop(){
  var rn = new Date();
  initClock(rn)
  updateUsageText();
  updateElipse();
}

function slowerFunctions(){
  updateCPS(new Date());
}


function updateClock(){
  var timestring = document.getElementById("time").innerHTML.split(":");
  var timenum = [];
  for(var i = 0; i < timestring.length; i++) timenum.push(parseInt(timestring[i]));
  timenum[2] += 1;
  if(timenum[2] >= 60){
    timenum[2] = 0;
    timenum[1] += 1;
  } 
  if(timenum[1] >= 60){
    timenum[1] = 0;
    timenum[0] += 1;
  }
  if(timenum[0] >= 12){
    timenum[0] = 0;
    initDate();
  }

  document.getElementById("time").innerHTML = formatTime(timenum[0], timenum[1], timenum[2]);
}

function updateElipse(){
  var docs = document.getElementsByClassName("ellipse-suffix");
  for(var element of docs){
    
    if((element.innerHTML.split('.').length)>3) 
      element.innerHTML = element.innerHTML.substring(0,element.innerHTML.indexOf("."));
    else
      element.innerHTML = element.innerHTML + '.';
  }
}

function updateCortex(cortexUsage){
  var cortexdoc = document.getElementById("cortex");
  var ellipses = cortexdoc.innerHTML.substring(cortexdoc.innerHTML.indexOf(".") , cortexdoc.innerHTML.length);
  
  cortexdoc.innerHTML = cortexdoc.innerHTML.substring(0, 7);
  if(cortexUsage > 75){
    cortexdoc.innerHTML += " USAGE HIGH"
  } else if (cortexUsage > 50){
    cortexdoc.innerHTML += " USAGE NORMAL";
  } else cortexdoc.innerHTML += " USAGE LIGHT";
  if (ellipses.length <= 3) cortexdoc.innerHTML += ellipses;
}

function updateUsageText(){
  var text = document.getElementById("current-usage");
  socket.on("currentUsage", (currentUsage) => {
    currentUsage = Math.round(100*currentUsage);
    text.innerHTML =  text.innerHTML.substring(0,text.innerHTML.indexOf(":") + 1) + " " + currentUsage.toString();
    updateCortex(currentUsage);
  }); 
}

function updateCPS(current){
  //time of day being true means its day and the sun is up, false means night and moon is up
  initCPS(current, sunset, sunrise);
  //console.log(sun.x);

}


    
