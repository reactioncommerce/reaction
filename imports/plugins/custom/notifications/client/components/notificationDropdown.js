import React, { Component } from "react";
import { Meteor } from "meteor/meteor";


class NotificationDropdown extends Component {
  constructor(props) {
    super(props);
    this.handleNoNotifications = this.handleNoNotifications.bind(this);
    this.handleRenderNotifications = this.handleRenderNotifications.bind(this);
  }

  handleNoNotifications(notifyArr) {
    if (notifyArr.length <= 0) {
      return (
          <li className="notification">
              <div className="media">
                 <div className="media-body">
                    <strong className="notification-title">No notifications yet</strong>
                 </div>
              </div>
          </li>
      );
    }
    return null;
  }

  handleRenderNotifications(notifyArr) {
    if (notifyArr) {
      notifyArr.map((notify) => {
        return (
            <li className="notification">
                <a onClick={this.handleStatus()}>
                <div className="media">
                    <div className="media-body">
                       <strong className="notification-title">{notify.message}</strong>
                       <div className="notification-meta">
                          <small className="timestamp">{notify.time}</small>
                       </div>
                    </div>
                </div>
                </a>
            </li>
        );
      });
    }
  }

  handleStatus() {
    const type = "orderAccepted";
    const userId = "16278903912";
    const url = "/juice";
    const details = "You should think twice";
    const sms = true;

    Meteor.call("notification/send", type, userId, url, sms, details, (err, res) => {
        console.log(err);
        console.log(res);
    });
  }

  render() {
    const arr = [
      {
        message: "Your wallet has been credited.",
        time: "5 mins Ago"
      },
    //   {
    //     message: "Your order has been cancelled.",
    //     time: "5 mins Ago"
    //   },
    //   {
    //     message: "Your order has been cancelled.",
    //     time: "5 mins Ago"
    //   }
    ];
    return (
        <div className="notify-bar">
            <div className="dropdown-toolbar">
                <div className="dropdown-toolbar-actions">
                    <a onClick={this.handleStatus()}> Mark all as read</a>
                </div>
                <h3 className="dropdown-toolbar-title">Recent (0)</h3>
            </div>
             <ul className="dropdown-notify notifications">
                { this.handleNoNotifications(arr) }
                { this.handleRenderNotifications(arr) }
                { arr.map((notify, key) => {
                  return (
                        <li className="notification" key={key}>
                            <div className="media">
                                <div className="media-body">
                                <strong className="notification-title">{notify.message}</strong>
                                <div className="notification-meta">
                                    <small className="timestamp">{notify.time}</small>
                                </div>
                                </div>
                            </div>
                        </li>
                  );
                })}
             </ul>
             <div className="dropdown-footer text-center">
                 <a href="/notifications">View All</a>
             </div>
        </div>
    );
  }
}

export default NotificationDropdown;
