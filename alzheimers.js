// alzheimers.js (Simplified Static Node-Link Diagram with abbreviated states)
d3.csv("data.csv").then(function(data) {
    const exactCauseName = "Alzheimer's disease";

    const stateAbbreviations = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'District of Columbia': 'DC', 'Florida': 'FL',
        'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN',
        'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME',
        'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
        'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH',
        'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND',
        'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI',
        'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
        'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI',
        'Wyoming': 'WY', 'United States': 'US'
    };

    const years = Array.from(new Set(data.map(d => d.Year))).sort();

    // Populate year dropdown
    const yearDropdown = d3.select("#yearDropdown");
    years.forEach(year => {
        yearDropdown.append("option")
            .attr("value", year)
            .text(year);
    });

    function updateGraph(year) {
        const filteredData = data.filter(d => d["Cause Name"] === exactCauseName && d.Year === year);

        const nodes = filteredData.map(d => ({ id: stateAbbreviations[d.State], deaths: +d.Deaths }));
        nodes.sort((a, b) => b.deaths - a.deaths);

        const links = nodes.slice(1).map(node => ({ source: nodes[0].id, target: node.id }));

        d3.select("#network-container").html("");

        const width = 1100, height = 700;
        const svg = d3.select("#network-container")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(250))
            .force("charge", d3.forceManyBody().strength(-800))
            .force("collision", d3.forceCollide().radius(d => 20 + d.deaths / 1500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .stop();

        for (let i = 0; i < 400; ++i) simulation.tick();

        const link = svg.selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke", "#aaa")
            .attr("stroke-width", 2)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        const node = svg.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", d => 5 + d.deaths / 1500)
            .attr("fill", "#69b3a2")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        const labels = svg.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .text(d => `${d.id}: ${d.deaths}`)
            .attr("x", d => d.x + 12)
            .attr("y", d => d.y + 4)
            .style("font-size", "12px");
    }

    // Initial render
    updateGraph(years[0]);

    // Event listener
    yearDropdown.on("change", function() {
        updateGraph(this.value);
    });
});