import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import _ from "lodash";
import { composeWithTracker, merge } from "/lib/api/compose";
import Button from "../components/button/button.jsx";
import { ButtonSelect } from "../components/button";

class ButtonSelectContainer extends Component {
  constructor(props) {
    super(props);
    const currentButton = <Button
      eventAction={props.defaultButton.eventAction}
      className={props.defaultButton.buttonClass} bezelStyle="solid"
                          >
     {props.defaultButton.name}
    </Button>;

    this.state = {
      toggle: "hidden",
      currentButton,
      nonActiveButtons: props.nonActiveButtons,
      defaultBgClassNames: classnames({ "button-select": true, [props.defaultButton.bgColor]: true }),
      toggleIcon: classnames({ "fa": true, "fa-chevron-down": true, "text-center": true, "fa-icon": true }),
      toggleClassNames: classnames({ "button-dropdown": true, "hidden": true })
    };

    this.handleToggle = this.handleToggle.bind(this);
    // this.renderDefaultButton = this.renderDefaultButton.bind(this);
    this.handleButtonChange = this.handleButtonChange.bind(this);
  }

  changeActiveButton() {
    const { buttons } = this.props;
    const index = _.indexOf(buttons, _.find(buttons), { active: true });
    buttons.splice(index, 1, { active: false, ...buttons[index] });

    return buttons;
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
      className={button.buttonClass} bezelStyle="solid"
                          >{button.name}</Button>;

    this.handleToggle();
    this.setState({
      currentButton: currentButton,
      defaultBgClassNames: classnames({ "button-select": true, [button.bgColor]: true }),
    });
  }

  render() {
    const { toggleClassNames, defaultBgClassNames, toggleIcon, currentButton } = this.state;
    return (
      <ButtonSelect
        currentButton={currentButton}
        toggleClassNames={toggleClassNames}
        defaultBgClassNames={defaultBgClassNames}
        toggleIcon={toggleIcon}
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
  nonActiveButtons: PropTypes.array
};

function composer(props, onData) {
  let defaultButton = props.buttons.filter(button => {
    if (button.active === true) {
      return button;
    }
  });
  defaultButton = defaultButton[0];

  const nonActiveButtons = props.buttons.filter(button => {
    if (button.active === false || button.active === undefined) {
      return button;
    }
  });

  onData(null, {
    defaultButton,
    nonActiveButtons
  });
}


export default merge(
  composeWithTracker(composer)
)(ButtonSelectContainer);

