import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import moment from "moment";
import withStyles from "@material-ui/core/styles/withStyles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { i18next } from "/client/api";
import listRefunds from "../graphql/queries/listRefunds";

const styles = (theme) => ({
  dividerSpacing: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4)
  },
  fontWeightSemiBold: {
    fontWeight: theme.typography.fontWeightSemiBold
  }
});

/**
 * @name OrderPreviousRefunds
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderPreviousRefunds(props) {
  const { classes, order } = props;

  const variables = {
    orderId: order._id,
    shopId: order.shop._id,
    token: null
  };

  return (
    <Query errorPolicy="all" query={listRefunds} variables={variables}>
      {({ data: listRefundsData, loading: isLoading }) => {
        if (isLoading) return null;

        const { listRefunds: refunds } = listRefundsData || {};

        if (Array.isArray(refunds) && refunds.length) {
          return (
            <Grid item xs={12}>
              <Card elevation={0}>
                <CardHeader
                  title={i18next.t("order.previousRefunds", "Previous Refunds")}
                />
                <CardContent>
                  {refunds.map((refund, index) => {
                    const { amount, createdAt, paymentDisplayName, reason } = refund;
                    const formattedDate = moment(createdAt).format("l");

                    return (
                      <Grid container key={index}>
                        <Grid item xs={6} md={6}>
                          <Grid item xs={12} md={12}>
                            <Typography paragraph variant="h4">
                              {formattedDate}
                            </Typography>
                            <Typography paragraph variant="body1">
                              {i18next.t("order.refundedTo", "Refunded to")} <span className={classes.fontWeightSemiBold}>{paymentDisplayName}</span>
                            </Typography>
                            <Typography variant="h4">
                              {i18next.t("order.reasonForRefund", "Reason for refund")}
                            </Typography>
                            <Typography paragraph variant="body1">
                              {reason || i18next.t("order.noRefundReason", "No reason provided")}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid item xs={6} md={6}>
                          <Grid item xs={12} md={12}>
                            <Typography paragraph variant="h4" align="right">
                              {amount.displayAmount}
                            </Typography>
                          </Grid>
                        </Grid>
                        {index + 1 < refunds.length &&
                        <Grid item xs={12} md={12}>
                          <Divider className={classes.dividerSpacing} />
                        </Grid>
                        }
                      </Grid>
                    );
                  })}
                </CardContent>
              </Card>
            </Grid>
          );
        }

        return null;
      }}
    </Query>
  );
}

OrderPreviousRefunds.propTypes = {
  classes: PropTypes.object,
  order: PropTypes.shape({
    _id: PropTypes.string,
    shop: PropTypes.shape({
      _id: PropTypes.string
    })
  })
};

export default withStyles(styles, { name: "RuiOrderPreviousRefunds" })(OrderPreviousRefunds);
