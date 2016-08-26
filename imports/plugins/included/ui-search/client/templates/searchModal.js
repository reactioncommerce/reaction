import _ from "lodash";
import { IconButton } from "/imports/plugins/core/ui/client/components";
import { Template } from "meteor/templating";
import { Products, ProductSearch, Tags } from "/lib/collections";


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

  this.autorun(() => {
    const searchQuery = this.state.get("searchQuery");
    const sub = this.subscribe("SearchResults", "products", searchQuery); // collection, searchTerm, facets

    if (sub.ready()) {
      const results = ProductSearch.find().fetch();
      const searchIds = [];
      for (const result of results) {
        searchIds.push(result._id);
      }
      const resultProducts = Products.find({
        _id: { $in: searchIds }
      }).fetch();
      this.state.set("productSearchResults", resultProducts);
      const hashtags = [];
      for (const product of resultProducts) {
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
  });
});


Template.searchModal.helpers({
  IconButtonComponent() {
    const instance = Template.instance();
    const view = instance.view;

    return {
      component: IconButton,
      icon: "fa fa-times",
      onClick() {
        $(".js-search-modal").fadeOut(400, () => {
          $("body").css("overflow-y", "inherit");
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


Template.searchModal.events({
  // on type, recload Reaction.SaerchResults
  "keyup input": (event, templateInstance) => {
    event.preventDefault();
    const searchQuery = templateInstance.find("#search-input").value;
    templateInstance.state.set("searchQuery", searchQuery);
  }
});

AutoForm.hooks({
  // "search-update-form": {
  //   /* eslint-disable no-unused-vars*/
  //   onSuccess(operation, result, template) {
  //     Alerts.removeSeen();
  //     return Alerts.add("Search settings saved.", "success");
  //   },
  //   onError(operation, error, template) {
  //     Alerts.removeSeen();
  //     return Alerts.add("Search settings update failed. " + error, "danger");
  //   }
  //   /* eslint-enable no-unused-vars*/
  // }
});
