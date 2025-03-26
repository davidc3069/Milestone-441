let currentRoute = null;

function loadRoute(route) {
  const routes = {
    choropleth: "choropleth.html",
    kidney: "kidney.html",
    accidents: "accidents.html"
  };

  if (!routes[route]) {
    console.error("Invalid route:", route);
    return;
  }

  if (route === currentRoute) return; // avoid reload if same
  currentRoute = route;

  const container = document.getElementById("view-container");
  container.innerHTML = ""; // clear old view

  fetch(routes[route])
    .then(res => {
      if (!res.ok) throw new Error("Page not found");
      return res.text();
    })
    .then(html => {
      const temp = document.createElement("div");
      temp.innerHTML = html;

      // Remove existing scripts to prevent duplicate D3 issues
      document.querySelectorAll("script[data-dynamic]").forEach(s => s.remove());

      // Extract and remove <script> tags from loaded HTML
      const scripts = temp.querySelectorAll("script");
      scripts.forEach(script => script.remove());

      container.innerHTML = temp.innerHTML;

      // Add back each script
      scripts.forEach(script => {
        const newScript = document.createElement("script");
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        newScript.dataset.dynamic = "true"; // mark to allow cleanup
        document.body.appendChild(newScript);
      });
    })
    .catch(err => {
      container.innerHTML = `<p style="color: red;">Error loading view: ${err.message}</p>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav a");
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const view = link.dataset.view;
      if (view) loadRoute(view);
      else console.error("Missing data-view attribute.");
    });
  });

  const views = ["choropleth", "kidney", "accidents"];
  let currentIndex = 0;

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % views.length;
      loadRoute(views[currentIndex]);
    } else if (e.key === "ArrowLeft") {
      currentIndex = (currentIndex - 1 + views.length) % views.length;
      loadRoute(views[currentIndex]);
    }
  });

  loadRoute("choropleth");
});


  