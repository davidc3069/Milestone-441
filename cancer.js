// cancer.js (Heatmap excluding "United States")
d3.csv("data.csv").then(function(data) {
    const causeName = "Cancer";

    const states = Array.from(new Set(data.map(d => d.State)))
                        .filter(state => state !== "United States")
                        .sort();

    const years = Array.from(new Set(data.map(d => +d.Year)))
                        .sort((a, b) => a - b);

    const filteredData = data.filter(d => d["Cause Name"] === causeName && d.State !== "United States");

    const heatmapData = filteredData.map(d => ({
        state: d.State,
        year: +d.Year,
        deaths: +d.Deaths
    }));

    const margin = { top: 50, right: 30, bottom: 100, left: 120 },
          width = 1200 - margin.left - margin.right,
          height = 800 - margin.top - margin.bottom;

    const svg = d3.select("#heatmap-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(years)
        .padding(0.05);

    const yScale = d3.scaleBand()
        .range([height, 0])
        .domain(states)
        .padding(0.05);

    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateReds)
        .domain([0, d3.max(heatmapData, d => d.deaths)]);

    svg.selectAll("rect")
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.state))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d.deaths));

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(yScale).tickSize(0))
        .selectAll("text")
        .style("text-anchor", "end");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Cancer Mortality Heatmap (Deaths by State & Year)");
});
