import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import CallSplit from "mdi-material-ui/CallSplit";
import Cancel from "mdi-material-ui/Cancel";
import ChevronDown from "mdi-material-ui/ChevronDown";
import Truck from "mdi-material-ui/Truck";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import OrderCardFulfillmentGroupItem from "./orderCardFulfillmentGroupItem";


const styles = (theme) => ({
  fulfillmentGroupSpacing: {
    marginBottom: theme.spacing.unit * 2
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  }
});

class OrderCardFulfillmentGroups extends Component {
  static propTypes = {
    classes: PropTypes.object,
    order: PropTypes.shape({
      fulfillmentGroups: PropTypes.array
    })
  };

  state = {
    expanded: false
  };

  handleExpandClick = () => {
    this.setState((state) => ({ expanded: !state.expanded }));
  };

  renderFulfillmentGroupItems(fulfillmentGroup) {
    return fulfillmentGroup.items.nodes.map((item) => <OrderCardFulfillmentGroupItem key={item._id} item={item} />);
  }

  renderFulfillmentGroups() {
    const { classes, order } = this.props;
    const { fulfillmentGroups } = order;
    const totalGroupsCount = fulfillmentGroups.length;

    return fulfillmentGroups.map((fulfillmentGroup, index) => {
      const currentGroupCount = index + 1;

      console.log(" ----- ----- fulfillmentGroup", fulfillmentGroup);


      return (
        <Card key={fulfillmentGroup._id} className={classes.fulfillmentGroupSpacing} elevation={0}>
          <CardHeader
            subheader={`Fulfillment group ${currentGroupCount} of ${totalGroupsCount}`}
          />
          <CardContent>
            {fulfillmentGroup.status}{fulfillmentGroup.displayStatus}
            {this.renderFulfillmentGroupItems(fulfillmentGroup)}
          </CardContent>
          <CardActions className={classes.actions} disableActionSpacing>
            <Typography variant="caption" align="right">
              Fulfillment group actions
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
                Cancel All items in group
              </Button>
              <Button variant="contained" color="secondary" onClick={this.props.onCancelOrder}>
                <CallSplit className={classes.leftIcon} />
                Move all items to another group
              </Button>
              <Button variant="contained" color="secondary" onClick={this.props.onCancelOrder}>
                <Truck className={classes.leftIcon} />
                Add tracking number for shipment
              </Button>
            </CardContent>
          </Collapse>
        </Card>
      );
    });
  }

  render() {
    return (
      <Card>
        <CardHeader
          title="Fulfillment Groups"
        />
        <CardContent>
          {this.renderFulfillmentGroups()}
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles, { name: "OrderCardHFulfillmentGroups" })(OrderCardFulfillmentGroups);
