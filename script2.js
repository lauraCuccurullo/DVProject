var migrantForeachState;
var codeName;
var selectedYear="1995";
var areaNotConsidered;






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
        }

      });
  }
