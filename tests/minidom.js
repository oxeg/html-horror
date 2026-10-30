// minidom: a tiny HTML reader for tests, so Node can look at index.html without a browser.
// minidom(html) -> { body }. Elements have tagName, children, getAttribute, hasAttribute,
// innerHTML and textContent. Well-formed input only. The same file also loads in a page.
function minidom(html) {
  var VOID = { AREA: 1, BASE: 1, BR: 1, COL: 1, EMBED: 1, HR: 1, IMG: 1, INPUT: 1, LINK: 1, META: 1, SOURCE: 1, TRACK: 1, WBR: 1 };
  var NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

  function decode(s) {
    return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (all, e) {
      if (e.charAt(0) === "#") {
        var n = e.charAt(1).toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return String.fromCodePoint(n);
      }
      return NAMED.hasOwnProperty(e) ? NAMED[e] : all;
    });
  }

  function Element(tag) {
    this.tagName = tag;
    this.children = [];
    this.parts = []; // the text and child elements, in order
    this.attrs = {};
    this.innerHTML = "";
  }
  Element.prototype.getAttribute = function (name) {
    name = name.toLowerCase();
    return this.attrs.hasOwnProperty(name) ? this.attrs[name] : null;
  };
  Element.prototype.hasAttribute = function (name) { return this.attrs.hasOwnProperty(name.toLowerCase()); };
  Object.defineProperty(Element.prototype, "textContent", {
    get: function () {
      return this.parts.map(function (p) { return typeof p === "string" ? p : p.textContent; }).join("");
    },
  });

  function parseAttrs(src, el) {
    var re = /([^\s=\/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    var m;
    while ((m = re.exec(src))) {
      var value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
      el.attrs[m[1].toLowerCase()] = value === undefined ? "" : decode(value);
    }
  }

  var root = new Element("ROOT");
  var stack = [root];
  var starts = [0]; // where each open element's content begins in html
  var i = 0;
  var tag = /^<([a-zA-Z][^\s\/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/;
  function top() { return stack[stack.length - 1]; }
  function text(s) { if (s) top().parts.push(decode(s)); }

  while (i < html.length) {
    var lt = html.indexOf("<", i);
    if (lt < 0) { text(html.slice(i)); break; }
    text(html.slice(i, lt));
    i = lt;
    if (html.substr(i, 4) === "<!--") {
      var endC = html.indexOf("-->", i + 4);
      i = endC < 0 ? html.length : endC + 3;
    } else if (html.charAt(i + 1) === "!" || html.charAt(i + 1) === "?") {
      i = html.indexOf(">", i) + 1 || html.length;
    } else if (html.charAt(i + 1) === "/") {
      var endT = html.indexOf(">", i);
      stack[stack.length - 1].innerHTML = html.slice(starts[starts.length - 1], i);
      if (stack.length > 1) { stack.pop(); starts.pop(); }
      i = endT < 0 ? html.length : endT + 1;
    } else {
      var m = tag.exec(html.slice(i));
      if (!m) { text("<"); i++; continue; }
      var el = new Element(m[1].toUpperCase());
      parseAttrs(m[2], el);
      top().children.push(el);
      top().parts.push(el);
      i += m[0].length;
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE") {
        var close = html.toLowerCase().indexOf("</" + el.tagName.toLowerCase(), i);
        if (close < 0) close = html.length;
        el.innerHTML = html.slice(i, close);
        i = html.indexOf(">", close) + 1 || html.length;
      } else if (!VOID[el.tagName] && !/\/\s*$/.test(m[2])) {
        stack.push(el);
        starts.push(i);
      }
    }
  }

  function find(el, name) {
    if (el.tagName === name) return el;
    for (var k = 0; k < el.children.length; k++) {
      var found = find(el.children[k], name);
      if (found) return found;
    }
    return null;
  }
  return { body: find(root, "BODY") || root };
}

if (typeof module !== "undefined" && module.exports) module.exports = minidom;
