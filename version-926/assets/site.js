(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    activate(0);
    start();
  }

  function textMatches(card, query) {
    if (!query) {
      return true;
    }
    var haystack = [
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.textContent
    ].join(" ").toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var scope = form.closest("main") || document;
      var input = form.querySelector("[data-card-search]");
      var year = form.querySelector("[data-year-filter]");
      var type = form.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty]");

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var ok = textMatches(card, query);
          if (ok && yearValue) {
            ok = card.getAttribute("data-year") === yearValue;
          }
          if (ok && typeValue) {
            ok = card.getAttribute("data-type") === typeValue;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
      form.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });
      apply();
    });
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player]");
    if (!video) {
      return;
    }
    var cover = document.querySelector("[data-play-cover]");
    var stream = video.getAttribute("data-stream");
    var attached = false;
    var hls = null;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 45,
          capLevelToPlayerSize: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  onReady(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
