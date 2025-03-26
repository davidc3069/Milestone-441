const views = ["choropleth", "scatter", "linechart", "heart-disease", "alzheimers", "cancer"];
let currentIndex = 0;

function loadRoute(viewName) {
  const frame = document.getElementById("view-frame");
  if (!frame || !views.includes(viewName)) {
    console.error("Invalid link or missing data-view attribute.");
    return;
  }

  frame.src = `${viewName}.html`;
  currentIndex = views.indexOf(viewName);
}

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const view = link.dataset.view;
      loadRoute(view);
    });
  });

  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("view-frame").src = this.getAttribute("data-view") + ".html";
    });
});

  window.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % views.length;
      loadRoute(views[currentIndex]);
    } else if (e.key === "ArrowLeft") {
      currentIndex = (currentIndex - 1 + views.length) % views.length;
      loadRoute(views[currentIndex]);
    }
  });

  // Initial route fallback
  loadRoute("choropleth");
});



  