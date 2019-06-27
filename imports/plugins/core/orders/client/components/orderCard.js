import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import Grid from "@material-ui/core/Grid";
import { Blocks } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import DetailDrawer from "/imports/client/ui/components/DetailDrawer";
import OrderCardAppBar from "./orderCardAppBar";
import OrderCardFulfillmentGroup from "./orderCardFulfillmentGroup";
import OrderCardHeader from "./orderCardHeader";
import OrderCardPayments from "./orderCardPayments";
import OrderCardCustomerDetails from "./OrderCardCustomerDetails";
import OrderCardSummary from "./orderCardSummary";


class OrderCard extends Component {
  static propTypes = {
    order: PropTypes.object
  };

  state = {}

  renderAppBar() {
    const { order } = this.props;

    return <OrderCardAppBar order={order} />;
  }

  renderHeader() {
    const { order } = this.props;

    return <OrderCardHeader order={order} />;
  }

  renderFulfillmentGroups() {
    const { order } = this.props;

    return <OrderCardFulfillmentGroup order={order} />;
  }

  renderPayments() {
    const { order } = this.props;

    return <OrderCardPayments order={order} />;
  }

  renderSidebar() {
    const { order } = this.props;

    return (
      <Grid container spacing={8}>
        <Grid item xs={12}>
          {this.renderSummary()}
          <Blocks region="OrderCardSummary" blockProps={{ order, ...this.props }} />
        </Grid>
        <Grid item xs={12}>
          <OrderCardCustomerDetails order={order} />
        </Grid>
      </Grid>
    );
  }

  renderSummary() {
    const { order } = this.props;

    return <OrderCardSummary order={order} />;
  }

  render() {
    const { order } = this.props;

    return (
      <Fragment>
        <Helmet title={`Order Details for order reference #${order.referenceId}`} />
        {this.renderAppBar()}
        <Grid container spacing={24}>
          <Grid item xs={12}>
            {this.renderHeader()}
          </Grid>
          <Grid item xs={12}>
            {this.renderFulfillmentGroups()}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={24}>
              <Grid item xs={12} md={12}>
                {this.renderPayments()}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <DetailDrawer title={i18next.t("orderCard.orderSummary.title", "Order summary")}>
          {this.renderSidebar()}
        </DetailDrawer>
      </Fragment>
    );
  }
}

export default OrderCard;



// class OrderCard extends Component {
//   static propTypes = {
//     order: PropTypes.object
//   };

//   state = {
//     currentTab: 0
//   }

//   handleTabChange = (event, value) => {
//     this.setState({ currentTab: value });
//   };

//   renderAppBar() {
//     const { order } = this.props;

//     return <OrderCardAppBar order={order} {...this.props} />;
//   }

//   renderHeader() {
//     const { order } = this.props;

//     return <OrderCardHeader order={order} />;
//   }

//   renderFulfillmentGroups() {
//     const { order } = this.props;

//     return <OrderCardFulfillmentGroup order={order} {...this.props} />;
//   }

//   renderPayments() {
//     const { order } = this.props;

//     return <OrderCardPayments order={order} {...this.props} />;
//   }

//   renderTabs() {
//     const { currentTab } = this.state;

//     return (
//       <Fragment>
//         <Tabs value={currentTab} onChange={this.handleTabChange}>
//           <Tab label={i18next.t("fulfillment", "Fulfillment")} />
//           <Tab label={i18next.t("refunds", "Refunds")} />
//         </Tabs>
//         <Divider />
//       </Fragment>
//     );
//   }

//   renderFulfillment() {
//     const { currentTab } = this.state;

//     if (currentTab === 0) {
//       return (
//         <Fragment>
//           <Grid item xs={12}>
//             {this.renderFulfillmentGroups()}
//           </Grid>
//           <Grid item xs={12}>
//             {this.renderPayments()}
//           </Grid>
//         </Fragment>
//       );
//     }

//     return null;
//   }

//   renderRefunds() {
//     const { currentTab } = this.state;

//     if (currentTab === 1) {
//       return (
//         <Fragment>
//           <Grid item xs={12}>
//             [Placeholder] Refunds will go here
//           </Grid>
//         </Fragment>
//       );
//     }

//     return null;
//   }

//   renderSidebar() {
//     const { order } = this.props;

//     return (
//       <Grid container spacing={8}>
//         <Grid item xs={12}>
//           <Blocks region="OrderCardSummary" blockProps={{ order, ...this.props }} />
//         </Grid>
//         <Grid item xs={12}>
//           <OrderCardCustomerDetails order={order} />
//         </Grid>
//       </Grid>
//     );
//   }

//   render() {
//     const { order } = this.props;
//     const { currentTab } = this.state;

//     return (
//       <Fragment>
//         <Helmet title={`Order Details for order reference #${order.referenceId}`} />
//         {this.renderAppBar()}
//         <Grid container spacing={24}>
//           <Grid item xs={12}>
//             {this.renderHeader()}
//           </Grid>
//           <Grid item xs={12}>
//             {this.renderTabs()}
//           </Grid>
//           {currentTab === 0 &&
//             this.renderFulfillment()
//           }
//           {currentTab === 1 &&
//             this.renderRefunds()
//           }
//         </Grid>
//         <DetailDrawer title={i18next.t("orderCard.orderSummary.title", "Order summary")}>
//           {this.renderSidebar()}
//         </DetailDrawer>
//       </Fragment>
//     );
//   }
// }
