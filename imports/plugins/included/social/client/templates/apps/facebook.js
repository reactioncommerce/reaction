Template.facebook.onRendered(function() {
  var ref;
  if (this.data.placement === 'footer' && (((ref = this.data.apps.facebook) != null ? ref.profilePage : void 0) != null)) {
    return this.$('.facebook-share').attr('href', this.data.apps.facebook.profilePage);
  } else {
    this.autorun(function() {
      var base, data, description, href, media, ref1, summary, template, title, url;
      template = Template.instance();
      data = Template.currentData();
      $('meta[property^="og:"]').remove();
      description = ((ref1 = data.apps.facebook) != null ? ref1.description : void 0) || $('.product-detail-field.description').text();
      url = data.url || location.origin + location.pathname;
      title = data.title || document.title;
      $('<meta>', {
        property: 'og:type',
        content: 'article'
      }).appendTo('head');
      $('<meta>', {
        property: 'og:site_name',
        content: location.hostname
      }).appendTo('head');
      $('<meta>', {
        property: 'og:url',
        content: url
      }).appendTo('head');
      $('<meta>', {
        property: 'og:title',
        content: title
      }).appendTo('head');
      $('<meta>', {
        property: 'og:description',
        content: description
      }).appendTo('head');
      if (data.media) {
        if (!/^http(s?):\/\/+/.test(data.media)) {
          media = location.origin + data.media;
        }
        $('<meta>', {
          property: 'og:image',
          content: media
        }).appendTo('head');
      }
      if (data.apps.facebook.appId != null) {
        return template.$('.facebook-share').click(function(e) {
          e.preventDefault();
          return FB.ui({
            method: 'share',
            display: 'popup',
            href: url
          }, function(response) {});
        });
      } else {
        url = encodeURIComponent(url);
        base = "https://www.facebook.com/sharer/sharer.php";
        title = encodeURIComponent(title);
        summary = encodeURIComponent(description);
        href = base + "?s=100&p[url]=" + url + "&p[title]=" + title + "&p[summary]=" + summary;
        if (data.media) {
          href += "&p[images][0]=" + encodeURIComponent(media);
        }
        return template.$(".facebook-share").attr("href", href);
      }
    });
  }
});

Template.facebook.onCreated(function() {
  var apps, isEnabled;
  apps = Template.currentData().apps;
  isEnabled = 'facebook' in apps && apps.facebook.enabled;
  if (isEnabled) {
    $('<div id="fb-root"></div>').appendTo('body');
    window.fbAsyncInit = function() {
      return FB.init({
        appId: apps.facebook.appId,
        xfbml: true,
        version: 'v2.1'
      });
    };
    (function(d, s, id) {
      var fjs, js;
      js = void 0;
      fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }
  return isEnabled;
});
