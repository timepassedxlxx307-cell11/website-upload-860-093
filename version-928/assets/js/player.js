(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var button = shell.querySelector('.play-toggle');
    var loading = shell.querySelector('.player-loading');
    var error = shell.querySelector('.player-error');
    var source = shell.getAttribute('data-video-src');
    var ready = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function showLoading(active) {
      if (loading) {
        loading.hidden = !active;
      }
    }

    function showError(active) {
      if (error) {
        error.hidden = !active;
      }
    }

    function bindSource() {
      if (ready) {
        return;
      }

      ready = true;
      showLoading(true);
      showError(false);

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          showLoading(false);
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          showLoading(false);
          showError(true);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          showLoading(false);
        }, { once: true });
      } else {
        showLoading(false);
        showError(true);
      }
    }

    function playVideo() {
      bindSource();
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          shell.classList.add('is-playing');
          showLoading(false);
        }).catch(function () {
          showLoading(false);
          showError(true);
        });
      } else {
        shell.classList.add('is-playing');
        showLoading(false);
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });
    }

    if (cover) {
      cover.addEventListener('click', function () {
        playVideo();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.player-shell').forEach(setupPlayer);
  });
})();
