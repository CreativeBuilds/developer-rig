let extensionFrameAPI;
window.addEventListener('message', proxyIframeEvent);

function proxyIframeEvent(event) {
  const data = event.data;
  switch (data.action) {
    case 'extension-frame-init':
      const ExtensionFrame = window['extension-coordinator'].ExtensionFrame;
      const extension = event.data.extension;
      extension.parentElement = document.getElementById('extension-frame');
      extension.dobbin = { trackEvent: () => {} };
      extensionFrameAPI = new ExtensionFrame(extension);
      break;
    case 'twitch-ext-rig-log':
      window.parent.postMessage(data, '*');
      break;
    default:
      break;
  }
}
