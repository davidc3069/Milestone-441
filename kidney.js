(function () {
  d3.csv("data.csv").then(data => {
    data = data.filter(d => d["Cause Name"] === "Kidney disease" && d.State !== "United States");
    data.forEach(d => {
      d.Deaths = +d.Deaths;
      d["Age-adjusted Death Rate"] = +d["Age-adjusted Death Rate"];
      d.Year = +d.Year;
    });

    const years = [...new Set(data.map(d => d.Year))].sort((a, b) => a - b);
    const yearSlider = d3.select("#kidney-year");
    const yearLabel = d3.select("#kidney-year-value");
    const metricToggle = d3.select("#metricToggle");

    yearSlider
      .attr("min", years[0])
      .attr("max", years[years.length - 1])
      .attr("value", years[0]);

    yearLabel.text(years[0]);

    function updateChart(year, metric) {
      const selectedYear = +year;
      const yearData = data
        .filter(d => d.Year === selectedYear)
        .sort((a, b) => d3.descending(a[metric], b[metric]))
        .slice(0, 15);

      console.log("Year:", selectedYear, "Metric:", metric, "Data:", yearData);

      const svg = d3.select("#kidney-chart");
      svg.selectAll("*").remove();

      const margin = { top: 60, right: 30, bottom: 120, left: 100 };
      const width = +svg.attr("width") - margin.left - margin.right;
      const height = +svg.attr("height") - margin.top - margin.bottom;

      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
        .domain(yearData.map(d => d.State))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => d[metric])]).nice()
        .range([height, 0]);

      g.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(",")))
        .selectAll("text")
        .style("fill", "white");

      g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("fill", "white");

      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("z-index", "9999")
        .style("background", "#333")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0);

      g.selectAll(".bar")
        .data(yearData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.State))
        .attr("y", d => y(d[metric]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[metric]))
        .attr("fill", "#1f77b4")
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip.html(`<strong>${d.State}</strong><br>${metric}: ${d[metric].toLocaleString()}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(300).style("opacity", 0);
        });

      svg.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(`Top 15 States by Kidney Disease (${metric})`);

      svg.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", height + margin.top + 100)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text("State");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top - height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "14px")
        .text(metric === "Deaths" ? "Total Deaths" : "Rate per 100,000");
    }

    updateChart(years[0], metricToggle.property("value"));

    yearSlider.on("input", () => {
      const selectedYear = yearSlider.property("value");
      yearLabel.text(selectedYear);
      updateChart(selectedYear, metricToggle.property("value"));
    });

    metricToggle.on("change", () => {
      updateChart(yearSlider.property("value"), metricToggle.property("value"));
    });
  });
})();





  
  
  
  
  


