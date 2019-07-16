import React, { Children, Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class DropDownMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: undefined,
      isOpen: false
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.isControlled) {
      this.setState({
        isOpen: nextProps.isOpen
      });
    }
  }

  handleDropdownToggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  get isOpen() {
    return this.props.isOpen || this.state.isOpen;
  }

  get isControlled() {
    return typeof this.props.isOpen === "boolean";
  }

  handleMenuItemChange = (event, value, menuItem) => {
    this.setState({
      label: menuItem.props.label || value,
      isOpen: false
    });

    if (this.props.closeOnClick) {
      this.handleOpen(false);
    }

    if (this.props.onChange) {
      this.props.onChange(event, value);
    }
  }

  handleOpen = (isOpen) => {
    if (this.isControlled) {
      if (this.props.onRequestOpen) {
        this.props.onRequestOpen(isOpen);
      }
    } else {
      this.setState({
        isOpen
      });
    }
  }

  get label() {
    let { label } = this.state;
    Children.forEach(this.props.children, (element) => {
      if (element.props.value === this.props.value) {
        ({ label } = element.props);
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
      <Components.Popover
        attachment={this.props.attachment}
        buttonElement={
          this.props.buttonElement ||
          <Components.Button
            icon="fa fa-chevron-down"
            iconAfter={true}
            label={this.label}
          />
        }
        constraints={this.props.constraints}
        isOpen={this.isOpen}
        onClick={this.handleDropdownToggle}
        onRequestOpen={this.handleOpen}
        targetAttachment={this.props.targetAttachment}
      >
        <Components.Menu
          className={this.props.className}
          menuClassName={this.props.menuClassName}
          value={this.props.value}
          onChange={this.handleMenuItemChange}
          style={this.props.menuStyle}
          isClickable={this.props.isClickable}
        >
          {this.props.children}
        </Components.Menu>
      </Components.Popover>
    );
  }
}

DropDownMenu.propTypes = {
  attachment: PropTypes.string,
  buttonElement: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  closeOnClick: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  constraints: PropTypes.array,
  isClickable: PropTypes.bool,
  isEnabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  menuClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  menuStyle: PropTypes.object,
  onChange: PropTypes.func,
  onPublishClick: PropTypes.func,
  onRequestOpen: PropTypes.func,
  revisions: PropTypes.arrayOf(PropTypes.object),
  targetAttachment: PropTypes.string,
  translation: PropTypes.shape({
    lang: PropTypes.string
  }),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number])
};

registerComponent("DropDownMenu", DropDownMenu);

export default DropDownMenu;
