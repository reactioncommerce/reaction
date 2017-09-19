import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { DayPickerRangeController } from "react-dates";
import omit from "lodash/omit";

class CalendarPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: props.initialStartDate,
      endDate: props.initialEndDate,
      focusedInput: props.autoFocusEndDate ? "endDate" : "startDate"
    };
  }

  onDatesChange = ({ startDate, endDate }) => {
    this.setState({
      startDate,
      endDate
    });

    if (this.props.onDatesChange) {
      this.props.onDatesChange(startDate, endDate);
    }
  }

onFocusChange = (focusedInput) => {
  this.setState({
    // Force the focusedInput to always be truthy so that dates are always selectable
    focusedInput: !focusedInput ? "startDate" : focusedInput
  });
}

render() {
  // can show start dates and end dates
  const { showInputs } = this.props;

  const { focusedInput, startDate, endDate } = this.state;

  const props = omit(this.props, [
    "autoFocus",
    "autoFocusEndDate",
    "initialStartDate",
    "initialEndDate"
  ]);


  const startDateString = startDate && startDate.format("YYYY-MM-DD");
  const endDateString = endDate && endDate.format("YYYY-MM-DD");

  return (
    <div>
      {showInputs &&
        <div style={{ marginBottom: 16 }}>
          <input type="text" name="start date" value={startDateString} readOnly />
          <input type="text" name="end date" value={endDateString} readOnly />
        </div>
      }
      <DayPickerRangeController
        {...props}
        onDatesChange={this.onDatesChange}
        onFocusChange={this.onFocusChange}
        focusedInput={focusedInput}
        startDate={startDate}
        endDate={endDate}
        navPrev={<i className="fa fa-arrow-left"/>}
        navNext={<i className="fa fa-arrow-right"/>}
        hideKeyboardShortcutsPanel={true}
      />
    </div>
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
  // example props for the demo
  autoFocusEndDate: PropTypes.bool,
  initialStartDate: PropTypes.object,
  initialEndDate: PropTypes.object,

  keepOpenOnDateSelect: PropTypes.bool,
  minimumNights: PropTypes.number,
  isOutsideRange: PropTypes.func,
  isDayBlocked: PropTypes.func,
  isDayHighlighted: PropTypes.func,

  // DayPicker props
  enableOutsideDays: PropTypes.bool,
  numberOfMonths: PropTypes.number,
  withPortal: PropTypes.bool,
  initialVisibleMonth: PropTypes.func,
  renderCalendarInfo: PropTypes.func,

  navPrev: PropTypes.node,
  navNext: PropTypes.node,

  onPrevMonthClick: PropTypes.func,
  onNextMonthClick: PropTypes.func,
  onOutsideClick: PropTypes.func,
  renderDay: PropTypes.func,

  // i18n
  monthFormat: PropTypes.string,

  isRTL: PropTypes.bool
};

registerComponent("CalendarPicker", CalendarPicker);

export default CalendarPicker;
