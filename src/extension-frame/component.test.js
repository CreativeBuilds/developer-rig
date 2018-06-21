import { setupShallowTest } from '../tests/enzyme-util/shallow';
import { setupMountTest } from '../tests/enzyme-util/mount';
import { ExtensionForTest } from '../tests/constants/extension';
import { ExtensionFrame } from './component';
const { ExtensionViewType, ExtensionAnchor, ExtensionMode } = window['extension-coordinator'];

describe('<ExtensionFrame />', () => {
  const setupShallow = setupShallowTest(ExtensionFrame, () => ({
    className: 'view',
    frameId: '0',
    extension: ExtensionForTest,
    type: ExtensionAnchor.Panel,
    mode: ExtensionMode.Viewer,
  }));

  const setupMount = setupMountTest(ExtensionFrame, () => ({
    className: 'view',
    frameId: '0',
    extension: ExtensionForTest,
    type: ExtensionAnchor.Panel,
    mode: ExtensionMode.Viewer,
  }));

  it('prevents the default when double clicked', () => {
    const mockEvent = {};
    mockEvent.preventDefault = jest.fn();
    const { wrapper } = setupShallow();
    wrapper.instance()._onFrameDoubleClick(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('onload postMessages data correctly', () => {
    const { wrapper } = setupMount();

    const mockIframeRef = {
      contentWindow: {
        postMessage: jest.fn(),
      },
    };

    wrapper.instance().iframe = mockIframeRef
    wrapper.instance()._extensionFrameInit();
    expect(mockIframeRef.contentWindow.postMessage).toHaveBeenCalledWith({
      "action": "extension-frame-init",
      "extension": {
        "anchor": "panel",
        "channelId": "channelId",
        "extension": {
          "authorName": "test",
          "channelId": "channelId",
          "description": "description",
          "iconUrl": "icon_url",
          "id": "id",
          "name": "name",
          "requestIdentity": false,
          "sku": "sku",
          "state": "state",
          "summary": "summary",
          "token": "token",
          "vendorCode": "vendorCode",
          "version": "0.1",
          "views": {
            "component": { "aspectHeight": 3000, "aspectWidth": 2500, "viewerUrl": "test", "zoom": false },
            "config": { "viewerUrl": "test" },
            "liveConfig": { "viewerUrl": "test" },
            "panel": { "viewerUrl": "test" }
          },
          "whitelistedConfigUrls": ["foo"],
          "whitelistedPanelUrls": ["bar"] },
          "iframeClassName": "extension-frame",
          "loginId": null,
          "mode": "viewer",
          "platform": "web",
          "trackingProperties": {}
        },
      "frameId": "0"
    }, "*");
  });

  it('onload postMessages data correctly when platform is mobile', () => {
    const { wrapper } = setupMount({
      type: ExtensionViewType.Mobile
    });

    const mockIframeRef = {
      contentWindow: {
        postMessage: jest.fn(),
      },
    };

    wrapper.instance().iframe = mockIframeRef
    wrapper.instance()._extensionFrameInit();
    expect(mockIframeRef.contentWindow.postMessage).toHaveBeenCalledWith({
      "action": "extension-frame-init",
      "extension": {
        "anchor": "mobile",
        "channelId": "channelId",
        "extension": {
          "authorName": "test",
          "channelId": "channelId",
          "description": "description",
          "iconUrl": "icon_url",
          "id": "id",
          "name": "name",
          "requestIdentity": false,
          "sku": "sku",
          "state": "state",
          "summary": "summary",
          "token": "token",
          "vendorCode": "vendorCode",
          "version": "0.1",
          "views": {
            "component": { "aspectHeight": 3000, "aspectWidth": 2500, "viewerUrl": "test", "zoom": false },
            "config": { "viewerUrl": "test" },
            "liveConfig": { "viewerUrl": "test" },
            "panel": { "viewerUrl": "test" }
          },
          "whitelistedConfigUrls": ["foo"],
          "whitelistedPanelUrls": ["bar"] },
          "iframeClassName": "extension-frame",
          "loginId": null,
          "mode": "viewer",
          "platform": "mobile",
          "trackingProperties": {}
        },
      "frameId": "0"
    }, "*");
  });

  describe('when in live config mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        type: ExtensionViewType.LiveConfig,
        mode: ExtensionMode.Dashboard,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in live config mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        type: ExtensionViewType.LiveConfig,
        mode: ExtensionMode.Dashboard,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in config mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        type: ExtensionViewType.Config,
        mode: ExtensionMode.Config,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in panel mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        type: ExtensionAnchor.Panel,
        mode: ExtensionMode.Viewer,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in video overlay mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        type: ExtensionAnchor.Overlay,
        mode: ExtensionMode.Viewer,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when in video overlay mode', () => {
    it('renders correctly', () => {
      const { wrapper } = setupShallow({
        type: ExtensionAnchor.Overlay,
        mode: ExtensionMode.Viewer,
      });
      expect(wrapper).toMatchSnapshot();
    });
  });
});
