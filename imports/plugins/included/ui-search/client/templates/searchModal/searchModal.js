import _ from "lodash";
import { IconButton } from "/imports/plugins/core/ui/client/components";
import { Template } from "meteor/templating";
import { ProductSearch, Tags } from "/lib/collections";


/**
 * searchModal onCreated
 */
Template.searchModal.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    initialLoad: true,
    slug: "",
    canLoadMoreProducts: false,
    searchQuery: "",
    productSearchResults: [],
    tagSearchResults: []
  });


  // Set products collection as the default searchCollection
  const searchCollection = "products";
  this.state.set("searchCollection", searchCollection);


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
    const searchCollection = this.state.get("searchCollection");
    const searchQuery = this.state.get("searchQuery");
    const facets = this.state.get("facets") || [];
    const sub = this.subscribe("SearchResults", searchCollection, searchQuery, facets);

    if (sub.ready()) {
      if (searchCollection === "products") {
        const results = ProductSearch.find().fetch();
        this.state.set("productSearchResults", results);
        const hashtags = [];
        for (const product of results) {
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
      }
      else {
        this.state.set("productSearchResults", "");
        this.state.set("tagSearchResults", "");
        console.log("If searchCollection !== products, clear result", searchCollection);
      }
    }
  });
});


/**
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
    // console.log("productSearchResults", results);
    return results;
  },
  tagSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("tagSearchResults");
    // console.log("tagSearchResults", results);
    return results;
  }
});


/**
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
    const instance = Template.instance();
    const searchCollection = $(event.target).data("event-value");

    templateInstance.state.set("searchCollection", searchCollection);
  }
});


/**
 * searchModal onDestroyed
 */
Template.searchModal.onDestroyed(() => {
  // Kill Allow modal to be closed by clicking ESC, which was initiated in Template.searchModal.onCreated
  $(document).off("keyup");
});


/**
 * searchModal extra functions
 */
function tagToggle(arr, val) {
  if (arr.length === _.pull(arr, val).length) {
    arr.push(val);
  }
  return arr;
}
