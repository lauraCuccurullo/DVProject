var allMigrantStock;

function createBarChart(selectedDimension) {

    var svgBarBounds = d3.select("#barChart").node().getBoundingClientRect();
    var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();

    
    var immigrati=[];
    var stati=[];
    var totali=[];
    var somma=0;
    var count=0;
    var ypad = 100;
    
    allMigrantStock.forEach(function (d){
        if (d[selectedDimension]=="..") d[selectedDimension]="0";
        d[selectedDimension] = parseInt((d[selectedDimension]).replace(/\./g,''));

        if (d.major_area!="") {
            somma+=d[selectedDimension];
            if (d[selectedDimension]!=0) count+=1;
    }
    });

    var media=somma/count;
    //console.log(somma + " " + count)
    allMigrantStock.forEach(function (d) {

        //d[selectedDimension] = parseInt((d[selectedDimension]).replace(/\./g,''));
        
        if(d.major_area=="WORLD"){            
            totali.push(d[selectedDimension] )
        }
        
        if(d[selectedDimension]>(media) && d.year=="1990"){
            immigrati.push(d[selectedDimension])
            stati.push(d.major_area)
        }
    });

    //---BAR CHART

    var xScale = d3.scaleBand()
        .domain(stati.map(function(d) { 
            return d; 
        }))
        .range([svgBarBounds.height, 0]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(allMigrantStock, function (d) {
            return d[selectedDimension];
        })])
        .range([svgBarBounds.width, 0]);

    var yAxis = d3.select("#yAxis").call(d3.axisLeft().scale(xScale))
    .attr("transform", "translate (" + (ypad) +", 0)");

    var bars = d3.select("#bars")
        .selectAll("rect")
        .data(immigrati)   

    bars.attr("height",  function(d){return (20)})
        .attr("y", function(d,i){return (-20*i)})
        .attr("width",  function(d){return ((svgBarBounds.width)-yScale(d))})
        .attr('val', function(d) {return d})

    bars.enter().append("rect")    
        .attr("height",  function(d){return (20)})
        .attr("x", ypad)
        .attr("y", function(d,i){return (-20*i)})
        .attr("width",  function(d){ return ((svgBarBounds.width)-yScale(d))})
        .attr('val', function(d) {return d})
        .attr("class", "rectStairCase")

    bars.exit().remove()

    //---LINE CHART

    var iScale = d3.scaleLinear()
        .domain([0, totali.length])
        .range([0, svgLineBounds.width]);

    var xLineScale = d3.scaleLinear()
        .domain([0, d3.max(totali, function (d) {
            return d;
        })])
        .range([svgLineBounds.height, 0]);

    var xLineGenerator = d3.line()
        .x(function (d, i) {
            return (iScale(i));
        })
        .y(function (d) {
            return (svgLineBounds.width-xLineScale(d));
        });

    var lines = d3.select("#lineChart");
    
    lines.selectAll("polyline").remove();
    lines.selectAll("path").remove();
    
    lines.datum(totali).append("path")
       .attr("d", xLineGenerator);
}

function chooseData(v) {

    createBarChart(v);

}

// Load CSV file
d3.csv("data/UN_MigrantStockByOriginAndDestination_2017.csv", function (error, csv) {
    if (error) { 
        console.log(error);  //Log the error.
	throw error;
    }

    csv.forEach(function (d) {
        d.year = d.Year;
        d.major_area = d.MajorArea;
        d.stato=[];
        d.valore=[];
        Object.keys(d).forEach(function(key) {
            if (d[key]!=".." && key!="MajorArea" && key!="Year" && key!="Total" && key!="total" && key!="year" && key!="major_area" && key!="stato" && key!="valore"){
            value=(d[key]).replace(/\./g,'');
            value = parseInt(value);
            d.stato.push(key);
            d.valore.push(value);
        }
        })
    });

    // Store csv data in a global variable
    allMigrantStock = csv;
    // Draw the Bar chart for the first time
    createBarChart('Italy');

    console.log(allMigrantStock);


});
