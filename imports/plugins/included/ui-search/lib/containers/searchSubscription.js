import React, { Component } from "react";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import * as Collections from "/lib/collections";
import { Components, composeWithTracker } from "@reactioncommerce/reaction-components";
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
  const hashtags = [];
  for (const product of productResults) {
    if (product.hashtags) {
      for (const hashtag of product.hashtags) {
        if (!_.includes(hashtags, hashtag)) {
          hashtags.push(hashtag);
        }
      }
    }
  }
  return hashtags;
}

function composer(props, onData) {
  const searchResultsSubscription = Meteor.subscribe("SearchResults", props.searchCollection, props.value, props.facets);
  const shopMembersSubscription = Meteor.subscribe("ShopMembers");

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
      tags: tagSearchResults
    });
  }
}

export default composeWithTracker(composer, Components.Loading)(SearchSubscription);
