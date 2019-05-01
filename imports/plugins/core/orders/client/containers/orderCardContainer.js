import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import OrderCard from "../components/orderCard";
// import { orderByReferenceId } from "./queries";

// Until the Blaze wrapper is removed, we need to provide the `MuiThemeProvider` and `ThemeProvider` here
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import { ThemeProvider } from "styled-components";
import theme from "/imports/plugins/core/router/client/theme/index.js";
import muiTheme from "/imports/plugins/core/router/client/theme/muiTheme.js";
// Until the Blaze wrapper is removed, we need to provide the `MuiThemeProvider` and `ThemeProvider` here

import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";


const orderByReferenceId = gql`
  query orderByReferenceId($id: ID!, $language: String!, $shopId: ID!, $token: String) {
    order: orderByReferenceId(id: $id, shopId: $shopId, token: $token) {
      _id
  account {
    _id
  }
  cartId
  createdAt
  displayStatus(language: $language)
  email
  fulfillmentGroups {
    _id
    data {
      ... on ShippingOrderFulfillmentGroupData {
        shippingAddress {
          _id
          address1
          address2
          city
          company
          country
          fullName
          isCommercial
          isShippingDefault
          phone
          postal
          region
        }
      }
    }
    items {
      nodes {
        _id
        addedAt
        createdAt
        imageURLs {
          large
          medium
          original
          small
          thumbnail
        }
        isTaxable
        optionTitle
        parcel {
          containers
          distanceUnit
          height
          length
          massUnit
          weight
          width
        }
        price {
          amount
          currency {
            code
          }
          displayAmount
        }
        productConfiguration {
          productId
          productVariantId
        }
        productSlug
        productType
        productVendor
        productTags {
          nodes {
            name
          }
        }
        quantity
        shop {
          _id
        }
        subtotal {
          amount
          currency {
            code
          }
          displayAmount
        }
        taxCode
        title
        updatedAt
        variantTitle
      }
    }
    selectedFulfillmentOption {
      fulfillmentMethod {
        _id
        carrier
        displayName
        fulfillmentTypes
        group
        name
      }
      handlingPrice {
        amount
        currency {
          code
        }
        displayAmount
      }
      price {
        amount
        currency {
          code
        }
        displayAmount
      }
    }
    shop {
      _id
    }
    summary {
      fulfillmentTotal {
        amount
        displayAmount
      }
      itemTotal {
        amount
        displayAmount
      }
      surchargeTotal {
        amount
        displayAmount
      }
      taxTotal {
        amount
        displayAmount
      }
      total {
        amount
        displayAmount
      }
    }
    tracking
    type
  }
  payments {
    _id
    amount {
      displayAmount
    }
    billingAddress {
      address1
      address2
      city
      company
      country
      fullName
      isCommercial
      phone
      postal
      region
    }
    displayName
    method {
      name
    }
  }
  referenceId
  shop {
    _id
    currency {
      code
    }
  }
  status
  summary {
    fulfillmentTotal {
      amount
      displayAmount
    }
    itemTotal {
      amount
      displayAmount
    }
    surchargeTotal {
      amount
      displayAmount
    }
    taxTotal {
      amount
      displayAmount
    }
    total {
      amount
      displayAmount
    }
  }
  totalItemQuantity
  updatedAt
    }
  }
`;

class OrderCardContainer extends Component {
  static propTypes = {}

  render() {
    const { primaryShopId, routingStore, uiStore } = this.props;

    console.log(" ------ OrderCardContainer props", this.props);

    // const conversionRequests = [
    //   { namespace: "Shop", id: "J8Bhq3uTtdgwZx3rz" }
    // ];

    // const [
    //   opaqueOrderId,
    //   opaqueShopId,
    //   ...opaquePaymentIds
    // ] = await getOpaqueIds(conversionRequests);

    const variables = {
      id: "qsHg8zFpfgD5j9WXJ",
      language: "en",
      shopId: "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==",
      token: null
    };

    return (
      <Query errorPolicy="all" query={orderByReferenceId} variables={variables}>
        {({ loading: isLoading, data: orderData }) => {
          if (isLoading) return null;
          const { order } = orderData || {};

          console.log(" ----- ----- ----- ----- ----- ----- order data ----- ----- ----- ----- ----- -----", order);

          return (
            <ThemeProvider theme={theme}>
              <MuiThemeProvider theme={muiTheme}>
                <OrderCard order={order} />
              </MuiThemeProvider>
            </ThemeProvider>
          );
        }}
      </Query>
    );
  }
}

export default OrderCardContainer;
