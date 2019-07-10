import React from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CartSummary from "@reactioncommerce/components/CartSummary/v1";

/**
 * @name OrderCardSummary
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderCardSummary({ order }) {
  const { summary } = order;

  if (summary) {
    const {
      fulfillmentTotal,
      itemTotal,
      surchargeTotal,
      taxTotal,
      total
    } = summary;

    return (
      <Card>
        <CardContent>
          <CartSummary
            isDense
            displayShipping={fulfillmentTotal && fulfillmentTotal.displayAmount}
            displaySubtotal={itemTotal && itemTotal.displayAmount}
            displaySurcharge={surchargeTotal && surchargeTotal.displayAmount}
            displayTax={taxTotal && taxTotal.displayAmount}
            displayTotal={total && total.displayAmount}
          />
        </CardContent>
      </Card>
    );
  }

  return null;
}

OrderCardSummary.propTypes = {
  order: PropTypes.shape({
    summary: PropTypes.shape({
      fulfillmentTotal: PropTypes.shape({
        displayAmount: PropTypes.string
      }),
      itemTotal: PropTypes.shape({
        displayAmount: PropTypes.string
      }),
      surchargeTotal: PropTypes.shape({
        displayAmount: PropTypes.string
      }),
      taxTotal: PropTypes.shape({
        displayAmount: PropTypes.string
      }),
      total: PropTypes.shape({
        displayAmount: PropTypes.string
      })
    })
  })
};

export default OrderCardSummary;
