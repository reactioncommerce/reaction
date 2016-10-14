import React, { Children, Component, PropTypes } from "react";
import {
  Button,
  Menu,
  Popover
} from "../";

class DropDownMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: undefined
    };
  }

  handleMenuItemChange = (event, value, menuItem) => {
    this.setState({
      label: menuItem.props.label || value
    });

    if (this.props.onChange) {
      this.props.onChange(event, value);
    }
  }

  get label() {
    let label = this.state.label;
    Children.forEach(this.props.children, (element) => {
      if (element.props.value === this.props.value) {
        label = element.props.label;
      }
    });

    if (!label) {
      const children = Children.toArray(this.props.children);
      if (children.length) {
        return children[0].props.label;
      }
    }

    return label;
  }

  render() {
    return (
      <Popover
        buttonElement={
          <Button
            icon="fa fa-chevron-down"
            iconAfter={true}
            label={this.label}
          />
        }
      >
        <Menu value={this.props.value} onChange={this.handleMenuItemChange}>
          {this.props.children}
        </Menu>
      </Popover>
    );
  }
}

DropDownMenu.propTypes = {
  children: PropTypes.node,
  isEnabled: PropTypes.bool,
  onChange: PropTypes.func,
  onPublishClick: PropTypes.func,
  revisions: PropTypes.arrayOf(PropTypes.object),
  translation: PropTypes.shape({
    lang: PropTypes.string
  }),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
};

export default DropDownMenu;
