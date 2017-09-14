import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { DayPickerRangeController } from "react-dates";
import moment from "moment";


class Dates extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment(),
      endDate: moment("2017-10-1"),
      focusedInput: null
    };
  }

  render() {
    return (
      <DayPickerRangeController
        startDate={this.state.startDate} // momentPropTypes.momentObj or null,
        endDate={this.state.endDate} // momentPropTypes.momentObj or null,
        onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
        focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
        onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
        numberOfMonths={this.props.numberOfMonths}
      />
    );
  }
}

Dates.defaultProps = {
  numberOfMonths: 1
};

Dates.propTypes = {
  numberOfMonths: PropTypes.number
};

registerComponent("Dates", Dates);

export default Dates;
