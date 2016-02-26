const classnames = ReactionUI.Lib.classnames;

const Icon = React.createClass({
  propTypes: {
    icon: React.PropTypes.string.isRequired
  },

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
});

ReactionUI.Components.Icon = Icon;
