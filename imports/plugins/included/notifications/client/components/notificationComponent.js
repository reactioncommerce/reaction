import React, { Component, PropTypes } from "react";
import NotificationDropdown from "./notificationDropdown.js";
import "../styles/main.less";
import "../styles/dropdown.css";

class NotificationComponent extends Component {
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
    const { notificationList, handleDelete, unread, markOneAsRead, markAllAsRead } = this.props;
    return (
      <div className="dropdown">
        <div className="notification-icon" data-toggle="dropdown">
          { this.handleBtn(unread) }
        </div>
        <div className="notify-drop dropdown-menu">
          <NotificationDropdown
            notificationList={notificationList}
            unread={unread}
            handleDelete={handleDelete}
            markAllAsRead={markAllAsRead}
            markOneAsRead={markOneAsRead}
          />
        </div>
      </div>
    );
  }
}

NotificationComponent.propTypes = {
  handleDelete: PropTypes.func,
  markAllAsRead: PropTypes.func,
  markOneAsRead: PropTypes.func,
  notificationList: PropTypes.array,
  unread: PropTypes.number
};

export default NotificationComponent;
