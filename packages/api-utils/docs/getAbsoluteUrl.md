# getAbsoluteUrl

A function that takes a root URL and a relative URL and combines them. Handles URLs that do and don't begin and end with slashes.

- It's fine to pass a path that may be undefined. Just the root URL will be returned.
- It's fine to pass a path that may already be absolute. It will be left alone.

Example:

```js
const rootUrl = "http://localhost:3000/";
const path = "/media/test.jpg";
const url = getAbsoluteUrl(rootUrl, path); // http://localhost:3000/media/test.jpg
```
