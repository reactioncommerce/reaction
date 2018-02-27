import PropTypes from "prop-types";
import { unformat } from "accounting-js";
import { registerComponent } from "@reactioncommerce/reaction-components";
import TextField from "../textfield/textfield";
import { formatPriceString } from "/client/api";


class CurrencyInput extends TextField {
  constructor(props) {
    super(props);

    this.state = {
      value: formatPriceString(this.props.value, true),
      isEditing: false
    };
  }

  /**
   * Getter: value
   * @return {String} value for text input
   */
  get value() {
    if (!this.state.isEditing && this.state && this.state.value) {
      return this.state.value;
    }
    return this.props.value || "";
  }

  /**
   * onValueChange
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @return {void}
   */
  onChange = (event) => {
    if (!isNaN(event.target.value)) {
      TextField.prototype.onChange.call(this, event);
    }
  }

  /**
   * onBlur
   * @summary set the state when the value of the input is changed
   * @param  {Event} event Event object
   * @return {void}
   */
  onBlur = (event) => {
    this.setState({
      value: formatPriceString(event.target.value, true),
      isEditing: false
    });
    TextField.prototype.onBlur.call(this, event);
  }

  /**
   * onFocus
   * @summary set the state when the input is focused
   * @param  {Event} event Event object
   * @return {void}
   */
  onFocus = (event) => {
    event.target.value = unformat(event.target.value);
    this.setState({
      value: event.target.value,
      isEditing: true
    });
    TextField.prototype.onFocus.call(this, event);
  }
}

registerComponent("CurrencyInput", CurrencyInput);

export default CurrencyInput;
