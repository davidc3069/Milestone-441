(function () {
  const svg = d3.select("#accidents-chart"),
    margin = { top: 60, right: 180, bottom: 80, left: 70 },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

  const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  d3.csv("data.csv").then(data => {
    const filtered = data.filter(d =>
      d["Cause Name"] === "Unintentional injuries" &&
      d.State !== "United States"
    );

    filtered.forEach(d => {
      d.Year = +d.Year;
      d.Rate = +d["Age-adjusted Death Rate"];
    });

    const avgRateByState = d3.rollup(
      filtered,
      v => d3.mean(v, d => d.Rate),
      d => d.State
    );

    const topStates = Array.from(avgRateByState.entries())
      .sort((a, b) => d3.descending(a[1], b[1]))
      .slice(0, 10)
      .map(d => d[0]);

    const topData = filtered.filter(d => topStates.includes(d.State));

    const x = d3.scaleLinear()
      .domain(d3.extent(topData, d => d.Year))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(topData, d => d.Rate)]).nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(topStates);

    // X Axis
    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .selectAll("text")
      .style("fill", "white");

    // Y Axis
    chart.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".1f")))
      .selectAll("text")
      .style("fill", "white");

    // X Axis Label
    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", height + margin.top + 45)
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "14px")
      .text("Year");

    // Y Axis Label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -margin.top - height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "14px")
      .text("Age-adjusted Death Rate (per 100,000)");

    // Chart Title
    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("Top 10 States by Age-Adjusted Accidental Death Rate");

    // Clarifying Footnote
    svg.append("text")
      .attr("x", margin.left + width / 2)
      .attr("y", height + margin.top + 70)
      .attr("text-anchor", "middle")
      .style("fill", "#aaa")
      .style("font-size", "12px")
      .text("Note: Y-axis shows age-adjusted deaths per 100,000 people.");

    // Plot Dots (with jitter, stroke, opacity)
    chart.selectAll("circle")
      .data(topData)
      .enter().append("circle")
      .attr("cx", d => x(d.Year))
      .attr("cy", d => y(d.Rate) + (Math.random() * 4 - 2)) // slight vertical jitter
      .attr("r", 8)
      .attr("fill", d => color(d.State))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.8)
      .attr("opacity", 0.7);

    // Legend
    const legend = svg.selectAll(".legend")
      .data(topStates)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) =>
        `translate(${width + margin.left + 20}, ${i * 20 + margin.top})`
      );

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 14)
      .attr("height", 14)
      .style("fill", d => color(d));

    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "13px")
      .style("fill", "white")
      .text(d => d);
  });
})();


  
  

  




  