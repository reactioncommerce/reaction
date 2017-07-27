import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";

const List = ({ children, isAdmin }) => {
  const listClassName = classnames({
    "rui": true,
    "admin": isAdmin,
    "list-group": true
  });

  return (
    <div className={listClassName}>
      {children}
    </div>
  );
};

List.propTypes = {
  children: PropTypes.node,
  isAdmin: PropTypes.bool
};

registerComponent("List", List);

export default List;
