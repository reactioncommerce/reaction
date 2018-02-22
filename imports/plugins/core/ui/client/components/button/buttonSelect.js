import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import Button from "./button.jsx";

class ButtonSelect extends Component {
  static propTypes = {
    buttons: PropTypes.array,
    currentButton: PropTypes.node,
    defaultButton: PropTypes.object,
    defaultNonActiveButtons: PropTypes.array,
    nonActiveButtons: PropTypes.array
  }

  state = {
    toggle: "hidden",
    currentButton: {},
    buttons: [],
    activeButton: "",
    nonActiveButtons: [],
    defaultBgClassNames: "",
    toggleIcon: classnames({ "fa": true, "fa-chevron-down": true, "text-center": true, "fa-icon": true }),
    toggleClassNames: classnames({ "button-dropdown": true, "hidden": true })
  }

  componentWillMount() {
    this.handleDefaultState();
  }

  handleDefaultState = () => {
    const { props } = this;
    const defaultButton = props.buttons.find((button) => button.active);
    const defaultBgClassNames = classnames({ "button-select": true, [defaultButton.bgColor]: true });

    const defaultNonActiveButtons = props.buttons.filter((button) => (button.active === false || button.active === undefined));
    const currentButton = (
      <Button
        eventAction={defaultButton.eventAction}
        status={defaultButton.status}
        bezelStyle="solid"
        label={defaultButton.name}
        i18nKeyLabel={defaultButton.i18nKeyLabel}
        type={defaultButton.buttonType}
      />
    );

    return this.setState({
      currentButton,
      defaultBgClassNames,
      buttons: props.buttons,
      nonActiveButtons: defaultNonActiveButtons
    });
  }

  filterButtons = () => {
    const { activeButton, buttons } = this.state;

    const nonActiveButtons = buttons.filter((button) => button.name !== activeButton);
    return this.setState({ nonActiveButtons });
  }

  handleToggle = () => {
    const { toggle } = this.state;
    let className;

    if (toggle === "hidden") {
      className = classnames({ "button-dropdown": true, "hidden": false });
      return this.setState({
        toggle: "show",
        toggleClassNames: className,
        toggleIcon: classnames({ "fa": true, "fa-chevron-up": true, "text-center": true, "fa-icon": true })
      });
    }

    className = classnames({ "button-dropdown": true, "hidden": true });
    return this.setState({
      toggle: "hidden",
      toggleClassNames: className,
      toggleIcon: classnames({ "fa": true, "fa-chevron-down": true, "text-center": true, "fa-icon": true })
    });
  }

  handleButtonChange = (button) => {
    const currentButton = (
      <Button
        eventAction={button.eventAction}
        status={button.status}
        bezelStyle="solid"
        label={button.name}
        i18nKeyLabel={button.i18nKeyLabel}
        type={button.buttonType}
      />
    );

    this.handleToggle();

    return this.setState({
      currentButton,
      defaultBgClassNames: classnames({ "button-select": true, [button.bgColor]: true }),
      activeButton: button.name
    }, () => {
      this.filterButtons();
    });
  }

  render() {
    const { toggleClassNames, nonActiveButtons, defaultBgClassNames, toggleIcon, currentButton } = this.state;
    return (
      <div className={defaultBgClassNames}>
        <div className="button-group">
          {currentButton}
          <Components.Button
            tagName="div"
            className={{
              "btn": false,
              "button-toggle": true
            }}
            onClick={this.handleToggle}
          >
            <i className={toggleIcon} aria-hidden="true" />
          </Components.Button>
        </div>
        <div className={toggleClassNames}>
          {nonActiveButtons.map((button, key) => (
            <button
              className="btn button-item" key={key}
              type="button"
              onClick={() => this.handleButtonChange(button)}
            >
              <Components.Translation defaultValue={button.name} i18nKey={button.i18nKeyLabel} />
            </button>))}
        </div>
      </div>
    );
  }
}

registerComponent("ButtonSelect", ButtonSelect);

export default ButtonSelect;
