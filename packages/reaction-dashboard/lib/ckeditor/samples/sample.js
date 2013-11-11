/*
 Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
*/
(function(){CKEDITOR.on("instanceReady",function(b){var b=b.editor,a=CKEDITOR.document.$.getElementsByName("ckeditor-sample-required-plugins"),a=a.length?CKEDITOR.dom.element.get(a[0]).getAttribute("content").split(","):[],c=[];if(a.length){for(var d=0;d<a.length;d++)b.plugins[a[d]]||c.push("<code>"+a[d]+"</code>");c.length&&CKEDITOR.dom.element.createFromHtml('<div class="warning"><span>To fully experience this demo, the '+c.join(", ")+" plugin"+(1<c.length?"s are":" is")+" required.</span></div>").insertBefore(b.container)}})})();