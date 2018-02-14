import React from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const NotificationDropdown = (props) => (
  <Components.NotificationRoute
    {...props}
    showViewAll={true}
  />
);

NotificationDropdown.propTypes = {
  markAllAsRead: PropTypes.func.isRequired,
  markOneAsRead: PropTypes.func.isRequired,
  moment: PropTypes.func,
  notificationList: PropTypes.array.isRequired,
  unread: PropTypes.number.isRequired
};

registerComponent("NotificationDropdown", NotificationDropdown);

export default NotificationDropdown;
