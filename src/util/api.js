import { createSignedToken } from '../util/token';
import { missingConfigurations } from '../util/errors';
import { RIG_ROLE } from '../constants/rig';

export function convertViews(data) {
  const views = {};
  if (data.config) {
    views.config = { viewerUrl: data.config.viewer_url };
  }

  if (data.hidden) {
    views.hidden = { viewerUrl: data.hidden.viewer_url };
  }

  if (data.live_config) {
    views.liveConfig = { viewerUrl: data.live_config.viewer_url };
  }

  if (data.panel) {
    views.panel = {
      height: data.panel.height,
      viewerUrl: data.panel.viewer_url,
    };
  }

  if (data.video_overlay) {
    views.videoOverlay = { viewerUrl: data.video_overlay.viewer_url };
  }

  if (data.mobile) {
    views.mobile = { viewerUrl: data.mobile.viewer_url };
  }

  if (data.component) {
    views.component = {
      aspectHeight: data.component.aspect_height,
      aspectWidth: data.component.aspect_width,
      size: data.component.size,
      viewerUrl: data.component.viewer_url,
      zoom: data.component.zoom,
      zoomPixels: data.component.zoom_pixels,
    };
  }

  return views;
}

export function fetchExtensionManifest(host, clientId, version, jwt, onSuccess, onError) {
  const api = 'https://' + host + '/kraken/extensions/search';
  return fetch(api, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' +  jwt,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Content-Type': 'application/json',
      'Client-ID': clientId,
    },
    body: JSON.stringify({
      limit: 1,
      searches: [
        {
          field: 'id',
          term: clientId,
        },
        {
          field: 'version',
          term: version,
        }
      ]
    }),
    referrer: 'Twitch Developer Rig',
  }).then((response) => response.json())
    .then((data) => {
      if (data.extensions && data.extensions.length > 0) {
        const manifest = data.extensions[0];
        manifest.views = convertViews(manifest.views);
        onSuccess({manifest: manifest, error: ''});
      } else {
        onError("Unable to retrieve extension manifest, please verify EXT_OWNER_NAME and EXT_SECRET");
      }
  }).catch((error) => {
      onError(error);
  });
}

export function fetchManifest(host, clientId, username, version, channelId, secret, onSuccess, onError) {
  if (!username || !clientId || !version || !channelId || !secret) {
    onError(missingConfigurations({
      'EXT_OWNER_NAME': username,
      'EXT_CLIENT_ID': clientId,
      'EXT_VERSION': version,
      'EXT_CHANNEL': channelId,
      'EXT_SECRET': secret,
    }));
    return null;
  }

  const api = 'https://' + host + '/helix/users?login=' + username;
  return fetch(api, {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
    },
    referrer: 'Twitch Developer Rig',
  }).then((response) => response.json())
    .then((respJson) => {
      const data = respJson.data;
      if (!data && data.length === 0) {
        onError('Unable to verify the id for username: ' + username);
        return null;
      }
      const userId = data[0]['id'];
      onSuccess({userId: userId});

      const token = createSignedToken(RIG_ROLE, '', userId, channelId, secret);
      return fetchExtensionManifest(host, clientId, version, token, onSuccess, onError);
  }).catch((error) => {
      onError(error);
  });
}
