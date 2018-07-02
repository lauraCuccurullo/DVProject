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
var agePercentage=[];
var paesi;
var expanded_continents=[];

function createBarChart(selectedDimension) {

    var svgBarBounds = d3.select("#barChart").node().getBoundingClientRect();
    var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();
    var svgPieBounds = d3.select("#pieChart").node().getBoundingClientRect();

    var chosenYear= "1990";
    var somma=0;
    var count=0;
    emigrInState = [];
    totalEmigrInYear = [];
    emigrInYear = [];
    agePercentage=[];
    media=0
    ageRange =["0-14", "15-29", "30-54", "55+"];


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

    d3.select("#selected-country")
        .text(selectedDimension);

    var xBarpad = 140;
    var yBarpad = 10;
    var yScale = d3.scaleBand()
        .domain(emigrInState.map(function(d) {
            return d.migrant_area;
        }))
        .range([svgBarBounds.height-yBarpad, yBarpad])
        .paddingInner([0.2]);

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(emigrInState, function (d) {
            return d.migrant_number;
        })])
        .range([xBarpad,svgBarBounds.width-xBarpad]);

    var yAxis = d3.select("#yAxis").call(d3.axisLeft().scale(yScale).tickSizeOuter(0))
        .attr("transform", "translate (" + (xBarpad) +", 0)");

    d3.select("#yAxis")
      .selectAll("text")
      .style("font-size","1vw");

    var colorScale= d3.scaleLinear()
        .domain([0, d3.max(emigrInState, function (d) {
           return d.migrant_number;
        })])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb('#FFFFC2'),d3.rgb("#BF4100")]);


    var bars = d3.select("#bars")
        .selectAll("rect")
        .data(emigrInState)

    bars.enter().append("rect")
    bars.exit().remove()
    d3.select("#bars")
        .selectAll("rect")
        .data(emigrInState)
        .attr("height", yScale.bandwidth())
        .attr("y", function(d){return (yScale(d.migrant_area))})
        .attr("width",  function(d){return (xScale(d.migrant_number))})
        .attr('val', function(d) {return d.migrant_number})
        .attr("class", "rectStairCase")
        .attr("x", xBarpad)
        .style("fill", function(d){return colorScale(d.migrant_number)});

    //---LINE CHART


    var xLineScale = d3.scaleTime()
        .domain([d3.min(totalEmigrInYear, function (d) {
            return new Date(d.migrant_year,0,1,0);
        }), d3.max(totalEmigrInYear, function (d) {
            return new Date(d.migrant_year,0,1,0);
        })])
        .range([xLinepad,svgLineBounds.width-xLinepad]);

    var yLineScale = d3.scaleLinear()
        .domain([0, d3.max(totalEmigrInYear, function (d) {
            return d.migrant_number;
        })])
        .range([svgLineBounds.height-yLinepad, yLinepad]);

    xLineGenerator = d3.line()
        .x(function (d) {
            return (xLineScale(new Date(d.migrant_year,0,1,0)));
        })
        .y(function (d) {
            return (yLineScale(d.migrant_number));
        });
    console.log(xLineGenerator);
    var xAxis = d3.select("#xLineAxis")
        .call(d3.axisBottom()
            .scale(xLineScale))
        .attr("transform", "translate (0, " + (svgLineBounds.height-yLinepad) +")");

    var yLineAxis = d3.select("#yLineAxis").call(d3.axisLeft().scale(yLineScale))
        .attr("transform", "translate (" + (xLinepad) +", 0)");

    var lines = d3.select("#lines");


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

    var colors = d3.scaleOrdinal(["#f3e59d", "#e5c16e", "#d89941", "#c6590b"]);

    var arcs = pieChart.selectAll("path")
              .data(pie(agePercentage))
              .enter();

    arcs.append("path")
        .attr("fill", function(d,i) { return colors(i); })
        .attr("d", arc);

    arcs.append("svg:text")
        .attr("transform", function(d) {
        d.innerRadius = 0;
        d.outerRadius =100;
        return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function(d, i) { return ageRange[i]; });
}

//INDICE
// function widen(d,v) {
//   console.log(d);
//   console.log(v);
  //   .selectAll(".states");
  // states.classed("invisible", !states.classed("invisible"))
  // d3.select(d)
  //   .append("div")
  //   .attr("class", "area-name")
  //   .text(function(d) { return d;})
  //   .attr("text-anchor", "middle")
  // if(!expanded_continents[v]){
  //   var stati= d3.select(d)
  //     .selectAll(".states")
  //     .data(paesi.filter(function (d) { return (d.Area==v);}))
  //     .enter().append("div")
  //     .attr("class", "states")
  //     .text(function(d) {return d.State})
  //     .on("click", function (d) {update_state(d.State)});
  //   expanded_continents[v]=true;
  //   console.log("Widening "+v+":\n");
  //   console.log(expanded_continents);
  // }
  // else{
  //   d3.select(d)
  //     .selectAll(".states")
  //     .remove();
  //   expanded_continents[v]=false;
  //   console.log("Shortening "+v+":\n");
  //   console.log(expanded_continents);
  //}

// }
function createIndex(){
    continent_array = d3.map(paesi, function(d){return d.Area}).keys()
    for(i=0;i<continent_array.length;i++)
        expanded_continents[continent_array[i]]=false;
    var continenti = d3.select("#index")
        .selectAll(".areas")
        .data(continent_array);

    continenti.enter()
        .append("div")
        .attr("class", "areas")
        .each(function(d){
          d3.select(this)
            .append("div")
            .attr("class", "area-name")
            .text(function(d) { return d;})
            .attr("text-anchor", "middle")
            .on("click", function(d){
                states=d3.select(this.parentNode)
                  .selectAll(".states");
                states.classed("invisible", !states.classed("invisible"));
            });
          d3.select(this)
            .selectAll(".states")
            .data(paesi.filter(function (p) { return (p.Area==d);}))
            .enter().append("div")
            .classed("states",true)
            .classed("invisible",true)
            .text(function(d) {return d.State})
            .on("click", function (d) {createBarChart(d.State)});
          }
        )

  //  continenti.text(function(d){return d})
  //  continenti.exit().remove()
}

//SCELTA E MODIFICA PARAMETRI

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

// Load CSV file on paesi
d3.csv("data/paesi.csv", function (error, csv) {
        if (error) {
        console.log(error);  //Log the error.
    throw error;
    }

    paesi = csv;

});

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
