import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import withOpaqueShopId from "/imports/plugins/core/graphql/lib/hocs/withOpaqueShopId";
import OrderCard from "../components/orderCard";

// import { orderByReferenceId } from "./queries";
// Why are we doing this here?
// We can't import the query correctly as is, need to make updates but maybe only available with webpack
// See: https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader
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
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        _id: PropTypes.string
      })
    }),
    shopId: PropTypes.string
  }

  render() {
    const { match: { params: { _id } }, shopId } = this.props;
    const variables = {
      id: _id,
      language: "en",
      shopId,
      token: null
    };

    return (
      <Query errorPolicy="all" query={orderByReferenceId} variables={variables}>
        {({ loading: isLoading, data: orderData }) => {
          if (isLoading) return null;
          const { order } = orderData || {};

          return (
            <OrderCard
              order={order}
            />
          );
        }}
      </Query>
    );
  }
}

export default compose(
  withOpaqueShopId,
  withRouter
)(OrderCardContainer);
