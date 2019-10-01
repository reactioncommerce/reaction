import React, { Fragment } from "react";
import PropTypes from "prop-types";
import moment from "moment";

/**
 * @name OrderDateCell
 * @param {Object} row A react-table row object
 * @return {React.Component} A date component
 */
export default function OrderDateCell({ row }) {
  if (!moment) return null;

  // Determine what date or time to display.
  const now = moment();
  const startDateTime = moment(row.values.createdAt);
  const duration = moment.duration(now.diff(startDateTime));
  const durationHours = duration.asHours();

  // Render order date by default
  let dateOrTime = moment(startDateTime).format("YYYY-MM-DD HH:mm");
  if (durationHours < 1) {
    dateOrTime = `${Math.round(duration.asMinutes())} minutes ago`;
  }

  if (durationHours > 1 && durationHours < 24) {
    dateOrTime = `${Math.round(durationHours)} hours ago`;
  }

  return (
    <Fragment>
      {dateOrTime}
    </Fragment>
  );
}

OrderDateCell.propTypes = {
  row: PropTypes.object.isRequired
};
