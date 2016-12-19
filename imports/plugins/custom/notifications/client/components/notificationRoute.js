import React, { Component, PropTypes } from "react";
import moment from "moment";


class NotificationRoute extends Component {
  constructor(props) {
    super(props);

    this.handleNoNotifications = this.handleNoNotifications.bind(this);
    this.renderDropdownHead = this.renderDropdownHead.bind(this);
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

  renderDropdownHead() {
    const { notificationList, unread, markAllAsRead } = this.props;
    return (
        <div className="dropdown-toolbar">
            <div className="dropdown-toolbar-actions">
                <a onClick={() => {
                  markAllAsRead(notificationList);
                }}
                > Mark all as read</a>
            </div>
            <h3 className="dropdown-toolbar-title">Recent ({unread})</h3>
        </div>
    );
  }

  render() {
    const { notificationList } = this.props;
    return (
        <div className="notify-bar">
            { this.renderDropdownHead() }
             <ul className="dropdown-notify notifications">
                { this.handleNoNotifications(notificationList) }
                { notificationList.map((notify, key) => {
                  const timeNow = moment(notify.timeSent).fromNow();
                  const read = `notification ${notify.status}`;
                  return (
                        <li className={read} key={key}>
                            <a href={notify.url} onClick={() => {
                              this.handleClick(notify);
                            }}
                            >
                                <div className="media">
                                    <div className="media-body">
                                    <strong className="notification-title">{notify.message}</strong>
                                    <div className="notification-meta">
                                        <small className="timestamp">{timeNow}</small>
                                    </div>
                                    </div>
                                </div>
                            </a>
                        </li>
                  );
                })}
             </ul>
        </div>
    );
  }
}

NotificationRoute.propTypes = {
  handleDelete: PropTypes.func,
  markAllAsRead: PropTypes.func,
  markOneAsRead: PropTypes.func,
  notificationList: PropTypes.array,
  unread: PropTypes.number
};

export default NotificationRoute;
