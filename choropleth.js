(() => {
  console.log("🎯 choropleth.js injected");

  function renderChoropleth() {
    const mapEl = document.querySelector("#map");
    if (!mapEl) {
      console.warn("❌ #map not found during renderChoropleth");
      return;
    }

    const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("z-index", "9999") // Ensures tooltip appears on top
  .style("background", "#333")
  .style("color", "#fff")
  .style("padding", "8px 12px")
  .style("border-radius", "4px")
  .style("font-size", "13px")
  .style("pointer-events", "none")
  .style("opacity", 0);


    const svg = d3.select("#map");
    const width = 960, height = 600;

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`)
       .style("background", "radial-gradient(ellipse at center, #1c0033 0%, #000000 100%)");

    for (let i = 0; i < 300; i++) {
      svg.append("circle")
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

    function drawGlobe(geoData) {
      globeGroup.append("path")
        .datum({ type: "Sphere" })
        .attr("fill", "#1c1c3c")
        .attr("stroke", "#666")
        .attr("stroke-width", 0.7)
        .attr("d", path);

      globeGroup.selectAll(".country")
        .data(geoData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => d.properties.name === "United States" ? "#f8f8f8" : "#444")
        .attr("stroke", "#999");
    }

    function transitionToChoropleth() {
      globeGroup.transition().duration(1500).style("opacity", 0.4);
      const albers = d3.geoAlbersUsa().scale(1000).translate([width / 2, height / 2]);
      const newPath = d3.geoPath().projection(albers);

      Promise.all([
        d3.json("us-states.json"),
        d3.csv("data.csv")
      ]).then(([us, deathData]) => {
        deathData = deathData.filter(d => d.State !== "United States");
        deathData.forEach(d => {
          d.Deaths = +d.Deaths;
          d.State = d.State.trim().toLowerCase();
        });

        const years = [...new Set(deathData.map(d => d.Year))].sort();
        const causes = [...new Set(deathData.map(d => d["Cause Name"]))].sort();

        const yearSlider = d3.select("#choropleth-year");
        const yearValue = d3.select("#choropleth-year-value");
        const causeSelect = d3.select("#causeSelect");

        yearSlider.attr("min", years[0]).attr("max", years[years.length - 1]).attr("value", years[0]);
        yearValue.text(years[0]);

        causeSelect.selectAll("option")
          .data(causes)
          .join("option")
          .text(d => d)
          .attr("value", d => d);

        function updateMap(year, cause) {
          const filtered = deathData.filter(d => +d.Year === +year && d["Cause Name"] === cause);
          const dataMap = {};
          filtered.forEach(d => dataMap[d.State] = d.Deaths);

          const color = d3.scaleQuantize()
            .domain([0, d3.max(filtered, d => d.Deaths)])
            .range(d3.schemeReds[7]);

          svg.selectAll("path.state-map").remove();

          svg.selectAll("path.state-map")
            .data(us.features.filter(d => d.properties.name !== "Puerto Rico"))
            .enter().append("path")
            .attr("class", "state-map")
            .attr("d", newPath)
            .attr("fill", d => color(dataMap[d.properties.name.toLowerCase()] || 0))
            .attr("stroke", "#fff")
            .on("mouseover", function(event, d) {
              const state = d.properties.name;
              const key = state.trim().toLowerCase();
              const deaths = dataMap[key];

              tooltip.transition().duration(200).style("opacity", 0.9);
              tooltip.html(`<strong>${state}</strong><br>${cause}<br><strong>Deaths:</strong> ${deaths ? deaths.toLocaleString() : "No data"}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
              tooltip.transition().duration(300).style("opacity", 0);
            });
        }

        updateMap(years[0], causes[0]);

        yearSlider.on("input", function () {
          const year = yearSlider.property("value");
          yearValue.text(year);
          updateMap(year, causeSelect.property("value"));
        });

        causeSelect.on("change", function () {
          const year = yearSlider.property("value");
          updateMap(year, causeSelect.property("value"));
        });

        // ✅ Reveal the controls after transition
        d3.select("#choropleth-controls").classed("hidden", false);
      });
    }

    svg.on("click", () => {
      const interpRotate = d3.interpolate(projection.rotate(), [98, -38]);
      const interpScale = d3.interpolate(projection.scale(), 1000);

      d3.transition()
        .duration(2500)
        .tween("zoom", () => t => {
          projection.rotate(interpRotate(t)).scale(interpScale(t));
          globeGroup.selectAll("path").attr("d", path);
        })
        .on("end", transitionToChoropleth);
    });

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then(drawGlobe);

    console.log("✅ Choropleth rendered");
  }

  const tryRender = () => {
    if (document.querySelector("#map")) {
      renderChoropleth();
    } else {
      const obs = new MutationObserver((_, observer) => {
        if (document.querySelector("#map")) {
          observer.disconnect();
          renderChoropleth();
        }
      });
      obs.observe(document.getElementById("view-container"), { childList: true, subtree: true });
    }
  };

  tryRender();
})();
