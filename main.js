const routes = {
    "choropleth": "choropleth.html",
    "kidney": "kidney.html",
    "accidents": "accidents.html",
    "heart-disease": "heart-disease.html",
    "alzheimers": "alzheimers.html",
    "cancer": "cancer.html"
  };
  
  const viewOrder = Object.keys(routes);
  let currentIndex = 0;
  let currentRoute = null;
  
  function loadRoute(route) {
    if (!routes[route]) {
      console.error("Invalid route:", route);
      return;
    }
  
    if (route === currentRoute) return;
    currentRoute = route;
    currentIndex = viewOrder.indexOf(route);
  
    const container = document.getElementById("view-container");
    container.innerHTML = "";
  
    fetch(routes[route])
      .then(res => {
        if (!res.ok) throw new Error("Page not found");
        return res.text();
      })
      .then(html => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
  
        // Remove old dynamic scripts
        document.querySelectorAll("script[data-dynamic]").forEach(s => s.remove());
  
        // Pull and remove inline scripts
        const scripts = temp.querySelectorAll("script");
        scripts.forEach(script => script.remove());
  
        container.innerHTML = temp.innerHTML;
  
        // Inject scripts again
        scripts.forEach(script => {
          const s = document.createElement("script");
          s.dataset.dynamic = "true";
          if (script.src) s.src = script.src;
          else s.textContent = script.textContent;
          document.body.appendChild(s);
        });
      })
      .catch(err => {
        container.innerHTML = `<p style="color: red;">Error loading view: ${err.message}</p>`;
      });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("nav a").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const view = link.dataset.view;
        if (view) loadRoute(view);
      });
    });
  
    document.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") {
        currentIndex = (currentIndex + 1) % viewOrder.length;
        loadRoute(viewOrder[currentIndex]);
      } else if (e.key === "ArrowLeft") {
        currentIndex = (currentIndex - 1 + viewOrder.length) % viewOrder.length;
        loadRoute(viewOrder[currentIndex]);
      }
    });
  
    loadRoute("choropleth");
  });
  


  