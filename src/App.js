import React, { Component } from "react";
//import logo from "./logo.svg";
import "./App.css";

import kv from "./api/kv";
import sleep from "./api/sleep";
import rpc from "./api/rpc";

class Article extends Component {
  render() {
    const title = this.props.title;
    const content = this.props.content;
    return (
      <div>
        <h2>{title}</h2>
        <p>{content}</p>
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.log = this.log.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = { logs: [], id: "$unlogined$", msg: kv.get("msg"), number: 0 };
  }
  onLogin() {
    (async () => {
      try {
        this.log("try login");
        const ret = await rpc.call(
          "login",
          { account: "mofon-admin" },
          { log: this.log }
        );
        this.log(ret);
        const id = await rpc.call("self");
        this.log(id);
      } catch (ret) {
        this.setState({ id: JSON.stringify(ret) });
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
  onChange(e) {
    const msg = e.target.value;
    kv.set("msg", msg);
    this.setState({ msg });
  }
  render() {
    const number = this.state.number;
    const msg = this.state.msg;
    const logs = this.state.logs;
    const onChange = this.onChange;
    const onLogin = this.onLogin;

    return (
      <div>
        <p>{number}</p>
        <button onClick={onLogin}>login</button>
        <code>{JSON.stringify(this.state, null, 2)}</code>
        <br />
        <ul>
          {logs.map(m => {
            return <li>{m}</li>;
          })}
        </ul>
        <input value={msg} onChange={onChange} />
        <p>{msg}</p>
        <Article title={"English P56"} content={msg} />
      </div>
    );
  }
}

export default App;
