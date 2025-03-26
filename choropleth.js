(function() {
    const width = 960;
    const height = 600;
  
    const svg = d3.select("#map");
    const projection = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);
  
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    Promise.all([
      d3.json("us-states.json"),
      d3.csv("data.csv")
    ]).then(([geoData, deathData]) => {
      deathData = deathData.filter(d => d.State !== "United States");
      deathData.forEach(d => {
        d.Deaths = +d.Deaths;
        d.State = d.State.trim().toLowerCase();
      });
  
      const years = [...new Set(deathData.map(d => d.Year))].sort();
      const causes = [...new Set(deathData.map(d => d["Cause Name"]))].sort();
  
      const yearSelect = d3.select("#yearSelect");
      yearSelect.selectAll("option").data(years).enter().append("option").text(d => d);
  
      const causeSelect = d3.select("#causeSelect");
      causeSelect.selectAll("option").data(causes).enter().append("option").text(d => d);
  
      function updateMap(year, cause) {
        const filtered = deathData.filter(d => +d.Year === +year && d["Cause Name"] === cause);
        const dataMap = {};
        filtered.forEach(d => {
          dataMap[d.State] = d.Deaths;
        });
  
        const maxDeaths = d3.max(filtered, d => d.Deaths);
        const color = d3.scaleQuantize().domain([0, maxDeaths]).range(d3.schemeReds[7]);
  
        svg.selectAll("path").remove();
  
        svg.selectAll("path")
          .data(geoData.features.filter(d => d.properties.name !== "Puerto Rico"))
          .enter().append("path")
          .attr("d", path)
          .attr("fill", d => {
            const state = d.properties.name.toLowerCase();
            return dataMap[state] ? color(dataMap[state]) : "#eee";
          })
          .attr("stroke", "#fff")
          .on("mouseover", function (event, d) {
            const state = d.properties.name;
            const deaths = dataMap[state.toLowerCase()] || "No data";
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`<strong>${state}</strong><br>${cause}<br><strong>Deaths:</strong> ${deaths.toLocaleString()}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", () => tooltip.transition().duration(300).style("opacity", 0));
  
        d3.select("#choropleth-title").text(`${cause} Deaths in ${year}`);
      }
  
      const initialYear = yearSelect.property("value") || years[0];
      const initialCause = causeSelect.property("value") || causes[0];
      updateMap(initialYear, initialCause);
  
      yearSelect.on("change", () => updateMap(yearSelect.property("value"), causeSelect.property("value")));
      causeSelect.on("change", () => updateMap(yearSelect.property("value"), causeSelect.property("value")));
    });
  })();
  