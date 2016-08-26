import _ from "lodash";
import { IconButton } from "/imports/plugins/core/ui/client/components";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Products, ProductSearch, Tags } from "/lib/collections"


Template.searchModal.onCreated(function () {
  this.products = ReactiveVar();
  this.state = new ReactiveDict();
  this.state.setDefault({
    initialLoad: true,
    slug: "",
    canLoadMoreProducts: false,
    searchQuery: "",
    searchResults: []
  });

  this.autorun(() => {
    const searchQuery = this.state.get("searchQuery");
    const sub = this.subscribe("SearchResults", "products", searchQuery); // collection, searchTerm, facets

    console.log("query", searchQuery);

    if (sub.ready()) {
      const results = ProductSearch.find().fetch();
      console.log(`result length is: ${results.length}`);
      this.state.set("searchResults", results);
      const searchIds = [];
      for (const result of results) {
        searchIds.push(result._id);
      }
      const resultProducts = Products.find({
        _id: { $in: searchIds }
      }).fetch();
      console.log(resultProducts);
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
      console.log("tagResults", tagResults);
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
  }


  // send data to template.....
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
