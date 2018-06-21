import { ViewerTypes } from '../constants/viewer-types';
import { RIG_ROLE } from '../constants/rig';
import jwt from 'jsonwebtoken';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const idSource = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const idLength = 15;

function generateOpaqueID() {
  let id = '';
  for (let i = 0; i < idLength; i++) {
    id += idSource.charAt(Math.floor(Math.random() * idSource.length));
  }
  return id;
}

export function createToken(newRole, isLinked, ownerID, channelId, secret, opaqueId) {
  const opaque = opaqueId ? opaqueId : generateOpaqueID();
  switch (newRole) {
    case ViewerTypes.LoggedOut:
      return createSignedToken('viewer', 'ARIG' + opaque, '', channelId, secret)
    case ViewerTypes.LoggedIn:
      if (isLinked) {
        return createSignedToken('viewer', 'URIG' + opaque, 'RIG'+ownerID, channelId, secret)
      } else {
        return createSignedToken('viewer', 'URIG' + opaque, '', channelId, secret)
      }
    case ViewerTypes.Broadcaster:
      return createSignedToken('broadcaster', 'URIG' + opaque, 'RIG' + ownerID, channelId, secret)
    default:
      return createSignedToken(RIG_ROLE, 'ARIG' + opaque, '', channelId, secret);
  }
}

export function createSignedToken(role, opaqueUserId, userId, channelId, secret) {
  let pubsub_perms = {
      listen: ['broadcast', 'global'],
  }
  if (role === 'broadcaster' ) {
    pubsub_perms.send = ['broadcast']
  } else if (role === RIG_ROLE) {
    pubsub_perms.send = ['*']
    pubsub_perms.listen = ['*']
  }

  const payload = {
    exp: Math.floor(((Date.now() + ONE_YEAR_MS) / 1000)),
    opaque_user_id: opaqueUserId,
    channel_id: channelId,
    role: role,
    pubsub_perms: pubsub_perms,
  };

  if (userId !== '') {
    payload['user_id'] = userId;
  }

  return jwt.sign(payload, new Buffer(secret, 'base64'), { algorithm: 'HS256' });
}
