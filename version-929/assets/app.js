(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.getElementById("mobileNav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-scope");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (!scope) {
        return;
      }
      var input = panel.querySelector("[data-filter-text]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

      function valueOf(control) {
        return control ? control.value.trim().toLowerCase() : "";
      }

      function apply() {
        var query = valueOf(input);
        var regionValue = valueOf(region);
        var typeValue = valueOf(type);
        var yearValue = valueOf(year);
        cards.forEach(function (card) {
          var search = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
          var cardType = (card.getAttribute("data-type") || "").toLowerCase();
          var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
          var matched = true;
          if (query && search.indexOf(query) === -1) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }
          if (typeValue && cardType !== typeValue) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
        });
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      apply();
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
  });
}());
