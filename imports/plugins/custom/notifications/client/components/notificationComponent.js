import React, { Component, PropTypes } from "react";
import NotificationDropdown from "./notificationDropdown.js";
import "../styles/main.less";
import "../styles/dropdown.css";

class Notification extends Component {
  constructor(props) {
    super(props);

    this.handleBtn = this.handleBtn.bind(this);
  }

  handleBtn(unread) {
    if (unread) {
      return (
        <button className="btn btn-default notify-btn rui button flat">
            <i className="rui fa fa-bell" />
            <span className="badge notify-icon badge-red">{ unread }</span>
        </button>
      );
    }
    return (
      <button className="btn btn-default rui button flat">
          <i className="rui fa fa-bell" />
      </button>
    );
  }

  render() {
    return (
      <div className="dropdown">
        <div className="notification-icon" data-toggle="dropdown">
          { this.handleBtn() }
        </div>
        <div className="notify-drop dropdown-menu">
          <NotificationDropdown />
        </div>
      </div>
    );
  }
}

export default Notification;
