(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-source]'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-cover');
    var source = shell.getAttribute('data-source');
    var prepared = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    var prepare = function () {
      if (prepared) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      prepared = true;
    };

    var play = function () {
      prepare();

      if (button) {
        button.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    };

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });

    prepare();
  });
})();
