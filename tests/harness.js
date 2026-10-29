// A tiny test harness that works the same in Node (run-node.js) and in the browser (playtest.html).
var __tests = [];

function test(name, fn) {
  __tests.push({ name: name, fn: fn });
}

function eq(actual, expected, msg) {
  var a = JSON.stringify(actual);
  var e = JSON.stringify(expected);
  if (a !== e) throw new Error((msg ? msg + ": " : "") + "expected " + e + " but got " + a);
}

function ok(cond, msg) {
  if (!cond) throw new Error(msg || "expected a true value");
}

function runTests() {
  var failures = [];
  var passed = 0;
  for (var i = 0; i < __tests.length; i++) {
    try {
      __tests[i].fn();
      passed++;
    } catch (e) {
      failures.push({ name: __tests[i].name, message: (e && e.message) || String(e) });
    }
  }
  return { passed: passed, failures: failures };
}
