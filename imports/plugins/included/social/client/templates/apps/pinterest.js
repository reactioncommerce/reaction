/* eslint-disable */
//
// TODO pinterest social templates need review to ensure proper use of reaction layouts
//
Template.pinterest.onRendered(function () {
  let ref;
  if (this.data.placement === "footer" && (((ref = this.data.apps.pinterest) !== null ? ref.profilePage : void 0) !== null)) {
    return this.$(".pinterest-share").attr("href", this.data.apps.pinterest.profilePage);
  }
  /*
    Pinterest requires three parameters:
      url: desired url
      media: image being shared
      description: image description
   */
  return this.autorun(function () {
    let media;
    let ref1;
    const template = Template.instance();
    const data = Template.currentData();
    const preferredUrl = data.url || location.origin + location.pathname;
    const url = encodeURIComponent(preferredUrl);
    if (data.media) {
      if (!/^http(s?):\/\/+/.test(data.media)) {
        media = location.origin + data.media;
      }
    }
    const description = encodeURIComponent(((ref1 = data.apps.pinterest) !== null ? ref1.description : void 0) || $(".product-detail-field.description").text());
    const href = "http://www.pinterest.com/pin/create/button/?url=" + url + "&media=" + media + "&description=" + description;
    return template.$(".pinterest-share").attr("href", href);
  });
});

Template.pinterest.events({
  "click a": function (event) {
    event.preventDefault();
    return window.open(Template.instance().$(".pinterest-share").attr("href"), "pinterest_window", "width=750, height=650");
  }
});
