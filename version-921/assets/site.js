(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  document.querySelectorAll('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var url = './search.html';
      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  });

  var filterInput = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var categoryButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeCategory = 'all';

  function yearMatches(cardYear, selectedYear) {
    if (!selectedYear || selectedYear === 'all') {
      return true;
    }
    var year = parseInt(cardYear, 10);
    if (selectedYear === 'older') {
      return year < 2022;
    }
    return year === parseInt(selectedYear, 10);
  }

  function applyFilters() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var selectedYear = yearFilter ? yearFilter.value : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var search = (card.getAttribute('data-search') || '').toLowerCase();
      var category = card.getAttribute('data-category') || '';
      var year = card.getAttribute('data-year') || '';
      var matchesQuery = !query || search.indexOf(query) !== -1;
      var matchesCategory = activeCategory === 'all' || category === activeCategory;
      var matchesYear = yearMatches(year, selectedYear);
      var matched = matchesQuery && matchesCategory && matchesYear;

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput || yearFilter || categoryButtons.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (filterInput && initialQuery) {
      filterInput.value = initialQuery;
    }

    if (filterInput && filterInput.hasAttribute('data-autofocus-filter')) {
      window.setTimeout(function () {
        filterInput.focus();
      }, 120);
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilters);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilters);
    }

    categoryButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-filter-category') || 'all';
        categoryButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  }

  document.querySelectorAll('.movie-player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-player-cover]');
    var stream = player.getAttribute('data-stream');
    var hls = null;
    var started = false;

    function attachStream() {
      if (!video || !stream) {
        return;
      }

      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function beginPlayback() {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (video) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', beginPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlayback();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
