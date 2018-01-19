import window from 'global/window';
import videojs from 'video.js';
import '../src';
import QUnit from 'qunit';

QUnit.module('videojs-dash globals');

QUnit.test('has expected globals', function(assert) {
  assert.ok(videojs.Html5DashJS, 'videojs has "Html5Dash" property');
  assert.ok(window.dashjs, 'global has "dashjs" property');
  assert.ok(window.dashjs.MediaPlayer, 'global has "dashjs.MediaPlayer" property');
});

