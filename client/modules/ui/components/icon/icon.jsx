import React from "react";
import classnames from "classnames";

class Icon extends React.Component {
  render() {
    const { icon } = this.props;
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

    return (
      <i className={classes} />
    );
  }
}

Icon.propTypes = {
  icon: React.PropTypes.string.isRequired
};

export default Icon;
