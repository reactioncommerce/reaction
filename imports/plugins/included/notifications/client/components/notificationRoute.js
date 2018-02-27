import React, { Component } from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Components, withMoment, registerComponent } from "@reactioncommerce/reaction-components";
import { Link } from "@reactioncommerce/reaction-router";

class NotificationRoute extends Component {
  handleNoNotifications = (notifyArr) => {
    if (notifyArr.length <= 0) {
      return (
        <li className="notification">
          <div className="media">
            <div className="media-body">
              <strong className="notification-title" data-i18n="notifications.body.noNotifcations">No notifications yet</strong>
            </div>
          </div>
        </li>
      );
    }
    return null;
  }

  handleClick = (event, notify) => {
    if (notify.type === "forAdmin") {
      const actionViewData = Reaction.Apps({
        name: "reaction-orders",
        provides: "dashboard"
      });
      Reaction.showActionView(actionViewData);
    } else {
      Reaction.Router.go(notify.url);
    }

    const { markOneAsRead } = this.props;
    return markOneAsRead(notify._id);
  }

  handleMarkAllAsRead = () => {
    const { notificationList, markAllAsRead } = this.props;
    markAllAsRead(notificationList);
  }

  renderDropdownHead() {
    const { unread } = this.props;
    return (
      <div className="dropdown-toolbar">
        <h3 className="dropdown-toolbar-title"><span data-i18n="notifications.body.recent">Recent</span> ({unread})</h3>
        <div className="dropdown-toolbar-actions">
          <Components.Button
            label={"Mark all as read"}
            i18nKeyLabel={"notifications.body.markAllAsRead"}
            onClick={this.handleMarkAllAsRead}
          />
        </div>
      </div>
    );
  }

  render() {
    const { moment, notificationList } = this.props;
    return (
      <div className="notify-bar">
        { this.renderDropdownHead() }
        <div className="dropdown-notify notifications">
          { this.handleNoNotifications(notificationList) }
          { notificationList.map((notify, key) => {
            const timeNow = (moment && moment(notify.timeSent).fromNow()) || notify.timeSent.toLocaleString();
            const read = `notification ${notify.status}`;
            const i18n = `notifications.messages.${notify.type}`;
            return (
              <Components.ListItem
                key={key}
                listItemClassName={read}
                onClick={this.handleClick}
                value={notify}
              >
                <div className="media">
                  <div className="media-body">
                    <strong className="notification-title" data-i18n={i18n}>{notify.message}</strong>
                    <div className="notification-meta">
                      <small className="timestamp">{timeNow}</small>
                    </div>
                  </div>
                </div>
              </Components.ListItem>
            );
          })}
        </div>
        {this.props.showViewAll &&
          <div className="dropdown-footer text-center">
            <Link to="/notifications" data-i18n="notifications.body.viewAll">View All</Link>
          </div>
        }
      </div>
    );
  }
}

NotificationRoute.propTypes = {
  markAllAsRead: PropTypes.func,
  markOneAsRead: PropTypes.func,
  moment: PropTypes.func,
  notificationList: PropTypes.array,
  showViewAll: PropTypes.bool,
  unread: PropTypes.number
};

registerComponent("NotificationRoute", NotificationRoute, withMoment);
export default withMoment(NotificationRoute);
