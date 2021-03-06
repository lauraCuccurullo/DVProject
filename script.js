var allMigrantStock;
var areaNotConsidered=[];
var media;
var totalEmigrInYear = [];
var emigrInState = [];
var emigrInYear = [];
var age_percentage;
var agePercentage=[];
var country_area;
var expanded_continents=[];
var year="2017"
var state=null;
var chosen_states=[]
var threshold=null;
var emigrants;
var immigrants;
var immigrantsFemale;
var immigrantsMale;
var gender_percentage;

function changeInput(){
    if(document.getElementById("check").checked){
          allMigrantStock=emigrants;
          d3.select("#genre").classed("invisible", false)
    }
    else{
      allMigrantStock=immigrants;
      d3.select("#genre").classed("invisible", true)
    }

    show_charts();
}

function changeGender(){
  if (document.getElementById("both").checked) {allMigrantStock=emigrants; age_percentage=age_percentageBoth;}
  else if (document.getElementById("male").checked) {allMigrantStock=immigrantsMale; age_percentage=age_percentageMale }
  else {allMigrantStock=immigrantsFemale; age_percentage=age_percentageFemale }
  show_charts();
}


function drawMap(world) {

  var svgMapBounds = d3.select("#map").node().getBoundingClientRect();

  projection = d3.geoEquirectangular().scale(170)
    .translate([svgMapBounds.width/2,svgMapBounds.height/2])

    var map = d3.select("#map"),
    path = d3.geoPath().projection(projection),
    g = map.append("g");

    g.append("path")
        .attr("width", svgMapBounds.width)
        .attr("id", "graticule")
        .attr("class", "grat")
        .attr("fill", "none")
        .attr("d", path(d3.geoGraticule10()));

    var countries = topojson.feature(world, world.objects.countries).features

    g.selectAll("path")
        .data(countries)
        .enter().insert("path", ".graticule")
        .attr("class", 'countries')
        .attr("id", function(d){return d.id})
        .attr("d", path)
        .style('fill', "grey")
        .on("mouseover", function(d,i){
                d3.select(this).style("fill", "#ffa07a")})
        .on("mouseout", function(){
                d3.select(this).style('fill', "grey")})
        .on("click", function(d){
                country_codes.forEach(function (f){
                  if (d.id == f.CountryCode) {state=f.CountryName; return show_charts();}
                })
        });

}

function hide_charts(){
    threshold=null;
    d3.select("#chart-container")
      .classed("invisible",true)
     .style("background-color", "rgba(20,50,50,0)");
    d3.select("#map-container")
     .transition()
     .duration(1000)
     .style("opacity", "1");
}

function create_charts(){
    createBarChart();
    createLineChart();
    createPieChart()
    createPieChartGender()
    d3.select("#slider")
          .attr("min", 500)
          .attr("max", d3.max(emigrInYear, function (d) {return d.migrant_number;}))
          .attr("value",parseInt(media));
  }

function show_charts(y){
    year=y||year;
    if (!state) return;

    update_state()
    update_year();
    d3.select("#chart-container")
      .classed("invisible",false)
      .transition()
      .duration(1000)
      .style("background-color", "rgba(20,50,50,0.1)");
      ;
    d3.select("#map-container")
     .transition()
     .duration(1000)
     .style("opacity", "0.3");
    document.getElementById("slider").value=media;
    var maxMigr = d3.max(emigrInYear, function (d) {return d.migrant_number;})

    create_charts();
}

function update_year(){
  d3.selectAll(".selected-year")
      .text(year);
  emigrInYear=[];
  emigrInState.forEach(function(d){
      if(d.migrant_year==year)
          emigrInYear.push({ migrant_number: d.migrant_number, migrant_area: d.migrant_area })
  });

}

function update_state(){
    d3.selectAll(".selected-country")
        .text(state);
    d3.select("#country-line")
        .text("");
    var somma=0;
    var count=0;
    emigrInYear = [];
    totalEmigrInYear = [];
    emigrInState = [];
    agePercentage=[];
    media=0
    ageRange =["0-14", "15-29", "30-54", "55+"];

        allMigrantStock.forEach(function (d){

            d[state] = +d[state];

            if (!(areaNotConsidered.includes(d.MajorArea)) && d.MajorArea!="") {
                somma+=d[state];
                if (d[state]!=0) count+=1;
            }

        });

        media=somma/count;
        threshold=threshold==null?media:threshold;
        var statesInThreshold=[];

        allMigrantStock.forEach(function (d) {

            if(d[state]>=threshold && !(statesInThreshold.includes(d.MajorArea)) && !(areaNotConsidered.includes(d.MajorArea))){
                statesInThreshold.push(d.MajorArea);
              }
        });

        allMigrantStock.forEach(function (d) {

            if(d.MajorArea=="WORLD"){
                totalEmigrInYear.push({ migrant_number: d[state], migrant_year: d.Year})
            }

            if(statesInThreshold.includes(d.MajorArea)){

                emigrInState.push({migrant_number: d[state], migrant_area: d.MajorArea, migrant_year: d.Year});

            }
        });

    age_percentage.forEach(function(d){

      if(d.MajorArea==state && d.Year==year){
          agePercentage.push(d.sectionOne)
          agePercentage.push(d.sectionTwo)
          agePercentage.push(d.sectionThree)
          agePercentage.push(d.sectionFour)
      }
    })

  chosen_states=[];
  }

