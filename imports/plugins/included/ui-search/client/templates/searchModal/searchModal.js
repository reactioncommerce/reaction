import { $ } from "meteor/jquery";
import { Template } from "meteor/templating";
import SearchModalContainer from "../../../lib/containers/searchModalContainer";

/*
 * searchModal helpers
 */
Template.searchModal.helpers({
  searchModal() {
    return {
      component: SearchModalContainer
    };
  }
});

/*
 * searchModal events
 */
Template.searchModal.events({
  "click [data-event-action=searchCollection]": function (event) {
    event.preventDefault();

    $(".search-type-option").not(event.target).removeClass("search-type-active");
    $(event.target).addClass("search-type-active");

    $("#search-input").focus();
  }
});
