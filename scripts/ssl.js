function generateFakeCert() {
  const signer = require("selfsigned");
  const attrs = [
    { name: "commonName", value: "localhost.rig.twitch.tv" }
  ];
  return signer.generate(attrs, {
    keySize: 2048,
    algorithm: "sha256",
    days: 365,
    extensions: [
      {
        name: "basicConstraints",
        cA: true
      },
      { name: "subjectAltName",
        altNames: [
          {
            type: 2, // DNS
            value: "localhost.rig.twitch.tv"
          }
        ]
      }
    ]
  });
}

//Need root path, port, cache, ssl keys,
if (require.main === module) {
  const fs = require("fs");
  const shell = require('shelljs');
  const rigDir = process.cwd();
  const certPath = rigDir + "/ssl/selfsigned.crt";
  const keyPath = rigDir + "/ssl/selfsigned.key";
  if (!fs.existsSync(certPath)) {
    console.log("Generate SSL cert at " + certPath);
    const pems = generateFakeCert()
    fs.writeFileSync(certPath, pems.cert, { encoding: 'utf-8' });
    fs.writeFileSync(keyPath, pems.private, { encoding: 'utf-8' });
    if (process.platform === "darwin") {
      shell.exec('./scripts/trust_cert_mac.sh ssl/selfsigned.crt');
    } else {
      console.log("Please install the cert into your cert manager found at ssl/selfsigned.crt");
    }
} else {
    console.log("SSL Cert already exists at " + certPath);
  }
}
