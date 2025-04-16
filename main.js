const views = [
  "landing",
  "choropleth-summary", 
  "kidney",
  "accidents",
  "heart-disease",
  "alzheimers",
  "cancer",
  "choropleth"     
];

function renderStarfield() {
  const svg = d3.select("#background-stars")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

  for (let i = 0; i < 300; i++) {
    svg.append("circle")
      .attr("cx", Math.random() * window.innerWidth)
      .attr("cy", Math.random() * window.innerHeight)
      .attr("r", Math.random() * 1.2)
      .attr("fill", "white")
      .attr("opacity", Math.random());
  }
}

let currentIndex = 0;

function loadRoute(route) {
  const container = document.getElementById("view-container");

  fetch(`${route}.html`)
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;

      const oldScript = document.getElementById("active-script");
      if (oldScript) oldScript.remove();

      const script = document.createElement("script");

      // ✅ FIX: Use choropleth.js for both summary and full
      script.src = route.includes("choropleth") ? `choropleth.js?v=${Date.now()}` : `${route}.js?v=${Date.now()}`;

      script.id = "active-script";
      script.defer = true;
      document.body.appendChild(script);
    })
    .catch(err => {
      container.innerHTML = `<p>Error loading ${route}</p>`;
      console.error("Error loading route:", err);
    });
}

function navigateView(step) {
  currentIndex = (currentIndex + step + views.length) % views.length;
  loadRoute(views[currentIndex]);
}

document.addEventListener("DOMContentLoaded", () => {
  renderStarfield();
  loadRoute(views[currentIndex]);

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      navigateView(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      navigateView(-1);
    }
  });

  document.querySelectorAll(".sidebar li").forEach(link => {
    link.addEventListener("click", () => {
      const view = link.getAttribute("data-view");
      currentIndex = views.indexOf(view);
      loadRoute(view);
    });
  });
});
