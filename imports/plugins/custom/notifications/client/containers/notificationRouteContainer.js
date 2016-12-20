import React, { Component } from "react";
import { composeWithTracker } from "react-komposer";
import { Meteor } from "meteor/meteor";
import { Notifications } from "/lib/collections";
import { NotificationRoute } from "../components";

class NotificationRouteContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <NotificationRoute {...this.props}/>
    );
  }
}

function markAllAsRead(notificationList) {
  notificationList.map((notify) => {
    Meteor.call("notification/markOneAsRead", notify._id);
  });
}

function markOneAsRead(id) {
  Meteor.call("notification/markOneAsRead", id);
}

function handleDelete(id) {
  Meteor.call("notification/delete", id);
}

function composer(props, onData) {
  Meteor.subscribe("Notification", Meteor.userId()).ready();
  const notificationList = Notifications.find({}, {sort: {timeSent: -1}}).fetch();
  const unread = Notifications.find({status: "unread"}).count();

  onData(null, {
    notificationList,
    unread,
    handleDelete,
    markAllAsRead,
    markOneAsRead
  });
}

export default composeWithTracker(composer)(NotificationRouteContainer);
