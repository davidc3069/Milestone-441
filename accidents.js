(function () {
    const svg = d3.select("#accidents-chart"),
      margin = { top: 50, right: 160, bottom: 50, left: 60 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;
  
    const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
    d3.csv("data.csv").then(data => {
      const filtered = data.filter(d => d["Cause Name"] === "Unintentional injuries" && d.State !== "United States");
  
      filtered.forEach(d => {
        d.Year = +d.Year;
        d.Deaths = +d.Deaths;
      });
  
      const totalByState = d3.rollup(filtered, v => d3.sum(v, d => d.Deaths), d => d.State);
      const topStates = Array.from(totalByState.entries())
        .sort((a, b) => d3.descending(a[1], b[1]))
        .slice(0, 20)
        .map(d => d[0]);
  
      const topData = filtered.filter(d => topStates.includes(d.State));
  
      const x = d3.scaleLinear()
        .domain(d3.extent(topData, d => d.Year))
        .range([0, width]);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(topData, d => d.Deaths)]).nice()
        .range([height, 0]);
  
      const color = d3.scaleOrdinal(d3.schemeTableau10).domain(topStates);
  
      chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  
      chart.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(",")));
  
      chart.selectAll("circle")
        .data(topData)
        .enter().append("circle")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Deaths))
        .attr("r", 4)
        .attr("fill", d => color(d.State))
        .attr("opacity", 0.8);
  
      svg.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Accidental Deaths by State and Year (Top 20)");
  
      // Clear any existing legend
      svg.selectAll(".legend").remove();
  
      // Add legend
      const legend = svg.selectAll(".legend")
        .data(topStates)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + margin.left + 20}, ${i * 20 + margin.top})`);
  
      legend.append("rect")
        .attr("x", 0)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", d => color(d));
  
      legend.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("dy", "0")
        .style("font-size", "12px")
        .text(d => d);
    });
  })();
  
  

  




  