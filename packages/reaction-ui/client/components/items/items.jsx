const classnames = ReactionUI.Lib.classnames;
const Item = ReactionUI.Components.Item;
const SortableItems = ReactionUI.Components.SortableItems;
const Sortable = ReactionUI.Lib.Sortable;
const ReactDOM = ReactionUI.Lib.ReactDOM;

class Items extends React.Component {
  displayName = "Items"

  componentDidMount() {
    if (this.props.sortable) {
      const list = ReactDOM.findDOMNode(this.refs.items)
      this.sortable = Sortable.create(list)
    }
  }

  renderItems() {
    if (this.props.children) {
      const items = React.Children.map(this.props.children, (child, index) => {
        if (this.props.autoWrap) {
          return (
            <Item key={index} sortable={this.props.sortable}>
              {React.cloneElement(child)}
            </Item>
          );
        }

        return React.cloneElement(child);
      });

      return items;
    }
  }

  render() {
    const classes = classnames({
      rui: true,
      items: true,

      flex: this.props.static === false,
      [`${this.props.direction}`]: true
    });

    // if (this.props.sortable) {
    //   return (
    //     <SortableItems model={this.props.sortableModel} onSort={this.props.onSort}>
    //       {this.renderItems()}
    //     </SortableItems>
    //   )
    // }

    return (
      <div className={classes} ref="items">
        {this.renderItems()}
      </div>
    );
  }
}

Items.defaultProps = {
  autoWrap: false,
  static: false,
  vertical: false,
  horizontal: true,
  sortable: false
};

Items.propTypes = {
  autoWrap: React.PropTypes.bool.isRequired,
  children: React.PropTypes.node,
  direction: React.PropTypes.oneOf(["vertical", "horizontal"]),
  sortable: React.PropTypes.bool,
  static: React.PropTypes.bool.isRequired
};

ReactionUI.Components.Items = Items;
