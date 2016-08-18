Template.googleplus.onRendered(function() {
  var ref;
  if (this.data.placement === 'footer' && (((ref = this.data.apps.googleplus) != null ? ref.profilePage : void 0) != null)) {
    return this.$('.googleplus-share').attr('href', this.data.apps.googleplus.profilePage);
  } else {
    return this.autorun(function() {
      var data, description, href, itemtype, media, ref1, ref2, template, title, url;
      template = Template.instance();
      data = Template.currentData();
      $('meta[itemscope]').remove();
      description = ((ref1 = data.apps.googleplus) != null ? ref1.description : void 0) || $('.product-detail-field.description').text();
      url = data.url || location.origin + location.pathname;
      title = data.title;
      itemtype = ((ref2 = data.apps.googleplus) != null ? ref2.itemtype : void 0) || 'Article';
      $('html').attr('itemscope', '').attr('itemtype', "http://schema.org/" + itemtype);
      $('<meta>', {
        itemprop: 'name',
        content: location.hostname
      }).appendTo('head');
      $('<meta>', {
        itemprop: 'url',
        content: url
      }).appendTo('head');
      $('<meta>', {
        itemprop: 'description',
        content: description
      }).appendTo('head');
      if (data.media) {
        if (!/^http(s?):\/\/+/.test(data.media)) {
          media = location.origin + data.media;
        }
        $('<meta>', {
          itemprop: 'image',
          content: media
        }).appendTo('head');
      }
      href = "https://plus.google.com/share?url=" + url;
      return template.$(".googleplus-share").attr("href", href);
    });
  }
});

Template.googleplus.events({
  'click a': function(event, template) {
    event.preventDefault();
    return window.open(Template.instance().$('.googleplus-share').attr('href'), 'googleplus_window', 'width=750, height=650');
  }
});
