Template.pinterest.onRendered(function() {
  var ref;
  if (this.data.placement === 'footer' && (((ref = this.data.apps.pinterest) != null ? ref.profilePage : void 0) != null)) {
    return this.$('.pinterest-share').attr('href', this.data.apps.pinterest.profilePage);
  } else {

    /*
      Pinterest requires three parameters:
        url: desired url
        media: image being shared
        description: image description
     */
    return this.autorun(function() {
      var data, description, href, media, preferred_url, ref1, template, url;
      template = Template.instance();
      data = Template.currentData();
      preferred_url = data.url || location.origin + location.pathname;
      url = encodeURIComponent(preferred_url);
      if (data.media) {
        if (!/^http(s?):\/\/+/.test(data.media)) {
          media = location.origin + data.media;
        }
      }
      description = encodeURIComponent(((ref1 = data.apps.pinterest) != null ? ref1.description : void 0) || $('.product-detail-field.description').text());
      href = "http://www.pinterest.com/pin/create/button/?url=" + url + "&media=" + media + "&description=" + description;
      return template.$('.pinterest-share').attr('href', href);
    });
  }
});

Template.pinterest.events({
  'click a': function(event, template) {
    event.preventDefault();
    return window.open(Template.instance().$('.pinterest-share').attr('href'), 'pinterest_window', 'width=750, height=650');
  }
});
