console.log("\nRunning Teddy server-side tests");

var teddy = require('../../teddy'),
renderedTemplate = '',
model = {
  letters: ['a', 'b', 'c'],
  names: {jack: 'guy', jill: 'girl', hill: 'landscape'},
  objects: [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}],
  something: 'Some content',
  somethingElse: true,
  variableName: 'Hello world!',
  varWithVarInside: 'Variable with a variable inside: {subVar}',
  subVar: 'And another: {variableName}',
  pageTitle: 'Teddy Templating Engine unit tests'
},

// unit tester function
unitTest = function(testName, testFunc) {
  try {
    if (testFunc()) {
      console.log('PASS: '+testName);
    }
    else {
      console.error('FAIL: '+testName);
    }
  }
  catch (e) {
    console.error('FAIL: '+testName+"\n"+'JS Error: '+e+"\n");
  }
};

// @param verbosity
// Possible values: none, concise (default), verbose, DEBUG
teddy.setVerbosity('concise');

// @param templateRoot
// Where to scan for templates on the filesystem in node.js environment (default value: is "./")
// Do not use with Express; for Express use app.set('views', './path/to/files/') instead
teddy.setTemplateRoot('../testTemplates/');

renderedTemplate = teddy.render('test.html', model);

console.log("\nUnrendered compiled template:\n" + teddy.compiledTemplates['test.html']);
console.log("\nData model applied to it:");
console.log(model);
console.log("\nFully rendered resulting HTML:\n" + renderedTemplate);

// run unit tests on rendered output
console.log("\nTest case results:\n");

// test list
unitTest('<title> tag test', function() {
  return renderedTemplate.indexOf('<title>Teddy Templating Engine unit tests</title>') > -1 ? true : false;
});

unitTest('<style> tag test', function() {
  return renderedTemplate.indexOf('<style> body{font-family: monospace;} </style>') > -1 ? true : false;
});

unitTest('{variable} test', function() {
  return renderedTemplate.indexOf('<section class="variables"><h1>Simple variable</h1><p>Hello world!</p><h2>Variable with a variable in it</h2><p>Variable with a variable inside: And another: Hello world!</p></section>') > -1 ? true : false;
});

unitTest('{! server-side comment !} test', function() {
  return (renderedTemplate.indexOf('{!') > -1 || renderedTemplate.indexOf('!}') > -1) ? false : true;
});

unitTest('<!-- HTML comment --> test', function() {
  return (renderedTemplate.indexOf('<!-- HTML comment; is sent to the client -->') > -1) ? true : false;
});

unitTest('<include> without arguments test', function() {
  return renderedTemplate.indexOf('<section class="includes"><h1>Includes</h1><section class="sampleIncludeWithoutArguments"><p>This is a sample included template without arguments.</p></section>') > -1 ? true : false;
});

unitTest('<include> with arguments test', function() {
  return renderedTemplate.indexOf('<section class="includes"><h1>Includes</h1><section class="sampleIncludeWithoutArguments"><p>This is a sample included template without arguments.</p></section><section class="sampleIncludeWithArguments"><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>Plain text argument</dd><dt>secondArgument:</dt><dd><span>Argument with HTML in it</span></dd><dt>thirdArgument: </dt><dd>Plain text argument to be checked via an if statement</dd></dl></section></section>') > -1 ? true : false;
});

unitTest('conditionals overall test', function() {
  return renderedTemplate.indexOf("<section class=\"flowcontrol\"><h1>Flow control</h1><p>The variable 'something' is present</p><p>The variable 'something' is not set to 'hello'</p><p>The variable 'something' is present</p><p>The variable 'something' is present</p><p>The variables 'something' and 'somethingElse' are both present</p></section>") > -1 ? true : false;
});

unitTest('one line if test', function() {
  return renderedTemplate.indexOf("<section class=\"onelineifs\"><h1>One line ifs</h1><p class=\"something-is-present\">One line if.</p><p class=\"something-is-not-hello\">One line if.</p></section>") > -1 ? true : false;
});

unitTest('loops overall test', function() {
  return renderedTemplate.indexOf("<section class=\"looping\"><h1>Looping</h1><dl><dt>JS model:</dt><dd>letters = ['a', 'b', 'c'];</dd><dt>HTML template:</dt><dd><p>a</p><p>b</p><p>c</p></dd></dl><dl><dt>JS model:</dt><dd>names = {jack: 'guy', jill: 'girl', hill: 'landscape'};</dd><dt>HTML template:</dt><dd><p>jack</p><p>guy</p><p>jill</p><p>girl</p><p>hill</p><p>landscape</p></dd></dl><dl><dt>JS model:</dt><dd>objects = [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}];</dd><dt>HTML template:</dt><dd><p>0</p><p>1</p><p>2</p><p>3</p><p>1</p><p>4</p><p>5</p><p>6</p><p>2</p><p>7</p><p>8</p><p>9</p></dd></dl><dl><dt>JS model:</dt><dd>objects = [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}];</dd><dt>HTML template:</dt><dd><p hidden=\"\">item.b is 5</p><section class=\"sampleIncludeWithArguments\"><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>2</dd><dt>secondArgument:</dt><dd><span>3</span></dd><dt>thirdArgument: </dt><dd>not present</dd></dl></section><p>item.a is 4</p><p class=\"item-b-is-five\">item.b is 5</p><section class=\"sampleIncludeWithArguments\"><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>5</dd><dt>secondArgument:</dt><dd><span>6</span></dd><dt>thirdArgument: </dt><dd>not present</dd></dl></section><p hidden=\"\">item.b is 5</p><section class=\"sampleIncludeWithArguments\"><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>8</dd><dt>secondArgument:</dt><dd><span>9</span></dd><dt>thirdArgument: </dt><dd>not present</dd></dl></section></dd></dl></section>") > -1 ? true : false;
});

unitTest('packaged templates test', function() {
  if (teddy.packagedTemplates['inc/sampleIncludeWithArguments.html'] !== "teddy.compiledTemplates['inc/sampleIncludeWithArguments.html']='<section class=\\'sampleIncludeWithArguments\\'><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>{firstArgument}</dd><dt>secondArgument:</dt><dd>{secondArgument}</dd><dt>thirdArgument: </dt><if thirdArgument><dd>{thirdArgument}</dd></if><else><dd>not present</dd></else></dl></section>';" || teddy.packagedTemplates['inc/sampleIncludeWithoutArguments.html'] !== "teddy.compiledTemplates['inc/sampleIncludeWithoutArguments.html']='<section class=\\'sampleIncludeWithoutArguments\\'><p>This is a sample included template without arguments.</p></section>';") {
    return false;
  }
  try {
    eval(teddy.packagedTemplates['inc/sampleIncludeWithArguments']);
    eval(teddy.packagedTemplates['inc/sampleIncludeWithoutArguments']);
    return true;
  }
  catch (e) {
    console.error(e);
    return false;
  }
});

console.log();