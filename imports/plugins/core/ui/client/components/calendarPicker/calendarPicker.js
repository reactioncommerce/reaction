import React, { Component } from "react";
import PropTypes from "prop-types";
import omit from "lodash/omit";
import { registerComponent } from "@reactioncommerce/reaction-components";
import DayPickerRangeController from "./dayPickerRangeController";

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

  /**
   * Getter returning a value of `true` if the current drection is set to RTL
   * @return {Boolean} true if RTL false if LTR
   */
  get isRTL() {
    if (typeof this.props.isRTL === "boolean") {
      // If isRTL is set from props, then use
      return this.props.isRTL;
    } else if (document) {
      // Otherwise try to determine RTL status from the html class name "rtl"
      return document.getElementsByTagName("html")[0].className.includes("rtl");
    }

    // Return false if above matches fail
    return false;
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

  renderDayContents(day) {
    return (
      <span className="CalendarDay__contents">{day.format("D")}</span>
    );
  }

  render() {
    const { focusedInput, startDate, endDate, renderDayContents } = this.state;

    const props = omit(this.props, ["autoFocus", "autoFocusEndDate", "initialStartDate", "initialEndDate"]);

    return (
      <DayPickerRangeController
        {...props}
        renderDayContents={renderDayContents || this.renderDayContents}
        onDatesChange={this.onDatesChange}
        onFocusChange={this.onFocusChange}
        focusedInput={focusedInput}
        isRTL={this.isRTL}
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
  renderDayContents: null,
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
  isRTL: undefined,

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
  renderDayContents: PropTypes.func,
  withPortal: PropTypes.bool
};

registerComponent("CalendarPicker", CalendarPicker);

export default CalendarPicker;
