import { createToken } from './token';

export function createExtensionObject(manifest, index, role, isLinked, ownerID, channelId, secret, opaqueId) {
  return {
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
}
