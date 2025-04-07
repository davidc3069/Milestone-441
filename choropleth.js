(function () {
  const width = 960;
  const height = 600;

  const svg = d3.select("#map")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background", "radial-gradient(ellipse at center, #1c0033 0%, #000000 100%)");

  // Add stars
  for (let i = 0; i < 300; i++) {
    svg.append("circle")
      .attr("class", "star")
      .attr("cx", Math.random() * width)
      .attr("cy", Math.random() * height)
      .attr("r", Math.random() * 1.5)
      .attr("fill", "white")
      .attr("opacity", Math.random());
  }

  const globeGroup = svg.append("g");
  const projection = d3.geoOrthographic()
    .scale(280)
    .translate([width / 2, height / 2])
    .clipAngle(90);

  const path = d3.geoPath().projection(projection);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  let rotate = [98, -38];
  projection.rotate(rotate);
  let zoomedIn = false;

  function drawGlobe(geoData) {
    globeGroup.append("path")
      .datum({ type: "Sphere" })
      .attr("class", "sphere")
      .attr("fill", "#1c1c3c")
      .attr("stroke", "#666")
      .attr("stroke-width", 0.7)
      .attr("d", path);

    globeGroup.selectAll(".country")
      .data(geoData.features)
      .join("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", d => d.properties.name === "United States" ? "#f8f8f8" : "#444")
      .attr("stroke", "#999");
  }

  const drag = d3.drag()
    .on("drag", (event) => {
      rotate[0] += event.dx * 0.5;
      rotate[1] -= event.dy * 0.5;
      projection.rotate(rotate);
      globeGroup.selectAll("path").attr("d", path);
    });

  svg.call(drag);

  function transitionToChoropleth() {
    // Instead of removing globeGroup, fade it out but keep as background
    globeGroup.transition()
      .duration(1500)
      .style("opacity", 0.4);

    const albers = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
    const newPath = d3.geoPath().projection(albers);

    d3.json("us-states.json").then(us => {
      d3.csv("data.csv").then(deathData => {
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

          svg.selectAll("path.state-map").remove();

          svg.selectAll("path.state-map")
            .data(us.features.filter(d => d.properties.name !== "Puerto Rico"))
            .enter().append("path")
            .attr("class", "state-map")
            .attr("d", newPath)
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
    });
  }

  svg.on("click", () => {
    if (zoomedIn) return;
    zoomedIn = true;

    svg.on("click", null);
    svg.on("mousedown.drag", null);

    const targetRotate = [98, -38];
    const interpRotate = d3.interpolate(projection.rotate(), targetRotate);
    const interpScale = d3.interpolate(projection.scale(), 1000);

    d3.transition()
      .duration(2500)
      .tween("zoomToUS", () => t => {
        projection.rotate(interpRotate(t)).scale(interpScale(t));
        globeGroup.selectAll("path").attr("d", path);
        globeGroup.select(".sphere").attr("d", path);
      })
      .on("end", () => {
        projection.rotate(targetRotate);
        transitionToChoropleth();
      });
  });

  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .then(world => drawGlobe(world));
})();



