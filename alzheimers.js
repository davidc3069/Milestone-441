d3.csv("data.csv").then(data => {
  const causeName = "Alzheimer's disease";

  data = data.filter(d => d["Cause Name"] === causeName && d.State !== "United States");
  data.forEach(d => {
    d.Deaths = +d.Deaths;
    d.Year = +d.Year;
  });

  const years = [...new Set(data.map(d => d.Year))].sort((a, b) => a - b);

  const svg = d3.select("#alzheimers-chart")
    .attr("viewBox", `0 0 1200 850`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const width = 1200;
  const height = 850;

  const chart = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2 - 30})`);

  const color = d3.scaleSequential(d3.interpolateReds);
  const radiusScale = d3.scaleSqrt().range([12, 90]);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#333")
    .style("color", "#fff")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none");

  function drawLegend(colorScale, maxDeaths) {
    svg.selectAll(".legend, .legend-axis, defs").remove();

    const defs = svg.append("defs");
    const gradientId = "legend-gradient-alz";

    const linearGradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%").attr("x2", "100%")
      .attr("y1", "0%").attr("y2", "0%");

    const stops = d3.range(0, 1.01, 0.1).map(t => ({
      offset: `${t * 100}%`,
      color: colorScale(t * maxDeaths)
    }));

    linearGradient.selectAll("stop")
      .data(stops)
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    svg.append("rect")
      .attr("class", "legend")
      .attr("x", width / 2 - 150)
      .attr("y", height - 50)
      .attr("width", 300)
      .attr("height", 15)
      .style("fill", `url(#${gradientId})`);

    const legendScale = d3.scaleLinear()
      .domain([0, maxDeaths])
      .range([width / 2 - 150, width / 2 + 150]);

    const axis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".0s"));

    svg.append("g")
      .attr("class", "legend-axis")
      .attr("transform", `translate(0, ${height - 35})`)
      .call(axis)
      .selectAll("text")
      .style("fill", "white")
      .style("font-size", "12px");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 60)
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "14px")
      .style("font-family", "Inter")
      .text("Deaths Scale");
  }

  function update(year) {
    const yearData = data
      .filter(d => d.Year === +year)
      .sort((a, b) => d3.descending(a.Deaths, b.Deaths))
      .slice(0, 20); // Top 20 states

    const maxDeaths = d3.max(yearData, d => d.Deaths);
    color.domain([0, maxDeaths]);
    radiusScale.domain([0, maxDeaths]);

    const nodes = yearData.map(d => ({
      ...d,
      r: radiusScale(d.Deaths)
    }));

    chart.selectAll("*").remove();
    drawLegend(color, maxDeaths);

    const simulation = d3.forceSimulation(nodes)
      .force("x", d3.forceX(0).strength(0.1))
      .force("y", d3.forceY(0).strength(0.1))
      .force("collide", d3.forceCollide(d => d.r + 5))
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    chart.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("fill", d => color(d.Deaths))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.7)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`<strong>${d.State}</strong><br/>Year: ${d.Year}<br/>Deaths: ${d.Deaths.toLocaleString()}`)
          .style("left", `${event.pageX + 15}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => tooltip.transition().duration(300).style("opacity", 0));

    chart.selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 4)
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "11px")
      .style("pointer-events", "none")
      .text(d => d.State);

    svg.select(".vis-title").remove();
    svg.append("text")
      .attr("class", "vis-title")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-family", "'Playfair Display', serif")
      .style("fill", "white")
      .text(`Top 20 States by Alzheimer's Deaths`);
  }

  const slider = d3.select("#alz-year");
  const label = d3.select("#alz-year-value");

  slider
    .attr("min", years[0])
    .attr("max", years[years.length - 1])
    .attr("value", years[0]);

  label.text(years[0]);
  update(years[0]);

  slider.on("input", function () {
    const selected = +this.value;
    label.text(selected);
    update(selected);
  });
});
