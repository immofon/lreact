import React, { Component } from "react";
//import logo from "./logo.svg";
import "./App.css";

import kv from "./api/kv";
import sleep from "./api/sleep";
import rpc from "./api/rpc";

class App extends Component {
  constructor(props) {
    super(props);
    this.log = this.log.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onSelf = this.onSelf.bind(this);
    this.update = this.update.bind(this);
    this.state = {
      msg: "",
      logs: [],
      user: {
        id: "",
        authed: false
      },
      rpc: {
        connected: false
      }
    };

    this.updater = setInterval(() => {
      this.update();
    }, 100);
  }
  update() {
    this.setState({ rpc: { connected: rpc.connected() } });
  }
  onLogin() {
    (async () => {
      const log = this.log;
      try {
        const ret = await rpc.call(
          "login",
          { account: "mofon-admin" }
          //          { log: this.log }
        );
        this.setState({
          user: {
            authed: true,
            id: ret.id
          }
        });
      } catch (ret) {
        if (rpc.needAuth(ret)) {
          log("you need auth first");
        }
        log(ret);
      }
    })();
  }
  onSelf() {
    const setState = this.setState;
    (async () => {
      try {
        const ret = await rpc.call("self");
        this.log(ret);
      } catch (e) {
        if (rpc.needAuth(e)) {
          this.setState({ msg: "you need auth first" });
        } else {
          throw e;
        }
      }
    })();
  }
  log(msg) {
    if (typeof msg == "object") {
      msg = JSON.stringify(msg);
    }
    let logs = this.state.logs;
    logs.push(msg);
    this.setState({ logs });
  }
  render() {
    const msg = this.state.msg;
    const logs = this.state.logs;
    const onLogin = this.onLogin;
    const onSelf = this.onSelf;

    return (
      <div>
        <p>{msg}</p>
        <button onClick={onLogin}>login</button>
        <button onClick={onSelf}>Self</button>
        <code>{JSON.stringify(this.state, null, 2)}</code>
        <br />
        <ul>
          {logs.map(m => {
            return <li>{m}</li>;
          })}
        </ul>
        <br />
      </div>
    );
  }
}

export default App;
