import React, { Component } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Typography from "@material-ui/core/Typography";


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

    // If more than one payment method, display amount for each
    if (Array.isArray(payments) && payments.length > 1) {
      return payments.map((payment) => <Typography key={payment._id} variant="body2">{payment.displayName} {payment.amount.displayAmount}</Typography>);
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
