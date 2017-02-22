/* eslint-disable */
//
// TODO google social templates need review to ensure proper use of reaction layouts
//
Template.googleplus.onRendered(function () {
  let ref;
  if (this.data.placement === "footer" && (((ref = this.data.apps.googleplus) !== null ? ref.profilePage : void 0) !== null)) {  // eslint-disable-line
    return this.$(".googleplus-share").attr("href", this.data.apps.googleplus.profilePage);
  }
  return this.autorun(function () {
    let media;
    let ref1;
    let ref2;
    const template = Template.instance();
    const data = Template.currentData();
    $("meta[itemscope]").remove();
    const description = ((ref1 = data.apps.googleplus) !== null ? ref1.description : void 0) || $(".product-detail-field.description").text(); // eslint-disable-line
    const url = data.url || location.origin + location.pathname;
    // const title = data.title;
    const itemtype = ((ref2 = data.apps.googleplus) !== null ? ref2.itemtype : void 0) || "Article";
    $("html").attr("itemscope", "").attr("itemtype", "http://schema.org/" + itemtype);
    $("<meta>", {
      itemprop: "name",
      content: location.hostname
    }).appendTo("head");
    $("<meta>", {
      itemprop: "url",
      content: url
    }).appendTo("head");
    $("<meta>", {
      itemprop: "description",
      content: description
    }).appendTo("head");
    if (data.media) {
      if (!/^http(s?):\/\/+/.test(data.media)) {
        media = location.origin + data.media;
      }
      $("<meta>", {
        itemprop: "image",
        content: media
      }).appendTo("head");
    }
    const href = "https://plus.google.com/share?url=" + url;
    return template.$(".googleplus-share").attr("href", href);
  });
});

Template.googleplus.events({
  "click a": function (event) {
    event.preventDefault();
    return window.open(Template.instance().$(".googleplus-share").attr("href"), "googleplus_window", "width=750, height=650");
  }
});
