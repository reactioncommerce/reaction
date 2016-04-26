import React from "react";
import classnames from "classnames";

class Icon extends React.Component {
  render() {
    let classes;

    if (this.props.icon) {
      if (this.props.icon.indexOf("icon-") === 0) {
        classes = this.props.icon;
      } else {
        classes = classnames({
          fa: true,
          [`fa-${this.props.icon}`]: true
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
