(function () {
  var cfg = window.HOMEFIX_COVERAGE || { cabaSinCobertura: [], ambaSinCobertura: [] };

  /** Base path absoluta (/ o /WebBom/) para que fetch no rompa en GitHub Pages sin barra final */
  function getBasePath() {
    var path = window.location.pathname || "/";
    if (path.endsWith(".html")) {
      path = path.slice(0, path.lastIndexOf("/") + 1);
    } else if (path !== "" && path !== "/" && !path.endsWith("/")) {
      path += "/";
    }
    if (path === "") path = "/";
    return path;
  }

  function geoUrl(relPath) {
    return window.location.origin + getBasePath() + relPath.replace(/^\//, "");
  }

  function loadGeoJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) {
        throw new Error("HTTP " + r.status + " " + url);
      }
      return r.json();
    });
  }

  function norm(s) {
    return String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/\u0300-\u036f/g, "")
      .trim();
  }

  var cabaRojos = new Set((cfg.cabaSinCobertura || []).map(norm));
  var ambaRojos = new Set((cfg.ambaSinCobertura || []).map(norm));

  /** Barrios CABA y partidos AMBA: borde grueso para ver bien los límites */
  function styleForZona(green) {
    return {
      fillColor: green ? "#22c55e" : "#ef4444",
      color: green ? "#0f3d26" : "#7f1d1d",
      weight: 2.75,
      opacity: 1,
      fillOpacity: 0.42,
    };
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initMap() {
    var el = document.getElementById("mapa-cobertura");
    if (!el || typeof L === "undefined") return;

    var map = L.map(el, { scrollWheelZoom: false, attributionControl: true }).setView([-34.61, -58.44], 10);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    Promise.all([loadGeoJson(geoUrl("data/amba-partidos.geojson")), loadGeoJson(geoUrl("data/caba-barrios.geojson"))])
      .then(function (results) {
        var amba = results[0];
        var caba = results[1];

        var gAmba = L.geoJSON(amba, {
          style: function (feat) {
            var green = !ambaRojos.has(norm(feat.properties.nam));
            return styleForZona(green);
          },
          onEachFeature: function (feat, layer) {
            var n = feat.properties.nam;
            var ok = !ambaRojos.has(norm(n));
            layer.bindPopup("<strong>" + esc(n) + "</strong><br/>Partido (AMBA)<br/>" + (ok ? "Con cobertura" : "Sin cobertura"));
          },
        }).addTo(map);

        var gCaba = L.geoJSON(caba, {
          style: function (feat) {
            var green = !cabaRojos.has(norm(feat.properties.nombre));
            return styleForZona(green);
          },
          onEachFeature: function (feat, layer) {
            var n = feat.properties.nombre;
            var ok = !cabaRojos.has(norm(n));
            layer.bindPopup("<strong>" + esc(n) + "</strong> (CABA)<br/>" + (ok ? "Con cobertura" : "Sin cobertura"));
          },
        }).addTo(map);

        var b = gAmba.getBounds();
        b.extend(gCaba.getBounds());
        map.fitBounds(b, { padding: [28, 28], maxZoom: 11 });
      })
      .catch(function (err) {
        console.error("Mapa cobertura:", err);
        el.innerHTML =
          '<p class="map-error">No se pudo cargar el mapa. Si usás GitHub Pages, probá abrir el sitio con barra al final en la URL (ej. …/WebBom/). Si sigue fallando, abrí la consola del navegador (F12) para ver el detalle.</p>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMap);
  } else {
    initMap();
  }
})();
