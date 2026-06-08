(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-index]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        showSlide(Number(dot.getAttribute('data-slide-index') || 0));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    if (slides.length > 1) {
      start();
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var root = panel.parentElement;
    var grid = root ? root.querySelector('[data-filter-grid]') : null;
    var empty = root ? root.querySelector('[data-empty-state]') : null;

    if (!grid) {
      return;
    }

    var input = panel.querySelector('[data-search-input]');
    var genre = panel.querySelector('[data-filter-genre]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(grid.children);

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var applyFilter = function () {
      var query = normalize(input ? input.value : '');
      var genreValue = normalize(genre ? genre.value : '');
      var yearValue = normalize(year ? year.value : '');
      var regionValue = normalize(region ? region.value : '');
      var visible = 0;

      cards.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-title'));
        var itemGenre = normalize(item.getAttribute('data-genre'));
        var itemYear = normalize(item.getAttribute('data-year'));
        var itemRegion = normalize(item.getAttribute('data-region'));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (genreValue && itemGenre.indexOf(genreValue) === -1) {
          matched = false;
        }

        if (yearValue && itemYear !== yearValue) {
          matched = false;
        }

        if (regionValue && itemRegion.indexOf(regionValue) === -1) {
          matched = false;
        }

        item.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [input, genre, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
