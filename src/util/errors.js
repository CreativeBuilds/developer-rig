export function missingConfigurations(configurations) {
  let msg = 'Missing configurations for rig: ';
  for (let key in configurations) {
    if (!configurations[key]) {
      msg += key + ','
    }
  }
  return msg.slice(0,-1);
}
