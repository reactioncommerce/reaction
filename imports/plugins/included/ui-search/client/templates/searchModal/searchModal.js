import _ from "lodash";
import React from "react";
import { DataType } from "react-taco-table";
import { Template } from "meteor/templating";
import { i18next } from "/client/api";
import { ProductSearch, Tags, OrderSearch, AccountSearch } from "/lib/collections";
import { IconButton, SortableTable } from "/imports/plugins/core/ui/client/components";



 // filterItems = [{vendor: []}, {min: 0}, {max: 9999999}, {score: false}];
function filterResult() {
  const result = [];
  if (JSON.stringify(filterItems) === "[{\"vendor\":[]},{},{},{}]") {
    return getProducts();
  }
  getProducts().filter((product) => {
    let match = false;
    filterItems.forEach(item => {
      match = false;
      const key = Object.keys(item).toString();
      switch (key) {
        case "vendor":
          match = vendorMatch(item[key], product[key]);
          break;
        case "min":
          match = priceMatch("min", product.price, item[key]);
          break;
        case "max":
          match = priceMatch("max", product.price, item[key]);
          break;
        case "score":
          match = scoreMatch(item[key], product[key]);
          break;
        default:
          match = false;
      }
      match ? result.push(product) : "";
    });
  });
  return result;
}

function setSearchResults(result) {
  const instance = Template.instance();
  if (result !== undefined) {
    instance.state.set("productSearchResults", result);
  }
}

// Match for score
function scoreMatch(itemKey, productKey) {
  return productKey >= itemKey ? true : false;
}

// Match for price
function priceMatch(type, value, condition) {
  if (!value) {
    return false;
  }

  if (type === "min" && (value.min >= condition || value.max >= condition)) {
    return true;
  }
  if (type === "max" && value.max <= condition) {
    return true;
  }
  return false;
}

// Match for vendors
function vendorMatch(itemKey, productKey) {
  return (itemKey.includes(productKey.toString())) ?
    true : false;
}

// format of items {location: item} e.g {vendor: china}
function getProducts() {
  return ProductSearch.find().fetch();
}


/*
 * searchModal extra functions
 */
function tagToggle(arr, val) {
  if (arr.length === _.pull(arr, val).length) {
    arr.push(val);
  }
  return arr;
}

/*
 * searchModal onCreated
 */
Template.searchModal.onCreated(function () {
  this.state = new ReactiveDict();
  filterItems = [{vendor: []}, {min: undefined}, {max: undefined}, {score: undefined}];
  emptyFilter = [{vendor: []}, {min: undefined}, {max: undefined}, {score: undefined}];
  this.state.setDefault({
    initialLoad: true,
    slug: "",
    canLoadMoreProducts: false,
    searchQuery: "",
    productSearchResults: [],
    tagSearchResults: []
  });


  // Allow modal to be closed by clicking ESC
  // Must be done in Template.searchModal.onCreated and not in Template.searchModal.events
  $(document).on("keyup", (event) => {
    if (event.keyCode === 27) {
      const view = this.view;
      $(".js-search-modal").fadeOut(400, () => {
        $("body").css("overflow", "visible");
        Blaze.remove(view);
      });
    }
  });


  this.autorun(() => {
    const searchCollection = this.state.get("searchCollection") || "products";
    const searchQuery = this.state.get("searchQuery");
    const facets = this.state.get("facets") || [];
    const sub = this.subscribe("SearchResults", searchCollection, searchQuery, facets);

    if (sub.ready()) {
      /*
       * Product Search
       */
      if (searchCollection === "products") {
        const productResults = ProductSearch.find().fetch();
        const productResultsCount = productResults.length;
        // console.log(productResults[0]);
        this.state.set("productSearchResults", productResults);
        this.state.set("productSearchCount", productResultsCount);

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
        const tagResults = Tags.find({
          _id: { $in: hashtags }
        }).fetch();
        this.state.set("tagSearchResults", tagResults);

        // TODO: Do we need this?
        this.state.set("accountSearchResults", "");
        this.state.set("orderSearchResults", "");
      }

      /*
       * Account Search
       */
      if (searchCollection === "accounts") {
        const accountResults = AccountSearch.find().fetch();
        const accountResultsCount = accountResults.length;
        this.state.set("accountSearchResults", accountResults);
        this.state.set("accountSearchCount", accountResultsCount);

        // TODO: Do we need this?
        this.state.set("orderSearchResults", "");
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
      }

      /*
       * Order Search
       */
      if (searchCollection === "orders") {
        const orderResults = OrderSearch.find().fetch();
        const orderResultsCount = orderResults.length;
        this.state.set("orderSearchResults", orderResults);
        this.state.set("orderSearchCount", orderResultsCount);


        // TODO: Do we need this?
        this.state.set("accountSearchResults", "");
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
      }
    }
  });
});


