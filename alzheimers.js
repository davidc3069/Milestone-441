d3.csv("data.csv").then(function (data) {
  const exactCauseName = "Alzheimer's disease";

  const alzPoemLines = [
    "She stares past the photo, past the wall.",
    "The names drift like leaves—",
    "familiar, then forgotten.",
    "A whisper echoes: daughter, husband, sister...",
    "She smiles at a stranger wearing her son's face.",
    "Time slides off her like water on glass.",
    "The past is a fog. The future, a blank page.",
    "What remains is the now—",
    "fleeting, fragile, fading."
  ];

  const poemEl = d3.select(".poem-box-alzheimers em");
  poemEl.html("");

  let line = 0;
  let char = 0;

  function typePoem() {
    if (line >= alzPoemLines.length) return;

    const current = alzPoemLines[line];
    if (char < current.length) {
      poemEl.html(poemEl.html() + current.charAt(char));
      char++;
      setTimeout(typePoem, 30);
    } else {
      poemEl.html(poemEl.html() + "<br>");
      line++;
      char = 0;
      setTimeout(typePoem, 300);
    }
  }

  typePoem();

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

  const slider = d3.select("#alz-year");
  slider.attr("min", years[0]).attr("max", years[years.length - 1]).attr("value", years[0]);

  const label = d3.select("#alz-year-value");
  label.text(years[0]);

  function updateGraph(year) {
    const filteredData = data.filter(d => d["Cause Name"] === exactCauseName && d.Year === year);
    const nodes = filteredData.map(d => ({
      id: stateAbbreviations[d.State],
      deaths: +d.Deaths
    }));

    nodes.sort((a, b) => b.deaths - a.deaths);

    const links = nodes.slice(1).map(node => ({
      source: nodes[0].id,
      target: node.id
    }));

    d3.select("#network-container").html("");

    const width = 1100, height = 700;
    const svg = d3.select("#network-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(250))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("collision", d3.forceCollide().radius(d => 20 + d.deaths / 1500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alpha(1)
      .restart();

    const color = d3.scaleLinear()
      .domain(d3.extent(nodes, d => d.deaths))
      .range(["#f4cccc", "#990000"]);

    const link = svg.selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2);

    const node = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 0)
      .attr("fill", d => color(d.deaths))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5);

    node.transition()
      .duration(1000)
      .attr("r", d => 5 + d.deaths / 1500);

    const labelGroup = svg.selectAll(".label-group")
      .data(nodes)
      .enter().append("g")
      .attr("class", "label-group")
      .style("opacity", 0);

    labelGroup.append("rect")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", "#f0f0f0")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.3);

    labelGroup.append("text")
      .text(d => `${d.id}: ${d.deaths}`)
      .attr("font-size", "12px")
      .attr("fill", "#000")
      .attr("x", 0)
      .attr("y", 12);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labelGroup
        .attr("transform", d => `translate(${d.x + 10},${d.y - 10})`);

      labelGroup.select("rect")
        .attr("width", function(_, i) {
          const text = labelGroup.select("text").nodes()[i];
          return text.getBBox().width + 8;
        })
        .attr("height", function(_, i) {
          const text = labelGroup.select("text").nodes()[i];
          return text.getBBox().height + 4;
        })
        .attr("x", -4)
        .attr("y", 2);
    });

    labelGroup.transition()
      .delay(500)
      .duration(500)
      .style("opacity", 1);
  }

  updateGraph(years[0]);

  slider.on("input", function () {
    const year = this.value;
    label.text(year);
    updateGraph(year);
  });
});
