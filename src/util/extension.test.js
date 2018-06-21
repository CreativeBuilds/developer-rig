import { createExtensionObject } from './extension';
import { ViewerTypes } from '../constants/viewer-types';
import { createToken } from './token';

describe('extension', () => {
  const manifest = {
    author_name: 'test',
    id: 'id',
    description: 'desc',
    icon_url: 'test.png',
    name: 'test',
    request_identity: 'test',
    sku: 'sku',
    state: 'state',
    summary: 'summary',
    vendor_code: 'vendor_code',
    views: {
      panel: {
        viewerUrl: 'test',
      },
    },
    version: '0.1',
    whitelisted_config_urls: [],
    whitelisted_panel_urls: [],
  };
  const index = '0';
  const role = ViewerTypes.LoggedOut;
  const isLinked = false;
  const ownerID = 'test';
  const channelId = 'test';
  const secret = 'test';
  const opaqueId = 'testOpaqueId';

  it('creates an extension with the correct data', () => {
    const expected = {
      authorName: manifest.author_name,
      clientId: manifest.id,
      description: manifest.description,
      iconUrl: manifest.icon_url,
      id: manifest.id + ':' + index,
      name: manifest.name,
      requestIdentityLink: manifest.request_identity,
      sku: manifest.sku,
      state: manifest.state,
      summary: manifest.summary,
      token: createToken(role, isLinked, ownerID, channelId, secret, opaqueId),
      vendorCode: manifest.vendor_code,
      version: manifest.version,
      views: manifest.views,
      whitelistedConfigUrls: manifest.whitelisted_config_urls,
      whitelistedPanelUrls: manifest.whitelisted_panel_urls,
      channelId: channelId,
    };
    const result = createExtensionObject(manifest, index, role, isLinked, ownerID, channelId, secret, opaqueId);
    expect(result).toEqual(expected);
  });
});
