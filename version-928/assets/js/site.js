(function () {
  var base = document.body ? document.body.getAttribute('data-base') || '' : '';

  function makeUrl(path) {
    return base + path;
  }

  function closeSearch(box) {
    var results = box.querySelector('[data-search-results]');
    if (results) {
      results.classList.remove('is-open');
      results.innerHTML = '';
    }
  }

  function renderSearch(input, box) {
    var results = box.querySelector('[data-search-results]');
    var data = window.SITE_SEARCH_DATA || [];
    var query = input.value.trim().toLowerCase();

    if (!results) {
      return;
    }

    if (!query) {
      closeSearch(box);
      return;
    }

    var matches = data.filter(function (item) {
      return item.search.indexOf(query) !== -1;
    }).slice(0, 10);

    if (!matches.length) {
      results.innerHTML = '<span class="empty-result">没有找到相关影片</span>';
      results.classList.add('is-open');
      return;
    }

    results.innerHTML = matches.map(function (item) {
      return '<a href="' + makeUrl(item.url) + '">' +
        '<strong>' + item.title + '</strong>' +
        '<em>' + item.category + ' · ' + item.year + ' · ' + item.region + '</em>' +
        '</a>';
    }).join('');
    results.classList.add('is-open');
  }

  function initSearch() {
    document.querySelectorAll('[data-search-box]').forEach(function (box) {
      var input = box.querySelector('.site-search-input');
      if (!input) {
        return;
      }

      input.addEventListener('input', function () {
        renderSearch(input, box);
      });

      input.addEventListener('focus', function () {
        renderSearch(input, box);
      });
    });

    document.addEventListener('click', function (event) {
      document.querySelectorAll('[data-search-box]').forEach(function (box) {
        if (!box.contains(event.target)) {
          closeSearch(box);
        }
      });
    });
  }

  function initHeader() {
    var header = document.querySelector('[data-header]');
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');

    function setHeaderState() {
      if (!header) {
        return;
      }

      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });

    if (button && panel) {
      button.addEventListener('click', function () {
        panel.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', panel.classList.contains('is-open'));
      });
    }
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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

    function schedule() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  function initPosterFallback() {
    document.querySelectorAll('img[data-poster]').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame');
        if (frame) {
          frame.classList.add('is-missing');
        }
      });

      if (image.complete && image.naturalWidth === 0) {
        var frame = image.closest('.poster-frame');
        if (frame) {
          frame.classList.add('is-missing');
        }
      }
    });
  }

  function initCategoryFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('.filter-input');
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var currentValue = '';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var search = card.getAttribute('data-search') || '';
          var genre = card.getAttribute('data-genre') || '';
          var matchesText = !query || search.indexOf(query) !== -1;
          var matchesButton = !currentValue || genre.indexOf(currentValue) !== -1 || search.indexOf(currentValue.toLowerCase()) !== -1;
          card.classList.toggle('is-hidden', !(matchesText && matchesButton));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          currentValue = button.getAttribute('data-filter-value') || '';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initSearch();
    initHero();
    initPosterFallback();
    initCategoryFilters();
  });
})();
