(function() {
    d3.csv("data.csv").then(data => {
      data = data.filter(d => d["Cause Name"] === "Kidney disease" && d.State !== "United States");
      data.forEach(d => {
        d.Deaths = +d.Deaths;
      });
  
      const years = [...new Set(data.map(d => d.Year))].sort();
      const yearSelect = d3.select("#kidney-year");
  
      yearSelect.selectAll("option").data(years).enter().append("option").text(d => d);
  
      function updateChart(year) {
        const yearData = data
          .filter(d => d.Year === year)
          .sort((a, b) => d3.descending(a.Deaths, b.Deaths))
          .slice(0, 25); // Top 25 states
  
        const svg = d3.select("#kidney-chart");
        svg.selectAll("*").remove();
  
        const margin = { top: 40, right: 30, bottom: 120, left: 80 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;
  
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
        const x = d3.scaleBand()
          .domain(yearData.map(d => d.State))
          .range([0, width])
          .padding(0.2);
  
        const y = d3.scaleLinear()
          .domain([0, d3.max(yearData, d => d.Deaths)])
          .nice()
          .range([height, 0]);
  
        g.append("g").call(d3.axisLeft(y));
  
        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "rotate(-60)")
          .style("text-anchor", "end");
  
        g.selectAll(".bar")
          .data(yearData)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d.State))
          .attr("y", d => y(d.Deaths))
          .attr("width", x.bandwidth())
          .attr("height", d => height - y(d.Deaths))
          .attr("fill", "#3366cc");
      }
  
      const defaultYear = years[0];
      updateChart(defaultYear);
      yearSelect.on("change", () => updateChart(yearSelect.property("value")));
    });
  })();
  
  
  
  
  


