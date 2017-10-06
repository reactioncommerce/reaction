import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";

const List = ({ children, isAdmin, className }) => {
  const listClassName = classnames({
    "rui": true,
    "admin": isAdmin,
    "list-group": true
  }, className);

  return (
    <div className={listClassName}>
      {children}
    </div>
  );
};

List.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isAdmin: PropTypes.bool
};

registerComponent("List", List);

export default List;
