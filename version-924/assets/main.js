(function() {
    const menuButton = document.querySelector('[data-mobile-menu-button]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function(carousel) {
        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        let index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                show(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function() {
                show(index + 1);
            }, 5000);
        }
    });

    const searchSection = document.querySelector('[data-search-page]');
    const filterPanel = document.querySelector('[data-filter-panel]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const input = document.querySelector('[data-filter-input]');
    const count = document.querySelector('[data-filter-count]');
    const emptyState = document.querySelector('[data-empty-state]');

    if (searchSection && input) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query) {
            input.value = query;
        }
    }

    function getSelectValue(name) {
        const select = document.querySelector('[data-filter-select="' + name + '"]');
        return select ? select.value.trim().toLowerCase() : '';
    }

    function applyFilter() {
        if (!filterPanel || !cards.length) {
            if (count) {
                count.textContent = String(cards.length);
            }
            return;
        }

        const query = input ? input.value.trim().toLowerCase() : '';
        const category = getSelectValue('category');
        const year = getSelectValue('year');
        let visible = 0;

        cards.forEach(function(card) {
            const search = (card.dataset.search || '').toLowerCase();
            const cardCategory = (card.dataset.category || '').toLowerCase();
            const cardYear = (card.dataset.year || '').toLowerCase();
            const matched = (!query || search.includes(query)) && (!category || cardCategory === category) && (!year || cardYear === year);
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = String(visible);
        }
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterPanel) {
        filterPanel.addEventListener('input', applyFilter);
        filterPanel.addEventListener('change', applyFilter);
        applyFilter();
    } else if (count) {
        count.textContent = String(cards.length);
    }
})();
