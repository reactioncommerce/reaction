import React, { Component } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import OrderPayment from "./OrderPayment";


class OrderCardPayments extends Component {
  static propTypes = {
    order: PropTypes.shape({
      payments: PropTypes.shape({
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

    return payments.map((payment) => <OrderPayment payment={payment} />);
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
