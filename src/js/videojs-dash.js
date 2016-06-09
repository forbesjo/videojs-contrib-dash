import window from 'global/window';
import videojs from 'video.js';
import shaka from 'shaka-player';

let
  isArray = function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

/**
 * videojs-contrib-dash
 *
 * Use the Shaka Player to playback DASH content inside of Video.js via a SourceHandler
 */
class Html5Shaka {
  constructor(source, tech) {
    this.tech_ = tech;
    this.el_ = tech.el();
    this.elParent_ = this.el_.parentNode;

    // Do nothing if the src is falsey
    if (!source.src) {
      return;
    }

    shaka.polyfill.installAll();
    
    // While the manifest is loading and Shaka player has not finished initializing
    // we must defer events and functions calls with isReady_ and then `triggerReady`
    // again later once everything is setup
    // tech.isReady_ = false;

    if (Html5Shaka.updateSourceData) {
      source = Html5Shaka.updateSourceData(source);
    }

    let manifestSource = source.src;
    this.keySystemOptions_ = Html5Shaka.buildShakaProtData(source.keySystemOptions);
    
    
    // reuse shakaPlayer if it already exists
    if (!this.shakaPlayer_) {
      this.shakaPlayer_ = new shaka.Player(this.el_);
    }

    this.shakaPlayer_.resetConfiguration();
      
    // Attach the source with any protection data
    if (this.keySystemOptions_) {
      this.shakaPlayer_.configure({ drm:{ servers: this.keySystemOptions_ } });
    }
      
    // var self = this;
    this.shakaPlayer_.load(manifestSource).then(function() {
      // self.tech_.triggerReady();
    }, function(error) {
      videojs.log.debug('error code ' + error.code);
    });
  }

  /*
   * Iterate over the `keySystemOptions` array and convert each object into
   * the type of object Shaka Player expects in the `protData` argument.
   *
   * Also rename 'licenseUrl' property in the options to an 'serverURL' property
   */
  static buildShakaProtData(keySystemOptions) {
    let output = {};

    if (!keySystemOptions || !isArray(keySystemOptions)) {
      return output;
    }

    for (let i = 0; i < keySystemOptions.length; i++) {
      let keySystem = keySystemOptions[i];
      let options = videojs.mergeOptions({}, keySystem.options);

      if (options.licenseUrl) {
        options.serverURL = options.licenseUrl;
        delete options.licenseUrl;
      }

      output[keySystem.name] = options.serverURL;
    }

    return output;
  }

  dispose() {
    if (this.shakaPlayer_) {
      this.shakaPlayer_.unload();
      this.shakaPlayer_.resetConfiguration();
    }
  }
}

videojs.DashSourceHandler = function() {
  return {
    canHandleSource: function(source) {
      let dashExtRE = /\.mpd/i;

      if (videojs.DashSourceHandler.canPlayType(source.type)) {
        return 'probably';
      } else if (dashExtRE.test(source.src)) {
        return 'maybe';
      } else {
        return '';
      }
    },

    handleSource: function(source, tech) {
      return new Html5Shaka(source, tech);
    },

    canPlayType: function(type) {
      return videojs.DashSourceHandler.canPlayType(type);
    }
  };
};

videojs.DashSourceHandler.canPlayType = function(type) {
  let dashTypeRE = /^application\/dash\+xml/i;
  if (dashTypeRE.test(type)) {
    return 'probably';
  }

  return '';
};

// Only add the SourceHandler if the browser supports MediaSourceExtensions
if (!!window.MediaSource) {
  videojs.getComponent('Html5').registerSourceHandler(videojs.DashSourceHandler(), 0);
}

videojs.Html5Shaka = Html5Shaka;
export default Html5Shaka;
