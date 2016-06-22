import React from "react";
import classnames from "classnames";

class Separator extends React.Component {

  render() {
    const classes = classnames({
      rui: true,
      separator: true,
      labeled: this.props.label
    });


    if (this.props.label) {
      return (
        <div className={classes}>
          <hr />
          <span className="label">{this.props.label}</span>
          <hr />
        </div>
      );
    }

    return (
      <hr className={classes} />
    );
  }
}

export default Separator;
