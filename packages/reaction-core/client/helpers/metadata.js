
/**
* ReactionCore MetaData
* Spiderable method to set meta tags for crawl
* accepts current iron-router route
*/


var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ReactionCore.MetaData = {
  settings: {
    title: '',
    meta: [],
    ignore: ['viewport', 'fragment']
  },
  render: function(route) {
    var metaContent;
    metaContent = Blaze.toHTMLWithData(Template.coreHead, Router.current().getName);
    $('head').append(metaContent);
    return metaContent;
  },
  clear: function() {
    var $m, m, property, _i, _len, _ref, _results;
    $("title").remove();
    _ref = $("meta");
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      m = _ref[_i];
      $m = $(m);
      property = $m.attr('name') || $m.attr('property');
      if (property && __indexOf.call(ReactionCore.MetaData.settings.ignore, property) < 0) {
        _results.push($m.remove());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  },
  update: function(route, params, meta) {
    var key, keywords, product, routeName, shop, title;
    if (!Router.current()) {
      return false;
    }
    product = selectedProduct();
    shop = Shops.findOne(ReactionCore.getShopId());
    meta = [];
    title = "";
    if (shop != null ? shop.name : void 0) {
      ReactionCore.MetaData.name = shop.name;
    }
    if (params._id) {
      title = params._id.charAt(0).toUpperCase() + params._id.substring(1);
    } else {
      routeName = Router.current().route.getName();
      title = routeName.charAt(0).toUpperCase() + routeName.substring(1);
    }
    if (product && product.handle === params._id && product.handle) {
      if (product != null ? product.description : void 0) {
        meta.push({
          'name': 'description',
          'content': product.description
        });
      }
      if (product != null ? product.metafields : void 0) {
        keywords = (function() {
          var _i, _len, _ref, _results;
          _ref = product.metafields;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            _results.push(key.value);
          }
          return _results;
        })();
      }
      if (keywords) {
        meta.push({
          'name': 'keywords',
          'content': keywords.toString()
        });
      }
      if (product != null ? product.title : void 0) {
        title = product.title;
      }
    } else {
      if (shop != null ? shop.description : void 0) {
        meta.push({
          'description': shop.description
        });
      }
      if (shop != null ? shop.keywords : void 0) {
        meta.push({
          'keywords': shop.keywords
        });
      }
    }
    ReactionCore.MetaData.title = title;
    return ReactionCore.MetaData.meta = meta;
  },
  refresh: function(route, params, meta) {
    ReactionCore.MetaData.clear(route);
    ReactionCore.MetaData.update(route, params, meta);
    return ReactionCore.MetaData.render(route);
  }
};
