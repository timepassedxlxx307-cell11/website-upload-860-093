(function () {
  function toggleMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".hero-card"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !cards.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      cards.forEach(function (card, current) {
        card.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function run() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-index")) || 0);
        run();
      });
    });

    show(0);
    run();
  }

  function initFilters() {
    var list = document.querySelector(".filter-list");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var keyword = document.getElementById("searchKeyword");
    var category = document.getElementById("filterCategory");
    var region = document.getElementById("filterRegion");
    var year = document.getElementById("filterYear");
    var type = document.getElementById("filterType");
    var empty = document.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);

    if (keyword && params.get("q")) {
      keyword.value = params.get("q");
    }

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function apply() {
      var q = valueOf(keyword);
      var c = valueOf(category);
      var r = valueOf(region);
      var y = valueOf(year);
      var t = valueOf(type);
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") || "").toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (c && (card.getAttribute("data-category") || "").toLowerCase() !== c) {
          ok = false;
        }
        if (r && (card.getAttribute("data-region") || "").toLowerCase() !== r) {
          ok = false;
        }
        if (y && (card.getAttribute("data-year") || "").toLowerCase() !== y) {
          ok = false;
        }
        if (t && (card.getAttribute("data-type") || "").toLowerCase() !== t) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible > 0;
      }
    }

    [keyword, category, region, year, type].forEach(function (element) {
      if (!element) {
        return;
      }
      element.addEventListener("input", apply);
      element.addEventListener("change", apply);
    });
    apply();
  }

  function bindMoviePlayer(player, streamUrl) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    if (!video || !streamUrl) {
      return;
    }
    var started = false;
    var hls = null;

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    function start() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (started) {
        playVideo();
        return;
      }
      started = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          playVideo();
        }
        return;
      }

      video.src = streamUrl;
      playVideo();
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.bindMoviePlayer = bindMoviePlayer;

  document.addEventListener("DOMContentLoaded", function () {
    toggleMenu();
    initHero();
    initFilters();
  });
})();
