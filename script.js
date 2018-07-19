var allMigrantStock;
var areaNotConsidered=[];
var media;
var totalEmigrInYear = [];
var emigrInState = [];
var emigrInYear = [];
var ageMigrantStock;
var agePercentage=[];
var paesi;
var expanded_continents=[];
var year="2017"
var state=null;
var chosen_states=[]
var threshold=1000;
var emigrates;
var immigrates;
var gender_percentage;

function changeInput(){
    if(document.getElementById("immigration").checked){
          allMigrantStock=immigrates;
    }
    else{
      allMigrantStock=emigrates;
    }

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
                codeName.forEach(function (f){
                  if (d.id == f.CountryCode) {state=f.CountryName; threshold=0; return show_charts();}
                })
        });

}

function hide_charts(){
    d3.select("#chart-container").classed("invisible",true);
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
}

function show_charts(y){
    year=y||year;
    if (!state) return;
    threshold=0;

    update_state()
    update_year();
    d3.select("#chart-container").classed("invisible",false);
    d3.select("#map-container")       
     .transition()
     .duration(1000)
     .style("opacity", "0.3");

    var maxMigr = d3.max(emigrInYear, function (d) {return d.migrant_number;})

    range= d3.select("#barInput");
    
    range
      .attr("min", 0)
      .attr("max", d3.max(emigrInYear, function (d) {return d.migrant_number;}))
      .attr("list", "tickmarks")

    d3.select("#tickmarks").remove();

    d3.select("#range").insert('datalist', 'p')
      .attr("id", "tickmarks");

    part=maxMigr/10;
    for (var i = 0; i < 21; i++) {
      d3.select("#tickmarks").append("option")
      .attr("value", (part*i));
    }

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

            if (!(areaNotConsidered.includes(d.MajorArea)) && d.MajorArea!="" && d[state]>threshold) {
                somma+=d[state];
                if (d[state]!=0) count+=1;
            }

        });

        media=somma/count;

        var statesInMedia=[];

        allMigrantStock.forEach(function (d) {

            if(d[state]>=(media) && !(statesInMedia.includes(d.MajorArea)) && !(areaNotConsidered.includes(d.MajorArea))){
                statesInMedia.push(d.MajorArea);
              }
        });

        allMigrantStock.forEach(function (d) {

            if(d.MajorArea=="WORLD"){
                totalEmigrInYear.push({ migrant_number: d[state], migrant_year: d.Year})
            }

            if(statesInMedia.includes(d.MajorArea)){

                emigrInState.push({migrant_number: d[state], migrant_area: d.MajorArea, migrant_year: d.Year});

            }
        });
    ageMigrantStock.forEach(function(d){
    
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
            })
        .on("mouseout",function(){
              d3.select(this).classed("lineHover", false);
              d3.select("#country-line")
              .text(null);
              d3.select(getId(chosenState, "bar"))
              .classed("lineHover", false);
            })
        .on("click",function(){
              chosen_states.splice(chosen_states.indexOf(chosenState), 1 )
              d3.select(this)
                .remove();
            })
        .attr('id', newId(chosenState,"line"))
        .attr("d", xLineGenerator(emigrFromState));
    }

}
function createLineChart(){
    var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();
    var yLinepad=30;
    var xLinepad_right=60;
    var xLinepad_left=20;
    d3.selectAll(".line").remove();

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
           //
           // var xLineScale = d3.scaleTime()
           //     .domain([d3.min(totalEmigrInYear, function (d) {
           //         return new Date(d.migrant_year,0,1,0);
           //     }), d3.max(totalEmigrInYear, function (d) {
           //         return new Date(d.migrant_year,0,1,0);
           //     })])
           //     .range([xLinepad,svgLineBounds.width-xLinepad]);
           //
           // var yLineScale = d3.scaleLinear()
           //     .domain([0, d3.max(totalEmigrInYear, function (d) {
           //         return d.migrant_number;
           //     })])
           //     .range([svgLineBounds.height-yLinepad, yLinepad]);
           //
           // xLineGenerator = d3.line()
           //     .x(function (d) {
           //         return (xLineScale(new Date(d.migrant_year,0,1,0)));
           //     })
           //     .y(function (d) {
           //         return (yLineScale(d.migrant_number));
           //     });
}
function createPieChart(){

    var svgPieBounds = d3.select("#pieChart").node().getBoundingClientRect();

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
    .text(function(d, i) { if (i==0 ) return "female"; else return "male" });
}

//SCELTA E MODIFICA PARAMETRI
function loadData(){
  var q = d3.queue();
      q.defer(d3.csv,"data/UN_MigrantStockByOriginAndDestination_2017.csv");
      q.defer(d3.csv,"data/MajorArea.csv");
      q.defer(d3.csv,"data/paesi.csv");
      q.defer(d3.json,"data/world.json")
      q.defer(d3.csv,"data/DEstinatioOrigin-1.csv");
      q.defer(d3.csv,"data/CountryCodeName.csv")
      q.defer(d3.csv,"data/continents_area.csv");
      q.defer(d3.csv,"data/UN_MigrantStockByAge_2017.csv");
      q.defer(d3.csv,"data/gender_percentage.csv");
      q.await(function(error,file1,file2,file3,file4, file5, file6, file7, file8, file9) {
        if (error){
            console.log(error);
            throw error;
        }
        else {

          emigrates=file1;
          immigrates=file5;
          allMigrantStock=file1;
          file2.forEach(function(d){
            areaNotConsidered.push(d.MajorArea)
          })
          paesi=file3;
          codeName=file6;
          continents_area=file7;
          drawMap(file4);

          ageMigrantStock=file8;
          gender_percentage=file9;

          ageMigrantStock.forEach(function (d) {

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

          d3.selectAll(".dropdown-menu").selectAll("li")
          .attr("class", "dropdown-submenu");
      
          continents_area.forEach(function(d){
            
            a="#"+(d.area).replace(" ","-");
            var region = d3.select(a);

            region.append("a")
              .attr("href", "#")
              .attr("tabindex", "-1")
              .attr("class", "major-area")
              .text(d.area);

            var part=region.append("ul").attr("class", "dropdown-menu");

            paesi.forEach(function(f){

              if (f.Area==d.area){

                nation=(f.State).replace(" ","-");

                part.append("li")
                .attr("id", nation)
                .attr("class", "dropdown-submenu")
                .append("a")
                .attr("href", "#")
                .attr("tabindex", "-1")
                .text(f.State)
                .on("click", function(){
                  state=f.State; show_charts();
                })
                }
              })
            })
    
    $(document).ready(function(){
        $('.dropdown-submenu a.major-area').on("click", function(e){
          $(this).next('ul').toggle();
          e.stopPropagation();
          e.preventDefault();
        });
      });

    d3.select("#barInput").on("input", function(){
      threshold = $("#barInput").val();
      console.log(threshold +"  c  "+ media)
      update_state()
      update_year();
      create_charts();
   });

  }}
  )
}