function getId(d,chart){
    id="#"+chart+"-"+d;
    return(id.replace(/ /g, "-"));
}
function newId(d,chart){
    return(getId(d,chart).replace(/#/g, ""));
}
function createBarChart(){
    var svgBarBounds = d3.select("#barChart").node().getBoundingClientRect();
    var xBarpad = 100;
    var yBarpad = 30;
    var yScale = d3.scaleBand()
        .domain(emigrInYear.map(function(d) {
            return d.migrant_area;
        }))
        .range([svgBarBounds.height-yBarpad, yBarpad])
        .paddingInner([0.2]);

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(emigrInYear, function (d) {
            return d.migrant_number;
        })])
        .range([0,svgBarBounds.width-2*xBarpad]);

    var yBarAxis = d3.select("#yBarAxis").call(d3.axisLeft().scale(yScale).tickSizeOuter(0))
        .attr("transform", "translate (" + (xBarpad) +", 0)")
        .selectAll("text")
        .attr("transform", "rotate (30)")

    var colorScale= d3.scaleLinear()
        .domain([0, d3.max(emigrInYear, function (d) {
           return d.migrant_number;
        })])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb('#FFFFC2'),d3.rgb("#BF4100")]);

    var bars = d3.select("#bars")
        .selectAll("rect")
        .data(emigrInYear);

    bars.exit().remove();
    bars.enter().append("rect");

    d3.select("#bars")
        .selectAll("rect")
        .data(emigrInYear)
        .classed("rect",true)
        .on("click",function(d){
              d3.select(this)
              .classed("hide",false);
              new_line(d.migrant_area);
              line = d3.select(getId(d.migrant_area,"line"))
              line.classed("highlight", !line.classed("highlight"));
              })
        .on("mouseover", function(d){
          d3.select(this).classed("lineHover", true);
          d3.select(getId(d.migrant_area, "line"))
          .classed("lineHover", true);
        })
        .on("mouseout", function(d){
          d3.select(this).classed("lineHover", false);
          d3.select(getId(d.migrant_area, "line"))
          .classed("lineHover", false);
        })
        .transition()
        .delay(function(d, i) {
          return i / allMigrantStock.length * 1000;
        })
        .duration(1000)
        .attr("height", yScale.bandwidth())
        .attr("y", function(d){return (yScale(d.migrant_area))})
        .attr("width",  function(d){return (xScale(d.migrant_number))})
        .attr('val', function(d) {return d.migrant_number})
        .attr("id",function(d){return newId(d.migrant_area,"bar");})
        .attr("x", xBarpad)
        .style("fill", function(d){return colorScale(d.migrant_number)});

    texts= d3.select("#bars")
        .selectAll("text")
        .data(emigrInYear);
    texts.enter().append("text");
    texts.exit().remove();
    d3.select("#bars")
        .selectAll("text")
        .data(emigrInYear)
        .classed("bar-tooltip",true)
        .transition()
        .delay(function(d, i) {
          return i / allMigrantStock.length * 1000;
        })
        .duration(500)
        .attr("y", function(d){return yScale(d.migrant_area)+(yScale.bandwidth()/2)})
        .attr("x", function(d){return xScale(d.migrant_number)+xBarpad+10})
        .text(function(d){return d.migrant_number;});


}
//---LINE Chart

