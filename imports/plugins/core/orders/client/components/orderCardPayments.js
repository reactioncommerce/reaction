import React, { Component } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import DangerChip from "imports/client/ui/components/DangerChip/DangerChip";
import OrderPayment from "./OrderPayment";


class OrderCardPayments extends Component {
  static propTypes = {
    order: PropTypes.shape({
      payments: PropTypes.arrayOf({
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

  renderPayments() {
    const { order: { payments } } = this.props;
    let showOrderStatusChip = false;

    if (this.props.hasEditPermission) { // TODO: EK - update to better permission handling
      return payments.map((payment) => <OrderPayment payment={payment} />);
    }

    // If more than one payment method, display amount for each
    if (Array.isArray(payments) && payments.length > 1) {
      const paymentStatuses = payments.map((payment) => payment.status);
      const uniqueStatuses = [...new Set(paymentStatuses)];

      console.log("paymentstatuses", paymentStatuses);
      console.log("uniqueStatuses", uniqueStatuses);


      // If all payment statuses are equal, and also not "created", then show a single badge
      if (Array.isArray(uniqueStatuses) && uniqueStatuses.length > 1) {
        showOrderStatusChip = true;
      }

      return payments.map((payment) => {
        const { status } = payment;

        return (
          <Typography key={payment._id} variant="body2">
            {payment.displayName} {payment.amount.displayAmount}
            {showOrderStatusChip ?
              <Chip
                size="small"
                variant="outlined"
                label={status}
              />
              :
              null }
          </Typography>
        );
      });
    }

    // If only one payment method, do not display amount
    return payments.map((payment) => <Typography key={payment._id} variant="body2">{payment.displayName}</Typography>);
  }

  render() {
    return (
      <Card>
        <CardHeader
          title="Payments"
        />
        <CardContent>
          {this.renderPayments()}
        </CardContent>
      </Card>
    );
  }
}

export default OrderCardPayments;
