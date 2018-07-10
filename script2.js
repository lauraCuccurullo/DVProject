var migrantForeachState;
var codeName;
var selectedYear="1995";
var areaNotConsidered;
var emigrInState=[];
var lastSelectedData=[];
var allSelectedData=[];
var years = ["1990", "1995", "2000", "2005", "2010", "2015", "2017"];
var chosen_states=[];
var yLineScale;
var xLineGenerator;
var paesi;
var expanded_continents=[];

function getId(d){
    id="#line-"+d;
    return(id.replace(/ /g, "-"));
}
function newId(d){
    return(getId(d).replace(/#/g, ""));
}


function select_state(state){
   migrantForeachState.forEach(function(d){
    if (d.MajorArea==state){
      for(i=0; i<7; i++){
      lastSelectedData.push({migrant_year: +years[i] , migrant_percentage: +d[years[i]] });
      allSelectedData.push({migrant_Area: state, migrant_year: +years[i] , migrant_percentage: +d[years[i]] });
      }
    }
   })
}

function drawMap(world) {

    var colorScale= d3.scaleLinear()
        .domain([d3.min(migrantForeachState, function (d) {
                return d[selectedYear];
            }), d3.max(migrantForeachState, function (d) {
                if (!(areaNotConsidered.includes(d.MajorArea))) return d[selectedYear];
        })])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb('#0aaaff'),d3.rgb("#000040")]);

    projection = d3.geoEquirectangular();

    var map = d3.select("#map").data(migrantForeachState),
    path = d3.geoPath().projection(projection),
    g = map.append("g");

    g.append("path")
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
        .style('fill', setColor)
        .on("mouseover", function(d,i){
                d3.select(this).style("fill", "#ffa07a")})
        .on("mouseout", function(){
                d3.select(this).style('fill', setColor)})
        .on("click", function(d){
          codeName.forEach(function (f){
            if (d.id == f.CountryCode) {
              lastSelectedData=[];
              select_state(f.CountryName);
              return new_line(f.CountryName);}
          })
        });

    function setColor(d){

        var nameCountry;
        var result;

        codeName.forEach(function (f){
            if (f.CountryCode==d.id) nameCountry=f.CountryName;
        })

        migrantForeachState.forEach(function (f){
            if (f.MajorArea==nameCountry) result=f[selectedYear];
        })

        return colorScale(result);
    }
}

//---LINE Chart

function new_line(state){

  if(!chosen_states.includes(state)){
        chosen_states.push(state)
        
        createLineChart(state);
    }
}

function createLineChart(state){
    var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();
    var yLinepad=30;
    var xLinepad_right=60;
    var xLinepad_left=20;
    //d3.selectAll(".line").remove();

    var xLineScale = d3.scalePoint()
        .domain(years)
        .range([xLinepad_right,svgLineBounds.width-xLinepad_left]);

    yLineScale = d3.scaleLinear()
        .domain([0, (d3.max(allSelectedData, function(d){ return d.migrant_percentage}))])
        .range([svgLineBounds.height-yLinepad, yLinepad]);

    xLineGenerator = d3.line()
        .x(function (d) {
            return (xLineScale(d.migrant_year));
        })
        .y(function (d) {
            return (yLineScale(d.migrant_percentage));
     })

    var xLineAxis = d3.select("#xLineAxis")
        .call(d3.axisBottom()
            .scale(xLineScale))
        .attr("transform", "translate (0, " + (svgLineBounds.height-yLinepad) +")")
        .selectAll("text")
        .attr("cursor","pointer")
        .on("click",function(d){year=d;});

    var yLineAxis = d3.select("#yLineAxis").call(d3.axisLeft().scale(yLineScale))
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
    chosen_states.forEach(function(s){
        tempData=[];
        allSelectedData.filter(function(d){
            if(s==d.migrant_Area)
                  tempData.push(d);
        });

        d3.select(getId(s))
        .attr("d", xLineGenerator(tempData));

    })

    d3.select("#lines")
        .append("path")
        .attr("class", "line")
        .attr('id', newId(state))
        .attr("d", xLineGenerator(lastSelectedData))
        .on("mouseover",function(){
              d3.select("#country-line")
              .text(state);
            })
        .on("mouseout",function(){
              d3.select("#country-line")
              .text(null);
            })
        .on("click",function(){
              chosen_states.splice(chosen_states.indexOf(state), 1 )

              allSelectedData = allSelectedData.filter(function(d){
                return d.migrant_Area!=state;
              })

              lastSelectedData=[];

              createLineChart()

              d3.select(this)
                .remove();
            });
}


function createIndex(){
    continent_array = d3.map(paesi, function(d){return d.Area}).keys()
    for(i=0;i<continent_array.length;i++)
        expanded_continents[continent_array[i]]=false;
    var continenti = d3.select("#index2")
        .selectAll(".areas2")
        .data(continent_array);

    continenti.enter()
        .append("span")
        .classed("areas2",true)
        .each(function(d){
          d3.select(this)
            .attr("id","index-"+d)
            .append("span")
            .classed("area-name2",true)
            .text(function(d) { return d;})
            .attr("text-anchor", "middle")
            .on("click", function(){
                d3.select("#index2").selectAll(".areas2")
                  .filter(function(d){ if(d!==this.parentNode) return d;})
                  .selectAll(".state-name2")
                  .classed("invisible",true);
                states=d3.select(this.parentNode)
                  .selectAll(".state-name2");
                states.classed("invisible", !states.classed("invisible"));
            });
          d3.select(this)
            .selectAll(".states2")
            .data(paesi.filter(function (p) { return (p.Area==d);}))
            .enter().append("div")
            .classed("state-name2",true)
            .classed("invisible",true)
            .text(function(d) {return d.State})
            .on("click", function (d) {state=d.State; show_charts();});
          }
        )
}







function loadMap(){
  d3.json("data/world.json", function (error, world) {
      if (error) {
          console.log(error);
          throw error;
      }
      drawMap(world);
  });
}

function loadDataMap(){
  var q = d3.queue();
      q.defer(d3.csv,"data/UN_MigrantStockTotal_2017.csv");
      q.defer(d3.csv,"data/MajorArea.csv");
      q.defer(d3.csv,"data/CountryCodeName.csv");
      q.defer(d3.csv,"data/paesi.csv");
      q.await(function(error,file1,file2,file3, file4) {
        if (error){
            console.log(error);
            throw error;
        }
        else {
          loadMap();
          migrantForeachState=file1;
          areaNotConsidered=file2
          codeName=file3;
          paesi=file4;
          createIndex();
//          select_state("Italy");
//          createLineChart();
        }

      });
  }
