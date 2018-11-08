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

import ErrorPage from "./view/ErrorPage";

import kv from "./api/kv";
import sleep from "./api/sleep";
import rpc from "./api/rpc";

import { maskPassword } from "./utils";

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
        name: "",
        role: "",
        input: {
          account: "",
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
    /*
			 this.setState(t => {
			 t.rpc.connected = rpc.connected();
			 });
			 */
    this.setState({ rpc: { connected: rpc.connected() } });
  }
  onChangeInput(fn) {
    return v => {
      this.setState($ => {
        fn($, v);
      });
    };
  }
  onLogin() {
    const $ = this.state;

    (async () => {
      const log = this.log;
      try {
        const ret = await rpc.call("login", {
          account: $.user.input.account,
          password: $.user.input.password
        });
        this.setState(t => {
          t.user.authed = true;
          t.user.id = ret.details.id;
          t.user.name = ret.details.name;
          t.user.role = ret.details.role;
        });
      } catch (ret) {
        if (rpc.needAuth(ret)) {
          this.setState(t => {
            t.user.authed = false;
          });
        }
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

    const account = this.state.user.input.account;
    const password = this.state.user.input.password;

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
        <ErrorPage msg="try" />
        <br />
        <Modal
          title={"login"}
          visible={!this.state.user.authed}
          transparent={true}
        >
          <InputItem
            value={account}
            onChange={onChangeInput(($, v) => {
              $.user.input.account = v;
            })}
          >
            学号
          </InputItem>
          <InputItem
            format="password"
            clear
            value={password}
            onChange={onChangeInput(($, v) => {
              $.user.input.password = v;
            })}
          >
            密码
          </InputItem>
          <WhiteSpace />
          <WhiteSpace />
          <WingBlank>
            <Button onClick={onLogin}>login</Button>
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
