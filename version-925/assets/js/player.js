(function () {
    function init(config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var overlay = document.getElementById(config.overlayId);
        var hlsInstance = null;
        var loaded = false;
        if (!video || !button || !overlay || !config.source) {
            return;
        }
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(config.source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = config.source;
            }
        }
        function play() {
            overlay.classList.add("is-hidden");
            load();
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        button.addEventListener("click", play);
        overlay.addEventListener("click", play);
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
    }
    window.MovieSitePlayer = {
        init: init
    };
})();
