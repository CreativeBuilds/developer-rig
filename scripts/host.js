const http = require("http-server");

const optionDefinitions = [
  { name: "local_dir", alias: "l", type: String },
  { name: "port", alias: "p", type: Number, defaultValue: 8080 },
  { name: "help", alias: "h" },
]

function usageAndExit() {
  console.log("Usage: node host.js -l [local_dir] -p [port]")
  process.exit(0)
}

function logRequest(req, res, error) {
  const date = "[" + new Date().toUTCString() + "]";
  const requestLog = "\"" + req.method + " " + req.url + "\""
  if (error) {
    console.log(date + "ERROR: " + requestLog);
    console.log(error);
  } else {
    console.log(date + " - " + requestLog);
  }
}

if (require.main === module) {
  const cli = require("command-line-args");
  const args = cli(optionDefinitions);
  if (args["local_dir"] === undefined || "help" in args) {
    usageAndExit();
  }

  const root = args["local_dir"];
  const port = args["port"];
  const options = {
    host: 'localhost.rig.twitch.tv',
    root: root,
    cache: -1,
    https: {
      cert: "./ssl/selfsigned.crt",
      key: "./ssl/selfsigned.key"
    },
    cors:["*"],
    logFn: logRequest,
  };

  const server = http.createServer(options)
  server.listen(port, function() {
    console.log("Serving assets from https://" + options.host + ":" + port);
  });
}
