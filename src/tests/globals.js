export function mockGlobals() {
  global.process.env.EXT_CLIENT_ID = 'test';
  global.process.env.EXT_SECRET = 'test';
  global.process.env.EXT_VERSION = 'test';
  global.process.env.EXT_CHANNEL_ID = 'test';
  global.process.env.EXT_USER_NAME = 'test';

  global.localStorage = {};
  global.localStorage.getItem = (key) => {
    if (!(key in global.localStorage)) {
      return null;
    }
    return global.localStorage[key];
  };

  global.localStorage.setItem = (key, value) => {
    global.localStorage[key] = value;
  };

  global.window.rig = {};
  global.window.rig.history = [];

  const coordinator = {}
  coordinator.ExtensionMode = {
    Viewer: 'viewer',
    Dashboard: 'dashboard',
    Config: 'config',
  };

  coordinator.ExtensionViewType = {
    Component: 'component',
    Config: 'config',
    Hidden: 'hidden',
    LiveConfig: 'liveConfig',
    Mobile: 'mobile',
    Panel: 'panel',
    VideoOverlay: 'videoOverlay',
  };

  coordinator.ExtensionPlatform = {
    Web: 'web',
    Mobile: 'mobile'
  };

  coordinator.ExtensionFrame = function () {
    return {
      on: () => { },
    }
  };

  coordinator.ExtensionAnchor = {
    Panel: 'panel',
    Overlay: 'video_overlay',
    Component: 'component',
  };

  coordinator.getComponentPositionFromView = function () {
    return {
      x: 20,
      y: 20,
    }
  }

  coordinator.getComponentSizeFromView = function () {
    return {
      width: 10,
      height: 10,
      zoomScale: 1024,
    }
  }

  global.window['extension-coordinator'] = coordinator;
}

