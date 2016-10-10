import _ from "lodash";
import { IconButton, SortableTable } from "/imports/plugins/core/ui/client/components";
// import { IconButton, Table } from "/imports/plugins/core/ui/client/components";
import { Template } from "meteor/templating";
import { ProductSearch, Tags, OrderSearch, AccountSearch } from "/lib/collections";
import { DataType } from "react-taco-table";


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
      /**
       * Product Search
       */
      if (searchCollection === "products") {
        const productResults = ProductSearch.find().fetch();
        const productResultsCount = productResults.length;
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

        console.log("-----Products-----", productResults);
        console.log("-----Products Size-----", productResultsCount);
      }

      /**
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

        console.log("-----Accounts-----", accountResults);
        console.log("-----Accounts Size-----", accountResultsCount);
      }

      /**
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

        console.log("-----Orders-----", orderResults);
        console.log("-----Orders Size-----", orderResultsCount);
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
    return results;
  },
  tagSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("tagSearchResults");
    return results;
  },
  orderSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("orderSearchResults");
    return results;
  },
  accountSearchResults() {
    const instance = Template.instance();
    const results = instance.state.get("accountSearchResults");
    return results;
  },
  accountTable() {
    const instance = Template.instance();
    const results = instance.state.get("accountSearchResults");

    const columns = [
      {
        id: "_id",
        type: DataType.String,
        header: "Account ID"
        // renderer(cellData, { column, rowData }) {
        //   return <a href={rowData.url} target="_blank">{cellData}</a>;
        // },
      },
      {
        id: "shopId",
        type: DataType.String,
        header: "Shop ID"
      },
      {
        id: "firstName",
        type: DataType.String,
        header: "First Name",
        value: rowData => {
          if (rowData.profile) {
            return rowData.profile.firstName;
          }
          return undefined;
        }
        // renderer(cellData, { column, rowData }) {
        //   return <a href={rowData.url} target="_blank">{cellData}</a>;
        // },
      },
      {
        id: "lastName",
        type: DataType.String,
        header: "Last Name",
        value: rowData => {
          if (rowData.profile) {
            return rowData.profile.firstName;
          }
          return undefined;
        }
        // renderer(cellData, { column, rowData }) {
        //   return <a href={rowData.url} target="_blank">{cellData}</a>;
        // },
      },
      {
        id: "phone",
        type: DataType.String,
        header: "Phone",
        value: rowData => {
          if (rowData.profile) {
            return rowData.profile.phone;
          }
          return undefined;
        }
      }
    ];

    return {
      component: SortableTable,
      data: results,
      columns: columns
    };
  },
  orderTable() {
    const instance = Template.instance();
    const results = instance.state.get("orderSearchResults");
    const columns = [
      {
        id: "shippingName",
        type: DataType.String,
        header: "Shipping Name"
        // renderer(cellData, { column, rowData }) {
        //   return <a href={rowData.url} target="_blank">{cellData}</a>;
        // },
      },
      {
        id: "shippingPhone",
        type: DataType.String,
        header: "Shipping Phone"
      },
      {
        id: "billingName",
        type: DataType.String,
        header: "Billing Name"
        // renderer(cellData, { column, rowData }) {
        //   return <a href={rowData.url} target="_blank">{cellData}</a>;
        // },
      },
      {
        id: "billingPhone",
        type: DataType.String,
        header: "Billing Phone"
      },
      {
        id: "shopId",
        type: DataType.String,
        header: "Shop ID"
      },
      {
        id: "_id",
        type: DataType.String,
        header: "Order ID"
      }
    ];

    return {
      component: SortableTable,
      data: results,
      columns: columns
    };
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
    const searchCollection = $(event.target).data("event-value");

    $(".search-type-option").not(event.target).removeClass("search-type-active");
    $(event.target).addClass("search-type-active");

    $("#search-input").focus();

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
