import React from "react";
import PropTypes from "prop-types";


const CompletedOrder = ({ order }) => {
  return (
    <div>Completed Order Stuff Goes right here</div>
  );
};

CompletedOrder.propTypes = {
  order: PropTypes.object
};

export default CompletedOrder;
