// Meta tag required to get web crawlers to use
// https://example.com/?_escaped_fragment_= when crawling.
// This is necessary for either prerender or phantomjs

const tag = "<meta name='fragment' content='!'>";
document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", tag);
