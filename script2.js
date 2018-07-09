var migrantForeachState;
var codeName;
var selectedYear="1995";
var areaNotConsidered;
var state="Italy";
var emigrInState=[];
var inputData=[];
var years = ["1990", "1995", "2000", "2005", "2010", "2015", "2017"];
var chosen_states=[];

function select_state(){
   migrantForeachState.forEach(function(d){
    if (d.MajorArea==state){
      for(i=0; i<7; i++)
      inputData.push({migrant_year: +years[i] , migrant_percentage: +d[years[i]] })
    }
   })
}

function drawMap(world) {

    migrantForeachState.forEach(function (d){

        if (typeof(d[selectedYear])!='number'){
            d[selectedYear] = d[selectedYear];
        }
    });

// console.log([d3.min(migrantForeachState, function (d) {
//                 return d[selectedYear];
//             }), d3.max(migrantForeachState, function (d) {
//                 if (!(areaNotConsidered.includes(d.MajorArea))) return d[selectedYear];
//         })])

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
              state=f.CountryName; 
              select_state();
              return new_line();}
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

        // console.log(nameCountry +"  -  "+ result+"  -  "+ colorScale(result));

        return colorScale(result);
    }
}

//---LINE Chart

function new_line(){
  if(!chosen_states.includes(inputData.MajorArea)){
        chosen_states.push(inputData.MajorArea)

        d3.select("#lines")
        .append("path")
        .attr("class", "line")
        .attr('id', newId(inputData.MajorArea,"line"))
        .attr("d", xLineGenerator(inputData))
        .on("mouseover",function(){
              d3.select("#country-line")
              .text(inputData.MajorArea);
            })
        .on("mouseout",function(){
              d3.select("#country-line")
              .text(null);
            })
        .on("click",function(){
              chosen_states.splice(chosen_states.indexOf(inputData.MajorArea), 1 )
              d3.select(this)
                .remove();
            });
    }

}

function createLineChart(){
    var svgLineBounds = d3.select("#lineChart").node().getBoundingClientRect();
    var yLinepad=30;
    var xLinepad_right=60;
    var xLinepad_left=20;
    d3.selectAll(".line").remove();
    console.log(inputData);

    var xLineScale = d3.scalePoint()
        .domain(years)
        .range([xLinepad_right,svgLineBounds.width-xLinepad_left]);

    var yLineScale = d3.scaleLinear()
        .domain([0, (d3.max(d3.values(inputData))).migrant_percentage])
        .range([svgLineBounds.height-yLinepad, yLinepad]);

    xLineGenerator = d3.line()
        .x(function (d) {
            console.log("1 "+ xLineScale(d.migrant_year));
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
      q.await(function(error,file1,file2,file3) {
        if (error){
            console.log(error);
            throw error;
        }
        else {
          loadMap();
          migrantForeachState=file1;
          areaNotConsidered=file2
          codeName=file3;
          select_state();
          createLineChart();
        }

      });
  }
