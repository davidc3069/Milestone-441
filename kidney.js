(function() {
  d3.csv("data.csv").then(data => {
    data = data.filter(d => d["Cause Name"] === "Kidney disease" && d.State !== "United States");
    data.forEach(d => {
      d.Deaths = +d.Deaths;
    });

    const years = [...new Set(data.map(d => d.Year))].sort();
    const yearSlider = d3.select("#kidney-year");
    const yearLabel = d3.select("#kidney-year-value");

    yearSlider
      .attr("min", years[0])
      .attr("max", years[years.length - 1])
      .attr("value", years[0]);

    yearLabel.text(years[0]);

    function updateChart(year) {
      const yearData = data
        .filter(d => d.Year === year)
        .sort((a, b) => d3.descending(a.Deaths, b.Deaths))
        .slice(0, 25);

      const svg = d3.select("#kidney-chart");
      svg.selectAll("*").remove();

      const margin = { top: 40, right: 30, bottom: 120, left: 80 };
      const width = +svg.attr("width") - margin.left - margin.right;
      const height = +svg.attr("height") - margin.top - margin.bottom;

      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
        .domain(yearData.map(d => d.State))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => d.Deaths)])
        .range([height, 0]);

      g.append("g").call(d3.axisLeft(y));

      g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      g.selectAll(".bar")
        .data(yearData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.State))
        .attr("y", d => y(d.Deaths))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.Deaths))
        .attr("fill", "#69b3a2");
    }

    updateChart(years[0]);

    yearSlider.on("input", () => {
      const selectedYear = yearSlider.property("value");
      yearLabel.text(selectedYear);
      updateChart(selectedYear);
    });
  });
})();

  
  
  
  
  


