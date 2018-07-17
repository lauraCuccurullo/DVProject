var emigration_data;
var immigration_data;
var country_filter=[];
var country_area;
var country_codes;
var world;
var continent_area;
var age_percentage;
var gender_percentage;

function group_age(file){
  aux=[];
  file.forEach(function (d) {

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
    aux.push({MajorArea:d.MajorArea,Year:d.Year,sectionOne:d.sectionOne,sectionTwo:d.sectionTwo,sectionThree:d.sectionThree,sectionFour:d.sectionFour});

  })
  return aux;
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
            })

      });
  d3.selectAll(".area")
      .each(function(){


      })
      .data(country_area)
}



function loadData(){
  var q = d3.queue();
      q.defer(d3.csv,"data/UN_MigrantStockByOriginAndDestination_2017.csv");
      q.defer(d3.csv,"data/MajorArea.csv");
      q.defer(d3.csv,"data/paesi.csv");
      q.defer(d3.json,"data/world.json")
      q.defer(d3.csv,"data/DEstinatioOrigin-1.csv");
      q.defer(d3.csv,"data/countryCodes.csv")
      q.defer(d3.csv,"data/continents_area.csv");
      q.defer(d3.csv,"data/UN_MigrantStockByAge_2017.csv");
      q.defer(d3.csv,"data/gender_percentage.csv");
      q.await(function(error,file1,file2,file3,file4, file5, file6, file7, file8, file9) {
        if (error){
            console.log(error);
            throw error;
        }
        else {

          emigrants=file1;
          immigrants=file5;
          file2.forEach(function(d){
            country_filter.push(d.MajorArea)
          })
          country_area=file3;
          country_codes=file6;
          continent_area=file7;
          // drawMap(file4);
          world=file4;
          age_percentage=group_age(file8);
          gender_percentage=file9;
          create_index();
   }
  });
}
