var allMigrantStock;
var areaNotConsidered;
var media;
var totalEmigrInYear = [];
var emigrInYear = [];
var emigrInState = [];
var xLineGenerator;
var yLinepad=60;
var xLinepad=30;
var ageMigrantStock;
var agePercentage=[]

function createBarChart(selectedDimension) {

    var svgBarBounds = d3.select("#barChart").node().getBoundingClientRect();
    var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();   
    var svgPieBounds = d3.select("#pieChart").node().getBoundingClientRect();

    var chosenYear= "1990";
    var somma=0;
    var count=0;
    var ypad = 120;
    emigrInState = [];
    totalEmigrInYear = [];
    emigrInYear = [];
    agePercentage=[];
    media=0
    
    allMigrantStock.forEach(function (d){

        if (typeof(d[selectedDimension])!='number'){
            if (d[selectedDimension]=="..") d[selectedDimension]="0";
            d[selectedDimension] = parseInt((d[selectedDimension]).replace(/\./g,''));
        }

        if (!(areaNotConsidered.includes(d.major_area)) && d.major_area!="") {
            somma+=d[selectedDimension];
            if (d[selectedDimension]!=0) count+=1;
        }

    });

    media=somma/count;
    var statesInMedia=[];

    allMigrantStock.forEach(function (d) {

        if(d[selectedDimension]>=(media) && !(statesInMedia.includes(d.major_area)) && !(areaNotConsidered.includes(d.major_area))) 
            statesInMedia.push(d.major_area);
    });

    allMigrantStock.forEach(function (d) {
        
        if(d.major_area=="WORLD"){         
            totalEmigrInYear.push({ migrant_number: d[selectedDimension], migrant_year: d.year})
        }
        
        if(statesInMedia.includes(d.major_area)){

            emigrInYear.push({migrant_number: d[selectedDimension], migrant_area: d.major_area, migrant_year: d.year})

            if (d.year=="1990"){ 
                emigrInState.push({ migrant_number: d[selectedDimension], migrant_area: d.major_area })
            }
            
        }
    });

    ageMigrantStock.forEach(function(d){

        if(d.MajorArea==selectedDimension && d.Year==chosenYear){ 
            agePercentage.push(d.sectionOne)
            agePercentage.push(d.sectionTwo)
            agePercentage.push(d.sectionThree)
            agePercentage.push(d.sectionFour)
        }
    })

    //---BAR CHART

    var xScale = d3.scaleBand()
        .domain(emigrInState.map(function(d) { 
            return d.migrant_area; 
        }))
        .range([svgBarBounds.height, 0]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(emigrInState, function (d) {
            return d.migrant_number;
        })])
        .range([svgBarBounds.width, 0]);

    var yAxis = d3.select("#yAxis").call(d3.axisLeft().scale(xScale))
    .attr("transform", "translate (" + (ypad) +", 0)");

    var bars = d3.select("#bars")
        .selectAll("rect")
        .data(emigrInState)   

    bars.attr("height",  function(d){return (20)})
        .attr("y", function(d,i){return (-xScale(d.migrant_area)-20)})
        .attr("width",  function(d){return ((svgBarBounds.width)-yScale(d.migrant_number))})
        .attr('val', function(d) {return d.migrant_number})

    bars.enter().append("rect")    
        .attr("height",  function(d){return (20)})
        .attr("x", ypad)
        .attr("y", function(d,i){return (-xScale(d.migrant_area)-20)})
        .attr("width",  function(d){ return ((svgBarBounds.width)-yScale(d.migrant_number))})
        .attr('val', function(d) {return d.migrant_number})
        .attr("class", "rectStairCase")

    bars.exit().remove()

    //---LINE CHART

    var iScale = d3.scaleLinear()
        .domain([0, Object.keys(totalEmigrInYear).length])
        .range([0, svgLineBounds.width]);

    var xLineScale = d3.scaleBand()
        .domain(totalEmigrInYear.map ( function (d) {
            return d.migrant_year;
        }))
        .range([svgLineBounds.width,0]);

    var yLineScale = d3.scaleLinear()
        .domain([0, d3.max(totalEmigrInYear, function (d) {
            return d.migrant_number;
        })])
        .range([svgLineBounds.height-xLinepad, 0]);

    xLineGenerator = d3.line()
        .x(function (d, i) {
            return (yLinepad+iScale(i));
        })
        .y(function (d) {
            return (yLineScale(d.migrant_number));
        });

    var xAxis = d3.select("#xLineAxis")
        .call(d3.axisBottom()
            .scale(xLineScale))
        .attr("transform", "translate ("+yLinepad+", " + (svgLineBounds.height-xLinepad) +")");

    d3.select("#xAxis").selectAll("text")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
        .attr("x", 9)
        .attr("y", 0)
        .attr("dy", ".35em")

    var yLineAxis = d3.select("#yLineAxis").call(d3.axisLeft().scale(yLineScale))
        .attr("transform", "translate (" + (yLinepad) +", 0)");

    var lines = d3.select("#lines");
    
    lines.selectAll("polyline").remove();
    lines.selectAll("path").remove();
    
    lines.datum(totalEmigrInYear).append("path")
       .attr("class", "line")
       .attr('val', function(d) {return d.migrant_number})
       .attr("d", xLineGenerator);

    //---PIE CHART
    d3.select("#pie").selectAll("path").remove(); 

    var outerRadius = svgPieBounds.width / 2;
    var innerRadius = 0;

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var pie = d3.pie();

    var pieChart = d3.select("#pie") 
            .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    var colors = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#a05d56", "#ff8c00"]);

    var arcs = pieChart.selectAll("path")
              .data(pie(agePercentage))
              .enter(); 

    arcs.append("path")
        .attr("fill", function(d,i) { return colors(i); })
        .attr("d", arc);
}

