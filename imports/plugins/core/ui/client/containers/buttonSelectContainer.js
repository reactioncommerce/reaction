import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { composeWithTracker, merge } from "/lib/api/compose";
import Button from "../components/button/button.jsx";
import { ButtonSelect } from "../components/button";

class ButtonSelectContainer extends Component {
  constructor(props) {
    super(props);
    const currentButton = <Button
      eventAction={props.defaultButton.eventAction}
      status={props.defaultButton.status}
      bezelStyle="solid"
      buttonType={props.defaultButton.buttonType}
                          >
     {props.defaultButton.name}
    </Button>;

    this.state = {
      toggle: "hidden",
      currentButton,
      buttons: props.buttons,
      activeButton: "",
      nonActiveButtons: props.defaultNonActiveButtons,
      defaultBgClassNames: classnames({ "button-select": true, [props.defaultButton.bgColor]: true }),
      toggleIcon: classnames({ "fa": true, "fa-chevron-down": true, "text-center": true, "fa-icon": true }),
      toggleClassNames: classnames({ "button-dropdown": true, "hidden": true })
    };

    this.handleToggle = this.handleToggle.bind(this);
    // this.renderDefaultButton = this.renderDefaultButton.bind(this);
    this.handleButtonChange = this.handleButtonChange.bind(this);
    this.filterButtons = this.filterButtons.bind(this);
  }

  filterButtons() {
    const { activeButton, buttons } = this.state;

    const nonActiveButtons = buttons.filter(button => {
      if (button.name !== activeButton) {
        return button;
      }
    });
    return this.setState({ nonActiveButtons });
  }

  handleToggle() {
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

  handleButtonChange(button) {
    const currentButton = <Button
      eventAction={button.eventAction}
      status={button.status}
      bezelStyle="solid"
      buttonType={button.buttonType}
                          >{button.name}</Button>;
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
      <ButtonSelect
        currentButton={currentButton}
        toggleClassNames={toggleClassNames}
        defaultBgClassNames={defaultBgClassNames}
        toggleIcon={toggleIcon}
        nonActiveButtons={nonActiveButtons}
        handleToggle={this.handleToggle}
        handleButtonChange={this.handleButtonChange}
        {...this.props}
      />
    );
  }
}

ButtonSelectContainer.propTypes = {
  buttons: PropTypes.array,
  currentButton: PropTypes.node,
  defaultButton: PropTypes.object,
  defaultNonActiveButtons: PropTypes.array,
  nonActiveButtons: PropTypes.array
};

function composer(props, onData) {
  let defaultButton = props.buttons.filter(button => {
    if (button.active === true) {
      return button;
    }
  });
  defaultButton = defaultButton[0];

  const defaultNonActiveButtons = props.buttons.filter(button => {
    if (button.active === false || button.active === undefined) {
      return button;
    }
  });

  onData(null, {
    defaultButton,
    defaultNonActiveButtons
  });
}


export default merge(
  composeWithTracker(composer)
)(ButtonSelectContainer);