function new_line(chosenState){

  var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();

  if(!chosen_states.includes(chosenState)){
        chosen_states.push(chosenState)
        emigrFromState=[];
        emigrInState.forEach(function(d){
            if(d.migrant_area===chosenState)
                emigrFromState.push({ migrant_number: d.migrant_number, migrant_year: d.migrant_year })

        });
        d3.select("#lines")
        .append("path")
        .attr("class", "line")
        .on("mouseover",function(){
              d3.select(this).classed("lineHover", true);
              d3.select("#country-line")
              .text(chosenState);
              d3.select(getId(chosenState, "bar"))
              .classed("lineHover", true);

              var coordinates = [0, 0];
              coordinates = d3.mouse(this);
              var x = coordinates[0];
              var y = coordinates[1];

              var xPosition = d3.event.pageX - svgLineBounds.x + 10
              var yPosition = d3.event.pageY - svgLineBounds.y + 10

            d3.select("#line-chart").insert("span", "svg")
               .attr("id", "tooltip")
               .style("left", xPosition+'px')
               .style("top", yPosition+'px')
               .text(chosenState);
            })

        .on("mouseout",function(){
              d3.select(this).classed("lineHover", false);
              d3.select("#country-line")
              .text(null);
              d3.select(getId(chosenState, "bar"))
              .classed("lineHover", false);
              d3.select("#tooltip").remove();
            })
        .on("click",function(){
              chosen_states.splice(chosen_states.indexOf(chosenState), 1 )
              d3.select(this)
                .remove();
              d3.select(getId(chosenState, "bar"))
              .classed("lineHover", false)
              .classed("hide",true);
              d3.select("#tooltip").remove();
            })
        .style("opacity", "0.1")
        .transition()
        .duration(1000)
        .style("opacity", "1")
        .attr('id', newId(chosenState,"line"))
        .attr("d", xLineGenerator(emigrFromState));
    }

}
function createLineChart(){
    var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();
    var yLinepad=30;
    var xLinepad_right=60;
    var xLinepad_left=20;
    d3.selectAll(".line")
     .transition()
     .duration(1000)
     .style("opacity", "0.3")
     .remove();

    var xLineScale = d3.scalePoint()
        .domain(emigrInState.map ( function (d) {
            return d.migrant_year;
        }))
        .range([xLinepad_right,svgLineBounds.width-xLinepad_left]);

    var yLineScale = d3.scaleLinear()
        .domain([0, d3.max(emigrInState, function (d) {
            return d.migrant_number;
        })])
        .range([svgLineBounds.height-yLinepad, yLinepad]);

    xLineGenerator = d3.line()
        .x(function (d) {
            return (xLineScale(d.migrant_year));
        })
        .y(function (d) {
            return (yLineScale(d.migrant_number));
        })

    var xLineAxis = d3.select("#xLineAxis")
        .call(d3.axisBottom()
            .scale(xLineScale))
        .transition()
        .duration(750)
        .attr("transform", "translate (0, " + (svgLineBounds.height-yLinepad) +")");

    d3.select("#xLineAxis").selectAll("text")
        .on("click",function(d){year=d; show_charts();})
        .attr("cursor","pointer");

    var yLineAxis = d3.select("#yLineAxis").call(d3.axisLeft().scale(yLineScale))
        .transition()
        .duration(1000)
        .attr("transform", "translate (" + (xLinepad_right) +", 0)");

    d3.select("#xLineAxis").append("g")
        .classed("grat",true)
        .call(d3.axisBottom().scale(xLineScale)
            .tickSize(-svgLineBounds.height+2*yLinepad)
            .tickFormat(""));
    d3.select("#yLineAxis").append("g")
        .classed("grat",true)
        .call(d3.axisLeft().scale(yLineScale)
            .tickSize(-svgLineBounds.width+xLinepad_right)
            .tickFormat(""));
    states=[];
    emigrInState.forEach(function(d){if(!states.includes(d.migrant_area)) states.push(d.migrant_area);});
    states.forEach(function(d){new_line(d)});
}
function createPieChart(){

    var svgPieBounds = d3.select("#pieChart").node().getBoundingClientRect();
    d3.select("#pie").selectAll("path").remove();
    d3.select("#pie").selectAll("text").remove();
    d3.select("#pie-chart").selectAll("text").remove();

    if (agePercentage[0]==0 && agePercentage[1]==0 && agePercentage[2]==0 && agePercentage[3]==0) {
      d3.select('#pie-chart')
      .insert('text', 'SVG')
      .attr('class', 'datiMancanti')
      .text('DATI MANCANTI')
      return;
    }

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
    .text(function(d, i) { return ageRange[i]; })
    .on("mouseover", function(d){

        var coordinates = [0, 0];
        coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];

        var xPosition = d3.event.pageX - svgPieBounds.x
        var yPosition = d3.event.pageY - svgPieBounds.y

      d3.select("#pie-chart").insert("span", "svg")
         .attr("id", "tooltip-pie")
         .style("left", xPosition+'px')
         .style("top", yPosition+'px')
         .text(d.value+"%");

    })
    .on("mouseout", function(d){
       d3.select("#tooltip-pie").remove();
    });
}

