var chartLoaded = false;
var histogram = [];
var chart = null;
var data = null;

var options = {
        backgroundColor: "black",
        colors: ['white'],
        //features: ['Smooth'],
        curveType: 'function',
        hAxis: {
            title: 'Time',
            textStyle: { 
                color: "white",
                fontName: 'Share Tech Mono',
                fontSize: 12,
                bold: false,
                italic: false,
            },
            gridlines: {count: 0},
        },
        vAxis: {
            title: 'CPU Usage',
            gridlines: {count: 3},
            textStyle: { 
                color: "white",
                fontName: 'Share Tech Mono',
                fontSize: 12,
                bold: false,
                italic: false,
                 
            },
            viewWindow:{
                min: 0,
                max: 100
            }
        },
        chartArea: {
            left: 2,
            top: 2,
            right: 2,
            bottom: 2,
            
        },
        
        
    };

google.charts.load('current', { packages: ['corechart', 'line'] });
google.charts.setOnLoadCallback(drawBasic);

function drawBasic() {
    data = new google.visualization.DataTable();     
    data.addColumn('number', 'SECS');
    data.addColumn('number', 'CPU');
    data.addRows(histogram);

    if(chart==null)
        chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    
    chart.draw(data, options);
    chartLoaded = true;
}

function updateBasic(){

    if(data.getNumberOfRows() != 0)
        data.removeRows(0,histogram.length);

    data.addRows(histogram);
    chart.draw(data, options);
}

var socket = io();
socket.on("cpu histogram", (cpuHistogram) => {
    histogram = cpuHistogram;
    if(chartLoaded) updateBasic();
}); 
