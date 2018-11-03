import sleep from "./sleep";
import ReconnectingWebSocket from "./reconnecting-websocket";

let ws = new ReconnectingWebSocket("ws://39.105.42.45:8100/ws", null, {
  maxReconnectInterval: 3000,
  reconnectDecay: 1.0
});
let connected = false;
let rtable = {}; // return table
let id = 1;

ws.onopen = () => {
  connected = true;
};
ws.onclose = () => {
  connected = false;
  rtable = {};
  id = 1;
};
ws.onmessage = evt => {
  const ret = JSON.parse(evt.data);
  if (ret.details["__debug"]) {
    console.debug("#ws# " + ret.details.__debug, ret);
  }

  const callback = rtable[ret.id];
  if (typeof callback == "function") {
    callback(ret);
    delete rtable[ret.id];
  }
};

function call(funcname, argv, options) {
  if (argv == undefined || argv == null) {
    argv = {};
  }
  if (typeof options != "object") {
    options = {};
  }

  const log = options.log || (() => {});

  id++;
  const req_id = String(id);
  return new Promise(async (resolve, reject) => {
    for (var i = 0; i < 100000000 && !connected; i++) {
      await sleep(100);
    }

    log({ req_id });
    if (connected) {
      log({ req_id });
      rtable[req_id] = ret => {
        log({ ret });
        if (ret.status == "ok") {
          resolve(ret);
        } else {
          reject(ret);
        }
      };
      ws.send(
        JSON.stringify({
          id: req_id,
          func: funcname,
          argv: argv
        })
      );

      log("sent");
    } else {
      reject({
        status: "err",
        details: { err: "unconnected" }
      });
    }
  });
}

function ok(ret) {
  if (ret.status === "ok") {
    return true;
  }
  return false;
}

export default {
  call,
  ok,
  needAuth: ret => {
    if (!ok(ret) && ret.details.err == "require-auth") {
      return true;
    }
    return false;
  },
  connected: () => {
    return connected;
  }
};