function createPieChartGender(){
    perc=[]
    gender_percentage.forEach(function(d){
      if(d.MajorArea==state){
        female=+((d[year]).replace(",","."))
        perc.push(female);
        perc.push(100-female);
      }
    })

    var svgPieBounds = d3.select("#pieChartGender").node().getBoundingClientRect();

    d3.select("#pieGender").selectAll("path").remove();

    var outerRadius = svgPieBounds.width / 2;
    var innerRadius = 0;

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var pie = d3.pie();

    var pieChart = d3.select("#pieGender")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    var colors = d3.scaleOrdinal(["#ff8080", "#8080ff"]);

    var arcs = pieChart.selectAll("path")
              .data(pie(perc))
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
    .text(function(d, i) { if (i==0 ) return "female"; else return "male" })
        .on("mouseover", function(d){

        value=parseInt(d.value)

        var coordinates = [0, 0];
        coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];

        var xPosition = d3.event.pageX - svgPieBounds.x
        var yPosition = d3.event.pageY - svgPieBounds.y +240

      d3.select("#pie-chart").insert("span", "svg")
         .attr("id", "tooltip-pie")
         .style("left", xPosition+'px')
         .style("top", yPosition+'px')
         .text(value+"%");

    })
    .on("mouseout", function(d){
       d3.select("#tooltip-pie").remove();
    });;
}

function create_index(){
  d3.select("#continents")
      .selectAll(".dropdown")
      .each(function(){
          id=this.id;
          d3.select(this)
            .select(".dropdown-content")
            .selectAll(".area")
            .data(continent_area.filter(function(d){
              if(d.continent.toLowerCase().includes(id))
                return d;
              }))
            .enter()
            .append("div")
            .classed("area",true)
            .each(function(d){
              area=d3.select(this);
              area
                .append("div")
                .classed("area-name",true)
                .attr("id",function(d){return d.area.replace(/ /g,"-")})
                .text(function(d){return d.area});
              area
                .append("div")
                .classed("dropdown-content-2",true)
                .attr("id",function(d){return d.area.replace(/ /g,"-")})
                .selectAll(".state")
                .data(country_area.filter(function(d1){
                  if(d1.Area==d.area) return d1;
                }))
                .enter()
                .append("div")
                .classed("state",true)
                .text(function(d){return d.State;})
                .on("click", function(d){
                  threshold=null;
                  state=d.State;
                  show_charts();
                  })
              })

      });
  d3.selectAll(".area")
      .each(function(){


      })
      .data(country_area)
}

function distributeAge(d){
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
}

//SCELTA E MODIFICA PARAMETRI
function loadData(){
  var q = d3.queue();
      q.defer(d3.csv,"data/UN_MigrantStockByOriginAndDestination_2017.csv");
      q.defer(d3.csv,"data/MajorArea.csv");
      q.defer(d3.csv,"data/paesi.csv");
      q.defer(d3.json,"data/world.json")
      q.defer(d3.csv,"data/UN_MigrantStockByDestinationAndOrigin.csv");
      q.defer(d3.csv,"data/CountryCodeName.csv")
      q.defer(d3.csv,"data/continents_area.csv");
      q.defer(d3.csv,"data/UN_MigrantStockByAge_2017.csv");
      q.defer(d3.csv,"data/gender_percentage.csv");
      q.defer(d3.csv,"data/UN_MigrantStockByOriginAndDestination_2017Male.csv");
      q.defer(d3.csv,"data/UN_MigrantStockByOriginAndDestination_2017Female.csv");
      q.defer(d3.csv,"data/UN_MigrantStockByAge_2017Female.csv");
      q.defer(d3.csv,"data/UN_MigrantStockByAge_2017Male.csv");
      q.await(function(error,file1,file2,file3,file4, file5, file6, file7, file8, file9, file10, file11, file12, file13) {
        if (error){
            console.log(error);
            throw error;
        }
        else {

          emigrants=file1;
          immigrants=file5;
          immigrantsMale=file10;
          immigrantsFemale=file11;
          allMigrantStock=file1;
          file2.forEach(function(d){
            areaNotConsidered.push(d.MajorArea)
          })
          country_area=file3;
          country_codes=file6;
          continent_area=file7;
          drawMap(file4);

          age_percentage=file8;
          age_percentageBoth=file8;
          age_percentageFemale=file12;
          age_percentageMale=file13;
          gender_percentage=file9;

          age_percentage.forEach(function (d) {
              distributeAge(d)
          })

          age_percentageBoth=age_percentage;

          age_percentageMale.forEach(function (d) {
           distributeAge(d)
          })

          age_percentageFemale.forEach(function (d) {
           distributeAge(d)
          })

          d3.select("#slider").on("input", function(){
            threshold = this.value;
            update_state()
            update_year();
            create_charts();
          });
    create_index();

  }}
  )
}
