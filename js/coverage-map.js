(function () {
  var cfg = window.HOMEFIX_COVERAGE || { cabaSinCobertura: [], ambaSinCobertura: [] };

  function norm(s) {
    return String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/\u0300-\u036f/g, "")
      .trim();
  }

  var cabaRojos = new Set((cfg.cabaSinCobertura || []).map(norm));
  var ambaRojos = new Set((cfg.ambaSinCobertura || []).map(norm));

  function styleFor(green) {
    return {
      fillColor: green ? "#22c55e" : "#ef4444",
      color: green ? "#166534" : "#991b1b",
      weight: 1.5,
      fillOpacity: 0.48,
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

    Promise.all([
      fetch("data/amba-partidos.geojson").then(function (r) {
        return r.json();
      }),
      fetch("data/caba-barrios.geojson").then(function (r) {
        return r.json();
      }),
    ])
      .then(function (results) {
        var amba = results[0];
        var caba = results[1];

        var gAmba = L.geoJSON(amba, {
          style: function (feat) {
            var green = !ambaRojos.has(norm(feat.properties.nam));
            return styleFor(green);
          },
          onEachFeature: function (feat, layer) {
            var n = feat.properties.nam;
            var ok = !ambaRojos.has(norm(n));
            layer.bindPopup(
              "<strong>" + L.Util.escapeHTML(n) + "</strong><br/>Partido (AMBA)<br/>" + (ok ? "Con cobertura" : "Sin cobertura")
            );
          },
        }).addTo(map);

        var gCaba = L.geoJSON(caba, {
          style: function (feat) {
            var green = !cabaRojos.has(norm(feat.properties.nombre));
            return styleFor(green);
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
      .catch(function () {
        el.innerHTML = '<p class="map-error">No se pudo cargar el mapa. Comprobá tu conexión o probá más tarde.</p>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMap);
  } else {
    initMap();
  }
})();
