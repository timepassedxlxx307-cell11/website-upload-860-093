(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    function setupCarousel() {
        var hero = document.querySelector("[data-carousel]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        show(0);
        start();
    }

    function setupLocalSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".local-search"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!inputs.length || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        function filter(value) {
            var query = normalize(value);
            cards.forEach(function (card) {
                var content = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year")
                ].join(" "));
                card.classList.toggle("is-hidden", query && content.indexOf(query) === -1);
            });
        }
        inputs.forEach(function (input) {
            if (initial && !input.value) {
                input.value = initial;
            }
            input.addEventListener("input", function () {
                filter(input.value);
            });
        });
        if (initial) {
            filter(initial);
        }
    }

    function setupTypeFilter() {
        var select = document.querySelector(".type-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!select || !cards.length) {
            return;
        }
        select.addEventListener("change", function () {
            var value = normalize(select.value);
            cards.forEach(function (card) {
                var genre = normalize(card.getAttribute("data-genre"));
                var tags = normalize(card.getAttribute("data-tags"));
                card.classList.toggle("is-hidden", value && genre.indexOf(value) === -1 && tags.indexOf(value) === -1);
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var trigger = player.querySelector(".player-cover");
            var stream = player.getAttribute("data-stream");
            var hlsInstance = null;
            if (!video || !trigger || !stream) {
                return;
            }
            function attach() {
                if (player.getAttribute("data-ready") === "1") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                }
                player.setAttribute("data-ready", "1");
            }
            function play() {
                attach();
                player.classList.add("is-playing");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }
            trigger.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupCarousel();
        setupLocalSearch();
        setupTypeFilter();
        setupPlayers();
    });
})();
