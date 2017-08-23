import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { registerComponent } from "@reactioncommerce/reaction-components";

const Icon = ({ className, icon, style }) => {
  let classes;

  if (icon) {
    if (icon.indexOf("icon-") === 0 || icon.indexOf("fa") >= 0) {
      classes = icon;
    } else {
      classes = classnames({
        fa: true,
        [`fa-${icon}`]: true
      });
    }
  }

  classes = classnames({
    "rui": true,
    "font-icon": true
  }, classes, className);

  return (
    <i style={style} className={classes} />
  );
};

Icon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  icon: PropTypes.string.isRequired,
  style: PropTypes.object
};

registerComponent("Icon", Icon);

export default Icon;
