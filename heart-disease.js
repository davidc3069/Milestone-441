d3.csv("data.csv").then(function(data) {
    const exactCauseName = "Heart disease";

    // Populate dropdown
    const statesDropdown = d3.select("#stateDropdown");
    const states = ["All"].concat(Array.from(new Set(data.map(d => d.State))).sort());

    states.forEach(state => {
        statesDropdown.append("option")
            .attr("value", state)
            .text(state);
    });

    function updateChart(selectedState) {
        let filteredData = data.filter(d => d["Cause Name"] === exactCauseName);

        if (selectedState !== "All") {
            filteredData = filteredData.filter(d => d.State === selectedState);
        } else {
            // Aggregate data by Year
            let aggregated = {};
            filteredData.forEach(d => {
                if (!aggregated[d.Year]) {
                    aggregated[d.Year] = { Year: +d.Year, Deaths: 0 };
                }
                aggregated[d.Year].Deaths += +d.Deaths;
            });
            filteredData = Object.values(aggregated);
        }

        filteredData.forEach(d => {
            d.Year = +d.Year;
            d.Deaths = +d.Deaths;
        });

        filteredData.sort((a, b) => d3.ascending(a.Year, b.Year));

        d3.select("#line-chart-container").html("");

        const width = 900, height = 500, margin = { top: 50, right: 30, bottom: 50, left: 60 };

        const svg = d3.select("#line-chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.Year))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.Deaths)])
            .range([height, 0]);

        const line = d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d.Deaths))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "#d73027")
            .attr("stroke-width", 2.5)
            .attr("d", line);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

        svg.append("g")
            .call(d3.axisLeft(yScale));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .text(`Heart Disease Mortality Over Time (${selectedState})`);
    }

    // Initial chart render
    updateChart("All");

    // Dropdown event listener
    d3.select("#stateDropdown").on("change", function() {
        d3.select("#line-chart-container").selectAll("*").remove();
        updateChart(this.value);
    });
});
