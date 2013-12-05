#
# configure google font using javascript
# rather than css import
# https://github.com/meteor/meteor/issues/662
#
WebFontConfig = google:
  families: ["Open+Sans:400,300,600,700:latin"]

(->
  wf = document.createElement("script")
  wf.src = ((if "https:" is document.location.protocol then "https" else "http")) + "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js"
  wf.type = "text/javascript"
  wf.async = "true"
  s = document.getElementsByTagName("script")[0]
  s.parentNode.insertBefore wf, s
)()
