import React, { Component } from "react";
//import logo from "./logo.svg";

import "antd";
import "antd/dist/antd.css";
import {
  Toast,
  Button,
  WingBlank,
  WhiteSpace,
  InputItem,
  ActivityIndicator,
  Modal
} from "antd-mobile";
import "antd-mobile/dist/antd-mobile.css";

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
    this.onChangeInput = this.onChangeInput.bind(this);
    this.state = {
      msg: "",
      logs: [],
      user: {
        id: "",
        authed: false,
        input: {
          account: "test",
          password: ""
        }
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
  onChangeInput(v) {
    this.setState({ user: { input: { password: v } } });
  }
  onLogin() {
    (async () => {
      const log = this.log;
      try {
        const ret = await rpc.call("login", { account: "mofon-admin" });
        this.setState({
          user: {
            authed: true,
            id: ret.id
          }
        });
      } catch (ret) {
        if (rpc.needAuth(ret)) {
          Toast.fail("you need auth first");
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
    const $ = this.state;
    const msg = this.state.msg;
    const logs = this.state.logs;
    const onLogin = this.onLogin;
    const onSelf = this.onSelf;
    const onChangeInput = this.onChangeInput;

    return (
      <div>
        <br />
        <p>{msg}</p>
        <code>{JSON.stringify(this.state, null, 2)}</code>
        <br />
        <ul>
          {logs.map(m => {
            return <li>{m}</li>;
          })}
        </ul>
        <br />
        <Modal
          title={"login"}
          visible={!this.state.user.authed}
          transparent={true}
        >
          <InputItem value={"test"} placeholder="account" />
          <InputItem
            format="password"
            value={$.user.input.password}
            onChange={onChangeInput}
            placeholder="password"
          />
          <WhiteSpace />
          <WhiteSpace />
          <WingBlank>
            <Button>login</Button>
          </WingBlank>
        </Modal>
        <ActivityIndicator
          animating={!this.state.rpc.connected}
          toast
          text="正在连接"
        />
      </div>
    );
  }
}

export default App;
