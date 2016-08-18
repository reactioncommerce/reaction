Template.twitter.onRendered(function() {
  var ref;
  if (this.data.placement === 'footer' && (((ref = this.data.apps.twitter) != null ? ref.profilePage : void 0) != null)) {
    return this.$('.twitter-share').attr('href', this.data.apps.twitter.profilePage);
  } else {
    return this.autorun(function() {
      var base, data, description, href, media, preferred_url, ref1, ref2, template, text, url;
      template = Template.instance();
      data = Template.currentData();
      $('meta[property^="twitter:"]').remove();
      $('<meta>', {
        property: 'twitter:card',
        content: 'summary'
      }).appendTo('head');
      if (data.apps.twitter.username) {
        $('<meta>', {
          property: 'twitter:creator',
          content: data.apps.twitter.username
        }).appendTo('head');
      }
      description = ((ref1 = data.apps.twitter) != null ? ref1.description : void 0) || $('.product-detail-field.description').text();
      $('<meta>', {
        property: 'twitter:url',
        content: location.origin + location.pathname
      }).appendTo('head');
      $('<meta>', {
        property: 'twitter:title',
        content: "" + data.title
      }).appendTo('head');
      $('<meta>', {
        property: 'twitter:description',
        content: description
      }).appendTo('head');
      if (data.media) {
        if (!/^http(s?):\/\/+/.test(data.media)) {
          media = location.origin + data.media;
          $('<meta>', {
            property: 'twitter:image',
            content: data.media
          }).appendTo('head');
        }
      }
      preferred_url = data.url || location.origin + location.pathname;
      url = encodeURIComponent(preferred_url);
      base = "https://twitter.com/intent/tweet";
      text = encodeURIComponent(((ref2 = data.apps.twitter) != null ? ref2.title : void 0) || data.title);
      href = base + "?url=" + url + "&text=" + text;
      if (data.apps.twitter.username) {
        href += "&via=" + data.apps.twitter.username;
      }
      return template.$(".twitter-share").attr("href", href);
    });
  }
});

Template.twitter.events({
  'click a': function(event, template) {
    event.preventDefault();
    return window.open(Template.instance().$('.twitter-share').attr('href'), 'twitter_window', 'width=750, height=650');
  }
});
