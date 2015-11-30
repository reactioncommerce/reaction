const Button = ReactionUI.Components.Button;
const classnames = ReactionUI.Lib.classnames;

class Item extends React.Component {


  renderSortableHandle() {
    if (this.props.sortable) {
      return <Button className="handle" type="button" icon="bars" />
    }
  }

  render() {
    const classes = classnames({
      rui: true,
      item: true,

      half: this.props.size === "half",
      full: this.props.size === "full",
      // [`item-${this.props.type}`]: true
    });

    //

    return (
      <div className={classes}>
        {this.renderSortableHandle()}
        {this.props.children}
      </div>
    );
  }
}

Item.defaultProps = {
  type: "default",
  sortable: false
};

Item.propTypes = {
  sortable: React.PropTypes.bool,
  type: React.PropTypes.string
};

ReactionUI.Components.Item = Item;
