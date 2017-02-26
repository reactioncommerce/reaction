/* eslint-disable */
//
// TODO twitter social templates need review to ensure proper use of reaction layouts
//
Template.twitter.onRendered(function () {
  let ref;
  if (this.data.placement === "footer" && (((ref = this.data.apps.twitter) !== null ? ref.profilePage : void 0) !== null)) {
    return this.$(".twitter-share").attr("href", this.data.apps.twitter.profilePage);
  }
  //
  // return twitter
  //
  return this.autorun(function () {
    const template = Template.instance();
    const data = Template.currentData();
    $('meta[property^="twitter:"]').remove();
    $("<meta>", {
      property: "twitter:card",
      content: "summary"
    }).appendTo("head");
    if (data.apps.twitter.username) {
      $("<meta>", {
        property: "twitter:creator",
        content: data.apps.twitter.username
      }).appendTo("head");
    }
    let ref1;
    const description = ((ref1 = data.apps.twitter) !== null ? ref1.description : void 0) || $(".product-detail-field.description").text();
    $("<meta>", {
      property: "twitter:url",
      content: location.origin + location.pathname
    }).appendTo("head");
    $("<meta>", {
      property: "twitter:title",
      content: "" + data.title
    }).appendTo("head");
    $("<meta>", {
      property: "twitter:description",
      content: description
    }).appendTo("head");
    if (data.media) {
      if (!/^http(s?):\/\/+/.test(data.media)) {
        // let media = location.origin + data.media;
        $("<meta>", {
          property: "twitter:image",
          content: data.media
        }).appendTo("head");
      }
    }
    const preferredUrl = data.url || location.origin + location.pathname;
    const url = encodeURIComponent(preferredUrl);
    const base = "https://twitter.com/intent/tweet";
    let ref2;
    const text = encodeURIComponent(((ref2 = data.apps.twitter) !== null ? ref2.title : void 0) || data.title);
    let href = base + "?url=" + url + "&text=" + text;
    if (data.apps.twitter.username) {
      href += "&via=" + data.apps.twitter.username;
    }
    return template.$(".twitter-share").attr("href", href);
  });
});

Template.twitter.events({
  "click a": function (event) {
    event.preventDefault();
    return window.open(Template.instance().$(".twitter-share").attr("href"), "twitter_window", "width=750, height=650");
  }
});
