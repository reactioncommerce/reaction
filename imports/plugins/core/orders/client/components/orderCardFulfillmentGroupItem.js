import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import CallSplit from "mdi-material-ui/CallSplit";
import Cancel from "mdi-material-ui/Cancel";
import ChevronDown from "mdi-material-ui/ChevronDown";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";


const styles = (theme) => ({
  fulfillmentGroupSpacing: {
    marginBottom: theme.spacing.unit * 2
  },
  itemTextBold: {
    fontWeight: theme.typography.fontWeightBold
  },
  itemTotals: {
    textAlign: "right"
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  },
  actions: {
    display: "flex"
  }
});

class OrderCardFulfillmentGroupItem extends Component {
  static propTypes = {
    classes: PropTypes.object,
    item: PropTypes.shape({
      price: PropTypes.object,
      productVendor: PropTypes.string,
      quantity: PropTypes.number,
      subtotal: PropTypes.object,
      title: PropTypes.string
    })
  };

  state = {
    expanded: false
  };

  handleExpandClick = () => {
    this.setState((state) => ({ expanded: !state.expanded }));
  };

  render() {
    const { classes, item } = this.props;
    const { price, productVendor, quantity, subtotal, title } = item;
    console.log(" ---------- ---------- item", item);

    return (
      <Card className={classes.fulfillmentGroupSpacing} elevation={0}>
        <CardContent>
          <Grid container>
            <Grid item xs={12} md={6}>
              <Grid item className={classes.orderCardSection} xs={12} md={12}>
                <Typography variant="body2" className={classes.itemTextBold}>
                  {title}
                </Typography>
                <Typography variant="body2">
                  {productVendor}
                </Typography>
                <Typography variant="body2">
                  Quantity: {quantity}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid item xs={12} md={12}>
                <Typography variant="body2" align="right">
                  {price.amount}
                </Typography>
                <Typography variant="body2" align="right">
                  Total: {quantity}
                </Typography>
                <Typography variant="body2" className={classes.itemTextBold} align="right">
                  {subtotal.amount}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions className={classes.actions} disableActionSpacing>
          <Typography variant="caption" align="right">
            Item actions
          </Typography>
          <IconButton
            className={classnames(classes.expand, {
              [classes.expandOpen]: this.state.expanded
            })}
            onClick={this.handleExpandClick}
            aria-expanded={this.state.expanded}
            aria-label="Show more"
          >
            <ChevronDown />
          </IconButton>
        </CardActions>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Button variant="contained" color="secondary" onClick={this.props.onCancelOrder}>
              <Cancel className={classes.leftIcon} />
                Cancel item
            </Button>
            <Button variant="contained" color="secondary" onClick={this.props.onCancelOrder}>
              <CallSplit className={classes.leftIcon} />
                Move item to another group
            </Button>
          </CardContent>
        </Collapse>
      </Card>
    );
  }
}

export default withStyles(styles, { name: "OrderCardHFulfillmentGroupItem" })(OrderCardFulfillmentGroupItem);
