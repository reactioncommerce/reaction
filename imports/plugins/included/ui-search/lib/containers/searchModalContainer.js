import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Roles } from "meteor/alanning:roles";
import _ from "lodash";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import * as Collections from "/lib/collections";
import SearchModal from "../components/searchModal";

class SearchModalContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collection: "products",
      value: localStorage.getItem("searchValue") || "",
      tagResults: [],
      productResults: [],
      orderResults: [],
      renderChild: true,
      accountResults: [],
      facets: []
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChildUnmount = this.handleChildUnmount.bind(this);
    this.handleAccountClick = this.handleAccountClick.bind(this);
    this.handleOrderClick = this.handleOrderClick.bind(this);
    this.handleTagClick = this.handleTagClick.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.dep = new Tracker.Dependency;
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);

    Tracker.autorun(() => {
      this.dep.depend();
      const searchCollection = this.state.collection;
      const searchQuery = this.state.value;
      const facets = this.state.facets;
      this.subscription = Meteor.subscribe("SearchResults", searchCollection, searchQuery, facets);

      if (this.subscription.ready()) {
        /*
        * Product Search
        */
        if (searchCollection === "products") {
          const productResults = Collections.ProductSearch.find().fetch();
          this.setState({ productResults });

          const productHashtags = getProductHashtags(productResults);
          const tagSearchResults = Collections.Tags.find({
            _id: { $in: productHashtags }
          }).fetch();

          this.setState({
            tagResults: tagSearchResults,
            accountResults: [],
            orderResults: []
          });
        }

        /*
          * Account Search
          */
        if (searchCollection === "accounts") {
          const accountResults = Collections.AccountSearch.find().fetch();
          this.setState({
            accountResults,
            tagResults: [],
            orderResults: [],
            productResults: []
          });
        }

        /*
          * Order Search
          */
        if (searchCollection === "orders") {
          const orderResults = Collections.OrderSearch.find().fetch();
          this.setState({
            orderResults,
            tagResults: [],
            accountResults: [],
            productResults: []
          });
        }
      }
    });
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.subscription.stop();
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 27) {
      this.setState({
        renderChild: false
      });
    }
  }

  handleChange = (event, value) => {
    this.setState({ value }, () => {
      this.dep.changed();
    });
    localStorage.setItem("searchValue", value);
  }

  handleClick = () => {
    this.setState({
      value: ""
    }, () => {
      this.dep.changed();
    });
  }

  handleAccountClick = (event) => {
    const userId = event._id;

    Reaction.showActionView({
      label: "Permissions",
      i18nKeyLabel: "admin.settings.permissionsSettingsLabel",
      data: userPermissions(userId),
      template: "memberSettings"
    });
    Reaction.Router.go("dashboard/accounts", {}, {});
    this.handleChildUnmount();
  }

  handleOrderClick = (event)  => {
    const isActionViewOpen = Reaction.isActionViewOpen();
    const orderId = event._id;

    // toggle detail views
    if (isActionViewOpen === false) {
      Reaction.showActionView({
        label: "Order Details",
        i18nKeyLabel: "orderWorkflow.orderDetails",
        data: event,
        props: {
          size: "large"
        },
        template: "coreOrderWorkflow"
      });
    }

    Reaction.Router.go("dashboard/orders", {}, {
      _id: orderId
    });
    this.handleChildUnmount();
  }

  handleTagClick = (tagId) => {
    const newFacet = tagId;
    const element = document.getElementById(tagId);
    element.classList.toggle("active-tag");

    this.setState({
      facets: tagToggle(this.state.facets, newFacet)
    });
  }

  handleToggle = (collection) => {
    this.setState({
      tagResults: [],
      productResults: [],
      orderResults: [],
      accountResults: [],
      collection
    }, () => {
      this.dep.changed();
    });
  }

  handleChildUnmount = () =>  {
    this.setState({ renderChild: false });
  }

  render() {
    return (
      <div>
        {this.state.renderChild ?
          <div className="rui search-modal js-search-modal">
            <SearchModal
              {...this.props}
              handleChange={this.handleChange}
              handleClick={this.handleClick}
              handleToggle={this.handleToggle}
              handleAccountClick={this.handleAccountClick}
              handleOrderClick={this.handleOrderClick}
              handleTagClick={this.handleTagClick}
              products={this.state.productResults}
              tags={this.state.tagResults}
              value={this.state.value}
              accounts={this.state.accountResults}
              orders={this.state.orderResults}
              unmountMe={this.handleChildUnmount}
            />
          </div> : null
        }
      </div>
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

function userPermissions(userId) {
  if (Reaction.hasPermission("reaction-accounts")) {
    const shopId = Reaction.getShopId();
    const user = Meteor.users.findOne(userId);
    const member = {};
    member.userId = user._id;

    if (user.emails && user.emails.length) {
      // this is some kind of denormalization. It is helpful to have both
      // of this string and array. Array goes to avatar, string goes to
      // template
      member.emails = user.emails;
      member.email = user.emails[0].address;
    }
    // member.user = user;
    member.username = user.username;
    member.isAdmin = Roles.userIsInRole(user._id, "admin", shopId);
    member.roles = user.roles;
    member.services = user.services;

    if (Roles.userIsInRole(member.userId, "owner", shopId)) {
      member.role = "owner";
    } else if (Roles.userIsInRole(member.userId, "admin", shopId)) {
      member.role = "admin";
    } else if (Roles.userIsInRole(member.userId, "dashboard", shopId)) {
      member.role = "dashboard";
    } else if (Roles.userIsInRole(member.userId, "guest", shopId)) {
      member.role = "guest";
    }

    return member;
  }
}

function tagToggle(arr, val) {
  if (arr.length === _.pull(arr, val).length) {
    arr.push(val);
  }
  return arr;
}

function composer(props, onData) {
  Meteor.subscribe("ShopMembers");
  const siteName = getSiteName();

  onData(null, {
    siteName
  });
}

export default composeWithTracker(composer)(SearchModalContainer);
