import React from "react";

const Items = ReactionUI.Components.Items;
const classnames = ReactionUI.Lib.classnames;

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

ReactionUI.Components.Separator = Separator;
