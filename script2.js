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
var continents_area;
var countries;
var w;

function getId(d){
    id="#line-"+d;
    return(id.replace(/ /g, "-"));
}
function newId(d){
    return(getId(d).replace(/#/g, ""));
}

function change_year(y){
  selectedYear=y;
  color_change();
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

function setColor(d){
  console.log(d)

  var colorScale= d3.scaleLinear()
    .domain([d3.min(migrantForeachState, function (d) {
            return d[selectedYear];
        }), d3.max(migrantForeachState, function (d) {
            if (!(areaNotConsidered.includes(d.MajorArea))) return d[selectedYear];
    })])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb('#8bd3f9'),d3.rgb("#28288c")]);

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

function color_change(){
  countries.forEach(function(d){
    id="#"+d.id
    codeName.forEach(function(f){
      if (d.id==f.CountryCode){
        if(!chosen_states.includes(f.CountryName) && id!="#-99") d3.select(id).style("fill", setColor(d));
      }
    })
  })
}

function drawMap() {

    projection = d3.geoEquirectangular();

    var map = d3.select("#map").data(migrantForeachState),
    path = d3.geoPath().projection(projection),
    g = map.append("g");

    countries = topojson.feature(w, w.objects.countries).features

    g.selectAll("path")
        .data(countries)
        .enter().insert("path", ".graticule")
        .attr("class", 'countries')
        .attr("id", function(d){return d.id})
        .attr("d", path)
        .style('fill', setColor)
        .on("mouseover", function(d,i){
                d3.select(this).style("fill", "#ffa07a")})
        .on("mouseout", function(d){
          elem=d3.select(this)
          codeName.forEach(function (f){
            if (d.id == f.CountryCode) {
              if(!chosen_states.includes(f.CountryName)) elem.style('fill', setColor(d));
              else elem.style('fill', "#FFFF35");
            }
          })
        })                
        .on("click", function(d){

          var temp=[];
          elem=d3.select(this) 

          codeName.forEach(function (f){
            if (d.id == f.CountryCode) {

              if(chosen_states.includes(f.CountryName)) {
                elem.style('fill', setColor(d));
                chosen_states.splice(chosen_states.indexOf(f.CountryName), 1 )  
                allSelectedData.forEach(function(d){
                  if(d.migrant_Area!=f.CountryName) temp.push(d);
                })             
               allSelectedData=temp;
               d3.select(getId(f.CountryName)).remove();
              }
              else{ 
                elem.style('fill', "#FFFF35");
                lastSelectedData=[];
                select_state(f.CountryName);
                return new_line(f.CountryName);}
            }
          })
        });
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
        .on("click",function(d){year=d;})
        .transition()
        .duration(750)
        .attr("transform", "translate (0, " + (svgLineBounds.height-yLinepad) +")")
        .selectAll("text")
        .attr("cursor","pointer");

    var yLineAxis = d3.select("#yLineAxis").call(d3.axisLeft().scale(yLineScale))
        .transition()
        .duration(750)
        .attr("transform", "translate (" + (xLinepad_right) +", 0)");

    d3.select("#xLineAxis").append("g")
        .classed("grat",true)
        .transition()
        .duration(750)
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
        .on("mouseover",function(){

              var coordinates = [0, 0];
              coordinates = d3.mouse(this);
              console.log(coordinates)
              var x = coordinates[0];
              var y = coordinates[1];

              var xPosition = d3.event.pageX - svgLineBounds.x + 10
              var yPosition = d3.event.pageY - svgLineBounds.y + 10

              d3.select("#line-charts").insert("span", "svg")
               .attr("id", "tooltip")
               .style("left", xPosition+'px')
               .style("top", yPosition+'px')
               .text(state);
            })
        .on("mouseout",function(){
              d3.select("#tooltip").remove();
            })
        .on("click",function(){
              chosen_states.splice(chosen_states.indexOf(state), 1 )

              allSelectedData = allSelectedData.filter(function(d){
                return d.migrant_Area!=state;
              })

              lastSelectedData=[];

              createLineChart()

              codeName.forEach(function(f){
                if (state==f.CountryName){
                  a={id:f.CountryCode};
                  d3.select("#"+f.CountryCode).style("fill", setColor(a));
                }
              })

              d3.select(this)
                .remove();

              d3.select("#tooltip").remove();

              //colore della mappa
            }) 
        .attr("class", "line")
        .attr('id', newId(state))
        .attr("d", xLineGenerator(lastSelectedData))
}

function loadMap(){
  d3.json("data/world.json", function (error, world) {
      if (error) {
          console.log(error);
          throw error;
      }
      w=world;
      drawMap();
  });
}

function loadDataMap(){
  var q = d3.queue();
      q.defer(d3.csv,"data/UN_MigrantStockTotal_2017.csv");
      q.defer(d3.csv,"data/MajorArea.csv");
      q.defer(d3.csv,"data/CountryCodeName.csv");
      q.defer(d3.csv,"data/paesi.csv");
      q.defer(d3.csv,"data/continents_area.csv");
      q.await(function(error,file1,file2,file3, file4, file5) {
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
          continents_area=file5;

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

            state=(f.State).replace(" ","-");

            part.append("li")
            .attr("id", state)
            .attr("class", "dropdown-submenu")
            .append("a")
            .attr("href", "#")
            .attr("tabindex", "-1")
            .text(f.State)
            .on("click", function(){

              lastSelectedData=[];
              select_state(f.State);
              return new_line(f.State);
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
   }

      });

      //CODICE NAV BAR

      
  }
