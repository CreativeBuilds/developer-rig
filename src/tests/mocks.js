
export function mockFetchForManifest() {
  var p = new Promise((resolve, reject) => {
    resolve({
      ok: true,
      json: function () {
        return {
          data: [
            {
              id: '0',
            }
          ]
        }
      }
    });
  });
  return p;
}

export function mockFetchErrorForManifest() {
  var p = new Promise((resolve, reject) => {
    resolve({
      ok: false
    });
  });
  return p;
}

export function mockFetchForExtensionManifest() {
  var p = new Promise((resolve, reject) => {
    resolve({
      ok: true,
      json: function () {
        return {
          extensions: [
            {
              version: 1,
              id: "clientid",
              views: {}
            }
          ]
        }
      }
    });
  });
  return p;
}

export function mockFetchError() {
  var p = new Promise((resolve, reject) => {
    resolve({
      ok: false,
    });
  });
  return p;
}
