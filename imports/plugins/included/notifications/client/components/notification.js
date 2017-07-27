import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import "../styles/main.less";
import "../styles/dropdown.css";

class Notification extends Component {
  constructor(props) {
    super(props);

    this.renderButton = this.renderButton.bind(this);
  }

  renderButton(unread) {
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
          {this.renderButton(unread)}
        </div>
        <div className="notify-drop dropdown-menu">
          <Components.NotificationDropdown
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

Notification.propTypes = {
  handleDelete: PropTypes.func,
  markAllAsRead: PropTypes.func,
  markOneAsRead: PropTypes.func,
  notificationList: PropTypes.array,
  unread: PropTypes.number
};

export default Notification;
