var ResourceCenterWebView = (function () {
	'use strict';

	var undefined;

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var runtime_1 = createCommonjsModule(function (module) {
	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var runtime = (function (exports) {

	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined$1; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  exports.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  // This is a polyfill for %IteratorPrototype% for environments that
	  // don't natively support it.
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };

	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    // This environment has a native %IteratorPrototype%; use it instead
	    // of the polyfill.
	    IteratorPrototype = NativeIteratorPrototype;
	  }

	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] =
	    GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  exports.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  exports.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `hasOwn.call(value, "__await")` to determine if the yielded value is
	  // meant to be awaited.
	  exports.awrap = function(arg) {
	    return { __await: arg };
	  };

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return Promise.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration.
	          result.value = unwrapped;
	          resolve(result);
	        }, function(error) {
	          // If a rejected Promise was yielded, throw the rejection back
	          // into the async generator function so it can be handled there.
	          return invoke("throw", error, resolve, reject);
	        });
	      }
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  exports.AsyncIterator = AsyncIterator;

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  exports.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return exports.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      context.method = method;
	      context.arg = arg;

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }

	        if (context.method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = context.arg;

	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }

	          context.dispatchException(context.arg);

	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          if (record.arg === ContinueSentinel) {
	            continue;
	          }

	          return {
	            value: record.arg,
	            done: context.done
	          };

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(context.arg) call above.
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }

	  // Call delegate.iterator[context.method](context.arg) and handle the
	  // result, either by returning a { value, done } result from the
	  // delegate iterator, or by modifying context.method and context.arg,
	  // setting context.delegate to null, and returning the ContinueSentinel.
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined$1) {
	      // A .throw or .return when the delegate iterator has no .throw
	      // method always terminates the yield* loop.
	      context.delegate = null;

	      if (context.method === "throw") {
	        // Note: ["return"] must be used for ES3 parsing compatibility.
	        if (delegate.iterator["return"]) {
	          // If the delegate iterator has a return method, give it a
	          // chance to clean up.
	          context.method = "return";
	          context.arg = undefined$1;
	          maybeInvokeDelegate(delegate, context);

	          if (context.method === "throw") {
	            // If maybeInvokeDelegate(context) changed context.method from
	            // "return" to "throw", let that override the TypeError below.
	            return ContinueSentinel;
	          }
	        }

	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }

	      return ContinueSentinel;
	    }

	    var record = tryCatch(method, delegate.iterator, context.arg);

	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    var info = record.arg;

	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    if (info.done) {
	      // Assign the result of the finished delegate to the temporary
	      // variable specified by delegate.resultName (see delegateYield).
	      context[delegate.resultName] = info.value;

	      // Resume execution at the desired location (see delegateYield).
	      context.next = delegate.nextLoc;

	      // If context.method was "throw" but the delegate handled the
	      // exception, let the outer generator proceed normally. If
	      // context.method was "next", forget context.arg since it has been
	      // "consumed" by the delegate iterator. If context.method was
	      // "return", allow the original .return call to continue in the
	      // outer generator.
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined$1;
	      }

	    } else {
	      // Re-yield the result returned by the delegate method.
	      return info;
	    }

	    // The delegate iterator is finished, so forget it and continue with
	    // the outer generator.
	    context.delegate = null;
	    return ContinueSentinel;
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[toStringTagSymbol] = "Generator";

	  // A Generator should always return itself as the iterator object when the
	  // @@iterator function is called on it. Some browsers' implementations of the
	  // iterator prototype chain incorrectly implement this, causing the Generator
	  // object to not be returned from this call. This ensures that doesn't happen.
	  // See https://github.com/facebook/regenerator/issues/274 for more details.
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  exports.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined$1;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  exports.values = values;

	  function doneResult() {
	    return { value: undefined$1, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined$1;
	      this.done = false;
	      this.delegate = null;

	      this.method = "next";
	      this.arg = undefined$1;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined$1;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;

	        if (caught) {
	          // If the dispatched exception was caught by a catch block,
	          // then let that catch block handle the exception normally.
	          context.method = "next";
	          context.arg = undefined$1;
	        }

	        return !! caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }

	      return this.complete(record);
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }

	      return ContinueSentinel;
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      if (this.method === "next") {
	        // Deliberately forget the last sent value so that we don't
	        // accidentally pass it on to the delegate.
	        this.arg = undefined$1;
	      }

	      return ContinueSentinel;
	    }
	  };

	  // Regardless of whether this script is executing as a CommonJS module
	  // or not, return the runtime object so that we can declare the variable
	  // regeneratorRuntime in the outer scope, which allows this module to be
	  // injected easily by `bin/regenerator --include-runtime script.js`.
	  return exports;

	}(
	  // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	  module.exports
	));

	try {
	  regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
	  // This module should not be running in strict mode, so the above
	  // assignment should always work unless something is misconfigured. Just
	  // in case runtime.js accidentally runs in strict mode, we can escape
	  // strict mode using a global Function call. This could conceivably fail
	  // if a Content Security Policy forbids using Function, but in that case
	  // the proper solution is to fix the accidental strict mode problem. If
	  // you've misconfigured your bundler to force strict mode and applied a
	  // CSP to forbid Function, and you're not willing to fix either of those
	  // problems, please detail your unique predicament in a GitHub issue.
	  Function("r", "regeneratorRuntime = r")(runtime);
	}
	});

	var regenerator = runtime_1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	  try {
	    var info = gen[key](arg);
	    var value = info.value;
	  } catch (error) {
	    reject(error);
	    return;
	  }

	  if (info.done) {
	    resolve(value);
	  } else {
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	var asyncToGenerator = _asyncToGenerator;

	function htmlToElement(html) {
	  var template = document.createElement('template');
	  html = html.trim();
	  template.innerHTML = html;
	  return template.content.firstChild;
	}

	var ROOM_PREVIEW_ACTIONS = {
	  LoadResources: 'Load Resources',
	  LoadResourcesCompleted: 'Load Resources Completed',
	  LoadResourcesFailed: 'Load Resources Failed',
	  SelectResource: 'Select Resource',
	  NextResource: 'Next Resource',
	  OpenScheduleCallDialog: 'Open Schedule Call Dialog',
	  CloseScheduleCallDialog: 'Close Schedule Call Dialog',
	  OpenShareByEmailDialog: 'Open Share by Email Dialog',
	  CloseShareByEmailDialog: 'Close Share by Email Dialog'
	};

	function leftSidebarTemplate() {
	  var html = "\n<div class=\"Left-sideboxR-center\">\n    <div class=\"header-Content-brandingbox\">\n        <div class=\"Logo-box-r-cent\">\n            <img src=\"https://storage.googleapis.com/social27/images/augusta.png\" class=\"img-responsive\">\n        </div>\n\n        <div class=\"Call-Meetingbox\">\n            <a onclick=\"s27ResourceCenterWebView.utils.pubSub.publish('".concat(ROOM_PREVIEW_ACTIONS.OpenScheduleCallDialog, "')\">Schedule a call</a>\n        </div>\n\n        <div class=\"Actions-Iconbox-R-center\">\n            <a><i class=\"fa fa-linkedin\" aria-hidden=\"true\"></i></a>\n            <a><i class=\"fa fa-facebook-official\" aria-hidden=\"true\"></i></a>\n            <a><i class=\"fa fa-twitter\" aria-hidden=\"true\"></i></a>\n            <a  onclick=\"s27ResourceCenterWebView.utils.pubSub.publish('").concat(s27ResourceCenterWebView.pages.roomPreview.ROOM_PREVIEW_ACTIONS.OpenShareByEmailDialog, "')\"><i class=\"fa fa-envelope\" aria-hidden=\"true\"></i></a>\n            <a><i class=\"fa fa-share-alt\" aria-hidden=\"true\"></i></a>\n        </div>\n\n        <div class=\"Title-HeadingboxR\">Recomended For You</div>\n    </div>\n    \n    ").concat(resourceListTemplate(), "\n\n    <!-- cookiee settings and footer -->\n    <div class=\"FootSetingbox\">\n        <div class=\"CookeeStBox\">\n          <a><i class=\"fa fa-cog\" aria-hidden=\"true\"></i> Cookie Settings</a>\n        </div>\n        <div class=\"Copy-termsBox\">\n          <a>View Privacy Policy</a> | Powered by <span>Social27</span>\n        </div>\n\n    </div>\n\n    <!-- cookiee settings and footer -->\n\n</div>  \n");
	  return html;
	}

	var ROOM_PREVIEW_ELEMENT_IDS = {
	  CONTAINER: 'roomPreviewPage_container',
	  CONTENT: 'roomPreviewPage_content',
	  RESOURCE_LIST: 'roomPreviewPage_resourceList',
	  NEXT_RESOURCE: 'roomPreviewPage_nextResource'
	};

	var elementId = ROOM_PREVIEW_ELEMENT_IDS.NEXT_RESOURCE;
	function nextResourceTemplate(resource) {
	  if (!resource) {
	    return '';
	  }

	  return "\n<div id=\"".concat(elementId, "\" onclick=\"s27ResourceCenterWebView.utils.pubSub.publish(ROOM_PREVIEW_ACTIONS.NextResource)\" class=\"nextSseion\">\n    <div class=\"Txt-ARrow\">Next <i class=\"fa fa-arrow-right\" aria-hidden=\"true\"></i></div>\n    <div class=\"Card-NextBox-Cont\">\n        <div class=\"Txt-ARrow\">Next <i class=\"fa fa-arrow-right\" aria-hidden=\"true\"></i></div>\n        <div class=\"Nxt-PreviewThumbbox\">\n          <img src=\"").concat(resource.thumbnail, "\">\n        </div>\n        <div class=\"Descript-Txt\">").concat(resource.title, "</div>\n    </div>\n</div>\n");
	}
	function rerenderNextResourceElement(resource) {
	  var element = document.getElementById(elementId);

	  if (element) {
	    element.innerHTML = nextResourceTemplate(resource);
	  }
	}

	var ROOM_PREVIEW_STORE = {};

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	var classCallCheck = _classCallCheck;

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	var createClass = _createClass;

	var PubSub =
	/*#__PURE__*/
	function () {
	  function PubSub() {
	    classCallCheck(this, PubSub);

	    this.subIds = 0;
	    this.subscriptions = {};
	  }

	  createClass(PubSub, [{
	    key: "subscribe",
	    value: function subscribe(topic, fn) {
	      var _this = this;

	      if (!this.subscriptions[topic]) this.subscriptions[topic] = {};
	      var token = ++this.subIds; // Validate topic name and function constructor

	      this.subscriptions[topic][token] = fn;
	      return function () {
	        return _this.unsubscribe(topic, token);
	      };
	    }
	  }, {
	    key: "publish",
	    value: function publish(topic) {
	      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      var subs = this.subscriptions[topic];
	      if (!subs) return false;
	      Object.values(subs).forEach(function (sub) {
	        return sub.apply(void 0, args);
	      });
	    }
	  }, {
	    key: "unsubscribe",
	    value: function unsubscribe(topic, token) {
	      if (!token) delete this.subscriptions[topic]; // Delete all subscriptions for the topic

	      this.subscriptions[topic] && delete this.subscriptions[topic][token]; // Delete specific subscription
	    }
	  }]);

	  return PubSub;
	}();

	var pubSub = new PubSub();

	var config = {
	  baseUrl: 'https://botapi.social27.com/api/',
	  imageUrl: 'https://storage.googleapis.com/olibot/images/icons/',
	  youtubeIframeUrl: 'https://www.youtube.com/player_api'
	};

	var config$1 = /*#__PURE__*/Object.freeze({
		config: config
	});

	var store = {
	  mediaIndex: -1,
	  time: 0,
	  userSessionId: '',
	  resources: [],
	  selectedResourceId: '',
	  options: {
	    roomTrackId: null
	  },
	  userId: 0,
	  viewerClosed: true,
	  openedDialogIds: new Set([])
	};

	function httpRequest(_x, _x2) {
	  return _httpRequest.apply(this, arguments);
	}

	function _httpRequest() {
	  _httpRequest = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(url, method) {
	    var body,
	        options,
	        _args = arguments;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            body = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
	            _context.prev = 1;
	            options = {
	              mode: 'cors',
	              method: method,
	              headers: {
	                'Accept': 'application/json',
	                'Content-Type': 'application/json',
	                'Access-Control-Allow-Headers': '*',
	                'Access-Control-Allow-Origin': '*'
	              }
	            };

	            if (method.toLowerCase() !== 'get') {
	              options.body = JSON.stringify(body);
	            }

	            _context.next = 6;
	            return fetch(url, options).then(function (response) {
	              return response.json();
	            }).then(function (json) {
	              return json;
	            })["catch"](function (e) {
	              return e;
	            });

	          case 6:
	            return _context.abrupt("return", _context.sent);

	          case 9:
	            _context.prev = 9;
	            _context.t0 = _context["catch"](1);
	            throw new Error(_context.t0);

	          case 12:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee, null, [[1, 9]]);
	  }));
	  return _httpRequest.apply(this, arguments);
	}

	function checkFormAlreadySubmitted(_x) {
	  return _checkFormAlreadySubmitted.apply(this, arguments);
	}

	function _checkFormAlreadySubmitted() {
	  _checkFormAlreadySubmitted = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(data) {
	    var body;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            body = {
	              visitorId: data.visitorId,
	              roomId: store.options.roomId,
	              formId: store.options.userId,
	              strategyId: data.strategyId
	            };
	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl, "form/submited"), 'post', body));

	          case 2:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _checkFormAlreadySubmitted.apply(this, arguments);
	}

	function getTzOffset() {
	  var offset = (new Date().getTimezoneOffset() / -60).toFixed(2).replace('.', ':');
	  return offset.startsWith('-') ? offset : "+".concat(offset);
	}

	function createMeetingEvent(_x) {
	  return _createMeetingEvent.apply(this, arguments);
	}

	function _createMeetingEvent() {
	  _createMeetingEvent = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(data) {
	    var body;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            body = {
	              userId: store.options.botUserId,
	              email: data.email,
	              name: data.name,
	              date: data.date,
	              startTime: data.startTime,
	              endTime: data.endTime,
	              daySlotId: data.daySlotId,
	              offSet: getTzOffset()
	            };
	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl, "room/").concat(store.options.roomTrackId, "/schedulemeeting"), 'post', body));

	          case 2:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _createMeetingEvent.apply(this, arguments);
	}

	function getAvailableDatesForScheduleMeeting() {
	  return _getAvailableDatesForScheduleMeeting.apply(this, arguments);
	}

	function _getAvailableDatesForScheduleMeeting() {
	  _getAvailableDatesForScheduleMeeting = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee() {
	    var body;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            body = {
	              offSet: getTzOffset()
	            };
	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl, "room/").concat(store.options.roomTrackId, "/getpresentatives"), 'post', body));

	          case 2:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _getAvailableDatesForScheduleMeeting.apply(this, arguments);
	}

	function getFormSettings(_x) {
	  return _getFormSettings.apply(this, arguments);
	}

	function _getFormSettings() {
	  _getFormSettings = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(data) {
	    var body;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            body = {
	              formId: data.formId,
	              userId: store.options.userId
	            };
	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl, "form/setting/forvisitor"), 'post', body));

	          case 2:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _getFormSettings.apply(this, arguments);
	}

	function getFormStrategy() {
	  return _getFormStrategy.apply(this, arguments);
	}

	function _getFormStrategy() {
	  _getFormStrategy = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee() {
	    var data,
	        body,
	        _args = arguments;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            data = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
	            body = {
	              strategyId: data && data.strategyId ? data.strategyId : 0,
	              roomId: store.options.roomId,
	              userId: store.options.userId
	            };
	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl).concat(store.options.botUserId, "/strategies"), 'post', body));

	          case 3:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _getFormStrategy.apply(this, arguments);
	}

	function getIpInfoApi() {
	  return _getIpInfoApi.apply(this, arguments);
	}

	function _getIpInfoApi() {
	  _getIpInfoApi = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee() {
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            return _context.abrupt("return", httpRequest("".concat(window.location.protocol, "//ipinfo.io"), 'get'));

	          case 1:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _getIpInfoApi.apply(this, arguments);
	}

	function getResources(_x) {
	  return _getResources.apply(this, arguments);
	}

	function _getResources() {
	  _getResources = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(roomTrackId) {
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl).concat(roomTrackId, "/resources"), 'post', {}));

	          case 1:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _getResources.apply(this, arguments);
	}

	function saveUser() {
	  return _saveUser.apply(this, arguments);
	}

	function _saveUser() {
	  _saveUser = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee() {
	    var body;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            body = {
	              trackId: store.options.roomTrackId,
	              fromId: store.options.botUserId,
	              locationInfo: {
	                state: null,
	                country: null,
	                city: null,
	                utcOffSet: null,
	                ip: null
	              },
	              userAgent: navigator.userAgent,
	              firstName: null,
	              lastName: null,
	              email: null,
	              phone: null,
	              company: null,
	              companySize: null,
	              companyWebSite: null,
	              companyIndustry: null,
	              jobTitle: null
	            };
	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl, "room/").concat(body.trackId, "/add/user"), 'post', body));

	          case 2:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _saveUser.apply(this, arguments);
	}

	function shareResourceByEmail(_x) {
	  return _shareResourceByEmail.apply(this, arguments);
	}

	function _shareResourceByEmail() {
	  _shareResourceByEmail = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(data) {
	    var body;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            body = {
	              subject: data.subject,
	              sharedTo: data.sharedTo,
	              sharedFrom: data.sharedFrom,
	              botUserId: store.options.botUserId,
	              roomTrackId: store.options.roomTrackId,
	              resourceId: data.resource.id,
	              resourceTitle: data.resource.title,
	              thumbnail: data.resource.thumbnail,
	              sharedType: data.resource.mediaTypeId,
	              resourceLink: data.resource.mediaUrl,
	              pageurl: window.location.href
	            };
	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl, "sharingInfo"), 'post', body));

	          case 2:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _shareResourceByEmail.apply(this, arguments);
	}

	function submitForm(data) {
	  var body = {
	    userId: store.options.botUserId,
	    trackId: store.options.roomTrackId,
	    formId: data.formId,
	    resourceId: data.resourceId,
	    strategyId: data.strategyId,
	    pageUrl: data.pageUrl || window.location.href,
	    allowedCookies: data.allowedCookies,
	    allowedOptIn: data.allowedOptIn,
	    inputFields: data.inputFields
	  };
	  return httpRequest("".concat(config.baseUrl, "room/submitform"), 'post', body);
	}

	/**
	 * Helpers.
	 */

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	var ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^((?:\d+)?\-?\d?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}

	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = ms;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* Active `debug` instances.
		*/
		createDebug.instances = [];

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return match;
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.enabled = createDebug.enabled(namespace);
			debug.useColors = createDebug.useColors();
			debug.color = selectColor(namespace);
			debug.destroy = destroy;
			debug.extend = extend;
			// Debug.formatArgs = formatArgs;
			// debug.rawLog = rawLog;

			// env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			createDebug.instances.push(debug);

			return debug;
		}

		function destroy() {
			const index = createDebug.instances.indexOf(this);
			if (index !== -1) {
				createDebug.instances.splice(index, 1);
				return true;
			}
			return false;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);

			createDebug.names = [];
			createDebug.skips = [];

			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;

			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}

				namespaces = split[i].replace(/\*/g, '.*?');

				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}

			for (i = 0; i < createDebug.instances.length; i++) {
				const instance = createDebug.instances[i];
				instance.enabled = createDebug.enabled(instance.namespace);
			}
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}

			let i;
			let len;

			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}

			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	var common = setup;

	var browser = createCommonjsModule(function (module, exports) {
	/* eslint-env browser */

	/**
	 * This is the web browser implementation of `debug()`.
	 */

	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = localstorage();

	/**
	 * Colors.
	 */

	exports.colors = [
		'#0000CC',
		'#0000FF',
		'#0033CC',
		'#0033FF',
		'#0066CC',
		'#0066FF',
		'#0099CC',
		'#0099FF',
		'#00CC00',
		'#00CC33',
		'#00CC66',
		'#00CC99',
		'#00CCCC',
		'#00CCFF',
		'#3300CC',
		'#3300FF',
		'#3333CC',
		'#3333FF',
		'#3366CC',
		'#3366FF',
		'#3399CC',
		'#3399FF',
		'#33CC00',
		'#33CC33',
		'#33CC66',
		'#33CC99',
		'#33CCCC',
		'#33CCFF',
		'#6600CC',
		'#6600FF',
		'#6633CC',
		'#6633FF',
		'#66CC00',
		'#66CC33',
		'#9900CC',
		'#9900FF',
		'#9933CC',
		'#9933FF',
		'#99CC00',
		'#99CC33',
		'#CC0000',
		'#CC0033',
		'#CC0066',
		'#CC0099',
		'#CC00CC',
		'#CC00FF',
		'#CC3300',
		'#CC3333',
		'#CC3366',
		'#CC3399',
		'#CC33CC',
		'#CC33FF',
		'#CC6600',
		'#CC6633',
		'#CC9900',
		'#CC9933',
		'#CCCC00',
		'#CCCC33',
		'#FF0000',
		'#FF0033',
		'#FF0066',
		'#FF0099',
		'#FF00CC',
		'#FF00FF',
		'#FF3300',
		'#FF3333',
		'#FF3366',
		'#FF3399',
		'#FF33CC',
		'#FF33FF',
		'#FF6600',
		'#FF6633',
		'#FF9900',
		'#FF9933',
		'#FFCC00',
		'#FFCC33'
	];

	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */

	// eslint-disable-next-line complexity
	function useColors() {
		// NB: In an Electron preload script, document will be defined but not fully
		// initialized. Since we know we're in Chrome, we'll just detect this case
		// explicitly
		if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
			return true;
		}

		// Internet Explorer and Edge do not support colors.
		if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
			return false;
		}

		// Is webkit? http://stackoverflow.com/a/16459606/376773
		// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
		return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
			// Is firebug? http://stackoverflow.com/a/398120/376773
			(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
			// Is firefox >= v31?
			// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
			// Double check webkit in userAgent just in case we are in a worker
			(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
	}

	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */

	function formatArgs(args) {
		args[0] = (this.useColors ? '%c' : '') +
			this.namespace +
			(this.useColors ? ' %c' : ' ') +
			args[0] +
			(this.useColors ? '%c ' : ' ') +
			'+' + module.exports.humanize(this.diff);

		if (!this.useColors) {
			return;
		}

		const c = 'color: ' + this.color;
		args.splice(1, 0, c, 'color: inherit');

		// The final "%c" is somewhat tricky, because there could be other
		// arguments passed either before or after the %c, so we need to
		// figure out the correct index to insert the CSS into
		let index = 0;
		let lastC = 0;
		args[0].replace(/%[a-zA-Z%]/g, match => {
			if (match === '%%') {
				return;
			}
			index++;
			if (match === '%c') {
				// We only are interested in the *last* %c
				// (the user may have provided their own)
				lastC = index;
			}
		});

		args.splice(lastC, 0, c);
	}

	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	function log(...args) {
		// This hackery is required for IE8/9, where
		// the `console.log` function doesn't have 'apply'
		return typeof console === 'object' &&
			console.log &&
			console.log(...args);
	}

	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	function save(namespaces) {
		try {
			if (namespaces) {
				exports.storage.setItem('debug', namespaces);
			} else {
				exports.storage.removeItem('debug');
			}
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}

	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	function load() {
		let r;
		try {
			r = exports.storage.getItem('debug');
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}

		// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
		if (!r && typeof process !== 'undefined' && 'env' in process) {
			r = process.env.DEBUG;
		}

		return r;
	}

	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */

	function localstorage() {
		try {
			// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
			// The Browser also has localStorage in the global context.
			return localStorage;
		} catch (error) {
			// Swallow
			// XXX (@Qix-) should we be logging these?
		}
	}

	module.exports = common(exports);

	const {formatters} = module.exports;

	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */

	formatters.j = function (v) {
		try {
			return JSON.stringify(v);
		} catch (error) {
			return '[UnexpectedJSONParseError]: ' + error.message;
		}
	};
	});
	var browser_1 = browser.log;
	var browser_2 = browser.formatArgs;
	var browser_3 = browser.save;
	var browser_4 = browser.load;
	var browser_5 = browser.useColors;
	var browser_6 = browser.storage;
	var browser_7 = browser.colors;

	function trackApi(_x) {
	  return _trackApi.apply(this, arguments);
	}

	function _trackApi() {
	  _trackApi = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(data) {
	    var body, options, url, response;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            _context.prev = 0;
	            body = {
	              botUserId: store.userId,
	              userSessionId: store.userSessionId,
	              PageUrl: top.location.href,
	              resourceId: data.resourceId,
	              event: data.event,
	              timeSpent: data.timeSpent || null,
	              timeAt: data.timeAt || null,
	              cord: data.cord || null,
	              trackId: store.options.roomTrackId
	            };
	            browser.log(body);
	            options = {
	              mode: 'cors',
	              method: 'post',
	              headers: {
	                'Accept': 'application/json',
	                'Content-Type': 'application/json',
	                'Access-Control-Allow-Headers': '*',
	                'Access-Control-Allow-Origin': '*'
	              },
	              body: JSON.stringify(body)
	            };
	            url = config.baseUrl + 'visits/resource';
	            _context.next = 7;
	            return fetch(url, options).then(function (response) {
	              return response.json();
	            }).then(function (json) {
	              return json;
	            })["catch"](function (e) {
	              return e;
	            });

	          case 7:
	            response = _context.sent;
	            return _context.abrupt("return", response);

	          case 11:
	            _context.prev = 11;
	            _context.t0 = _context["catch"](0);
	            throw new Error(_context.t0);

	          case 14:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee, null, [[0, 11]]);
	  }));
	  return _trackApi.apply(this, arguments);
	}

	function validateResourceRoom() {
	  return _validateResourceRoom.apply(this, arguments);
	}

	function _validateResourceRoom() {
	  _validateResourceRoom = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee() {
	    var body;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            body = {
	              domain: window.location.href
	            };

	            if (store.options.botKey) {
	              body.botKey = store.options.botKey;
	            }

	            return _context.abrupt("return", httpRequest("".concat(config.baseUrl, "room/").concat(store.options.roomTrackId, "/validate"), 'post', body));

	          case 3:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _validateResourceRoom.apply(this, arguments);
	}



	var index = /*#__PURE__*/Object.freeze({
		checkFormAlreadySubmitted: checkFormAlreadySubmitted,
		createMeetingEvent: createMeetingEvent,
		getAvailableDatesForScheduleMeeting: getAvailableDatesForScheduleMeeting,
		getFormSettings: getFormSettings,
		getFormStrategy: getFormStrategy,
		getIpInfoApi: getIpInfoApi,
		getResources: getResources,
		saveUser: saveUser,
		shareResourceByEmail: shareResourceByEmail,
		submitForm: submitForm,
		trackApi: trackApi,
		validateResourceRoom: validateResourceRoom
	});

	var constants = {
	  LEFT: 'left',
	  RIGHT: 'right',
	  YOUTUBE: 97,
	  HTML5: 101,
	  IFRAME: 102,
	  DOCUMENT: 100,
	  VIMEO: 94,
	  WEB: 95,
	  VIDEO_ICON: 'video-icon-content.png',
	  WEB_ICON: 'web-icon-content.png',
	  WORD_ICON: 'word-icon-content.png',
	  PDF_ICON: 'pdf-icon-content.png',
	  LOGO: 'C-logo.png',
	  NONE: 'none',
	  CLICK: 'click',
	  PLAYING: 'playing',
	  PAUSED: 'paused',
	  CUED: 'cued',
	  BUFFERING: 'buffering',
	  ENDED: 'ended',
	  UNSTRATED: 'unstarted',
	  SEEKED: 'seeked',
	  LOADED: 'loaded'
	};

	var constants$1 = /*#__PURE__*/Object.freeze({
		constants: constants
	});

	var trackTime = /*#__PURE__*/
	(function () {
	  var _ref = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(source) {
	    var end, timeSpent;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            if (!(source.resourceId !== store.selectedResourceId)) {
	              _context.next = 9;
	              break;
	            }

	            if (!(store.time !== 0)) {
	              _context.next = 7;
	              break;
	            }

	            end = new Date();
	            timeSpent = Math.round((end - store.time) / 1000);
	            source.timeSpent = timeSpent;
	            _context.next = 7;
	            return track(source);

	          case 7:
	            store.time = new Date();
	            store.selectedResourceId = source.resourceId;

	          case 9:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));

	  return function (_x) {
	    return _ref.apply(this, arguments);
	  };
	})();

	/*! @vimeo/player v2.8.2 | (c) 2019 Vimeo | MIT License | https://github.com/vimeo/player.js */
	function _classCallCheck$1(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties$1(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass$1(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties$1(Constructor, staticProps);
	  return Constructor;
	}

	/**
	 * @module lib/functions
	 */

	/**
	 * Check to see this is a node environment.
	 * @type {Boolean}
	 */

	/* global global */
	var isNode = typeof global !== 'undefined' && {}.toString.call(global) === '[object global]';
	/**
	 * Get the name of the method for a given getter or setter.
	 *
	 * @param {string} prop The name of the property.
	 * @param {string} type Either “get” or “set”.
	 * @return {string}
	 */

	function getMethodName(prop, type) {
	  if (prop.indexOf(type.toLowerCase()) === 0) {
	    return prop;
	  }

	  return "".concat(type.toLowerCase()).concat(prop.substr(0, 1).toUpperCase()).concat(prop.substr(1));
	}
	/**
	 * Check to see if the object is a DOM Element.
	 *
	 * @param {*} element The object to check.
	 * @return {boolean}
	 */

	function isDomElement(element) {
	  return Boolean(element && element.nodeType === 1 && 'nodeName' in element && element.ownerDocument && element.ownerDocument.defaultView);
	}
	/**
	 * Check to see whether the value is a number.
	 *
	 * @see http://dl.dropboxusercontent.com/u/35146/js/tests/isNumber.html
	 * @param {*} value The value to check.
	 * @param {boolean} integer Check if the value is an integer.
	 * @return {boolean}
	 */

	function isInteger(value) {
	  // eslint-disable-next-line eqeqeq
	  return !isNaN(parseFloat(value)) && isFinite(value) && Math.floor(value) == value;
	}
	/**
	 * Check to see if the URL is a Vimeo url.
	 *
	 * @param {string} url The url string.
	 * @return {boolean}
	 */

	function isVimeoUrl(url) {
	  return /^(https?:)?\/\/((player|www)\.)?vimeo\.com(?=$|\/)/.test(url);
	}
	/**
	 * Get the Vimeo URL from an element.
	 * The element must have either a data-vimeo-id or data-vimeo-url attribute.
	 *
	 * @param {object} oEmbedParameters The oEmbed parameters.
	 * @return {string}
	 */

	function getVimeoUrl() {
	  var oEmbedParameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var id = oEmbedParameters.id;
	  var url = oEmbedParameters.url;
	  var idOrUrl = id || url;

	  if (!idOrUrl) {
	    throw new Error('An id or url must be passed, either in an options object or as a data-vimeo-id or data-vimeo-url attribute.');
	  }

	  if (isInteger(idOrUrl)) {
	    return "https://vimeo.com/".concat(idOrUrl);
	  }

	  if (isVimeoUrl(idOrUrl)) {
	    return idOrUrl.replace('http:', 'https:');
	  }

	  if (id) {
	    throw new TypeError("\u201C".concat(id, "\u201D is not a valid video id."));
	  }

	  throw new TypeError("\u201C".concat(idOrUrl, "\u201D is not a vimeo.com url."));
	}

	var arrayIndexOfSupport = typeof Array.prototype.indexOf !== 'undefined';
	var postMessageSupport = typeof window !== 'undefined' && typeof window.postMessage !== 'undefined';

	if (!isNode && (!arrayIndexOfSupport || !postMessageSupport)) {
	  throw new Error('Sorry, the Vimeo Player API is not available in this browser.');
	}

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule$1(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	/*!
	 * weakmap-polyfill v2.0.0 - ECMAScript6 WeakMap polyfill
	 * https://github.com/polygonplanet/weakmap-polyfill
	 * Copyright (c) 2015-2016 polygon planet <polygon.planet.aqua@gmail.com>
	 * @license MIT
	 */
	(function (self) {

	  if (self.WeakMap) {
	    return;
	  }

	  var hasOwnProperty = Object.prototype.hasOwnProperty;

	  var defineProperty = function (object, name, value) {
	    if (Object.defineProperty) {
	      Object.defineProperty(object, name, {
	        configurable: true,
	        writable: true,
	        value: value
	      });
	    } else {
	      object[name] = value;
	    }
	  };

	  self.WeakMap = function () {
	    // ECMA-262 23.3 WeakMap Objects
	    function WeakMap() {
	      if (this === void 0) {
	        throw new TypeError("Constructor WeakMap requires 'new'");
	      }

	      defineProperty(this, '_id', genId('_WeakMap')); // ECMA-262 23.3.1.1 WeakMap([iterable])

	      if (arguments.length > 0) {
	        // Currently, WeakMap `iterable` argument is not supported
	        throw new TypeError('WeakMap iterable is not supported');
	      }
	    } // ECMA-262 23.3.3.2 WeakMap.prototype.delete(key)


	    defineProperty(WeakMap.prototype, 'delete', function (key) {
	      checkInstance(this, 'delete');

	      if (!isObject(key)) {
	        return false;
	      }

	      var entry = key[this._id];

	      if (entry && entry[0] === key) {
	        delete key[this._id];
	        return true;
	      }

	      return false;
	    }); // ECMA-262 23.3.3.3 WeakMap.prototype.get(key)

	    defineProperty(WeakMap.prototype, 'get', function (key) {
	      checkInstance(this, 'get');

	      if (!isObject(key)) {
	        return void 0;
	      }

	      var entry = key[this._id];

	      if (entry && entry[0] === key) {
	        return entry[1];
	      }

	      return void 0;
	    }); // ECMA-262 23.3.3.4 WeakMap.prototype.has(key)

	    defineProperty(WeakMap.prototype, 'has', function (key) {
	      checkInstance(this, 'has');

	      if (!isObject(key)) {
	        return false;
	      }

	      var entry = key[this._id];

	      if (entry && entry[0] === key) {
	        return true;
	      }

	      return false;
	    }); // ECMA-262 23.3.3.5 WeakMap.prototype.set(key, value)

	    defineProperty(WeakMap.prototype, 'set', function (key, value) {
	      checkInstance(this, 'set');

	      if (!isObject(key)) {
	        throw new TypeError('Invalid value used as weak map key');
	      }

	      var entry = key[this._id];

	      if (entry && entry[0] === key) {
	        entry[1] = value;
	        return this;
	      }

	      defineProperty(key, this._id, [key, value]);
	      return this;
	    });

	    function checkInstance(x, methodName) {
	      if (!isObject(x) || !hasOwnProperty.call(x, '_id')) {
	        throw new TypeError(methodName + ' method called on incompatible receiver ' + typeof x);
	      }
	    }

	    function genId(prefix) {
	      return prefix + '_' + rand() + '.' + rand();
	    }

	    function rand() {
	      return Math.random().toString().substring(2);
	    }

	    defineProperty(WeakMap, '_polyfill', true);
	    return WeakMap;
	  }();

	  function isObject(x) {
	    return Object(x) === x;
	  }
	})(typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : commonjsGlobal);

	var npo_src = createCommonjsModule$1(function (module) {
	/*! Native Promise Only
	    v0.8.1 (c) Kyle Simpson
	    MIT License: http://getify.mit-license.org
	*/
	(function UMD(name, context, definition) {
	  // special form of UMD for polyfilling across evironments
	  context[name] = context[name] || definition();

	  if (module.exports) {
	    module.exports = context[name];
	  }
	})("Promise", typeof commonjsGlobal != "undefined" ? commonjsGlobal : commonjsGlobal, function DEF() {

	  var builtInProp,
	      cycle,
	      scheduling_queue,
	      ToString = Object.prototype.toString,
	      timer = typeof setImmediate != "undefined" ? function timer(fn) {
	    return setImmediate(fn);
	  } : setTimeout; // dammit, IE8.

	  try {
	    Object.defineProperty({}, "x", {});

	    builtInProp = function builtInProp(obj, name, val, config) {
	      return Object.defineProperty(obj, name, {
	        value: val,
	        writable: true,
	        configurable: config !== false
	      });
	    };
	  } catch (err) {
	    builtInProp = function builtInProp(obj, name, val) {
	      obj[name] = val;
	      return obj;
	    };
	  } // Note: using a queue instead of array for efficiency


	  scheduling_queue = function Queue() {
	    var first, last, item;

	    function Item(fn, self) {
	      this.fn = fn;
	      this.self = self;
	      this.next = void 0;
	    }

	    return {
	      add: function add(fn, self) {
	        item = new Item(fn, self);

	        if (last) {
	          last.next = item;
	        } else {
	          first = item;
	        }

	        last = item;
	        item = void 0;
	      },
	      drain: function drain() {
	        var f = first;
	        first = last = cycle = void 0;

	        while (f) {
	          f.fn.call(f.self);
	          f = f.next;
	        }
	      }
	    };
	  }();

	  function schedule(fn, self) {
	    scheduling_queue.add(fn, self);

	    if (!cycle) {
	      cycle = timer(scheduling_queue.drain);
	    }
	  } // promise duck typing


	  function isThenable(o) {
	    var _then,
	        o_type = typeof o;

	    if (o != null && (o_type == "object" || o_type == "function")) {
	      _then = o.then;
	    }

	    return typeof _then == "function" ? _then : false;
	  }

	  function notify() {
	    for (var i = 0; i < this.chain.length; i++) {
	      notifyIsolated(this, this.state === 1 ? this.chain[i].success : this.chain[i].failure, this.chain[i]);
	    }

	    this.chain.length = 0;
	  } // NOTE: This is a separate function to isolate
	  // the `try..catch` so that other code can be
	  // optimized better


	  function notifyIsolated(self, cb, chain) {
	    var ret, _then;

	    try {
	      if (cb === false) {
	        chain.reject(self.msg);
	      } else {
	        if (cb === true) {
	          ret = self.msg;
	        } else {
	          ret = cb.call(void 0, self.msg);
	        }

	        if (ret === chain.promise) {
	          chain.reject(TypeError("Promise-chain cycle"));
	        } else if (_then = isThenable(ret)) {
	          _then.call(ret, chain.resolve, chain.reject);
	        } else {
	          chain.resolve(ret);
	        }
	      }
	    } catch (err) {
	      chain.reject(err);
	    }
	  }

	  function resolve(msg) {
	    var _then,
	        self = this; // already triggered?


	    if (self.triggered) {
	      return;
	    }

	    self.triggered = true; // unwrap

	    if (self.def) {
	      self = self.def;
	    }

	    try {
	      if (_then = isThenable(msg)) {
	        schedule(function () {
	          var def_wrapper = new MakeDefWrapper(self);

	          try {
	            _then.call(msg, function $resolve$() {
	              resolve.apply(def_wrapper, arguments);
	            }, function $reject$() {
	              reject.apply(def_wrapper, arguments);
	            });
	          } catch (err) {
	            reject.call(def_wrapper, err);
	          }
	        });
	      } else {
	        self.msg = msg;
	        self.state = 1;

	        if (self.chain.length > 0) {
	          schedule(notify, self);
	        }
	      }
	    } catch (err) {
	      reject.call(new MakeDefWrapper(self), err);
	    }
	  }

	  function reject(msg) {
	    var self = this; // already triggered?

	    if (self.triggered) {
	      return;
	    }

	    self.triggered = true; // unwrap

	    if (self.def) {
	      self = self.def;
	    }

	    self.msg = msg;
	    self.state = 2;

	    if (self.chain.length > 0) {
	      schedule(notify, self);
	    }
	  }

	  function iteratePromises(Constructor, arr, resolver, rejecter) {
	    for (var idx = 0; idx < arr.length; idx++) {
	      (function IIFE(idx) {
	        Constructor.resolve(arr[idx]).then(function $resolver$(msg) {
	          resolver(idx, msg);
	        }, rejecter);
	      })(idx);
	    }
	  }

	  function MakeDefWrapper(self) {
	    this.def = self;
	    this.triggered = false;
	  }

	  function MakeDef(self) {
	    this.promise = self;
	    this.state = 0;
	    this.triggered = false;
	    this.chain = [];
	    this.msg = void 0;
	  }

	  function Promise(executor) {
	    if (typeof executor != "function") {
	      throw TypeError("Not a function");
	    }

	    if (this.__NPO__ !== 0) {
	      throw TypeError("Not a promise");
	    } // instance shadowing the inherited "brand"
	    // to signal an already "initialized" promise


	    this.__NPO__ = 1;
	    var def = new MakeDef(this);

	    this["then"] = function then(success, failure) {
	      var o = {
	        success: typeof success == "function" ? success : true,
	        failure: typeof failure == "function" ? failure : false
	      }; // Note: `then(..)` itself can be borrowed to be used against
	      // a different promise constructor for making the chained promise,
	      // by substituting a different `this` binding.

	      o.promise = new this.constructor(function extractChain(resolve, reject) {
	        if (typeof resolve != "function" || typeof reject != "function") {
	          throw TypeError("Not a function");
	        }

	        o.resolve = resolve;
	        o.reject = reject;
	      });
	      def.chain.push(o);

	      if (def.state !== 0) {
	        schedule(notify, def);
	      }

	      return o.promise;
	    };

	    this["catch"] = function $catch$(failure) {
	      return this.then(void 0, failure);
	    };

	    try {
	      executor.call(void 0, function publicResolve(msg) {
	        resolve.call(def, msg);
	      }, function publicReject(msg) {
	        reject.call(def, msg);
	      });
	    } catch (err) {
	      reject.call(def, err);
	    }
	  }

	  var PromisePrototype = builtInProp({}, "constructor", Promise,
	  /*configurable=*/
	  false); // Note: Android 4 cannot use `Object.defineProperty(..)` here

	  Promise.prototype = PromisePrototype; // built-in "brand" to signal an "uninitialized" promise

	  builtInProp(PromisePrototype, "__NPO__", 0,
	  /*configurable=*/
	  false);
	  builtInProp(Promise, "resolve", function Promise$resolve(msg) {
	    var Constructor = this; // spec mandated checks
	    // note: best "isPromise" check that's practical for now

	    if (msg && typeof msg == "object" && msg.__NPO__ === 1) {
	      return msg;
	    }

	    return new Constructor(function executor(resolve, reject) {
	      if (typeof resolve != "function" || typeof reject != "function") {
	        throw TypeError("Not a function");
	      }

	      resolve(msg);
	    });
	  });
	  builtInProp(Promise, "reject", function Promise$reject(msg) {
	    return new this(function executor(resolve, reject) {
	      if (typeof resolve != "function" || typeof reject != "function") {
	        throw TypeError("Not a function");
	      }

	      reject(msg);
	    });
	  });
	  builtInProp(Promise, "all", function Promise$all(arr) {
	    var Constructor = this; // spec mandated checks

	    if (ToString.call(arr) != "[object Array]") {
	      return Constructor.reject(TypeError("Not an array"));
	    }

	    if (arr.length === 0) {
	      return Constructor.resolve([]);
	    }

	    return new Constructor(function executor(resolve, reject) {
	      if (typeof resolve != "function" || typeof reject != "function") {
	        throw TypeError("Not a function");
	      }

	      var len = arr.length,
	          msgs = Array(len),
	          count = 0;
	      iteratePromises(Constructor, arr, function resolver(idx, msg) {
	        msgs[idx] = msg;

	        if (++count === len) {
	          resolve(msgs);
	        }
	      }, reject);
	    });
	  });
	  builtInProp(Promise, "race", function Promise$race(arr) {
	    var Constructor = this; // spec mandated checks

	    if (ToString.call(arr) != "[object Array]") {
	      return Constructor.reject(TypeError("Not an array"));
	    }

	    return new Constructor(function executor(resolve, reject) {
	      if (typeof resolve != "function" || typeof reject != "function") {
	        throw TypeError("Not a function");
	      }

	      iteratePromises(Constructor, arr, function resolver(idx, msg) {
	        resolve(msg);
	      }, reject);
	    });
	  });
	  return Promise;
	});
	});

	/**
	 * @module lib/callbacks
	 */
	var callbackMap = new WeakMap();
	/**
	 * Store a callback for a method or event for a player.
	 *
	 * @param {Player} player The player object.
	 * @param {string} name The method or event name.
	 * @param {(function(this:Player, *): void|{resolve: function, reject: function})} callback
	 *        The callback to call or an object with resolve and reject functions for a promise.
	 * @return {void}
	 */

	function storeCallback(player, name, callback) {
	  var playerCallbacks = callbackMap.get(player.element) || {};

	  if (!(name in playerCallbacks)) {
	    playerCallbacks[name] = [];
	  }

	  playerCallbacks[name].push(callback);
	  callbackMap.set(player.element, playerCallbacks);
	}
	/**
	 * Get the callbacks for a player and event or method.
	 *
	 * @param {Player} player The player object.
	 * @param {string} name The method or event name
	 * @return {function[]}
	 */

	function getCallbacks(player, name) {
	  var playerCallbacks = callbackMap.get(player.element) || {};
	  return playerCallbacks[name] || [];
	}
	/**
	 * Remove a stored callback for a method or event for a player.
	 *
	 * @param {Player} player The player object.
	 * @param {string} name The method or event name
	 * @param {function} [callback] The specific callback to remove.
	 * @return {boolean} Was this the last callback?
	 */

	function removeCallback(player, name, callback) {
	  var playerCallbacks = callbackMap.get(player.element) || {};

	  if (!playerCallbacks[name]) {
	    return true;
	  } // If no callback is passed, remove all callbacks for the event


	  if (!callback) {
	    playerCallbacks[name] = [];
	    callbackMap.set(player.element, playerCallbacks);
	    return true;
	  }

	  var index = playerCallbacks[name].indexOf(callback);

	  if (index !== -1) {
	    playerCallbacks[name].splice(index, 1);
	  }

	  callbackMap.set(player.element, playerCallbacks);
	  return playerCallbacks[name] && playerCallbacks[name].length === 0;
	}
	/**
	 * Return the first stored callback for a player and event or method.
	 *
	 * @param {Player} player The player object.
	 * @param {string} name The method or event name.
	 * @return {function} The callback, or false if there were none
	 */

	function shiftCallbacks(player, name) {
	  var playerCallbacks = getCallbacks(player, name);

	  if (playerCallbacks.length < 1) {
	    return false;
	  }

	  var callback = playerCallbacks.shift();
	  removeCallback(player, name, callback);
	  return callback;
	}
	/**
	 * Move callbacks associated with an element to another element.
	 *
	 * @param {HTMLElement} oldElement The old element.
	 * @param {HTMLElement} newElement The new element.
	 * @return {void}
	 */

	function swapCallbacks(oldElement, newElement) {
	  var playerCallbacks = callbackMap.get(oldElement);
	  callbackMap.set(newElement, playerCallbacks);
	  callbackMap.delete(oldElement);
	}

	/**
	 * @module lib/embed
	 */
	var oEmbedParameters = ['autopause', 'autoplay', 'background', 'byline', 'color', 'dnt', 'height', 'id', 'loop', 'maxheight', 'maxwidth', 'muted', 'playsinline', 'portrait', 'responsive', 'speed', 'title', 'transparent', 'url', 'width'];
	/**
	 * Get the 'data-vimeo'-prefixed attributes from an element as an object.
	 *
	 * @param {HTMLElement} element The element.
	 * @param {Object} [defaults={}] The default values to use.
	 * @return {Object<string, string>}
	 */

	function getOEmbedParameters(element) {
	  var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  return oEmbedParameters.reduce(function (params, param) {
	    var value = element.getAttribute("data-vimeo-".concat(param));

	    if (value || value === '') {
	      params[param] = value === '' ? 1 : value;
	    }

	    return params;
	  }, defaults);
	}
	/**
	 * Create an embed from oEmbed data inside an element.
	 *
	 * @param {object} data The oEmbed data.
	 * @param {HTMLElement} element The element to put the iframe in.
	 * @return {HTMLIFrameElement} The iframe embed.
	 */

	function createEmbed(_ref, element) {
	  var html = _ref.html;

	  if (!element) {
	    throw new TypeError('An element must be provided');
	  }

	  if (element.getAttribute('data-vimeo-initialized') !== null) {
	    return element.querySelector('iframe');
	  }

	  var div = document.createElement('div');
	  div.innerHTML = html;
	  element.appendChild(div.firstChild);
	  element.setAttribute('data-vimeo-initialized', 'true');
	  return element.querySelector('iframe');
	}
	/**
	 * Make an oEmbed call for the specified URL.
	 *
	 * @param {string} videoUrl The vimeo.com url for the video.
	 * @param {Object} [params] Parameters to pass to oEmbed.
	 * @param {HTMLElement} element The element.
	 * @return {Promise}
	 */

	function getOEmbedData(videoUrl) {
	  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  var element = arguments.length > 2 ? arguments[2] : undefined;
	  return new Promise(function (resolve, reject) {
	    if (!isVimeoUrl(videoUrl)) {
	      throw new TypeError("\u201C".concat(videoUrl, "\u201D is not a vimeo.com url."));
	    }

	    var url = "https://vimeo.com/api/oembed.json?url=".concat(encodeURIComponent(videoUrl), "&domain=").concat(window.location.hostname);

	    for (var param in params) {
	      if (params.hasOwnProperty(param)) {
	        url += "&".concat(param, "=").concat(encodeURIComponent(params[param]));
	      }
	    }

	    var xhr = 'XDomainRequest' in window ? new XDomainRequest() : new XMLHttpRequest();
	    xhr.open('GET', url, true);

	    xhr.onload = function () {
	      if (xhr.status === 404) {
	        reject(new Error("\u201C".concat(videoUrl, "\u201D was not found.")));
	        return;
	      }

	      if (xhr.status === 403) {
	        reject(new Error("\u201C".concat(videoUrl, "\u201D is not embeddable.")));
	        return;
	      }

	      try {
	        var json = JSON.parse(xhr.responseText); // Check api response for 403 on oembed

	        if (json.domain_status_code === 403) {
	          // We still want to create the embed to give users visual feedback
	          createEmbed(json, element);
	          reject(new Error("\u201C".concat(videoUrl, "\u201D is not embeddable.")));
	          return;
	        }

	        resolve(json);
	      } catch (error) {
	        reject(error);
	      }
	    };

	    xhr.onerror = function () {
	      var status = xhr.status ? " (".concat(xhr.status, ")") : '';
	      reject(new Error("There was an error fetching the embed code from Vimeo".concat(status, ".")));
	    };

	    xhr.send();
	  });
	}
	/**
	 * Initialize all embeds within a specific element
	 *
	 * @param {HTMLElement} [parent=document] The parent element.
	 * @return {void}
	 */

	function initializeEmbeds() {
	  var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
	  var elements = [].slice.call(parent.querySelectorAll('[data-vimeo-id], [data-vimeo-url]'));

	  var handleError = function handleError(error) {
	    if ('console' in window && console.error) {
	      console.error("There was an error creating an embed: ".concat(error));
	    }
	  };

	  elements.forEach(function (element) {
	    try {
	      // Skip any that have data-vimeo-defer
	      if (element.getAttribute('data-vimeo-defer') !== null) {
	        return;
	      }

	      var params = getOEmbedParameters(element);
	      var url = getVimeoUrl(params);
	      getOEmbedData(url, params, element).then(function (data) {
	        return createEmbed(data, element);
	      }).catch(handleError);
	    } catch (error) {
	      handleError(error);
	    }
	  });
	}
	/**
	 * Resize embeds when messaged by the player.
	 *
	 * @param {HTMLElement} [parent=document] The parent element.
	 * @return {void}
	 */

	function resizeEmbeds() {
	  var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

	  // Prevent execution if users include the player.js script multiple times.
	  if (window.VimeoPlayerResizeEmbeds_) {
	    return;
	  }

	  window.VimeoPlayerResizeEmbeds_ = true;

	  var onMessage = function onMessage(event) {
	    if (!isVimeoUrl(event.origin)) {
	      return;
	    } // 'spacechange' is fired only on embeds with cards


	    if (!event.data || event.data.event !== 'spacechange') {
	      return;
	    }

	    var iframes = parent.querySelectorAll('iframe');

	    for (var i = 0; i < iframes.length; i++) {
	      if (iframes[i].contentWindow !== event.source) {
	        continue;
	      } // Change padding-bottom of the enclosing div to accommodate
	      // card carousel without distorting aspect ratio


	      var space = iframes[i].parentElement;
	      space.style.paddingBottom = "".concat(event.data.data[0].bottom, "px");
	      break;
	    }
	  };

	  if (window.addEventListener) {
	    window.addEventListener('message', onMessage, false);
	  } else if (window.attachEvent) {
	    window.attachEvent('onmessage', onMessage);
	  }
	}

	/**
	 * @module lib/postmessage
	 */
	/**
	 * Parse a message received from postMessage.
	 *
	 * @param {*} data The data received from postMessage.
	 * @return {object}
	 */

	function parseMessageData(data) {
	  if (typeof data === 'string') {
	    try {
	      data = JSON.parse(data);
	    } catch (error) {
	      // If the message cannot be parsed, throw the error as a warning
	      console.warn(error);
	      return {};
	    }
	  }

	  return data;
	}
	/**
	 * Post a message to the specified target.
	 *
	 * @param {Player} player The player object to use.
	 * @param {string} method The API method to call.
	 * @param {object} params The parameters to send to the player.
	 * @return {void}
	 */

	function postMessage(player, method, params) {
	  if (!player.element.contentWindow || !player.element.contentWindow.postMessage) {
	    return;
	  }

	  var message = {
	    method: method
	  };

	  if (params !== undefined) {
	    message.value = params;
	  } // IE 8 and 9 do not support passing messages, so stringify them


	  var ieVersion = parseFloat(navigator.userAgent.toLowerCase().replace(/^.*msie (\d+).*$/, '$1'));

	  if (ieVersion >= 8 && ieVersion < 10) {
	    message = JSON.stringify(message);
	  }

	  player.element.contentWindow.postMessage(message, player.origin);
	}
	/**
	 * Parse the data received from a message event.
	 *
	 * @param {Player} player The player that received the message.
	 * @param {(Object|string)} data The message data. Strings will be parsed into JSON.
	 * @return {void}
	 */

	function processData(player, data) {
	  data = parseMessageData(data);
	  var callbacks = [];
	  var param;

	  if (data.event) {
	    if (data.event === 'error') {
	      var promises = getCallbacks(player, data.data.method);
	      promises.forEach(function (promise) {
	        var error = new Error(data.data.message);
	        error.name = data.data.name;
	        promise.reject(error);
	        removeCallback(player, data.data.method, promise);
	      });
	    }

	    callbacks = getCallbacks(player, "event:".concat(data.event));
	    param = data.data;
	  } else if (data.method) {
	    var callback = shiftCallbacks(player, data.method);

	    if (callback) {
	      callbacks.push(callback);
	      param = data.value;
	    }
	  }

	  callbacks.forEach(function (callback) {
	    try {
	      if (typeof callback === 'function') {
	        callback.call(player, param);
	        return;
	      }

	      callback.resolve(param);
	    } catch (e) {// empty
	    }
	  });
	}

	var playerMap = new WeakMap();
	var readyMap = new WeakMap();

	var Player =
	/*#__PURE__*/
	function () {
	  /**
	   * Create a Player.
	   *
	   * @param {(HTMLIFrameElement|HTMLElement|string|jQuery)} element A reference to the Vimeo
	   *        player iframe, and id, or a jQuery object.
	   * @param {object} [options] oEmbed parameters to use when creating an embed in the element.
	   * @return {Player}
	   */
	  function Player(element) {
	    var _this = this;

	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    _classCallCheck$1(this, Player);

	    /* global jQuery */
	    if (window.jQuery && element instanceof jQuery) {
	      if (element.length > 1 && window.console && console.warn) {
	        console.warn('A jQuery object with multiple elements was passed, using the first element.');
	      }

	      element = element[0];
	    } // Find an element by ID


	    if (typeof document !== 'undefined' && typeof element === 'string') {
	      element = document.getElementById(element);
	    } // Not an element!


	    if (!isDomElement(element)) {
	      throw new TypeError('You must pass either a valid element or a valid id.');
	    }

	    var win = element.ownerDocument.defaultView; // Already initialized an embed in this div, so grab the iframe

	    if (element.nodeName !== 'IFRAME') {
	      var iframe = element.querySelector('iframe');

	      if (iframe) {
	        element = iframe;
	      }
	    } // iframe url is not a Vimeo url


	    if (element.nodeName === 'IFRAME' && !isVimeoUrl(element.getAttribute('src') || '')) {
	      throw new Error('The player element passed isn’t a Vimeo embed.');
	    } // If there is already a player object in the map, return that


	    if (playerMap.has(element)) {
	      return playerMap.get(element);
	    }

	    this.element = element;
	    this.origin = '*';
	    var readyPromise = new npo_src(function (resolve, reject) {
	      var onMessage = function onMessage(event) {
	        if (!isVimeoUrl(event.origin) || _this.element.contentWindow !== event.source) {
	          return;
	        }

	        if (_this.origin === '*') {
	          _this.origin = event.origin;
	        }

	        var data = parseMessageData(event.data);
	        var isError = data && data.event === 'error';
	        var isReadyError = isError && data.data && data.data.method === 'ready';

	        if (isReadyError) {
	          var error = new Error(data.data.message);
	          error.name = data.data.name;
	          reject(error);
	          return;
	        }

	        var isReadyEvent = data && data.event === 'ready';
	        var isPingResponse = data && data.method === 'ping';

	        if (isReadyEvent || isPingResponse) {
	          _this.element.setAttribute('data-ready', 'true');

	          resolve();
	          return;
	        }

	        processData(_this, data);
	      };

	      if (win.addEventListener) {
	        win.addEventListener('message', onMessage, false);
	      } else if (win.attachEvent) {
	        win.attachEvent('onmessage', onMessage);
	      }

	      if (_this.element.nodeName !== 'IFRAME') {
	        var params = getOEmbedParameters(element, options);
	        var url = getVimeoUrl(params);
	        getOEmbedData(url, params, element).then(function (data) {
	          var iframe = createEmbed(data, element); // Overwrite element with the new iframe,
	          // but store reference to the original element

	          _this.element = iframe;
	          _this._originalElement = element;
	          swapCallbacks(element, iframe);
	          playerMap.set(_this.element, _this);
	          return data;
	        }).catch(reject);
	      }
	    }); // Store a copy of this Player in the map

	    readyMap.set(this, readyPromise);
	    playerMap.set(this.element, this); // Send a ping to the iframe so the ready promise will be resolved if
	    // the player is already ready.

	    if (this.element.nodeName === 'IFRAME') {
	      postMessage(this, 'ping');
	    }

	    return this;
	  }
	  /**
	   * Get a promise for a method.
	   *
	   * @param {string} name The API method to call.
	   * @param {Object} [args={}] Arguments to send via postMessage.
	   * @return {Promise}
	   */


	  _createClass$1(Player, [{
	    key: "callMethod",
	    value: function callMethod(name) {
	      var _this2 = this;

	      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      return new npo_src(function (resolve, reject) {
	        // We are storing the resolve/reject handlers to call later, so we
	        // can’t return here.
	        // eslint-disable-next-line promise/always-return
	        return _this2.ready().then(function () {
	          storeCallback(_this2, name, {
	            resolve: resolve,
	            reject: reject
	          });
	          postMessage(_this2, name, args);
	        }).catch(reject);
	      });
	    }
	    /**
	     * Get a promise for the value of a player property.
	     *
	     * @param {string} name The property name
	     * @return {Promise}
	     */

	  }, {
	    key: "get",
	    value: function get(name) {
	      var _this3 = this;

	      return new npo_src(function (resolve, reject) {
	        name = getMethodName(name, 'get'); // We are storing the resolve/reject handlers to call later, so we
	        // can’t return here.
	        // eslint-disable-next-line promise/always-return

	        return _this3.ready().then(function () {
	          storeCallback(_this3, name, {
	            resolve: resolve,
	            reject: reject
	          });
	          postMessage(_this3, name);
	        }).catch(reject);
	      });
	    }
	    /**
	     * Get a promise for setting the value of a player property.
	     *
	     * @param {string} name The API method to call.
	     * @param {mixed} value The value to set.
	     * @return {Promise}
	     */

	  }, {
	    key: "set",
	    value: function set(name, value) {
	      var _this4 = this;

	      return new npo_src(function (resolve, reject) {
	        name = getMethodName(name, 'set');

	        if (value === undefined || value === null) {
	          throw new TypeError('There must be a value to set.');
	        } // We are storing the resolve/reject handlers to call later, so we
	        // can’t return here.
	        // eslint-disable-next-line promise/always-return


	        return _this4.ready().then(function () {
	          storeCallback(_this4, name, {
	            resolve: resolve,
	            reject: reject
	          });
	          postMessage(_this4, name, value);
	        }).catch(reject);
	      });
	    }
	    /**
	     * Add an event listener for the specified event. Will call the
	     * callback with a single parameter, `data`, that contains the data for
	     * that event.
	     *
	     * @param {string} eventName The name of the event.
	     * @param {function(*)} callback The function to call when the event fires.
	     * @return {void}
	     */

	  }, {
	    key: "on",
	    value: function on(eventName, callback) {
	      if (!eventName) {
	        throw new TypeError('You must pass an event name.');
	      }

	      if (!callback) {
	        throw new TypeError('You must pass a callback function.');
	      }

	      if (typeof callback !== 'function') {
	        throw new TypeError('The callback must be a function.');
	      }

	      var callbacks = getCallbacks(this, "event:".concat(eventName));

	      if (callbacks.length === 0) {
	        this.callMethod('addEventListener', eventName).catch(function () {// Ignore the error. There will be an error event fired that
	          // will trigger the error callback if they are listening.
	        });
	      }

	      storeCallback(this, "event:".concat(eventName), callback);
	    }
	    /**
	     * Remove an event listener for the specified event. Will remove all
	     * listeners for that event if a `callback` isn’t passed, or only that
	     * specific callback if it is passed.
	     *
	     * @param {string} eventName The name of the event.
	     * @param {function} [callback] The specific callback to remove.
	     * @return {void}
	     */

	  }, {
	    key: "off",
	    value: function off(eventName, callback) {
	      if (!eventName) {
	        throw new TypeError('You must pass an event name.');
	      }

	      if (callback && typeof callback !== 'function') {
	        throw new TypeError('The callback must be a function.');
	      }

	      var lastCallback = removeCallback(this, "event:".concat(eventName), callback); // If there are no callbacks left, remove the listener

	      if (lastCallback) {
	        this.callMethod('removeEventListener', eventName).catch(function (e) {// Ignore the error. There will be an error event fired that
	          // will trigger the error callback if they are listening.
	        });
	      }
	    }
	    /**
	     * A promise to load a new video.
	     *
	     * @promise LoadVideoPromise
	     * @fulfill {number} The video with this id successfully loaded.
	     * @reject {TypeError} The id was not a number.
	     */

	    /**
	     * Load a new video into this embed. The promise will be resolved if
	     * the video is successfully loaded, or it will be rejected if it could
	     * not be loaded.
	     *
	     * @param {number|object} options The id of the video or an object with embed options.
	     * @return {LoadVideoPromise}
	     */

	  }, {
	    key: "loadVideo",
	    value: function loadVideo(options) {
	      return this.callMethod('loadVideo', options);
	    }
	    /**
	     * A promise to perform an action when the Player is ready.
	     *
	     * @todo document errors
	     * @promise LoadVideoPromise
	     * @fulfill {void}
	     */

	    /**
	     * Trigger a function when the player iframe has initialized. You do not
	     * need to wait for `ready` to trigger to begin adding event listeners
	     * or calling other methods.
	     *
	     * @return {ReadyPromise}
	     */

	  }, {
	    key: "ready",
	    value: function ready() {
	      var readyPromise = readyMap.get(this) || new npo_src(function (resolve, reject) {
	        reject(new Error('Unknown player. Probably unloaded.'));
	      });
	      return npo_src.resolve(readyPromise);
	    }
	    /**
	     * A promise to add a cue point to the player.
	     *
	     * @promise AddCuePointPromise
	     * @fulfill {string} The id of the cue point to use for removeCuePoint.
	     * @reject {RangeError} the time was less than 0 or greater than the
	     *         video’s duration.
	     * @reject {UnsupportedError} Cue points are not supported with the current
	     *         player or browser.
	     */

	    /**
	     * Add a cue point to the player.
	     *
	     * @param {number} time The time for the cue point.
	     * @param {object} [data] Arbitrary data to be returned with the cue point.
	     * @return {AddCuePointPromise}
	     */

	  }, {
	    key: "addCuePoint",
	    value: function addCuePoint(time) {
	      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      return this.callMethod('addCuePoint', {
	        time: time,
	        data: data
	      });
	    }
	    /**
	     * A promise to remove a cue point from the player.
	     *
	     * @promise AddCuePointPromise
	     * @fulfill {string} The id of the cue point that was removed.
	     * @reject {InvalidCuePoint} The cue point with the specified id was not
	     *         found.
	     * @reject {UnsupportedError} Cue points are not supported with the current
	     *         player or browser.
	     */

	    /**
	     * Remove a cue point from the video.
	     *
	     * @param {string} id The id of the cue point to remove.
	     * @return {RemoveCuePointPromise}
	     */

	  }, {
	    key: "removeCuePoint",
	    value: function removeCuePoint(id) {
	      return this.callMethod('removeCuePoint', id);
	    }
	    /**
	     * A representation of a text track on a video.
	     *
	     * @typedef {Object} VimeoTextTrack
	     * @property {string} language The ISO language code.
	     * @property {string} kind The kind of track it is (captions or subtitles).
	     * @property {string} label The human‐readable label for the track.
	     */

	    /**
	     * A promise to enable a text track.
	     *
	     * @promise EnableTextTrackPromise
	     * @fulfill {VimeoTextTrack} The text track that was enabled.
	     * @reject {InvalidTrackLanguageError} No track was available with the
	     *         specified language.
	     * @reject {InvalidTrackError} No track was available with the specified
	     *         language and kind.
	     */

	    /**
	     * Enable the text track with the specified language, and optionally the
	     * specified kind (captions or subtitles).
	     *
	     * When set via the API, the track language will not change the viewer’s
	     * stored preference.
	     *
	     * @param {string} language The two‐letter language code.
	     * @param {string} [kind] The kind of track to enable (captions or subtitles).
	     * @return {EnableTextTrackPromise}
	     */

	  }, {
	    key: "enableTextTrack",
	    value: function enableTextTrack(language, kind) {
	      if (!language) {
	        throw new TypeError('You must pass a language.');
	      }

	      return this.callMethod('enableTextTrack', {
	        language: language,
	        kind: kind
	      });
	    }
	    /**
	     * A promise to disable the active text track.
	     *
	     * @promise DisableTextTrackPromise
	     * @fulfill {void} The track was disabled.
	     */

	    /**
	     * Disable the currently-active text track.
	     *
	     * @return {DisableTextTrackPromise}
	     */

	  }, {
	    key: "disableTextTrack",
	    value: function disableTextTrack() {
	      return this.callMethod('disableTextTrack');
	    }
	    /**
	     * A promise to pause the video.
	     *
	     * @promise PausePromise
	     * @fulfill {void} The video was paused.
	     */

	    /**
	     * Pause the video if it’s playing.
	     *
	     * @return {PausePromise}
	     */

	  }, {
	    key: "pause",
	    value: function pause() {
	      return this.callMethod('pause');
	    }
	    /**
	     * A promise to play the video.
	     *
	     * @promise PlayPromise
	     * @fulfill {void} The video was played.
	     */

	    /**
	     * Play the video if it’s paused. **Note:** on iOS and some other
	     * mobile devices, you cannot programmatically trigger play. Once the
	     * viewer has tapped on the play button in the player, however, you
	     * will be able to use this function.
	     *
	     * @return {PlayPromise}
	     */

	  }, {
	    key: "play",
	    value: function play() {
	      return this.callMethod('play');
	    }
	    /**
	     * A promise to unload the video.
	     *
	     * @promise UnloadPromise
	     * @fulfill {void} The video was unloaded.
	     */

	    /**
	     * Return the player to its initial state.
	     *
	     * @return {UnloadPromise}
	     */

	  }, {
	    key: "unload",
	    value: function unload() {
	      return this.callMethod('unload');
	    }
	    /**
	     * Cleanup the player and remove it from the DOM
	     *
	     * It won't be usable and a new one should be constructed
	     *  in order to do any operations.
	     *
	     * @return {Promise}
	     */

	  }, {
	    key: "destroy",
	    value: function destroy() {
	      var _this5 = this;

	      return new npo_src(function (resolve) {
	        readyMap.delete(_this5);
	        playerMap.delete(_this5.element);

	        if (_this5._originalElement) {
	          playerMap.delete(_this5._originalElement);

	          _this5._originalElement.removeAttribute('data-vimeo-initialized');
	        }

	        if (_this5.element && _this5.element.nodeName === 'IFRAME' && _this5.element.parentNode) {
	          _this5.element.parentNode.removeChild(_this5.element);
	        }

	        resolve();
	      });
	    }
	    /**
	     * A promise to get the autopause behavior of the video.
	     *
	     * @promise GetAutopausePromise
	     * @fulfill {boolean} Whether autopause is turned on or off.
	     * @reject {UnsupportedError} Autopause is not supported with the current
	     *         player or browser.
	     */

	    /**
	     * Get the autopause behavior for this player.
	     *
	     * @return {GetAutopausePromise}
	     */

	  }, {
	    key: "getAutopause",
	    value: function getAutopause() {
	      return this.get('autopause');
	    }
	    /**
	     * A promise to set the autopause behavior of the video.
	     *
	     * @promise SetAutopausePromise
	     * @fulfill {boolean} Whether autopause is turned on or off.
	     * @reject {UnsupportedError} Autopause is not supported with the current
	     *         player or browser.
	     */

	    /**
	     * Enable or disable the autopause behavior of this player.
	     *
	     * By default, when another video is played in the same browser, this
	     * player will automatically pause. Unless you have a specific reason
	     * for doing so, we recommend that you leave autopause set to the
	     * default (`true`).
	     *
	     * @param {boolean} autopause
	     * @return {SetAutopausePromise}
	     */

	  }, {
	    key: "setAutopause",
	    value: function setAutopause(autopause) {
	      return this.set('autopause', autopause);
	    }
	    /**
	     * A promise to get the buffered property of the video.
	     *
	     * @promise GetBufferedPromise
	     * @fulfill {Array} Buffered Timeranges converted to an Array.
	     */

	    /**
	     * Get the buffered property of the video.
	     *
	     * @return {GetBufferedPromise}
	     */

	  }, {
	    key: "getBuffered",
	    value: function getBuffered() {
	      return this.get('buffered');
	    }
	    /**
	     * A promise to get the color of the player.
	     *
	     * @promise GetColorPromise
	     * @fulfill {string} The hex color of the player.
	     */

	    /**
	     * Get the color for this player.
	     *
	     * @return {GetColorPromise}
	     */

	  }, {
	    key: "getColor",
	    value: function getColor() {
	      return this.get('color');
	    }
	    /**
	     * A promise to set the color of the player.
	     *
	     * @promise SetColorPromise
	     * @fulfill {string} The color was successfully set.
	     * @reject {TypeError} The string was not a valid hex or rgb color.
	     * @reject {ContrastError} The color was set, but the contrast is
	     *         outside of the acceptable range.
	     * @reject {EmbedSettingsError} The owner of the player has chosen to
	     *         use a specific color.
	     */

	    /**
	     * Set the color of this player to a hex or rgb string. Setting the
	     * color may fail if the owner of the video has set their embed
	     * preferences to force a specific color.
	     *
	     * @param {string} color The hex or rgb color string to set.
	     * @return {SetColorPromise}
	     */

	  }, {
	    key: "setColor",
	    value: function setColor(color) {
	      return this.set('color', color);
	    }
	    /**
	     * A representation of a cue point.
	     *
	     * @typedef {Object} VimeoCuePoint
	     * @property {number} time The time of the cue point.
	     * @property {object} data The data passed when adding the cue point.
	     * @property {string} id The unique id for use with removeCuePoint.
	     */

	    /**
	     * A promise to get the cue points of a video.
	     *
	     * @promise GetCuePointsPromise
	     * @fulfill {VimeoCuePoint[]} The cue points added to the video.
	     * @reject {UnsupportedError} Cue points are not supported with the current
	     *         player or browser.
	     */

	    /**
	     * Get an array of the cue points added to the video.
	     *
	     * @return {GetCuePointsPromise}
	     */

	  }, {
	    key: "getCuePoints",
	    value: function getCuePoints() {
	      return this.get('cuePoints');
	    }
	    /**
	     * A promise to get the current time of the video.
	     *
	     * @promise GetCurrentTimePromise
	     * @fulfill {number} The current time in seconds.
	     */

	    /**
	     * Get the current playback position in seconds.
	     *
	     * @return {GetCurrentTimePromise}
	     */

	  }, {
	    key: "getCurrentTime",
	    value: function getCurrentTime() {
	      return this.get('currentTime');
	    }
	    /**
	     * A promise to set the current time of the video.
	     *
	     * @promise SetCurrentTimePromise
	     * @fulfill {number} The actual current time that was set.
	     * @reject {RangeError} the time was less than 0 or greater than the
	     *         video’s duration.
	     */

	    /**
	     * Set the current playback position in seconds. If the player was
	     * paused, it will remain paused. Likewise, if the player was playing,
	     * it will resume playing once the video has buffered.
	     *
	     * You can provide an accurate time and the player will attempt to seek
	     * to as close to that time as possible. The exact time will be the
	     * fulfilled value of the promise.
	     *
	     * @param {number} currentTime
	     * @return {SetCurrentTimePromise}
	     */

	  }, {
	    key: "setCurrentTime",
	    value: function setCurrentTime(currentTime) {
	      return this.set('currentTime', currentTime);
	    }
	    /**
	     * A promise to get the duration of the video.
	     *
	     * @promise GetDurationPromise
	     * @fulfill {number} The duration in seconds.
	     */

	    /**
	     * Get the duration of the video in seconds. It will be rounded to the
	     * nearest second before playback begins, and to the nearest thousandth
	     * of a second after playback begins.
	     *
	     * @return {GetDurationPromise}
	     */

	  }, {
	    key: "getDuration",
	    value: function getDuration() {
	      return this.get('duration');
	    }
	    /**
	     * A promise to get the ended state of the video.
	     *
	     * @promise GetEndedPromise
	     * @fulfill {boolean} Whether or not the video has ended.
	     */

	    /**
	     * Get the ended state of the video. The video has ended if
	     * `currentTime === duration`.
	     *
	     * @return {GetEndedPromise}
	     */

	  }, {
	    key: "getEnded",
	    value: function getEnded() {
	      return this.get('ended');
	    }
	    /**
	     * A promise to get the loop state of the player.
	     *
	     * @promise GetLoopPromise
	     * @fulfill {boolean} Whether or not the player is set to loop.
	     */

	    /**
	     * Get the loop state of the player.
	     *
	     * @return {GetLoopPromise}
	     */

	  }, {
	    key: "getLoop",
	    value: function getLoop() {
	      return this.get('loop');
	    }
	    /**
	     * A promise to set the loop state of the player.
	     *
	     * @promise SetLoopPromise
	     * @fulfill {boolean} The loop state that was set.
	     */

	    /**
	     * Set the loop state of the player. When set to `true`, the player
	     * will start over immediately once playback ends.
	     *
	     * @param {boolean} loop
	     * @return {SetLoopPromise}
	     */

	  }, {
	    key: "setLoop",
	    value: function setLoop(loop) {
	      return this.set('loop', loop);
	    }
	    /**
	     * A promise to get the paused state of the player.
	     *
	     * @promise GetLoopPromise
	     * @fulfill {boolean} Whether or not the video is paused.
	     */

	    /**
	     * Get the paused state of the player.
	     *
	     * @return {GetLoopPromise}
	     */

	  }, {
	    key: "getPaused",
	    value: function getPaused() {
	      return this.get('paused');
	    }
	    /**
	     * A promise to get the playback rate of the player.
	     *
	     * @promise GetPlaybackRatePromise
	     * @fulfill {number} The playback rate of the player on a scale from 0.5 to 2.
	     */

	    /**
	     * Get the playback rate of the player on a scale from `0.5` to `2`.
	     *
	     * @return {GetPlaybackRatePromise}
	     */

	  }, {
	    key: "getPlaybackRate",
	    value: function getPlaybackRate() {
	      return this.get('playbackRate');
	    }
	    /**
	     * A promise to set the playbackrate of the player.
	     *
	     * @promise SetPlaybackRatePromise
	     * @fulfill {number} The playback rate was set.
	     * @reject {RangeError} The playback rate was less than 0.5 or greater than 2.
	     */

	    /**
	     * Set the playback rate of the player on a scale from `0.5` to `2`. When set
	     * via the API, the playback rate will not be synchronized to other
	     * players or stored as the viewer's preference.
	     *
	     * @param {number} playbackRate
	     * @return {SetPlaybackRatePromise}
	     */

	  }, {
	    key: "setPlaybackRate",
	    value: function setPlaybackRate(playbackRate) {
	      return this.set('playbackRate', playbackRate);
	    }
	    /**
	     * A promise to get the played property of the video.
	     *
	     * @promise GetPlayedPromise
	     * @fulfill {Array} Played Timeranges converted to an Array.
	     */

	    /**
	     * Get the played property of the video.
	     *
	     * @return {GetPlayedPromise}
	     */

	  }, {
	    key: "getPlayed",
	    value: function getPlayed() {
	      return this.get('played');
	    }
	    /**
	     * A promise to get the seekable property of the video.
	     *
	     * @promise GetSeekablePromise
	     * @fulfill {Array} Seekable Timeranges converted to an Array.
	     */

	    /**
	     * Get the seekable property of the video.
	     *
	     * @return {GetSeekablePromise}
	     */

	  }, {
	    key: "getSeekable",
	    value: function getSeekable() {
	      return this.get('seekable');
	    }
	    /**
	     * A promise to get the seeking property of the player.
	     *
	     * @promise GetSeekingPromise
	     * @fulfill {boolean} Whether or not the player is currently seeking.
	     */

	    /**
	     * Get if the player is currently seeking.
	     *
	     * @return {GetSeekingPromise}
	     */

	  }, {
	    key: "getSeeking",
	    value: function getSeeking() {
	      return this.get('seeking');
	    }
	    /**
	     * A promise to get the text tracks of a video.
	     *
	     * @promise GetTextTracksPromise
	     * @fulfill {VimeoTextTrack[]} The text tracks associated with the video.
	     */

	    /**
	     * Get an array of the text tracks that exist for the video.
	     *
	     * @return {GetTextTracksPromise}
	     */

	  }, {
	    key: "getTextTracks",
	    value: function getTextTracks() {
	      return this.get('textTracks');
	    }
	    /**
	     * A promise to get the embed code for the video.
	     *
	     * @promise GetVideoEmbedCodePromise
	     * @fulfill {string} The `<iframe>` embed code for the video.
	     */

	    /**
	     * Get the `<iframe>` embed code for the video.
	     *
	     * @return {GetVideoEmbedCodePromise}
	     */

	  }, {
	    key: "getVideoEmbedCode",
	    value: function getVideoEmbedCode() {
	      return this.get('videoEmbedCode');
	    }
	    /**
	     * A promise to get the id of the video.
	     *
	     * @promise GetVideoIdPromise
	     * @fulfill {number} The id of the video.
	     */

	    /**
	     * Get the id of the video.
	     *
	     * @return {GetVideoIdPromise}
	     */

	  }, {
	    key: "getVideoId",
	    value: function getVideoId() {
	      return this.get('videoId');
	    }
	    /**
	     * A promise to get the title of the video.
	     *
	     * @promise GetVideoTitlePromise
	     * @fulfill {number} The title of the video.
	     */

	    /**
	     * Get the title of the video.
	     *
	     * @return {GetVideoTitlePromise}
	     */

	  }, {
	    key: "getVideoTitle",
	    value: function getVideoTitle() {
	      return this.get('videoTitle');
	    }
	    /**
	     * A promise to get the native width of the video.
	     *
	     * @promise GetVideoWidthPromise
	     * @fulfill {number} The native width of the video.
	     */

	    /**
	     * Get the native width of the currently‐playing video. The width of
	     * the highest‐resolution available will be used before playback begins.
	     *
	     * @return {GetVideoWidthPromise}
	     */

	  }, {
	    key: "getVideoWidth",
	    value: function getVideoWidth() {
	      return this.get('videoWidth');
	    }
	    /**
	     * A promise to get the native height of the video.
	     *
	     * @promise GetVideoHeightPromise
	     * @fulfill {number} The native height of the video.
	     */

	    /**
	     * Get the native height of the currently‐playing video. The height of
	     * the highest‐resolution available will be used before playback begins.
	     *
	     * @return {GetVideoHeightPromise}
	     */

	  }, {
	    key: "getVideoHeight",
	    value: function getVideoHeight() {
	      return this.get('videoHeight');
	    }
	    /**
	     * A promise to get the vimeo.com url for the video.
	     *
	     * @promise GetVideoUrlPromise
	     * @fulfill {number} The vimeo.com url for the video.
	     * @reject {PrivacyError} The url isn’t available because of the video’s privacy setting.
	     */

	    /**
	     * Get the vimeo.com url for the video.
	     *
	     * @return {GetVideoUrlPromise}
	     */

	  }, {
	    key: "getVideoUrl",
	    value: function getVideoUrl() {
	      return this.get('videoUrl');
	    }
	    /**
	     * A promise to get the volume level of the player.
	     *
	     * @promise GetVolumePromise
	     * @fulfill {number} The volume level of the player on a scale from 0 to 1.
	     */

	    /**
	     * Get the current volume level of the player on a scale from `0` to `1`.
	     *
	     * Most mobile devices do not support an independent volume from the
	     * system volume. In those cases, this method will always return `1`.
	     *
	     * @return {GetVolumePromise}
	     */

	  }, {
	    key: "getVolume",
	    value: function getVolume() {
	      return this.get('volume');
	    }
	    /**
	     * A promise to set the volume level of the player.
	     *
	     * @promise SetVolumePromise
	     * @fulfill {number} The volume was set.
	     * @reject {RangeError} The volume was less than 0 or greater than 1.
	     */

	    /**
	     * Set the volume of the player on a scale from `0` to `1`. When set
	     * via the API, the volume level will not be synchronized to other
	     * players or stored as the viewer’s preference.
	     *
	     * Most mobile devices do not support setting the volume. An error will
	     * *not* be triggered in that situation.
	     *
	     * @param {number} volume
	     * @return {SetVolumePromise}
	     */

	  }, {
	    key: "setVolume",
	    value: function setVolume(volume) {
	      return this.set('volume', volume);
	    }
	  }]);

	  return Player;
	}(); // Setup embed only if this is not a node environment


	if (!isNode) {
	  initializeEmbeds();
	  resizeEmbeds();
	}

	var track$1 =
	/*#__PURE__*/
	function () {
	  var _ref = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(data) {
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            browser.log('analytics');
	            browser.log(data);
	            _context.next = 4;
	            return trackApi(data);

	          case 4:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));

	  return function track(_x) {
	    return _ref.apply(this, arguments);
	  };
	}();

	var analytics = {
	  track: track$1
	};

	var analytics$1 = /*#__PURE__*/Object.freeze({
		analytics: analytics
	});

	var trackVimeo = (function (iframe, resourceId) {
	  var player = new Player(iframe);

	  var onLoaded = function onLoaded() {
	    analytics.track({
	      event: constants.LOADED,
	      resourceId: resourceId
	    });
	  };

	  var onPlay = function onPlay(player) {
	    analytics.track({
	      event: constants.PLAYING,
	      resourceId: resourceId,
	      timeSpent: player.duration,
	      timeAt: player.seconds
	    });
	  };

	  var onPause = function onPause(player) {
	    analytics.track({
	      event: constants.PAUSED,
	      resourceId: resourceId,
	      timeAt: player.seconds
	    });
	  };

	  var onSeeked = function onSeeked(player) {
	    analytics.track({
	      event: constants.SEEKED,
	      timeAt: player.seconds
	    });
	  };

	  var onEnded = function onEnded(player) {
	    analytics.track({
	      event: constants.ENDED,
	      timeSpent: player.duration,
	      timeAt: player.seconds
	    });
	  };

	  player.on('loaded', onLoaded);
	  player.on('play', onPlay);
	  player.on('pause', onPause);
	  player.on('seeked', onSeeked);
	  player.on('ended', onEnded);
	});

	var youtubeIframe = createCommonjsModule(function (module) {
	(function(window) {
		var YouTubeIframeLoader = {
			src: 'https://www.youtube.com/iframe_api',
			loading: false,
			loaded: false,
			listeners: [],

			load: function(callback) {
				var _this = this;
				this.listeners.push(callback);

				if(this.loaded) {
					setTimeout(function() {
						_this.done();
					});
					return;
				}

				if(this.loading) {
					return;
				}

				this.loading = true;

				window.onYouTubeIframeAPIReady = function() {
					_this.loaded = true;
					_this.done();
				};

				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = this.src;
				document.body.appendChild(script);
			},

			done: function() {
				delete window.onYouTubeIframeAPIReady;

				while(this.listeners.length) {
					this.listeners.pop()(window.YT);
				}
			}
		};

		if(module.exports) {
			module.exports = YouTubeIframeLoader;
		} else {
			window.YouTubeIframeLoader = YouTubeIframeLoader;
		}
	}(window));
	});

	var trackYoutube = (function (resourceId) {
	  var onLoad = function onLoad(YT) {
	    var player = new YT.Player('room-youtube-player', {
	      events: {
	        'onStateChange': onPlayerStateChange
	      }
	    });

	    function onPlayerStateChange(event) {
	      switch (event.data) {
	        case YT.PlayerState.PLAYING:
	          analytics.track({
	            event: constants.PLAYING,
	            resourceId: resourceId,
	            timeSpent: player.getDuration(),
	            timeAt: player.getCurrentTime()
	          });
	          break;

	        case YT.PlayerState.PAUSED:
	          analytics.track({
	            event: constants.PAUSED,
	            resourceId: resourceId,
	            timeAt: player.getCurrentTime()
	          });
	          break;

	        case YT.PlayerState.CUED:
	          analytics.track({
	            event: constants.CUED,
	            resourceId: resourceId,
	            timeAt: player.getCurrentTime()
	          });
	          break;

	        case YT.PlayerState.BUFFERING:
	          analytics.track({
	            event: constants.BUFFERING,
	            resourceId: resourceId,
	            timeAt: player.getCurrentTime()
	          });
	          break;

	        case YT.PlayerState.ENDED:
	          analytics.track({
	            event: constants.ENDED,
	            resourceId: resourceId,
	            timeSpent: player.getDuration(),
	            timeAt: player.getCurrentTime()
	          });
	          break;

	        case YT.PlayerState.UNSTARTED:
	          analytics.track({
	            event: constants.UNSTRATED,
	            resourceId: resourceId,
	            timeSpent: player.getDuration(),
	            timeAt: player.getCurrentTime()
	          });
	          break;

	        default:
	          browser.log('default');
	          browser.log(event);
	          return;
	      }
	    }
	  };

	  youtubeIframe.load(onLoad);
	});

	function loadSource (_x, _x2) {
	  return _ref.apply(this, arguments);
	}

	function _ref() {
	  _ref = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(resource, index) {
	    var type, url, resourceId, vimeo_template, youtube_template, document_template, web_template, html5_template, Iframe_template, container, source, template;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            type = resource.mediaTypeId;
	            url = resource.mediaUrl;
	            resourceId = resource.id;
	            vimeo_template = "<iframe id=\"room-vimeo-player\" src=\"".concat(url, "\" style=\"width:100%; height:100%;\" width=\"100%\" height=\"100%\" frameborder=\"0\" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen</iframe>");
	            youtube_template = "<iframe id=\"room-youtube-player\" width=\"100%\" height=\"100%\" src=\"".concat(url, "?enablejsapi=1&origin=").concat(window.location.origin, "\" frameborder=\"0\"></iframe>");
	            document_template = "<iframe id='room-document-iframe' src=\"https://docs.google.com/gview?url=".concat(url, "&embedded=true\"></iframe>");
	            web_template = "<iframe id='room-web-iframe' src=\"".concat(url, "\" width=\"100%\" height=\"100%\"><p>Your browser does not support iframes.</p></iframe>");
	            html5_template = "<video id='room-html-iframe' width=\"100%\" height=\"100%\" controls=\"controls\"><source src=\"".concat(url, "\" type=\"video/mp4\"></video>");
	            Iframe_template = "<iframe id='room-template-iframe' src=\"".concat(url, "\" width=\"100%\" height=\"100%\"><p>Your browser does not support iframes.</p></iframe>");
	            container = document.getElementById(ROOM_PREVIEW_ELEMENT_IDS.CONTENT);
	            source = {
	              resourceId: resourceId,
	              event: constants.CLICK
	            };
	            store.resourceId = source.resourceId;
	            _context.next = 14;
	            return trackTime(source);

	          case 14:
	            template = null;
	            _context.t0 = type;
	            _context.next = _context.t0 === constants.YOUTUBE ? 18 : _context.t0 === constants.VIMEO ? 21 : _context.t0 === constants.HTML5 ? 24 : _context.t0 === constants.IFRAME ? 26 : _context.t0 === constants.DOCUMENT ? 28 : _context.t0 === constants.WEB ? 30 : 32;
	            break;

	          case 18:
	            template = youtube_template;
	            trackYoutube(resourceId);
	            return _context.abrupt("break", 32);

	          case 21:
	            template = vimeo_template;
	            trackVimeo('room-vimeo-player', resourceId);
	            return _context.abrupt("break", 32);

	          case 24:
	            template = html5_template;
	            return _context.abrupt("break", 32);

	          case 26:
	            template = Iframe_template;
	            return _context.abrupt("break", 32);

	          case 28:
	            template = document_template;
	            return _context.abrupt("break", 32);

	          case 30:
	            template = web_template;
	            return _context.abrupt("break", 32);

	          case 32:
	            container.innerHTML = template || '';

	          case 33:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _ref.apply(this, arguments);
	}

	var events = {
	  viewResource: 'viewResource',
	  openDialog: 'openDialog',
	  closeDialog: 'closeDialog'
	};

	function dialog(_ref) {
	  var title = _ref.title,
	      template = _ref.template,
	      preventClose = _ref.preventClose,
	      element = _ref.element,
	      close = _ref.close,
	      confirmLabel = _ref.confirmLabel,
	      declineLabel = _ref.declineLabel,
	      customActions = _ref.customActions,
	      id = _ref.id;
	  var confirmButton = confirmLabel ? "<button type=\"button\" class=\"mdc-button mdc-dialog__button mdc-button--raised\" data-mdc-dialog-action=\"false\">\n      <span class=\"mdc-button__label\">".concat(confirmLabel, "</span>\n    </button>") : '';
	  var declineButton = declineLabel ? "<button type=\"button\" class=\"mdc-button mdc-dialog__button\" data-mdc-dialog-action=\"".concat(false, "\">\n      <span class=\"mdc-button__label\">", declineLabel, "</span>\n    </button>") : '';
	  var actions = confirmLabel || declineLabel ? "<footer class=\"mdc-dialog__actions\">\n      ".concat(declineButton, "\n      ").concat(confirmButton, "\n    </footer>") : '';
	  var dialogTemplate = "\n  <div \n    id=\"".concat(id, "\"\n    data-mdc-auto-init=\"MDCDialog\"\n    class=\"mdc-dialog\"\n    role=\"alertdialog\"\n    aria-modal=\"true\"\n    aria-labelledby=\"my-dialog-title\"\n    aria-describedby=\"my-dialog-content\">\n    <div class=\"mdc-dialog__container\">\n      <div class=\"mdc-dialog__surface\">\n        ").concat(title ? "<h2 class=\"mdc-dialog__title\">".concat(title, "</h2>") : '', "\n        ").concat(close ? "<button class=\"mdc-fab mdc-fab--mini close-icon\" aria-label=\"Close\" data-mdc-dialog-action=\"no\">\n          x\n        </button>" : '', "\n        <div class=\"mdc-dialog__content\">").concat(template || '', "</div>\n        ").concat(customActions || actions, "\n      </div>\n    </div>\n    <div class=\"mdc-dialog__scrim\"></div>\n  </div>\n  ");
	  var dialogElement = htmlToElement(dialogTemplate);

	  if (element) {
	    dialogElement.querySelector('.mdc-dialog__content').append(element);
	  }

	  document.body.appendChild(dialogElement);
	  window.mdc.autoInit();

	  if (preventClose) {
	    dialogElement.MDCDialog.scrimClickAction = '';
	    dialogElement.MDCDialog.escapeKeyAction = ''; //for escape
	  }

	  dialogElement.MDCDialog.listen('MDCDialog:closed', function () {
	    pubSub.publish(events.closeDialog, {
	      id: id
	    });
	    dialogElement.MDCDialog.destroy();
	    dialogElement.remove();
	  });
	  dialogElement.MDCDialog.listen('MDCDialog:opened', function () {
	    pubSub.publish(events.openDialog, {
	      id: id
	    });
	  });
	  return dialogElement;
	}

	var dialogs = {
	  scheduleMeeting: 'scheduleMeeting',
	  scheduleMeetingSuccess: 'scheduleMeetingSuccess',
	  shareResourceByEmail: 'shareResourceByEmail',
	  form: 'form'
	};

	function scheduleMeetingSuccessDialog(date) {
	  var templateContent = "\n    <div class=\"schedule-meeting-dialog-success-content\">\n        <div class=\"success-icon\">\n          <i class=\"material-icons mdc-text-field__icon\">check</i>\n        </div>\n        \n        <p>Awesome! Your appointment is booked.</p>\n        <p>We'll talk to you on ".concat(date, "</p>\n        <p>Feel free to leave any messages on our email \n          <a href=\"mailto:support@social27.com\">support@social27.com</a>\n        </p>\n    </div>\n  ");
	  return dialog({
	    title: 'Schedule Meeting',
	    template: templateContent,
	    declineLabel: 'Close',
	    id: dialogs.scheduleMeetingSuccess
	  });
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	var arrayWithHoles = _arrayWithHoles;

	function _iterableToArrayLimit(arr, i) {
	  var _arr = [];
	  var _n = true;
	  var _d = false;
	  var _e = undefined;

	  try {
	    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	var iterableToArrayLimit = _iterableToArrayLimit;

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}

	var nonIterableRest = _nonIterableRest;

	function _slicedToArray(arr, i) {
	  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
	}

	var slicedToArray = _slicedToArray;

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	var defineProperty = _defineProperty;

	function _objectSpread(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i] != null ? arguments[i] : {};
	    var ownKeys = Object.keys(source);

	    if (typeof Object.getOwnPropertySymbols === 'function') {
	      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
	        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
	      }));
	    }

	    ownKeys.forEach(function (key) {
	      defineProperty(target, key, source[key]);
	    });
	  }

	  return target;
	}

	var objectSpread = _objectSpread;

	function flatten(data) {
	  return data.reduce(function (acc, val) {
	    return acc.concat(val);
	  }, []);
	}

	function scheduleMeetingDialog() {
	  var result = {
	    element: null,
	    model: {}
	  };
	  var contentTemplate = "\n  <form id=\"s27_schedule_meeting_form\" novalidate>\n    <div class=\"text-field-container\">\n        <div id=\"s27_schedule_meeting_email\"  data-mdc-auto-init=\"MDCTextField\" class=\"mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon\">\n            <i class=\"material-icons mdc-text-field__icon\">email</i>\n            <input required type=\"email\" class=\"mdc-text-field__input\">\n            <div class=\"mdc-notched-outline\">\n                <div class=\"mdc-notched-outline__leading\"></div>\n                <div class=\"mdc-notched-outline__notch\">\n                    <label class=\"mdc-floating-label\">Email</label>\n                </div>\n                <div class=\"mdc-notched-outline__trailing\"></div>\n            </div>\n        </div>\n        <div class=\"mdc-text-field-helper-line\">\n            <p class=\"mdc-text-field-helper-text\">What email address should I send the invite?</p>\n        </div>\n    </div>\n  \n    <div class=\"text-field-container\">\n        <div id=\"s27_schedule_meeting_name\" data-mdc-auto-init=\"MDCTextField\" class=\"mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon\">\n            <i class=\"material-icons mdc-text-field__icon\">perm_identity</i>\n            <input required type=\"text\" class=\"mdc-text-field__input\">\n            <div class=\"mdc-notched-outline\">\n                <div class=\"mdc-notched-outline__leading\"></div>\n                <div class=\"mdc-notched-outline__notch\">\n                    <label class=\"mdc-floating-label\">First Name & Last Name</label>\n                </div>\n                <div class=\"mdc-notched-outline__trailing\"></div>\n            </div>\n        </div>\n        <div class=\"mdc-text-field-helper-line\">\n            <p class=\"mdc-text-field-helper-text\">Please share your first and last name</p>\n        </div>\n    </div>\n  \n    <div id=\"s27_schedule_meeting_date__container\" class=\"text-field-container\">\n      <div data-mdc-auto-init=\"MDCSelect\" class=\"mdc-select mdc-select--outlined mdc-select--with-leading-icon mdc-select--disabled\">\n        <i class=\"material-icons mdc-select__icon\" role=\"button\">calendar_today</i>\n        <input id=\"s27_schedule_meeting_date\" type=\"hidden\" name=\"enhanced-select\">\n        <i class=\"mdc-select__dropdown-icon\"></i>\n        <div class=\"mdc-select__selected-text\"></div>\n        <div class=\"mdc-select__menu mdc-menu mdc-menu-surface\">\n          <ul class=\"mdc-list\">\n            <li class=\"mdc-list-item mdc-list-item--selected\" data-value=\"\" aria-selected=\"true\"></li>\n          </ul>\n        </div>\n        \n        <div class=\"mdc-notched-outline\">\n         <div class=\"mdc-notched-outline__leading\"></div>\n         <div class=\"mdc-notched-outline__notch\">\n           <label class=\"mdc-floating-label\">Date</label>\n         </div>\n         <div class=\"mdc-notched-outline__trailing\"></div>\n       </div>\n      </div>\n      \n      <div class=\"mdc-text-field-helper-line\">\n          <p class=\"mdc-text-field-helper-text\">What date works best for you?</p>\n      </div>\n    </div>\n    \n    <div id=\"s27_schedule_meeting_time__container\" class=\"text-field-container\">\n      <div data-mdc-auto-init=\"MDCSelect\" class=\"mdc-select mdc-select--outlined mdc-select--with-leading-icon mdc-select--disabled\">\n        <i class=\"material-icons mdc-select__icon\" role=\"button\">access_time</i>\n\n        <input id=\"s27_schedule_meeting_time\" type=\"hidden\" name=\"enhanced-select\">\n        <i class=\"mdc-select__dropdown-icon\"></i>\n        <div class=\"mdc-select__selected-text\"></div>\n        <div class=\"mdc-select__menu mdc-menu mdc-menu-surface\">\n          <ul class=\"mdc-list\">\n            <li class=\"mdc-list-item mdc-list-item--selected\" data-value=\"\" aria-selected=\"true\"></li>\n          </ul>\n        </div>\n        \n        <div class=\"mdc-notched-outline\">\n         <div class=\"mdc-notched-outline__leading\"></div>\n         <div class=\"mdc-notched-outline__notch\">\n           <label class=\"mdc-floating-label\">Time</label>\n         </div>\n         <div class=\"mdc-notched-outline__trailing\"></div>\n       </div>\n      </div>\n      \n      <div class=\"mdc-text-field-helper-line\">\n          <p class=\"mdc-text-field-helper-text\">What date works best for you?</p>\n      </div>\n    </div>\n    \n    <div data-mdc-auto-init=\"MDCLinearProgress\" style=\"opacity: 0\" role=\"progressbar\" id=\"s27_schedule-meeting__progress\" class=\"mdc-linear-progress mdc-linear-progress--indeterminate\">\n      <div class=\"mdc-linear-progress__buffering-dots\"></div>\n      <div class=\"mdc-linear-progress__buffer\"></div>\n      <div class=\"mdc-linear-progress__bar mdc-linear-progress__primary-bar\">\n        <span class=\"mdc-linear-progress__bar-inner\"></span>\n      </div>\n      <div class=\"mdc-linear-progress__bar mdc-linear-progress__secondary-bar\">\n        <span class=\"mdc-linear-progress__bar-inner\"></span>\n      </div>\n    </div>\n  \n  </form>";
	  var actions = "\n    <footer class=\"mdc-dialog__actions\">\n      <button id=\"s27_schedule_meeting_cancel\" type=\"button\" class=\"mdc-button mdc-dialog__button\" data-mdc-dialog-action=\"false\">\n        <span class=\"mdc-button__label\">Cancel</span>\n      </button>\n      <button disabled id=\"s27_schedule_meeting_confirm\" type=\"button\" class=\"mdc-button mdc-button--raised\">\n        <span class=\"mdc-button__label\">Confirm</span>\n      </button>\n    </footer>";
	  result.element = dialog({
	    title: 'Schedule Meeting',
	    template: contentTemplate,
	    customActions: actions,
	    close: true,
	    id: dialogs.scheduleMeeting
	  });
	  var confirmEl = document.getElementById('s27_schedule_meeting_confirm');
	  var formEl = document.getElementById('s27_schedule_meeting_form');
	  var emailMDCTextField = document.getElementById('s27_schedule_meeting_email').MDCTextField;
	  emailMDCTextField.input_.addEventListener('keyup', function (e) {
	    result.model = objectSpread({}, result.model, {
	      email: e.target.value
	    });
	    confirmEl.disabled = !formEl.checkValidity();
	  });
	  var nameMDCTextField = document.getElementById('s27_schedule_meeting_name').MDCTextField;
	  nameMDCTextField.input_.addEventListener('keyup', function (e) {
	    result.model = objectSpread({}, result.model, {
	      name: e.target.value
	    });
	    confirmEl.disabled = !formEl.checkValidity();
	  });
	  confirmEl.addEventListener('click', function () {
	    var dateSelect = document.getElementById('s27_schedule_meeting_date').MDCSelect;
	    var timeSelect = document.getElementById('s27_schedule_meeting_time').MDCSelect;
	    progressElement.style.opacity = '1';
	    confirmEl.disabled = true;
	    emailMDCTextField.disabled = true;
	    nameMDCTextField.disabled = true;
	    dateSelect.disabled = true;
	    timeSelect.disabled = true;
	    createMeetingEvent(result.model).then(function (resp) {
	      result.element.MDCDialog.close();

	      if (resp.code === 1) {
	        return scheduleMeetingSuccessDialog(result.model.date).MDCDialog.open();
	      }
	    })["finally"](function () {
	      progressElement.style.opacity = '0';
	      confirmEl.disabled = false;
	      emailMDCTextField.disabled = false;
	      nameMDCTextField.disabled = false;
	      dateSelect.disabled = false;
	      timeSelect.disabled = false;
	    });
	  });
	  confirmEl.disabled = !formEl.checkValidity();
	  var progressElement = document.getElementById('s27_schedule-meeting__progress');
	  getAvailableDatesForScheduleMeeting().then(function (resp) {
	    var availability = flatten(resp.map(function (data) {
	      return data.availability;
	    }));
	    var dateSelectContainer = document.getElementById('s27_schedule_meeting_date__container');
	    dateSelectContainer.innerHTML = createAvailableDateTemplate(availability);
	    window.mdc.autoInit();
	    var dateSelectElement = dateSelectContainer.querySelector('.mdc-select');
	    dateSelectElement.MDCSelect.listen('MDCSelect:change', function (e) {
	      var date = availability.find(function (val) {
	        return val.date === e.detail.value;
	      });
	      result.model = objectSpread({}, result.model, {
	        date: date.date,
	        daySlotId: date.id
	      });
	      confirmEl.disabled = !formEl.checkValidity();
	      var timeSelectContainer = document.getElementById('s27_schedule_meeting_time__container');
	      timeSelectContainer.innerHTML = createAvailableTimeTemplate(date);
	      window.mdc.autoInit();
	      var timeSelectElement = timeSelectContainer.querySelector('.mdc-select');
	      timeSelectElement.MDCSelect.listen('MDCSelect:change', function (e) {
	        var _e$detail$value$split = e.detail.value.split(' - '),
	            _e$detail$value$split2 = slicedToArray(_e$detail$value$split, 2),
	            startTime = _e$detail$value$split2[0],
	            endTime = _e$detail$value$split2[1];

	        result.model = objectSpread({}, result.model, {
	          startTime: startTime,
	          endTime: endTime
	        });
	        confirmEl.disabled = !formEl.checkValidity();
	      });
	    });
	  });
	  return result;
	}

	function createAvailableDateTemplate(availableDates) {
	  return createSelectTemplate('s27_schedule_meeting_date', availableDates, 'Date', 'What date works best for you?', function (option) {
	    return option.date;
	  }, function (option) {
	    return "".concat(option.date, " - ").concat(option.dayName);
	  }, 'calendar_today');
	}

	function createAvailableTimeTemplate(date) {
	  return createSelectTemplate('s27_schedule_meeting_time', date.timeInterval, 'Time', "What time is suitable for you on ".concat(date.date, "?"), function (option) {
	    return "".concat(option.timeFrom, " - ").concat(option.timeTo);
	  }, function (option) {
	    return "".concat(option.timeFrom, " - ").concat(option.timeTo);
	  }, 'access_time');
	}

	function createSelectTemplate(id, options, label, helperText, toValue, toDisplayName, icon) {
	  return "<div id=\"".concat(id, "\" data-mdc-auto-init=\"MDCSelect\" class=\"mdc-select mdc-select--outlined mdc-select--with-leading-icon\">\n  <i class=\"material-icons mdc-select__icon\" role=\"button\">").concat(icon, "</i>\n        <input type=\"hidden\" name=\"enhanced-select\">\n        <i class=\"mdc-select__dropdown-icon\"></i>\n        <div class=\"mdc-select__selected-text\"></div>\n        <div class=\"mdc-select__menu mdc-menu mdc-menu-surface\">\n          <ul class=\"mdc-list\">\n            ").concat(options.map(function (option) {
	    return "\n    <li class=\"mdc-list-item\" data-value=\"".concat(toValue(option), "\" role=\"option\">\n      ").concat(toDisplayName(option), "\n    </li>\n  ");
	  }).join(''), "\n          </ul>\n        </div>\n        \n        <div class=\"mdc-notched-outline\">\n         <div class=\"mdc-notched-outline__leading\"></div>\n         <div class=\"mdc-notched-outline__notch\">\n           <label class=\"mdc-floating-label\">").concat(label, "</label>\n         </div>\n         <div class=\"mdc-notched-outline__trailing\"></div>\n       </div>\n      </div>\n      \n      <div class=\"mdc-text-field-helper-line\">\n          <p class=\"mdc-text-field-helper-text\">").concat(helperText, "</p>\n      </div>");
	}

	function shareResourceByEmailDialog() {
	  var result = {
	    element: null,
	    model: {}
	  };
	  var contentTemplate = "\n  <form id=\"s27_schedule_meeting_form\" novalidate>\n    <div class=\"text-field-container\">\n        <div id=\"s27_schedule_meeting_subject\"  data-mdc-auto-init=\"MDCTextField\" class=\"mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon\">\n            <i class=\"material-icons mdc-text-field__icon\">subject</i>\n            <input required type=\"text\" class=\"mdc-text-field__input\">\n            <div class=\"mdc-notched-outline\">\n                <div class=\"mdc-notched-outline__leading\"></div>\n                <div class=\"mdc-notched-outline__notch\">\n                    <label class=\"mdc-floating-label\">Subject</label>\n                </div>\n                <div class=\"mdc-notched-outline__trailing\"></div>\n            </div>\n        </div>\n<!--        <div class=\"mdc-text-field-helper-line\">-->\n<!--            <p class=\"mdc-text-field-helper-text\">What email address should I send the invite?</p>-->\n<!--        </div>-->\n    </div>\n  \n    <div class=\"text-field-container\">\n        <div id=\"s27_schedule_meeting_sharedFrom\"  data-mdc-auto-init=\"MDCTextField\" class=\"mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon\">\n            <i class=\"material-icons mdc-text-field__icon\">email</i>\n            <input required type=\"email\" class=\"mdc-text-field__input\">\n            <div class=\"mdc-notched-outline\">\n                <div class=\"mdc-notched-outline__leading\"></div>\n                <div class=\"mdc-notched-outline__notch\">\n                    <label class=\"mdc-floating-label\">Share from Email</label>\n                </div>\n                <div class=\"mdc-notched-outline__trailing\"></div>\n            </div>\n        </div>\n<!--        <div class=\"mdc-text-field-helper-line\">-->\n<!--            <p class=\"mdc-text-field-helper-text\">What email address should I send the invite?</p>-->\n<!--        </div>-->\n    </div>\n    \n    <div class=\"text-field-container\">\n        <div id=\"s27_schedule_meeting_sharedTo\"  data-mdc-auto-init=\"MDCTextField\" class=\"mdc-text-field mdc-text-field--outlined mdc-text-field--with-leading-icon\">\n            <i class=\"material-icons mdc-text-field__icon\">email</i>\n            <input required type=\"email\" class=\"mdc-text-field__input\">\n            <div class=\"mdc-notched-outline\">\n                <div class=\"mdc-notched-outline__leading\"></div>\n                <div class=\"mdc-notched-outline__notch\">\n                    <label class=\"mdc-floating-label\">Share to Email</label>\n                </div>\n                <div class=\"mdc-notched-outline__trailing\"></div>\n            </div>\n        </div>\n<!--        <div class=\"mdc-text-field-helper-line\">-->\n<!--            <p class=\"mdc-text-field-helper-text\">What email address should I send the invite?</p>-->\n<!--        </div>-->\n    </div>\n    \n    <div data-mdc-auto-init=\"MDCLinearProgress\" style=\"opacity: 0\" role=\"progressbar\" id=\"s27_schedule-meeting__progress\" class=\"mdc-linear-progress mdc-linear-progress--indeterminate\">\n      <div class=\"mdc-linear-progress__buffering-dots\"></div>\n      <div class=\"mdc-linear-progress__buffer\"></div>\n      <div class=\"mdc-linear-progress__bar mdc-linear-progress__primary-bar\">\n        <span class=\"mdc-linear-progress__bar-inner\"></span>\n      </div>\n      <div class=\"mdc-linear-progress__bar mdc-linear-progress__secondary-bar\">\n        <span class=\"mdc-linear-progress__bar-inner\"></span>\n      </div>\n    </div>\n  \n  </form>";
	  var actions = "\n    <footer class=\"mdc-dialog__actions\">\n      <button id=\"s27_schedule_meeting_cancel\" type=\"button\" class=\"mdc-button mdc-dialog__button\" data-mdc-dialog-action=\"false\">\n        <span class=\"mdc-button__label\">Cancel</span>\n      </button>\n      <button disabled id=\"s27_schedule_meeting_confirm\" type=\"button\" class=\"mdc-button mdc-button--raised\">\n        <span class=\"mdc-button__label\">Confirm</span>\n      </button>\n    </footer>";
	  result.element = dialog({
	    title: 'Share Resource by Email',
	    template: contentTemplate,
	    customActions: actions,
	    close: true,
	    id: dialogs.shareResourceByEmail
	  });
	  var confirmEl = document.getElementById('s27_schedule_meeting_confirm');
	  var formEl = document.getElementById('s27_schedule_meeting_form');
	  var subjectMDCTextField = document.getElementById('s27_schedule_meeting_subject').MDCTextField;
	  subjectMDCTextField.input_.addEventListener('keyup', function (e) {
	    result.model = objectSpread({}, result.model, {
	      subject: e.target.value
	    });
	    confirmEl.disabled = !formEl.checkValidity();
	  });
	  var shareFromMDCTextField = document.getElementById('s27_schedule_meeting_sharedFrom').MDCTextField;
	  shareFromMDCTextField.input_.addEventListener('keyup', function (e) {
	    result.model = objectSpread({}, result.model, {
	      shareFrom: e.target.value
	    });
	    confirmEl.disabled = !formEl.checkValidity();
	  });
	  var shareToMDCTextField = document.getElementById('s27_schedule_meeting_sharedTo').MDCTextField;
	  shareToMDCTextField.input_.addEventListener('keyup', function (e) {
	    result.model = objectSpread({}, result.model, {
	      shareTo: e.target.value
	    });
	    confirmEl.disabled = !formEl.checkValidity();
	  });
	  confirmEl.addEventListener('click', function () {
	    progressElement.style.opacity = '1';
	    confirmEl.disabled = true;
	    subjectMDCTextField.disabled = true;
	    shareFromMDCTextField.disabled = true;
	    shareToMDCTextField.disabled = true;
	    var resource = store.resources.find(function (val) {
	      return val.id == store.selectedResourceId;
	    });
	    shareResourceByEmail(objectSpread({
	      resource: resource
	    }, result.model)).then(function (resp) {
	      result.element.MDCDialog.close();
	    })["finally"](function () {
	      progressElement.style.opacity = '0';
	      confirmEl.disabled = false;
	      subjectMDCTextField.disabled = false;
	      shareFromMDCTextField.disabled = false;
	      shareToMDCTextField.disabled = false;
	    });
	  });
	  confirmEl.disabled = !formEl.checkValidity();
	  var progressElement = document.getElementById('s27_schedule-meeting__progress');
	  return result;
	}



	var index$1 = /*#__PURE__*/Object.freeze({
		scheduleMeetingSuccessDialog: scheduleMeetingSuccessDialog,
		scheduleMeetingDialog: scheduleMeetingDialog,
		shareResourceByEmailDialog: shareResourceByEmailDialog
	});

	var RoomPreviewEffects =
	/*#__PURE__*/
	function () {
	  function RoomPreviewEffects() {
	    classCallCheck(this, RoomPreviewEffects);

	    pubSub.subscribe(ROOM_PREVIEW_ACTIONS.LoadResources, this.loadResources.bind(this));
	    pubSub.subscribe(ROOM_PREVIEW_ACTIONS.SelectResource, this.selectResource.bind(this));
	    pubSub.subscribe(ROOM_PREVIEW_ACTIONS.NextResource, this.nextResource.bind(this));
	    pubSub.subscribe(ROOM_PREVIEW_ACTIONS.OpenScheduleCallDialog, this.openScheduleCallDialog.bind(this));
	    pubSub.subscribe(ROOM_PREVIEW_ACTIONS.OpenShareByEmailDialog, this.openShareResourceByEmailDialog.bind(this));
	  }

	  createClass(RoomPreviewEffects, [{
	    key: "loadResources",
	    value: function loadResources() {
	      return getResources(store.options.roomTrackId).then(function (resources) {
	        store.resources = resources;
	        var selectedResource = store.selectedResourceId && resources && resources.find(function (resource) {
	          return resource.id == store.selectedResourceId;
	        });

	        if (!selectedResource) {
	          store.selectedResourceId = resources[0] ? resources[0].id : null;
	        }

	        pubSub.publish(ROOM_PREVIEW_ACTIONS.SelectResource, store.selectedResourceId);
	        rerenderResources(resources);
	        pubSub.publish(ROOM_PREVIEW_ACTIONS.LoadResourcesCompleted);
	      })["catch"](function (err) {
	        pubSub.publish(ROOM_PREVIEW_ACTIONS.LoadResourcesFailed, err);
	      });
	    }
	  }, {
	    key: "selectResource",
	    value: function selectResource(resourceId) {
	      store.selectedResourceId = resourceId;

	      if (resourceId) {
	        var resource = store.resources.find(function (resource) {
	          return resource.id == resourceId;
	        });

	        if (resource) {
	          rerenderNextResourceElement(resource);
	          loadSource(resource);
	        }
	      }
	    }
	  }, {
	    key: "nextResource",
	    value: function nextResource() {
	      var selectedResourceIndex = store.resources.findIndex(function (resource) {
	        return resource.id === store.selectedResourceId;
	      });
	      var nextResource = store.resources[selectedResourceIndex + 1] || store.resources[0] || {};

	      if (nextResource && nextResource.id !== store.selectedResourceId) {
	        pubSub.publish(ROOM_PREVIEW_ACTIONS.SelectResource, nextResource);
	      }
	    }
	  }, {
	    key: "openScheduleCallDialog",
	    value: function openScheduleCallDialog() {
	      scheduleMeetingDialog().element.MDCDialog.open();
	    }
	  }, {
	    key: "openShareResourceByEmailDialog",
	    value: function openShareResourceByEmailDialog() {
	      shareResourceByEmailDialog().element.MDCDialog.open();
	    }
	  }]);

	  return RoomPreviewEffects;
	}();

	function resourceItemTemplate(resource) {
	  var templateData = {
	    thumbnail: resource.thumbnail || 'https://s27platformmedia.blob.core.windows.net/s27botimages/c17e7ff66e0844078c10afc8627a88d8_285x150.png',
	    icon: 'https://storage.googleapis.com/olibot/images/webpage-icon-R.jpg',
	    description: resource.title,
	    linkTitle: 'Visit Website'
	  };
	  return "\n<a onclick=\"s27ResourceCenterWebView.utils.pubSub.publish('".concat(ROOM_PREVIEW_ACTIONS.SelectResource, "', ").concat(resource.id, ")\" class=\"MyResource-listbox-TCont\">\n    <div class=\"Box-ListC-ResourceTrk\">\n        <div class=\"Thumbnail-Imgblok\">\n            <img src=\"").concat(templateData.thumbnail, "\">\n        </div>\n        <div class=\"T-description\">\n            <div class=\"h3descriptionbox\">").concat(templateData.description, "</div>\n        </div>\n        <div class=\"box-typeContent\">\n            <div class=\"Icontype\">\n                <img src=\"").concat(templateData.icon, "\">\n            </div>\n            <div class=\"Type-TitleT\">").concat(templateData.linkTitle, "</div>\n        </div>\n    </div>\n</a>\n");
	}

	function resourceListTemplate() {
	  var resources = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	  return "\n<div id=\"".concat(ROOM_PREVIEW_ELEMENT_IDS.RESOURCE_LIST, "\" class=\"C-ilistbox-case\">\n").concat(resources.map(resourceItemTemplate).join(''), "\n</div>\n");
	}
	function rerenderResources(resources) {
	  var element = document.getElementById(ROOM_PREVIEW_ELEMENT_IDS.RESOURCE_LIST);

	  if (element) {
	    element.innerHTML = resourceListTemplate(resources);
	  }
	}

	var _typeof_1 = createCommonjsModule(function (module) {
	function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

	function _typeof(obj) {
	  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
	    module.exports = _typeof = function _typeof(obj) {
	      return _typeof2(obj);
	    };
	  } else {
	    module.exports = _typeof = function _typeof(obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
	    };
	  }

	  return _typeof(obj);
	}

	module.exports = _typeof;
	});

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	var assertThisInitialized = _assertThisInitialized;

	function _possibleConstructorReturn(self, call) {
	  if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
	    return call;
	  }

	  return assertThisInitialized(self);
	}

	var possibleConstructorReturn = _possibleConstructorReturn;

	var getPrototypeOf = createCommonjsModule(function (module) {
	function _getPrototypeOf(o) {
	  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	module.exports = _getPrototypeOf;
	});

	var setPrototypeOf = createCommonjsModule(function (module) {
	function _setPrototypeOf(o, p) {
	  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	module.exports = _setPrototypeOf;
	});

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) setPrototypeOf(subClass, superClass);
	}

	var inherits = _inherits;

	var RoomPreviewController =
	/*#__PURE__*/
	function (_RoomPreviewEffects) {
	  inherits(RoomPreviewController, _RoomPreviewEffects);

	  function RoomPreviewController() {
	    var _this;

	    classCallCheck(this, RoomPreviewController);

	    _this = possibleConstructorReturn(this, getPrototypeOf(RoomPreviewController).call(this));
	    pubSub.publish(ROOM_PREVIEW_ACTIONS.LoadResources);
	    return _this;
	  }

	  return RoomPreviewController;
	}(RoomPreviewEffects);

	function createCookie(name, value, days) {
	  var expires;

	  if (days) {
	    var date = new Date();
	    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
	    expires = '; expires=' + date.toGMTString();
	  } else {
	    expires = '';
	  }

	  document.cookie = name + '=' + value + expires + '; path=/';
	}

	function dynamicElementLoader(_ref) {
	  var tag = _ref.tag,
	      attributes = _ref.attributes,
	      style = _ref.style;
	  var element = document.createElement(tag || 'div');
	  Object.keys(attributes || {}).forEach(function (attribute) {
	    element.setAttribute(attribute, attributes[attribute]);
	  });
	  element.style = style || '';
	  document.body.appendChild(element);
	}

	function dynamicFontLoader(href, onload, onerror) {
	  var rel = 'stylesheet';
	  var head = document.getElementsByTagName('head')[0];

	  if (head) {
	    var link = document.createElement('link');

	    var noOpFn = function noOpFn() {};

	    link.rel = rel;
	    link.href = href;
	    head.appendChild(link);
	    link.onload = onload || noOpFn;
	    link.onerror = onerror || noOpFn;
	  }
	}

	function dynamicInlineScriptLoader(inlineScript) {
	  var type = 'text/javascript';
	  var head = document.getElementsByTagName('head')[0];

	  if (head) {
	    var script = document.createElement('script');
	    script.type = type;
	    script.innerHTML = inlineScript;
	    head.appendChild(script);
	  }
	}

	function dynamicInlineStyleLoader(inlineStyle) {
	  var type = 'text/css';
	  var head = document.getElementsByTagName('head')[0];

	  if (head) {
	    var style = document.createElement('style');
	    style.type = type;
	    style.innerHTML = inlineStyle;
	    head.appendChild(style);
	  }
	}

	function dynamicScriptLoader(src, onload, onerror) {
	  var type = 'text/javascript';
	  var head = document.getElementsByTagName('head')[0];

	  if (head) {
	    var script = document.createElement('script');

	    var noOpFn = function noOpFn() {};

	    script.src = src;
	    script.type = type;
	    head.appendChild(script);
	    script.onload = onload || noOpFn;
	    script.onerror = onerror || noOpFn;
	  }
	}

	function dynamicStyleLoader(href, onload, onerror) {
	  var type = 'text/css';
	  var rel = 'stylesheet';
	  var head = document.getElementsByTagName('head')[0];

	  if (head) {
	    var link = document.createElement('link');

	    var noOpFn = function noOpFn() {};

	    link.type = type;
	    link.rel = rel;
	    link.href = href;
	    head.appendChild(link);
	    link.onload = onload || noOpFn;
	    link.onerror = onerror || noOpFn;
	  }
	}

	function eraseCookie(name) {
	  createCookie(name, '', -1);
	}

	function readCookie(name) {
	  var nameEq = name + '=';
	  var ca = document.cookie.split(';');

	  for (var i = 0; i < ca.length; i++) {
	    var c = ca[i];

	    while (c.charAt(0) === ' ') {
	      c = c.substring(1, c.length);
	    }

	    if (c.indexOf(nameEq) === 0) return c.substring(nameEq.length, c.length);
	  }

	  return null;
	}

	function generateUserId() {
	  var botKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : store.options.botKey;
	  var userId = readCookie('userId' + botKey);

	  if (userId) {
	    return {
	      userId: userId,
	      cache: true
	    };
	  }

	  userId = '_' + Math.random().toString(36).substr(2, 9);
	  createCookie('userId' + botKey, userId, 365);
	  return {
	    userId: userId,
	    cache: false
	  };
	}

	function getTimezone() {
	  var timezone = new Date().toString().match(/([-\+][0-9]+)\s/)[1]; //Formatting response

	  var timezoneArr = timezone.split('');
	  timezoneArr.splice(3, 0, ':');
	  timezone = timezoneArr.join('');
	  return timezone;
	}

	function getId() {
	  var botKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : store.options.botKey;
	  // Math.random should be unique because of its seeding algorithm.
	  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
	  // after the decimal.
	  var userId = readCookie('userId' + botKey);

	  if (userId) {
	    return userId;
	  }

	  userId = '_' + Math.random().toString(36).substr(2, 9);
	  createCookie('userId' + botKey, userId, 365);
	  return userId;
	}

	var GUID = (function () {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0,
	        v = c == 'x' ? r : r & 0x3 | 0x8;
	    return v.toString(16);
	  });
	});

	function poll(fn, callback, check, interval) {
	  var loop = function loop() {
	    fn();

	    if (check()) {
	      clearInterval(handler);
	      callback();
	    }
	  };

	  var handler = setInterval(loop, interval);
	}

	function prependChild(parentEle, newFirstChildEle) {
	  parentEle.insertBefore(newFirstChildEle, parentEle.firstChild);
	}



	var index$2 = /*#__PURE__*/Object.freeze({
		createCookie: createCookie,
		dynamicElementLoader: dynamicElementLoader,
		dynamicFontLoader: dynamicFontLoader,
		dynamicInlineScriptLoader: dynamicInlineScriptLoader,
		dynamicInlineStyleLoader: dynamicInlineStyleLoader,
		dynamicScriptLoader: dynamicScriptLoader,
		dynamicStyleLoader: dynamicStyleLoader,
		eraseCookie: eraseCookie,
		flatten: flatten,
		generateUserId: generateUserId,
		getTimeZone: getTimezone,
		getTzOffset: getTzOffset,
		getUserId: getId,
		guid: GUID,
		htmlToElement: htmlToElement,
		httpRequest: httpRequest,
		poll: poll,
		prependChild: prependChild,
		pubSub: pubSub,
		readCookie: readCookie
	});

	function openCookieConsent() {
	  var template = "\n  <div id=\"qa-cookie-consent\" class=\"sc-hMFtBS jWMndb\">\n    <style>\n      #qa-cookie-consent {\n          max-width: 100%;\n          position: fixed;\n          box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 1px, rgba(0, 0, 0, 0.16) 0px 1px 2px;\n          right: 15px;\n          top: 15px;\n          z-index: 160001;\n          width: 450px;\n          background-color: rgb(255, 255, 255);\n          border-radius: 3px;\n          padding: 10px;\n      }\n      #qa-cookie-consent .kldzuG {\n          opacity: 0.8;\n          color: rgb(33, 53, 66);\n          font-family: Roboto;\n          font-size: 15px;\n          font-weight: normal;\n          line-height: 20px;\n      }\n      #qa-cookie-consent .beTcTy {\n          opacity: 0.8;\n          color: rgb(0, 155, 255);\n          font-family: Roboto;\n          font-size: 15px;\n          font-weight: normal;\n          line-height: 20px;\n      }\n      #qa-cookie-consent .hfSJlC {\n          cursor: pointer;\n          float: right;\n          height: 36px;\n          user-select: none;\n          white-space: nowrap;\n          background-color: rgb(255, 255, 255);\n          color: rgb(33, 53, 66);\n          font-family: Roboto;\n          font-size: 15px;\n          font-weight: normal;\n          line-height: 20px;\n          padding: 0px 12px;\n          border-width: 1px;\n          border-style: solid;\n          border-color: rgba(0, 0, 0, 0.2);\n          border-image: initial;\n          border-radius: 3px;\n          transition: all 0.5s ease 0s;\n      }\n      #qa-cookie-consent .diLeWt {\n          cursor: pointer;\n          float: right;\n          height: 36px;\n          user-select: none;\n          white-space: nowrap;\n          margin-right: 10px;\n          background-color: rgb(255, 255, 255);\n          color: rgb(33, 53, 66);\n          font-family: Roboto;\n          font-size: 15px;\n          font-weight: normal;\n          line-height: 20px;\n          padding: 0px 12px;\n          border-width: 1px;\n          border-style: solid;\n          border-color: rgba(0, 0, 0, 0.2);\n          border-image: initial;\n          border-radius: 3px;\n          transition: all 0.5s ease 0s;\n      }\n      #qa-cookie-consent button {\n          -webkit-appearance: button;\n          -webkit-writing-mode: horizontal-tb !important;\n          text-rendering: auto;\n          color: buttontext;\n          letter-spacing: normal;\n          word-spacing: normal;\n          text-transform: none;\n          text-indent: 0px;\n          text-shadow: none;\n          display: inline-block;\n          text-align: center;\n          align-items: flex-start;\n          cursor: default;\n          background-color: buttonface;\n          box-sizing: border-box;\n          margin: 0em;\n          font: 400 11px system-ui;\n          padding: 1px 7px 2px;\n          border-width: 1px;\n          border-style: solid;\n          border-color: rgb(216, 216, 216) rgb(209, 209, 209) rgb(186, 186, 186);\n          border-image: initial;\n      }\n    </style>\n    <div color=\"#213542\" font-family=\"Roboto\" font-size=\"15px\" font-weight=\"normal\" class=\"sc-cLQEGU kldzuG\">\n      <p id=\"qa-cookie-consent-message\">This site uses cookies to provide a personalized content experience and track visitor engagement.</p>\n      <a target=\"_blank\" rel=\"noopener noreferrer\" color=\"#009bff\" font-family=\"Roboto\" font-size=\"15px\" font-weight=\"normal\" class=\"sc-gqPbQI beTcTy\">Learn More</a>\n    </div>\n    <button id=\"qa-gdpr-cookie-consent-accept-button\" color=\"#213542\" font-family=\"Roboto\" font-size=\"15px\" font-weight=\"normal\" class=\"sc-hORach hfSJlC\">Accept</button><button id=\"qa-gdpr-cookie-consent-decline-button\" color=\"#213542\" font-family=\"Roboto\" font-size=\"15px\" font-weight=\"normal\" class=\"sc-bMVAic diLeWt\">Decline</button>\n  </div>\n  ";
	  var element = htmlToElement(template);
	  element.querySelectorAll('button').forEach(function (el) {
	    el.onclick = function () {
	      element.remove();
	    };
	  });
	  window.document.body.appendChild(element);
	  return element;
	}

	var roomPreviewTemplate = /*#__PURE__*/
	asyncToGenerator(
	/*#__PURE__*/
	regenerator.mark(function _callee() {
	  var controller, html, element;
	  return regenerator.wrap(function _callee$(_context) {
	    while (1) {
	      switch (_context.prev = _context.next) {
	        case 0:
	          controller = new RoomPreviewController();
	          openCookieConsent();
	          html = "\n<section id=".concat(ROOM_PREVIEW_ELEMENT_IDS.CONTAINER, " class=\"Singlepage-ResourceCBox-Container\">\n\n  <!-- next-Videobox and their hover box -->\n  ").concat(nextResourceTemplate(), "\n\n  <!-- next-Videobox and their hover box -->\n  ").concat(leftSidebarTemplate(), "\n\n  <div class=\"rightSide-PlayGround-box\">\n      <div id=\"").concat(ROOM_PREVIEW_ELEMENT_IDS.CONTENT, "\" class=\"content\" style=\"display: block; height: 100%; width: 100%; border: 0; padding: 0; margin: 0; overflow: hidden;\" allowfullscreen=\"\">\n      </div>\n  </div>\n\n</section>\n");
	          element = htmlToElement(html);
	          document.body.appendChild(element);

	        case 5:
	        case "end":
	          return _context.stop();
	      }
	    }
	  }, _callee);
	}));

	var FORM_TYPE = {
	  Standard: 124,
	  ExternalUrl: 125,
	  CustomHTML: 126
	};

	function form(formSettings, onSubmit) {
	  var append = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	  var settings = formSettings.settings,
	      fields = formSettings.fields;
	  var headerTemplate = settings.enableHeader ? "<div class=\"s27_form_form-header\">\n      ".concat(settings.headerImage != '' && settings.headerImage != null ? "<div class=\"s27_standard_form-header__img-container\"><img src=\"".concat(settings.headerImage, "\" /></div>") : '', "\n\n     \n    <div class=\"s27_form_form-header__content\">\n          ").concat(settings.headerTitle != null ? "<h2>".concat(settings.headerTitle, "</h2>") : '<h2>Title of the Header Form</h2>', "\n          ").concat(settings.headerDescription != null ? "<p>".concat(settings.headerDescription, "</p>") : '<p>Description of the Header Form</p>', "\n        </div>\n    \n\n    </div>") : '';
	  var formTemplateBody = '';

	  if (settings.formType === FORM_TYPE.Standard) {
	    formTemplateBody = fields.map(createInputFieldTemplate).join('');
	  } else if (settings.formType === FORM_TYPE.ExternalUrl) {
	    formTemplateBody = "<iframe src=\"".concat(settings.externalForm, "\"></iframe>");
	  } else if (settings.formType === FORM_TYPE.CustomHTML) {
	    formTemplateBody = settings.ExternalForm;
	  }

	  var humanFormType = Object.keys(FORM_TYPE).find(function (key) {
	    return FORM_TYPE[key] === settings.formType;
	  });
	  var formTemplate = "\n  <form class=\"s27_form__form s27_form_".concat(humanFormType, "\" novalidate>\n    ").concat(formTemplateBody, "\n  </form>");
	  var optInTemplate = settings.formType === FORM_TYPE.Standard ? "\n  <div class=\"s27_form_opt-in\">\n  <h4>".concat(settings.allowOptIn && settings.privacyUrl != null && settings.privacyUrl != "" ? "<a href=".concat(settings.privacyUrl, " target=_blank>").concat(settings.optInText, "</a>") : "".concat(settings.optInText), "\n    \n    </h4>\n    <div class=\"s27_form_opt-in__inputs\">\n      <div class=\"mdc-form-field\">\n        <div data-mdc-auto-init=\"MDCRadio\" class=\"mdc-radio\">\n          <input name=\"allowedOptIn\" value=\"yes\" class=\"mdc-radio__native-control\" type=\"radio\" id=\"radio-1\" name=\"radios\" checked>\n          <div class=\"mdc-radio__background\">\n            <div class=\"mdc-radio__outer-circle\"></div>\n            <div class=\"mdc-radio__inner-circle\"></div>\n          </div>\n        </div>\n        <label for=\"radio-1\">Yes</label>\n      </div>\n  \n      <div class=\"mdc-form-field\">\n        <div data-mdc-auto-init=\"MDCRadio\" class=\"mdc-radio\">\n          <input name=\"allowedOptIn\" value=\"no\" class=\"mdc-radio__native-control\" type=\"radio\" id=\"radio-1\" name=\"radios\" checked>\n          <div class=\"mdc-radio__background\">\n            <div class=\"mdc-radio__outer-circle\"></div>\n            <div class=\"mdc-radio__inner-circle\"></div>\n          </div>\n        </div>\n        <label for=\"radio-1\">No</label>\n      </div>\n    </div>\n  </div>") : '';
	  var cookieConsentMessage = settings.formType === FORM_TYPE.Standard ? "\n  <div class=\"s27_form_cookie-consent\">\n    <div class=\"mdc-form-field\">\n      <div data-mdc-auto-init=\"MDCCheckbox\" class=\"mdc-checkbox\">\n        <input type=\"checkbox\"\n               class=\"mdc-checkbox__native-control\"\n               id=\"checkbox-1\"/>\n        <div class=\"mdc-checkbox__background\">\n          <svg class=\"mdc-checkbox__checkmark\"\n               viewBox=\"0 0 24 24\">\n            <path class=\"mdc-checkbox__checkmark-path\"\n                  fill=\"none\"\n                  d=\"M1.73,12.91 8.1,19.28 22.79,4.59\"/>\n          </svg>\n          <div class=\"mdc-checkbox__mixedmark\"></div>\n        </div>\n      </div>\n      <label for=\"checkbox-1\">\n        ".concat(settings.cookieConsentDescription != '' && settings.cookieConsentDescription != null ? settings.cookieConsentDescription : 'By checking this you are accepting to use cookies to personalize content, ads and analize our traffic', "\n      </label>\n    </div>\n  </div>\n  ") : '';
	  var footerTemplate = settings.formType === FORM_TYPE.Standard ? "\n  <div class=\"s27_form_footer\">\n    <button type=\"submit\" class=\"mdc-button mdc-button--outlined\">".concat(settings.buttonText != '' && settings.buttonText != null ? settings.buttonText : 'Submit', "</button>\n  </div>") : '';
	  var template = "\n    <div class=\"s27_form\">\n      ".concat(settings.enableHeader ? headerTemplate : '', "\n      ").concat(formTemplate, "\n      ").concat(settings.allowOptIn ? optInTemplate : '', "\n      ").concat(settings.enableCookieConsent ? cookieConsentMessage : '', "\n      ").concat(footerTemplate, "\n    </div>\n  ");
	  var result = {
	    element: htmlToElement(template),
	    model: {
	      inputFields: fields.reduce(function (acc, field) {
	        acc[field.id] = '';
	        return acc;
	      }, {})
	    },
	    formSettings: formSettings,
	    template: template
	  };

	  if (formSettings.settings.styleSettings) {
	    var formElement = result.element.querySelector('.s27_form__form');

	    try {
	      var stylesObj = JSON.parse(formSettings.settings.styleSettings);
	      Object.keys(stylesObj).forEach(function (key) {
	        formElement.style[key] = Number.isInteger(stylesObj[key]) ? stylesObj[key] + 'px' : stylesObj[key];
	      }); // eslint-disable-next-line no-empty
	    } catch (err) {}
	  }

	  var standardForm = result.element.querySelector('.s27_form__form.s27_form_Standard');

	  if (standardForm) {
	    standardForm.querySelectorAll('.mdc-text-field').forEach(function (el) {
	      el.addEventListener('keyup', function (e) {
	        result.model = objectSpread({}, result.model || {}, {
	          inputFields: objectSpread({}, result.model && result.model.inputFields || {}, defineProperty({}, el.id, e.target.value))
	        });
	      });
	    });
	  }

	  var submitButton = result.element.querySelector('button[type="submit"]');

	  if (submitButton) {
	    submitButton.addEventListener('click', function () {
	      if (onSubmit) {
	        onSubmit(result.model);
	      }
	    });
	  }

	  var optInElement = result.element.querySelector('.s27_form_opt-in');

	  if (optInElement) {
	    optInElement.querySelectorAll('.mdc-radio').forEach(function (el) {
	      el.addEventListener('change', function (e) {
	        result.model = objectSpread({}, result.model || {}, {
	          allowedOptIn: e.target.value.toLowerCase() === 'yes'
	        });
	      });
	    });
	  }

	  var cookieConsentElement = result.element.querySelector('.s27_form_cookie-consent');

	  if (cookieConsentElement) {
	    cookieConsentElement.querySelectorAll('.mdc-checkbox').forEach(function (el) {
	      el.addEventListener('change', function (e) {
	        result.model = objectSpread({}, result.model || {}, {
	          allowedCookies: e.target.checked
	        });
	      });
	    });
	  }

	  if (append) {
	    document.body.appendChild(result.element);
	    window.mdc.autoInit();
	  }

	  return result;
	}

	function createInputFieldTemplate(field) {
	  return "\n  <div id=\"".concat(field.id, "\" data-mdc-auto-init=\"MDCTextField\" class=\"s27_form-settings-field mdc-text-field\">\n    <input class=\"mdc-text-field__input\">\n    <div class=\"mdc-line-ripple\"></div>\n    <label class=\"mdc-floating-label\">").concat(field.name, "</label>\n  </div>\n  ");
	}

	function initFormStrategies() {
	  var visitedResources = [];

	  var eventHandlers = defineProperty({}, events.viewResource, [function (data) {
	    visitedResources.push(data.resourceId);
	  }]);

	  Object.keys(eventHandlers).forEach(function (topic) {
	    pubSub.subscribe(topic, function (data) {
	      eventHandlers[topic].forEach(function (handler) {
	        return handler(data);
	      });
	    });
	  });
	  getFormStrategy().then(function (formStrategies) {
	    var formIds = Array.from(new Set(formStrategies.map(function (strategy) {
	      return strategy.formId;
	    }).filter(Boolean)));
	    Promise.all(formIds.map(function (formId) {
	      return getFormSettings({
	        formId: formId
	      }).then(function (formSettings) {
	        return {
	          formSettings: formSettings,
	          formId: formId
	        };
	      });
	    })).then(function (formSettings) {
	      var formSettingsByFormId = formSettings.reduce(function (acc, _ref) {
	        var formSettings = _ref.formSettings,
	            formId = _ref.formId;
	        acc[formId] = formSettings;
	        return acc;
	      }, {});
	      formStrategies.filter(function (formStrategy) {
	        return formStrategy.formId;
	      }).forEach(function (formStrategy) {
	        var formId = formStrategy.formId;
	        var formSettings = formSettingsByFormId[formId];

	        if (formStrategy.serveAfterSpendingTime > 0) {
	          var spentSeconds = 0;
	          poll(function () {
	            return spentSeconds += 1;
	          }, function () {
	            return openForm(formId, formSettings, formStrategy);
	          }, function () {
	            return spentSeconds >= formStrategy.serveAfterSpendingTime;
	          }, 1000);
	        }

	        if (formStrategy.serveAfterVisitingResources > 0) {
	          var excludedResourceIds = new Set((formStrategy.excludedResourceIds || '').split(',').filter(Boolean).map(function (id) {
	            return parseInt(id, 10);
	          }));
	          eventHandlers[events.viewResource].push(function () {
	            var count = visitedResources.filter(function (id) {
	              return !excludedResourceIds.has(id);
	            }).length;

	            if (count === formStrategy.serveAfterVisitingResources) {
	              openForm(formId, formSettings, formStrategy);
	            }
	          });
	        }
	      });
	    });
	  });

	  var openForm = function openForm(formId, formSettings, formStrategy) {
	    if (store.openedDialogIds.size === 0) {
	      var formElement = form(formSettings, function (data) {
	        formDialog.MDCDialog.close();
	        var model = {
	          formId: formId,
	          resourceId: visitedResources[visitedResources.length - 1],
	          strategyId: formStrategy.strategyId,
	          allowedCookies: data.allowedCookies,
	          allowedOptIn: data.allowedOptIn,
	          inputFields: Object.keys(data.inputFields).map(function (id) {
	            return {
	              id: id,
	              value: data.inputFields[id]
	            };
	          })
	        };
	        return submitForm(model);
	      }, false);
	      var formDialog = dialog({
	        title: formStrategy.formName,
	        element: formElement.element,
	        preventClose: formStrategy.isMandatory,
	        close: formStrategy.isMandatory,
	        id: dialogs.form
	      });
	      formDialog.MDCDialog.open();
	    }
	  };
	}

	var initSession = (function () {
	  if (!store.userSessionId) {
	    store.userSessionId = GUID();
	  }
	});

	var initUserId = function initUserId() {
	  if (!store.userId) {
	    store.userId = window.getId ? window.getId() : GUID();
	  }
	};

	var identity = /*#__PURE__*/Object.freeze({
		initUserId: initUserId
	});

	function loadScripts() {
	  var stylePaths = ['https://storage.googleapis.com/social27/css/resource-room-style.css', 'https://unpkg.com/material-components-web@2.2.0/dist/material-components-web.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'];
	  var fontPaths = ['https://fonts.googleapis.com/icon?family=Material+Icons', 'https://fonts.googleapis.com/css?family=Lato&display=swap'];
	  var scriptPaths = ['https://unpkg.com/material-components-web@2.2.0/dist/material-components-web.min.js'];
	  stylePaths.forEach(function (path) {
	    return dynamicStyleLoader(path);
	  });
	  fontPaths.forEach(function (path) {
	    return dynamicFontLoader(path);
	  });
	  scriptPaths.forEach(function (path) {
	    return dynamicScriptLoader(path);
	  });
	  dynamicElementLoader({
	    attributes: {
	      id: 'resource-room'
	    },
	    style: 'display: none'
	  });
	  var inlineStyle = "\n  a {\n    cursor: pointer;\n  }\n  .mdc-dialog__content {\n    min-width: 450px;\n    min-height: 350px;\n  }\n  .mdc-dialog__title+.mdc-dialog__content {\n    padding-top: 20px;\n  }\n  .text-field-container {\n      margin-bottom: 10px;\n  }\n  .text-field-container > * {\n      width: 100%;\n  }\n  .close-icon {\n    position: absolute;\n    top: -20px;\n    right: -15px;\n    background-color: white;\n    color: rgba(0, 0, 0, .5);\n    font-size: 25px;\n    color: black;\n  }\n  ::root --mdc-theme-primary {\n    color: 286efa !important;\n  }\n  :root {\n     --mdc-theme-primary: #286efa !important;\n  }\n  .input-time .mdc-notched-outline__notch, .input-date .mdc-notched-outline__notch {\n      width: 33.5px !important;\n  }\n\n  .schedule-meeting-dialog-success-content {\n      text-align: center;\n  }\n  .schedule-meeting-dialog-success-content .success-icon i {\n      font-size: 60px;\n      color: #00b050;\n  }\n  .ScheduleCallPlacer {\n      cursor: pointer;\n  }\n\n  .s27_form_form-header {\n      display: flex;\n  }\n  .s27_standard_form-header__img-container {\n      margin-right: 10px;\n  }\n  .s27_standard_form-header__img-container, .s27_form_form-header__content {\n      display: inline-flex;\n      padding: 10px;\n      border: solid 1px gray;\n  }\n  .s27_standard_form-header__img-container img {\n      width: 100%;\n      height: 100%;\n      object-fit: cover;\n      max-width: 100px\n  }\n  .s27_form__form {\n      display: flex;\n      flex-direction: column;\n      padding: 10px;\n      border: solid 1px gray;\n      margin-top: 10px;\n      min-width: 300px;\n  }\n\n  .s27_form__form.s27_form_ExternalUrl {\n      display: block;\n      padding: 0;\n      border: 0;\n      min-width: 100%;\n      min-height: 100%;\n  }\n\n  .mdc-select.mdc-select--focused + .mdc-text-field-helper-line .mdc-text-field-helper-text {\n      opacity: 1;\n  }\n\n  .mdc-select+.mdc-text-field-helper-line {\n      padding-right: 16px;\n      padding-left: 16px;\n  }\n\n  .s27_form__form.s27_form_ExternalUrl iframe {\n      width: 100%;\n      height: 100%;\n  }\n  .s27_form_form-header__content {\n      flex: 1;\n      display: flex;\n      flex-direction: column;\n      justify-content: center;\n  }\n  .s27_form_form-header__content h2 {\n      margin: 0;\n  }\n  .s27_form_form-header__content p {\n      margin-bottom: 0;\n  }\n\n  .s27_form_footer {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      margin: 10px 0;\n  }\n  .s27_form_footer button {\n      min-width: 200px;\n  }\n  .s27_form_opt-in {\n      display: flex;\n      flex-direction: column;\n      justify-content: center;\n      align-items: center;\n\n      border: 1px solid gray;\n      padding: 10px;\n      margin: 10px 0;\n  }\n  .s27_form_cookie-consent {\n      border: 1px solid gray;\n      padding: 10px;\n      margin: 10px 0;\n  }\n\n  .s27_form_opt-in h4 {\n      margin: 0;\n  }\n\n  .resource-box-room__close {\n      top: 5px;\n      right: 5px;\n  }\n  \nbody {\n    margin: 0;\n    padding: 0;\n    font-family: 'Lato', sans-serif;\n}\n.Singlepage-ResourceCBox-Container {\n}\n.Left-sideboxR-center {\n    position: absolute;\n    z-index: 110000;\n    top: 0px;\n    left: 0px;\n    bottom: 0px;\n    display: flex;\n    flex-direction: column;\n    width: 240px;\n    border-right: 1px solid rgb(221, 221, 221);\n    background: #fff;\n}\n.header-Content-brandingbox {\n    flex-shrink: 0;\n}\n.Logo-box-r-cent {\n    display: flex;\n    margin: 0 auto;\n    padding: 20px;\n}\n.Logo-box-r-cent img {\n    width: 100%;\n    height: 100%;\n    display: flex;\n}\n.rightSide-PlayGround-box {\n    position: static;\n    width: calc(100% - 240px);\n    margin-left: 240px;\n    height: 100vh;\n    display: flex;\n}\n.Call-Meetingbox {\n    margin: 10px auto;\n    padding: 0;\n}\n.Call-Meetingbox a {\n    background: #00b050;\n    padding: 10px 25px;\n    font-size: 14px;\n    color: #fff;\n    font-weight: normal;\n    text-align: center;\n    border-radius: 20px;\n    margin: 0 auto;\n    display: table;\n    text-decoration: none;\n}\n.Actions-Iconbox-R-center {\n    display: flex;\n    margin: 0 auto;\n    text-align: center;\n    justify-content: space-evenly;\n    ;\n}\n.Actions-Iconbox-R-center a {\n    font-size: 20px;\n    color: #286efa;\n    transition: all 1s;\n}\n.Actions-Iconbox-R-center a:hover {\n    color: #606060;\n    font-size: 20px;\n    transition: all 1s;\n}\n.C-ilistbox-case {\n    overflow: hidden;\n    overflow-y: hidden;\n    overflow-y: auto;\n}\n.Title-HeadingboxR {\n    text-align: center;\n    margin: 10px auto;\n    font-size: 13px;\n    color: #565656;\n    line-height: 17px;\n    text-transform: uppercase;\n}\n.MyResource-listbox-TCont {\n    outline: none;\n    box-shadow: 0px 3px 2px #d2d2d2;\n    border-radius: 3px;\n    transition: all 1s;\n}\n.MyResource-listbox-TCont:hover .Type-TitleT::after {\n    color: #000;\n    transition: all 1s;\n}\n.MyResource-listbox-TCont:hover .Type-TitleT {\n    color: #286efa;\n    transition: all 1s;\n}\n.MyResource-listbox-TCont:hover .Box-ListC-ResourceTrk {\n    box-shadow: 0px 3px 6px #555;\n    transition: all 1s;\ncursor: pointer;\n}\n.Box-ListC-ResourceTrk {\n    width: 200px;\n    height: 280px;\n    border: 2px solid #e7e7e7;\n    position: relative;\n    margin: 0 auto 10px;\n}\n.Thumbnail-Imgblok {\n    width: 100%;\n}\n.Thumbnail-Imgblok img {\n    width: 100%;\n}\n.h3descriptionbox {\n    font-size: 27px;\n    line-height: 30px;\n    padding: 10px 0;\n    color: #555;\n    font-weight: 700;\n    width: 100%;\n    word-wrap: break-word;\n}\n.T-description {\n    position: absolute;\n    bottom: 0;\n    min-height: 70px;\n    height: 58.90052356%;\n    left: 6px;\n    right: 6px;\n    word-wrap: break-word;\n}\n.box-typeContent {\n    background: #fbfbfb;\n    width: 100%;\n    bottom: 0;\n    position: absolute;\n    display: flex;\n    flex-direction: row;\n    flex-wrap: wrap;\n    align-items: center;\n    margin: 0;\n    border-top: 1px solid #ddd;\n    left: 0;\n    right: 0;\n}\n.Icontype {\n    margin: 0 10px;\n}\n.Icontype img {\n    width: 30px;\n    margin: 5px 0;\n}\n.Type-TitleT {\n    font-size: 12px;\n    color: #565656;\n    line-height: 17px;\n}\n.Type-TitleT::after {\n    content: '\\203A';\n    position: absolute;\n    right: 15px;\n    color: #C6C6C6;\n    font-size: 30px;\n    font-weight: bold;\n}\n.nextSseion {\n    position: fixed;\n    right: 0;\n    bottom: 70px;\n    background: #0F7CC0;\n    box-shadow: 1px 1px 4px #000;\n    z-index: 100;\n    padding: 12px 10px;\n    width: 200px;\n    cursor: pointer;\ntransition: all 5s ease;\n}\n\n.Txt-ARrow {\n    font-size: 30px;\n    color: #fff;\n    text-align: left;\n    padding: 0;\n}\n.Card-NextBox-Cont {\n    position: absolute;\n    bottom: 0px;\n    right: 0px;\n    width: 240px;\n    box-shadow: -1px 2px 8px #000;\n    background: #fff;\n    padding: 15px;\n    min-height: 300px;\n    z-index: 200;\n    transition: all 0.3s ease;\n    transform: translate3d(100%,100%, 0px);\n}\n\n.nextSseion:hover .Card-NextBox-Cont {\ntransition: all 0.3s ease;\ntransform: translate3d(0px, 70px, 0px);\n}\n\n.Card-NextBox-Cont .Txt-ARrow {\n\n    color: #000;\n    padding: 10px 0;\n    font-size: 22px;\n    line-height: 25px;\n\n}\n\n.Nxt-PreviewThumbbox img{width: 100%; height: 100%;}\t\t\n.Card-NextBox-Cont .Descript-Txt {\n    font-size: 15px;\n    line-height: 20px;\n    margin: 10px 0;\n}\n\n.FootSetingbox {\n    margin: 0px auto;\n    background: #f2f2f2;\n    width: 100%;\n    box-shadow: -1px -4px 8px #cecece;\n    padding: 6px 0;\n    border-top: 1px solid #ddd;\n}\n\n.CookeeStBox a {\n\n    background: blue;\n    display: table;\n    margin: 0 auto;\n    padding: 6px 10px;\n    color: #fff;\n    text-decoration: navajowhite;\n    font-size: 13px;\n    line-height: 16px;\n\n}\n\n.Copy-termsBox {\n    font-size: 10px;\n    margin: 3px auto 0;\n    text-align: center;\n}\n  ";
	  dynamicInlineStyleLoader(inlineStyle);
	}

	var constants$2 = {
	  LEFT: 'left',
	  RIGHT: 'right',
	  YOUTUBE: 97,
	  HTML5: 101,
	  IFRAME: 102,
	  DOCUMENT: 100,
	  VIMEO: 94,
	  WEB: 95,
	  VIDEO_ICON: 'video-icon-content.png',
	  WEB_ICON: 'web-icon-content.png',
	  WORD_ICON: 'word-icon-content.png',
	  PDF_ICON: 'pdf-icon-content.png',
	  LOGO: 'C-logo.png',
	  NONE: 'none',
	  CLICK: 'click',
	  PLAYING: 'playing',
	  PAUSED: 'paused',
	  CUED: 'cued',
	  BUFFERING: 'buffering',
	  ENDED: 'ended',
	  UNSTRATED: 'unstarted',
	  SEEKED: 'seeked',
	  LOADED: 'loaded'
	};

	var log = browser('app:log');
	function init(options) {
	  var urlParams = new URLSearchParams(window.location.search);
	  var trackId = urlParams.get('trackId') || urlParams.get('trackid') || '96FFE53A07';
	  var resourceId = urlParams.get('resourceId') || urlParams.get('resourceid');

	  if (trackId && resourceId) {
	    store.selectedResourceId = resourceId;
	  } // default options


	  var defaults = {
	    sidebar: {
	      position: 'left'
	    },
	    logoUrl: window._botIcon || config.imageUrl + constants$2.LOGO,
	    roomTrackId: trackId,
	    botKey: window._botKey
	  }; // get user options

	  store.options = Object.assign({}, defaults, options); // The logger should only be disabled if we’re not in production.

	  {
	    // Enable the logger.
	    browser.enable('*');
	    log('Logging is enabled!');
	  }

	  loadScripts(); // initialize user session

	  initSession(); // get user Id

	  initUserId();
	  pubSub.subscribe(events.openDialog, function (data) {
	    store.openedDialogIds.add(data.id);
	  });
	  pubSub.subscribe(events.closeDialog, function (data) {
	    store.openedDialogIds["delete"](data.id);
	  });
	  return validateResourceRoom().then(function (resp) {
	    resp = resp || {};
	    var botUserIdResult = generateUserId(resp.BotKey || store.options.botKey);
	    store.options = Object.assign(store.options, {
	      botKey: resp.BotKey || store.options.botKey,
	      domainUrl: resp.domainUrl || store.options.domainUrl,
	      userId: resp.domainUserId || store.options.userId,
	      roomId: resp.roomId || store.options.roomId,
	      botUserId: botUserIdResult.userId
	    });

	    if (botUserIdResult.userId && !botUserIdResult.cache) {
	      return saveUser();
	    }

	    return botUserIdResult.userId;
	  }).then(function () {
	    return initFormStrategies();
	  });
	}



	var index$3 = /*#__PURE__*/Object.freeze({
		dialogs: index$1,
		dialog: dialog,
		form: form
	});

	var addMeta = /*#__PURE__*/
	asyncToGenerator(
	/*#__PURE__*/
	regenerator.mark(function _callee() {
	  var meta;
	  return regenerator.wrap(function _callee$(_context) {
	    while (1) {
	      switch (_context.prev = _context.next) {
	        case 0:
	          meta = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
	          browser.log(document.querySelector(meta));

	          if (document.querySelector(meta).length > 0) {
	            document.getElementsByTagName('head')[0].appendChild(meta);
	          }

	        case 3:
	        case "end":
	          return _context.stop();
	      }
	    }
	  }, _callee);
	}));



	var clientApi = /*#__PURE__*/Object.freeze({

	});

	var openBot = (function () {
	  var event = new CustomEvent('playResource', {
	    'detail': 'Schedule a demo'
	  });
	  document.dispatchEvent(event);
	  browser.log(event);
	});

	function renderResources(resources, resource) {
	  var html = resources.map(function (resource, index) {
	    return "\n    <li onclick=\"loadSource(".concat(resource.mediaTypeId, ", '").concat(resource.mediaUrl, "', ").concat(index, ", ").concat(resource.id, ", '").concat(resource.title, "')\">\n      <div class=\"box-r-work-elements\">\n        <div class=\"ImgBox\">\n          <div class=\"ContentType-icon\">\n            <img src='").concat(config.imageUrl + resource.icon, "' />\n          </div>\n          <img src=\"").concat(resource.thumbnail, "\" class=\"thumb\" />\n        </div>\n        <div class=\"Titlebox\">").concat(resource.title, "</div>\n      </div>\n    </li>");
	  }).join('');
	  var container = document.getElementById('resource-room-thumbs');
	  var index = resources.findIndex(function (el) {
	    return el.id === resource.id;
	  });
	  container.innerHTML = html;
	  document.getElementById('iframe-container').innerHTML = '';
	  loadSource(resource.mediaTypeId, resource.mediaUrl, index, resource.id, resource.title);
	}

	var toggleViewer = (function () {
	  var container = document.getElementById('resource-room');

	  if (container.style.display === constants.NONE) {
	    container.style.display = '';
	    store.viewerClosed = false;
	  } else if (container.style.display === '') {
	    container.style.display = constants.NONE;
	    store.viewerClosed = true;
	  }
	});

	var sourceFactory = (function (sources) {
	  sources.forEach(function (source) {
	    switch (source.mediaTypeId) {
	      case constants.YOUTUBE:
	      case constants.VIMEO:
	      case constants.HTML5:
	        source.icon = constants.VIDEO_ICON;
	        break;

	      case constants.IFRAME:
	      case constants.WEB:
	        source.icon = constants.WEB_ICON;
	        break;

	      case constants.DOCUMENT:
	        source.icon = constants.PDF_ICON;
	        break;

	      default:
	        source.icon = constants.WEB_ICON;
	        break;
	    }
	  });
	  return sources;
	});

	function previewResource(resource, resources) {
	  store.resource = resource;

	  if (resources) {
	    store.resources = sourceFactory(resources);
	  }

	  renderResources(store.resources, resource);
	  toggleViewer();
	}

	function sources() {
	  return _sources.apply(this, arguments);
	}

	function _sources() {
	  _sources = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee() {
	    var options, url, response;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            _context.prev = 0;
	            options = {
	              mode: 'cors',
	              method: 'post',
	              headers: {
	                'Accept': 'application/json',
	                'Content-Type': 'application/json',
	                'Access-Control-Allow-Headers': '*',
	                'Access-Control-Allow-Origin': '*'
	              }
	            };
	            url = config.baseUrl + store.options.roomTrackId + '/resources';
	            _context.next = 5;
	            return fetch(url, options).then(function (response) {
	              return response.json();
	            }).then(function (json) {
	              return json;
	            })["catch"](function (e) {
	              return e;
	            });

	          case 5:
	            response = _context.sent;
	            return _context.abrupt("return", response);

	          case 9:
	            _context.prev = 9;
	            _context.t0 = _context["catch"](0);
	            throw new Error(_context.t0);

	          case 12:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee, null, [[0, 9]]);
	  }));
	  return _sources.apply(this, arguments);
	}



	var index$4 = /*#__PURE__*/Object.freeze({
		addMeta: addMeta,
		analytics: analytics$1,
		clientApi: clientApi,
		identity: identity,
		init: init,
		initFormStrategies: initFormStrategies,
		loadScripts: loadScripts,
		loadSource: loadSource,
		openBot: openBot,
		previewResource: previewResource,
		renderResources: renderResources,
		session: initSession,
		sourceFactory: sourceFactory,
		sources: sources,
		store: store,
		toggleViewer: toggleViewer,
		trackTime: trackTime,
		trackVimeo: trackVimeo,
		trackYoutube: trackYoutube
	});



	var index$5 = /*#__PURE__*/Object.freeze({
		ROOM_PREVIEW_ACTIONS: ROOM_PREVIEW_ACTIONS,
		ROOM_PREVIEW_STORE: ROOM_PREVIEW_STORE,
		RoomPreviewEffects: RoomPreviewEffects,
		ROOM_PREVIEW_ELEMENT_IDS: ROOM_PREVIEW_ELEMENT_IDS,
		leftSidebarTemplate: leftSidebarTemplate,
		nextResourceTemplate: nextResourceTemplate,
		rerenderNextResourceElement: rerenderNextResourceElement,
		resourceItemTemplate: resourceItemTemplate,
		resourceListTemplate: resourceListTemplate,
		rerenderResources: rerenderResources,
		RoomPreviewController: RoomPreviewController
	});



	var index$6 = /*#__PURE__*/Object.freeze({
		roomPreview: index$5
	});



	var s27ResourceCenterWebView$1 = /*#__PURE__*/Object.freeze({
		api: index,
		constants: constants$1,
		dom: index$3,
		logic: index$4,
		pages: index$6,
		utils: index$2,
		config: config$1,
		main: main$1
	});

	function main() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  window.s27ResourceCenterWebView = s27ResourceCenterWebView$1;
	  init(options);
	  return roomPreviewTemplate();
	}

	var main$1 = /*#__PURE__*/Object.freeze({
		default: main
	});

	return main;

}());
