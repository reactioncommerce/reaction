import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import * as Collections from "/lib/collections";
import { Components, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, formatPriceString } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import SearchModal from "../components/searchModal";

class SearchSubscription extends Component {
  render() {
    return (
      <SearchModal {...this.props}/>
    );
  }
}

function getSiteName() {
  const shop = Collections.Shops.findOne();
  return typeof shop === "object" && shop.name ? shop.name : "";
}

function getProductHashtags(productResults) {
  const foundHashtags = {}; // Object to keep track of results for O(1) lookup
  return productResults.reduce((hashtags, product) => {
    if (Array.isArray(product.hashtags)) {
      product.hashtags.forEach((tag) => {
        // If we haven't added this tag yet, push it and add it to the foundHashtags dict
        if (!foundHashtags[tag]) {
          hashtags.push(tag);
          foundHashtags[tag] = true;
        }
      });
    }
    return hashtags;
  }, []);
}

function composer(props, onData) {
  const searchResultsSubscription = Meteor.subscribe("SearchResults", props.searchCollection, props.value, props.facets);
  const shopMembersSubscription = Meteor.subscribe("ShopMembers");

  // Determine currency - user's selected or primary shop's currency
  const shopCurrencyCode = Reaction.getPrimaryShopCurrency();
  const userAccount = Collections.Accounts.findOne(Meteor.userId());
  const { currency: currencyCode = "" } = userAccount.profile;

  if (searchResultsSubscription.ready() && shopMembersSubscription.ready()) {
    const siteName = getSiteName();
    let productResults = [];
    let tagSearchResults = [];
    let accountResults = [];

    /*
    * Product Search
    */
    if (props.searchCollection === "products") {
      productResults = Collections.ProductSearch.find().fetch();

      const productHashtags = getProductHashtags(productResults);
      tagSearchResults = Collections.Tags.find({
        _id: { $in: productHashtags }
      }).fetch();

      // Subscribe to media
      const productIds = productResults.map((result) => result._id);
      Meteor.subscribe("ProductGridMedia", productIds);

      const productMediaById = {};
      productIds.forEach((productId) => {
        const primaryMedia = Media.findOneLocal({
          "metadata.productId": productId,
          "metadata.toGrid": 1,
          "metadata.workflow": { $nin: ["archived", "unpublished"] }
        }, {
          sort: { "metadata.priority": 1, "uploadedAt": 1 }
        });

        if (primaryMedia) {
          productMediaById[productId] = {
            thumbnail: primaryMedia.url({ store: "thumbnail" }),
            small: primaryMedia.url({ store: "small" }),
            medium: primaryMedia.url({ store: "medium" }),
            large: primaryMedia.url({ store: "large" }),
            original: primaryMedia.url({ store: "original" })
          };
        }
      });

      // Re-format product data for CatalogGrid
      productResults = productResults.map((productResult) => {
        const {
          _id,
          description,
          handle: slug,
          isBackorder,
          isLowQuantity,
          isSoldOut,
          price,
          title,
          vendor
        } = productResult;
        const primaryImage = (productMediaById[_id] && { URLs: productMediaById[_id] }) || null;

        return {
          _id,
          description,
          isBackorder,
          isLowQuantity,
          isSoldOut,
          pricing: [{
            currency: {
              code: currencyCode || shopCurrencyCode
            },
            displayPrice: formatPriceString(price.range)
          }],
          primaryImage,
          slug,
          title,
          vendor
        };
      });
    }

    /*
      * Account Search
      */
    if (props.searchCollection === "accounts") {
      accountResults = Collections.AccountSearch.find().fetch();
    }

    onData(null, {
      siteName,
      products: productResults,
      accounts: accountResults,
      tags: tagSearchResults,
      currencyCode: currencyCode || shopCurrencyCode
    });
  }
}

export default composeWithTracker(composer, Components.Loading)(SearchSubscription);