function chooseData(v) {

    createBarChart(v);

}

function chooseDataLineChart(v){
    
    var lines = d3.select("#lines");
    var chosenEmigr=[]
    var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();
    
    emigrInYear.forEach(function (d) {
        if (d.migrant_area==v) chosenEmigr.push({ migrant_number: d.migrant_number, migrant_year: d.migrant_year})
    });

    lines.datum(chosenEmigr).append("path")
       .attr("class", "line")
       .attr('val', function(d) {return d.migrant_number})
       .attr("d", xLineGenerator);
}

// Load CSV file on area 
d3.csv("data/MajorArea.csv", function (error, csv) {
        if (error) { 
        console.log(error);  //Log the error.
    throw error;
    }

    areaNotConsidered=[];
    
    csv.forEach(function(d){
        areaNotConsidered.push(d.MajorArea);
    });
});

// Load CSV file on migrant age
d3.csv("data/UN_MigrantStockByAge_2017.csv", function (error, csv) {
        if (error) { 
        console.log(error);  //Log the error.
    throw error;
    }
    
    csv.forEach(function (d) {

        d.sectionOne= +(d["0-4"]);
        d.sectionOne+= +(d["5-9"]);
        d.sectionOne+= +(d["10-14"]);
        d.sectionOne= (Math.round(d.sectionOne*10))/10;

        d.sectionTwo= +(d["15-19"]);
        d.sectionTwo+= +(d["20-24"]);
        d.sectionTwo+= +(d["25-29"]);
        d.sectionTwo= (Math.round(d.sectionTwo*10))/10;

        d.sectionThree= +(d["30-34"]);
        d.sectionThree+= +(d["35-39"]);
        d.sectionThree+= +(d["40-44"]);
        d.sectionThree+= +(d["45-49"]);
        d.sectionThree+= +(d["50-54"]);
        d.sectionThree= (Math.round(d.sectionThree*10))/10;

        d.sectionFour= +(d["55-59"]);
        d.sectionFour+= +(d["60-64"]);
        d.sectionFour+= +(d["65-69"]);
        d.sectionFour+= +(d["70-74"]);
        d.sectionFour+= +(d["75+"]);
        d.sectionFour= (Math.round(d.sectionFour*10))/10;

    })

    ageMigrantStock=csv;
    console.log(ageMigrantStock);

});

d3.csv("data/UN_MigrantStockByOriginAndDestination_2017.csv", function (error, csv) {
    if (error) { 
        console.log(error);  //Log the error.
	throw error;
    }

    csv.forEach(function (d) {

        d.year = +d.Year;
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
