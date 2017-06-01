import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import _ from "lodash";
import { composeWithTracker } from "/lib/api/compose";
import * as Collections from "/lib/collections";
import SearchModal from "../components/searchModal";


class SearchModalContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ""
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getTags = this.getTags.bind(this);
  }

  handleChange = (event, value) => {
    this.setState({
      value: value
    });
  }

  handleClick = () => {
    this.setState({
      value: ""
    });
  }

  getTags() {
    const searchQuery = this.state.value;
    console.log("searchQuery", searchQuery);
    console.log("subscription.ready", getQuery(searchQuery).ready());
    if (searchQuery && getQuery(searchQuery).ready()) {
      const productHashtags = getProducts();
      const tagSearchResults = Collections.Tags.find({
        _id: { $in: productHashtags }
      }).fetch();

      console.log("tagSearchResults", tagSearchResults);
      return tagSearchResults;
    }
    return false;
  }

  render() {
    return (
      <div>
        <SearchModal
          {...this.props}
          handleChange={this.handleChange}
          handleClick={this.handleClick}
          tags={this.getTags}
          value={this.state.value}
        />
      </div>
    );
  }
}

function getSiteName() {
  const shop = Collections.Shops.findOne();
  return typeof shop === "object" && shop.name ? shop.name : "";
}

function getQuery(searchQuery) {
  console.log("meteor", Meteor);
  console.log("meteor.subscribe", Meteor.subscribe());
  return Meteor.subscribe("SearchResults", "products", searchQuery, []);
}

function getProducts() {
  const productResults = Collections.ProductSearch.find().fetch();
  // const productResultsCount = productResults.length;
  // this.state.set("productSearchResults", productResults);
  // this.state.set("productSearchCount", productResultsCount);

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
  console.log("hashtags", hashtags);
  return hashtags;
}

function composer(props, onData) {
  const siteName = getSiteName();

  onData(null, {
    siteName
  });
}

export default composeWithTracker(composer)(SearchModalContainer);