/*
 * searchModal helpers
 */
Template.searchModal.helpers({
  IconButtonComponent() {
    const instance = Template.instance();
    const view = instance.view;

    return {
      component: IconButton,
      icon: "fa fa-times",
      kind: "close",
      onClick() {
        $(".js-search-modal").fadeOut(400, () => {
          $("body").css("overflow", "visible");
          Blaze.remove(view);
        });
      }
    };
  },
  productSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("productSearchResults");
    return results;
  },
  tagSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("tagSearchResults");
    return results;
  },
  showSearchResults() {
    return false;
  }
});


/*
 * searchModal events
 */
Template.searchModal.events({
  // on type, reload Reaction.SaerchResults
  "keyup input": (event, templateInstance) => {
    event.preventDefault();
    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
    $(".search-modal-header:not(.active-search)").addClass(".active-search");
    if (!$(".search-modal-header").hasClass("active-search")) {
      $(".search-modal-header").addClass("active-search");
    }
  },
  "change [data-event-action=filterSearch]": (event) => {
    // {vendor: [China, ireland]}
    const key = event.target.parentNode.id;
    const value = event.target.value;
    this.filterItems.forEach((item) => {
      let itemKey = Object.keys(item).toString();
      if (itemKey === key) {
        if (key === "vendor" && !item[itemKey].includes(value)) {
          item[itemKey].push(value);
        } else if (key === "vendor") {
          item[itemKey].splice(item[itemKey].indexOf(value), 1);
        } else {
          item[itemKey] = value;
        }
      }
    });
    const result = filterResult();
    setSearchResults(result);
    console.log(result);
  },
  "click [data-event-action=filter]": function (event, templateInstance) {
    event.preventDefault();
    const instance = Template.instance();
    const facets = instance.state.get("facets") || [];
    const newFacet = $(event.target).data("event-value");

    tagToggle(facets, newFacet);

    $(event.target).toggleClass("active-tag btn-active");

    templateInstance.state.set("facets", facets);
  },
  "click [data-event-action=productClick]": function () {
    const instance = Template.instance();
    const view = instance.view;
    $(".js-search-modal").delay(400).fadeOut(400, () => {
      Blaze.remove(view);
    });
  },
  "click [data-event-action=clearSearch]": function (event, templateInstance) {
    $("#search-input").val("");
    $("#search-input").focus();
    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
  },
  "click [data-event-action=searchCollection]": function (event, templateInstance) {
    event.preventDefault();
    const searchCollection = $(event.target).data("event-value");

    $(".search-type-option").not(event.target).removeClass("search-type-active");
    $(event.target).addClass("search-type-active");

    $("#search-input").focus();

    templateInstance.state.set("searchCollection", searchCollection);
  }
});


/*
 * searchModal onDestroyed
 */
Template.searchModal.onDestroyed(() => {
  // Kill Allow modal to be closed by clicking ESC, which was initiated in Template.searchModal.onCreated
  $(document).off("keyup");
});
