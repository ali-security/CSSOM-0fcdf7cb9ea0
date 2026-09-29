// Headless Node runner for CSSOM's browser Jasmine 1.1 suite (spec/index.html).
// Usage: node .github/scripts/run-specs.js <repo-root> <objectDiff-dir>; TEST_FILTER env selects specs by full-name substring.
var vm = require("vm"), fs = require("fs"), path = require("path");
var root = process.argv[2], od = process.argv[3];
var filter = process.env.TEST_FILTER || "";
global.window = global;
global.document = { createElement: function(){ return {}; } };
function load(p){ vm.runInThisContext(fs.readFileSync(p, "utf8"), { filename: p }); }
load(path.join(od, "objectDiff.js"));
load(path.join(od, "jasmine-objectDiff.js"));
// Plain-text failure messages instead of DOM nodes.
["toEqualProperties","toEqualOwnProperties"].forEach(function(name){
  var orig = objectDiff.jasmine[name];
  objectDiff.jasmine[name] = function(expected){
    var r = orig.call(this, expected);
    var diff = name === "toEqualProperties" ? objectDiff.diff(expected, this.actual) : objectDiff.diffOwnProperties(expected, this.actual);
    this.message = function(){ return "objects differ: " + JSON.stringify(diff).slice(0, 2000); };
    return r;
  };
});
// window is defined, so jasmine.js takes its browser path and declares its globals.
load(path.join(root, "spec/vendor/jasmine/jasmine.js"));
global.CSSOM = require(path.join(root, "lib/index.js"));
// Spec files from spec/index.html, plus CSSImportRule.spec.js. CSSProperty.spec.js is left out because lib/ has no CSSOM.CSSProperty.
var specs = ["helper.js","utils.js","parse.spec.js","MediaList.spec.js","CSSStyleRule.spec.js","CSSStyleDeclaration.spec.js","CSSStyleSheet.spec.js","CSSValueExpression.spec.js","CSSImportRule.spec.js"];
specs.forEach(function(f){ load(path.join(root, "spec", f)); });
var env = jasmine.getEnv();
if (filter) env.specFilter = function(spec){ return spec.getFullName().indexOf(filter) !== -1; };
var passed = 0, failed = 0, skipped = 0;
var reporter = new jasmine.Reporter();
reporter.reportSpecResults = function(spec){
  var r = spec.results();
  if (r.skipped) { skipped++; return; }
  if (r.passed()) { passed++; console.log("PASS " + spec.getFullName()); }
  else {
    failed++; console.log("FAIL " + spec.getFullName());
    r.getItems().forEach(function(it){ if (it.passed && !it.passed()) console.log("    " + it.message); });
  }
};
reporter.reportRunnerResults = function(){
  console.log("\n" + (passed + failed) + " specs, " + passed + " passed, " + failed + " failed, " + skipped + " skipped");
  process.exit(failed === 0 && passed > 0 ? 0 : 1);
};
env.addReporter(reporter);
env.execute();
