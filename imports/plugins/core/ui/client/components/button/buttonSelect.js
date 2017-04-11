import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import Button from "./button.jsx";
import { Translation } from "/imports/plugins/core/ui/client/components";

class ButtonSelect extends Component {
  static PropTypes = {
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
    const props = this.props;
    let defaultButton = props.buttons.filter(button => {
      if (button.active === true) {
        return button;
      }
    });
    defaultButton = defaultButton[0];

    const defaultBgClassNames = classnames({ "button-select": true, [defaultButton.bgColor]: true });

    const defaultNonActiveButtons = props.buttons.filter(button => {
      if (button.active === false || button.active === undefined) {
        return button;
      }
    });
    const currentButton = (
      <Button
        eventAction={defaultButton.eventAction}
        status={defaultButton.status}
        bezelStyle="solid"
        label={defaultButton.name}
        i18nKeyLabel={defaultButton.i18nKeyLabel}
        buttonType={defaultButton.buttonType}
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

    const nonActiveButtons = buttons.filter(button => {
      if (button.name !== activeButton) {
        return button;
      }
    });
    return this.setState({ nonActiveButtons });
  }

  handleToggle = () => {
    const { toggle } = this.state;
    let className;

    if (toggle === "hidden") {
      className = classnames({ "button-dropdown": true, "hidden": false });
      return this.setState({ toggle: "show",
        toggleClassNames: className,
        toggleIcon: classnames({ "fa": true, "fa-chevron-up": true, "text-center": true, "fa-icon": true })
      });
    }

    className = classnames({ "button-dropdown": true, "hidden": true });
    return this.setState({ toggle: "hidden",
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
        buttonType={button.buttonType}
      />
    );

    this.handleToggle();

    return this.setState({
      currentButton: currentButton,
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
          <div className="button-toggle" onClick={this.handleToggle}>
            <i className={toggleIcon} aria-hidden="true" />
          </div>
        </div>
        <div className={toggleClassNames}>
          {nonActiveButtons.map((button, key) => {
            return (
              <button
                className="btn button-item" key={key}
                type="button"
                onClick={() => this.handleButtonChange(button)}
              >
                <Translation defaultValue={button.name} i18nKey={button.i18nKeyLabel} />
              </button>);
          })}
        </div>
      </div>
    );
  }
}

export default ButtonSelect;
