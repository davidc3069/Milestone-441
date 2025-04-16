const views = [
  "instructions",
  "loading",
  "choropleth",
  "kidney",
  "accidents",
  "heart-disease",
  "alzheimers",
  "cancer",
  
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

document.addEventListener("DOMContentLoaded", () => {
  renderStarfield();

  // ...your existing routing code
});

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
      script.src = `${route}.js?v=${new Date().getTime()}`;
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




