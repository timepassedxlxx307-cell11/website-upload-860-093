(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (slides.length > 1) {
      var active = 0;
      var setSlide = function (index) {
        active = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          setSlide(i);
        });
      });
      window.setInterval(function () {
        setSlide((active + 1) % slides.length);
      }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    if (filterInput) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      filterInput.addEventListener("input", function () {
        var value = filterInput.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.year].join(" ").toLowerCase();
          card.style.display = haystack.indexOf(value) > -1 ? "" : "none";
        });
      });
    }

    var searchInput = document.querySelector("[data-search-page-input]");
    var searchResults = document.querySelector("[data-search-results]");
    if (searchInput && searchResults && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;
      var escapeHtml = function (value) {
        return String(value).replace(/[&<>"]/g, function (match) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;"
          }[match];
        });
      };
      var render = function () {
        var value = searchInput.value.trim().toLowerCase();
        var rows = window.SEARCH_MOVIES.filter(function (item) {
          if (!value) {
            return true;
          }
          return item.text.toLowerCase().indexOf(value) > -1;
        }).slice(0, 80);
        searchResults.innerHTML = rows.map(function (item) {
          return '<a class="search-result-item" href="' + escapeHtml(item.url) + '">' +
            '<img src="' + escapeHtml(item.img) + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><h2>' + escapeHtml(item.title) + '</h2><p>' + escapeHtml(item.meta) + '</p><p>' + escapeHtml(item.desc) + '</p></span>' +
            '</a>';
        }).join("");
      };
      searchInput.addEventListener("input", render);
      render();
    }
  });
})();
