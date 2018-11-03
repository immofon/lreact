import sleep from "./sleep";
import ReconnectingWebSocket from "./reconnecting-websocket";

let ws = new ReconnectingWebSocket("ws://39.105.42.45:8100/ws");
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

let _call = (funcname, argv) => {
  return new Promise((resolve, reject) => {
    if (argv == undefined || argv == null) {
      argv = {};
    }
    if (connected) {
      id += 1;
      const token = String(id);
      rtable[token] = ret => {
        if (ret.status == "ok") {
          resolve(ret);
        } else {
          reject(ret);
        }
      };
      ws.send(
        JSON.stringify({
          id: token,
          func: funcname,
          argv: argv
        })
      );
    } else {
      console.log("rpc call to unconnected", funcname, argv);
      reject({
        status: "err",
        details: { err: "unconnected" }
      });
    }
  });
};

async function call(
  funcname,
  argv,
  { retry = 20, interval = 500, log = () => {} }
) {
  log(`call: ${funcname}`);
  for (var i = 0; i < retry; i++) {
    const ret = _call(funcname, argv);
    if (ret.status == "err" && ret.details.unconnected == true) {
      await sleep(interval);
      continue;
    }
    return ret;
  }
}

export default {
  call
};
