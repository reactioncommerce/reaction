/* eslint-disable */
//
// TODO facebook social templates need review to ensure proper use of reaction layouts
//
Template.facebook.onRendered(function () {
  let ref;
  if (this.data.placement === "footer" && (((ref = this.data.apps.facebook) !== null ? ref.profilePage : void 0) !== null)) { // eslint-disable-line no-cond-assign
    return this.$(".facebook-share").attr("href", this.data.apps.facebook.profilePage);
  }
  //
  // autorun and insert fb
  //
  this.autorun(function () {
    let media;
    let ref1;
    const template = Template.instance();
    const data = Template.currentData();
    $('meta[property^="og:"]').remove();
    const description = ((ref1 = data.apps.facebook) !== null ? ref1.description : void 0) || $(".product-detail-field.description").text();
    let url = data.url || location.origin + location.pathname;
    let title = data.title || document.title;
    $("<meta>", {
      property: "og:type",
      content: "article"
    }).appendTo("head");
    $("<meta>", {
      property: "og:site_name",
      content: location.hostname
    }).appendTo("head");
    $("<meta>", {
      property: "og:url",
      content: url
    }).appendTo("head");
    $("<meta>", {
      property: "og:title",
      content: title
    }).appendTo("head");
    $("<meta>", {
      property: "og:description",
      content: description
    }).appendTo("head");
    if (data.media) {
      if (!/^http(s?):\/\/+/.test(data.media)) {
        media = location.origin + data.media;
      }
      $("<meta>", {
        property: "og:image",
        content: media
      }).appendTo("head");
    }
    /* eslint no-unused-vars: 1 */
    //
    // TODO review Template.facebook.onRendered for FB response
    // believe this object is declared by FB so the
    // lint error should be ignored
    //
    if (data.apps.facebook.appId !== null) {
      return template.$(".facebook-share").click(function (e) {
        e.preventDefault();
        return FB.ui({
          method: "share",
          display: "popup",
          href: url
        }, function () {});
      });
    }
    // else return
    url = encodeURIComponent(url);
    title = encodeURIComponent(title);
    const base = "https://www.facebook.com/sharer/sharer.php";
    const summary = encodeURIComponent(description);
    let href = base + "?s=100&p[url]=" + url + "&p[title]=" + title + "&p[summary]=" + summary;
    if (data.media) {
      href += "&p[images][0]=" + encodeURIComponent(media);
    }
    return template.$(".facebook-share").attr("href", href);
  });
});

Template.facebook.onCreated(function () {
  const apps = Template.currentData().apps;
  const isEnabled = "facebook" in apps && apps.facebook.enabled;
  if (isEnabled) {
    $('<div id="fb-root"></div>').appendTo("body");
    window.fbAsyncInit = function () {
      return FB.init({
        appId: apps.facebook.appId,
        xfbml: true,
        version: "v2.1"
      });
    };
    (function (d, s, id) {
      let js = void 0;
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }
  return isEnabled;
});
