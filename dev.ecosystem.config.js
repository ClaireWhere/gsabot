module.exports = {
  apps : [{
    name          : "GSA Bot",
    script        : "./client/index.js",
    restart_delay : 5000,
    max_restarts  : 3,
    ignore_watch  : ["**/node_modules/", "**/logs/", "**/data/"],
    wait_ready    : true,
    watch         : true,
    time          : true,
  },
  {
    name          : "GSA Web Server",
    script        : "./server/index.js",
    restart_delay : 5000,
    max_restarts  : 3,
    ignore_watch  : ["node_modules", "logs", "data", ""],
    wait_ready    : true,
    watch         : true,
    time          : true,
  }]
}
