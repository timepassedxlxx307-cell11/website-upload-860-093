(function () {
  var hlsLoading = null;
  var hlsReady = false;
  var hlsFailed = false;
  var hlsCallbacks = [];

  function flushHlsCallbacks() {
    var callbacks = hlsCallbacks.slice();
    hlsCallbacks = [];
    callbacks.forEach(function (callback) {
      callback();
    });
  }

  function loadHls(callback) {
    if (window.Hls || hlsReady || hlsFailed) {
      callback();
      return;
    }
    hlsCallbacks.push(callback);
    if (!hlsLoading) {
      hlsLoading = document.createElement("script");
      hlsLoading.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      hlsLoading.async = true;
      hlsLoading.addEventListener("load", function () {
        hlsReady = true;
        flushHlsCallbacks();
      });
      hlsLoading.addEventListener("error", function () {
        hlsFailed = true;
        flushHlsCallbacks();
      });
      document.head.appendChild(hlsLoading);
    }
  }

  function startPlayback(video) {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  function directPlayback(video, source) {
    if (video.src !== source) {
      video.src = source;
    }
    startPlayback(video);
  }

  function playVideo(video, layer, source) {
    if (layer) {
      layer.classList.add("is-hidden");
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      directPlayback(video, source);
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (video._movieHls) {
          video._movieHls.destroy();
        }
        var hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        video._movieHls = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          startPlayback(video);
        });
      } else {
        directPlayback(video, source);
      }
    });
  }

  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var layer = document.getElementById(options.layerId);
    var trigger = document.getElementById(options.triggerId);
    if (!video || !options.source) {
      return;
    }
    var started = false;
    function handleStart(event) {
      if (event) {
        event.preventDefault();
      }
      if (started) {
        return;
      }
      started = true;
      playVideo(video, layer, options.source);
    }
    if (layer) {
      layer.addEventListener("click", handleStart);
    }
    if (trigger) {
      trigger.addEventListener("click", handleStart);
    }
  };
}());
