const classnames = ReactionUI.Lib.classnames;

class VariantSelector extends React.Component {
  diplsyName: "Variant Selector"

  props = {
    variants: []
  }

  state = {
    listLayout: "list"
  }

  componentWillReceiveProps = (props) => {
    const variants = props.variants;
    let listLayout = "list";

    if (variants.length <= this.props.shortListLimit) {
      listLayout = this.props.shortListLayout;
    } else if (variants.length <= this.props.mediumListLimit) {
      listLayout = this.props.mediumListLayout;
    } else {
      listLayout = this.props.longListLayout;
    }

    this.setState({
      listLayout: `${listLayout}`
    });
  }

  renderVariant() {
    return this.props.variants.map((variant, index) => {
      return (
        <Variant
          key={index}
          variant={variant}
          editable={this.props.editable}
          layout={this.state.listLayout}
        />
      );
    });
  }

  renderFlatList() {
    return (
      <div className="rui variants list">
        {this.renderVariant()}
      </div>
    );
  }

  render() {
    const variants = this.props.variants;

    const classes = classnames({
      rsp: true,
      variants: true,

      [`${this.state.listLayout}`]: true
    });

    return (
      <div className={classes}>
        {this.renderVariant()}
      </div>
    );
  }
}

VariantSelector.defaultProps = {
  editable: false,
  shortListLimit: 1,
  shortListLayout: "list",
  mediumListLimit: 20,
  mediumListLayout: "grid",
  longListLimit: 0,
  longListLayout: "dropdown",
  defaultListLayout: "list"
};

VariantSelector.propTypes = {
  defaultListLayout: React.PropTypes.oneOf(["list", "grid", "dropdown"]),
  editable: React.PropTypes.bool.isRequired,
  longListLayout: React.PropTypes.oneOf(["list", "grid", "dropdown"]),
  longListLimit: React.PropTypes.number.isRequired,
  mediumListLayout: React.PropTypes.oneOf(["list", "grid", "dropdown"]),
  mediumListLimit: React.PropTypes.number.isRequired,
  shortListLayout: React.PropTypes.oneOf(["list", "grid", "dropdown"]),
  shortListLimit: React.PropTypes.number.isRequired,
  variants: React.PropTypes.array.isRequired
};

ReactionProductSimple.Components.VariantSelector = VariantSelector;
