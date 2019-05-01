import React, { Component } from "react";
import PropTypes from "prop-types";
import Printer from "mdi-material-ui/Printer";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import CartSummary from "@reactioncommerce/components/CartSummary/v1";

import { i18next, Logger, Reaction } from "/client/api";


class OrderCardSummary extends Component {
  static propTypes = {
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
  }

  render() {
    const { order } = this.props;
    const { summary } = order;

    const printOrder = Reaction.Router.pathFor("dashboard/pdf/orders", {
      hash: {
        id: order.referenceId
      }
    });


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
          <CardHeader
            title="Order Summary"
          />
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
          <CardActions>
            <a href={printOrder} target="_blank">
              <IconButton aria-label="Print">
                <Printer />
              </IconButton>
            </a>
          </CardActions>
        </Card>
      );
    }

    return null;
  }
}

export default OrderCardSummary;
