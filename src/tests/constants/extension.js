import { ViewerTypes } from '../../constants/viewer-types';
import { ExtensionAnchors } from '../../constants/extension-types';
import { MobileOrientation } from '../../constants/mobile';
const { ExtensionAnchor } = window['extension-coordinator'];

export const ExtensionForTest = {
  authorName: 'test',
  id: 'id',
  description: 'description',
  iconUrl: 'icon_url',
  name: 'name',
  requestIdentity: false,
  sku: 'sku',
  state: 'state',
  summary: 'summary',
  token: 'token',
  vendorCode: 'vendorCode',
  version: '0.1',
  views: {
    panel: {
      viewerUrl: 'test'
    },
    config: {
      viewerUrl: 'test'
    },
    liveConfig: {
      viewerUrl: 'test',
    },
    component: {
      aspectHeight: 3000,
      aspectWidth: 2500,
      zoom: false,
      viewerUrl: 'test',
    }
  },
  whitelistedConfigUrls: ['foo'],
  whitelistedPanelUrls: ['bar'],
  channelId: 'channelId',
};

export function createViewsForTest(numOfViews, type, role, extras) {
  let ex = {
    x: 0,
    y: 0,
    orientation: MobileOrientation.Portrait,
  }
  const extViews = [];
  if (extras) {
    ex.x = extras.x;
    ex.y = extras.y;
  }

  for (let i = 0; i < numOfViews; i++) {
    extViews.push({
      id: (extViews.length + 1).toString(),
      type: type,
      extension: ExtensionForTest,
      linked: false,
      role: role,
      x: ex.x,
      y: ex.y,
      orientation: ex.orientation
    })
  }
  return extViews;
}
