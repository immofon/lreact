import React, { Component } from "react";
//import logo from "./logo.svg";

import "antd";
import "antd/dist/antd.css";
import { Button, Modal } from "antd-mobile";
import "antd-mobile/dist/antd-mobile.css";

class ErrorPage extends Component {
  onRefresh() {
    window.location.reload();
  }
  render() {
    let msg = this.props.msg;
    if (typeof msg != "string" || msg == "") {
      msg = "thers is something wrong";
    }

    return (
      <div>
        <p> {this.props.msg} </p>
        <Button onClick={this.onRefresh}>Refresh</Button>
      </div>
    );
  }
}

export default ErrorPage;
