import React, { Component } from "react";
import PropTypes from "prop-types";
import { DayPickerRangeController } from "react-dates";
import omit from "lodash/omit";
import { registerComponent } from "@reactioncommerce/reaction-components";

// CalendarPicker is a wrapper around react-dates DayPickerRangeController. Anything that works in react-dates should
// work in CalendarPicker react-dates docs are available at: https://github.com/airbnb/react-dates

class CalendarPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: props.initialStartDate,
      endDate: props.initialEndDate,
      focusedInput: props.autoFocusEndDate
        ? "endDate"
        : "startDate"
    };
  }

  onDatesChange = ({ startDate, endDate }) => {
    this.setState({ startDate, endDate });

    if (this.props.onDatesChange) {
      this.props.onDatesChange(startDate, endDate);
    }
  }

  onFocusChange = (focusedInput) => {
    this.setState({
      // Force the focusedInput to always be truthy so that dates are always selectable
      focusedInput: !focusedInput
        ? "startDate"
        : focusedInput
    });
  }

  render() {
    const { focusedInput, startDate, endDate } = this.state;

    const props = omit(this.props, ["autoFocus", "autoFocusEndDate", "initialStartDate", "initialEndDate"]);

    return (
      <DayPickerRangeController
        {...props}
        onDatesChange={this.onDatesChange}
        onFocusChange={this.onFocusChange}
        focusedInput={focusedInput}
        startDate={startDate}
        endDate={endDate}
        navPrev={< i className = "fa fa-arrow-left" />}
        navNext={< i className = "fa fa-arrow-right" />}
        hideKeyboardShortcutsPanel={true}
      />
    );
  }
}

CalendarPicker.defaultProps = {
  autoFocusEndDate: false,
  initialStartDate: null,
  initialEndDate: null,

  // day presentation and interaction related props
  renderDay: null,
  minimumNights: 1,
  isDayBlocked: () => false,
  isDayHighlighted: () => false,
  enableOutsideDays: false,

  // calendar presentation and interaction related props
  withPortal: false,
  initialVisibleMonth: null,
  numberOfMonths: 1,
  onOutsideClick() {},
  keepOpenOnDateSelect: false,
  renderCalendarInfo: null,
  isRTL: false,

  // navigation related props
  navPrev: null,
  navNext: null,
  onPrevMonthClick() {},
  onNextMonthClick() {},

  // internationalization
  monthFormat: "MMMM YYYY"
};

CalendarPicker.propTypes = {
  autoFocusEndDate: PropTypes.bool,
  enableOutsideDays: PropTypes.bool,
  initialEndDate: PropTypes.object,
  initialStartDate: PropTypes.object,
  initialVisibleMonth: PropTypes.func,
  isDayBlocked: PropTypes.func,
  isDayHighlighted: PropTypes.func,
  isOutsideRange: PropTypes.func,
  isRTL: PropTypes.bool,
  keepOpenOnDateSelect: PropTypes.bool,
  minimumNights: PropTypes.number,
  monthFormat: PropTypes.string,
  navNext: PropTypes.node,
  navPrev: PropTypes.node,
  numberOfMonths: PropTypes.number,
  onDatesChange: PropTypes.func,
  onNextMonthClick: PropTypes.func,
  onOutsideClick: PropTypes.func,
  onPrevMonthClick: PropTypes.func,
  renderCalendarInfo: PropTypes.func,
  renderDay: PropTypes.func,
  withPortal: PropTypes.bool
};

registerComponent("CalendarPicker", CalendarPicker);

export default CalendarPicker;
