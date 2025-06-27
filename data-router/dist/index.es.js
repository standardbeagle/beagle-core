var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import require$$0, { createContext, useMemo, useReducer, useContext, useRef, useEffect, useCallback, forwardRef } from "react";
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production_min;
function requireReactJsxRuntime_production_min() {
  if (hasRequiredReactJsxRuntime_production_min)
    return reactJsxRuntime_production_min;
  hasRequiredReactJsxRuntime_production_min = 1;
  var f = require$$0, k2 = Symbol.for("react.element"), l2 = Symbol.for("react.fragment"), m2 = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p2 = { key: true, ref: true, __self: true, __source: true };
  function q2(c, a, g2) {
    var b2, d = {}, e = null, h2 = null;
    void 0 !== g2 && (e = "" + g2);
    void 0 !== a.key && (e = "" + a.key);
    void 0 !== a.ref && (h2 = a.ref);
    for (b2 in a)
      m2.call(a, b2) && !p2.hasOwnProperty(b2) && (d[b2] = a[b2]);
    if (c && c.defaultProps)
      for (b2 in a = c.defaultProps, a)
        void 0 === d[b2] && (d[b2] = a[b2]);
    return { $$typeof: k2, type: c, key: e, ref: h2, props: d, _owner: n.current };
  }
  reactJsxRuntime_production_min.Fragment = l2;
  reactJsxRuntime_production_min.jsx = q2;
  reactJsxRuntime_production_min.jsxs = q2;
  return reactJsxRuntime_production_min;
}
var reactJsxRuntime_development = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_development;
function requireReactJsxRuntime_development() {
  if (hasRequiredReactJsxRuntime_development)
    return reactJsxRuntime_development;
  hasRequiredReactJsxRuntime_development = 1;
  if (process.env.NODE_ENV !== "production") {
    (function() {
      var React = require$$0;
      var REACT_ELEMENT_TYPE = Symbol.for("react.element");
      var REACT_PORTAL_TYPE = Symbol.for("react.portal");
      var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
      var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
      var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
      var REACT_CONTEXT_TYPE = Symbol.for("react.context");
      var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
      var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
      var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
      var REACT_MEMO_TYPE = Symbol.for("react.memo");
      var REACT_LAZY_TYPE = Symbol.for("react.lazy");
      var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
      var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = "@@iterator";
      function getIteratorFn(maybeIterable) {
        if (maybeIterable === null || typeof maybeIterable !== "object") {
          return null;
        }
        var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
        if (typeof maybeIterator === "function") {
          return maybeIterator;
        }
        return null;
      }
      var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      function error(format) {
        {
          {
            for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }
            printWarning("error", format, args);
          }
        }
      }
      function printWarning(level, format, args) {
        {
          var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
          var stack = ReactDebugCurrentFrame2.getStackAddendum();
          if (stack !== "") {
            format += "%s";
            args = args.concat([stack]);
          }
          var argsWithFormat = args.map(function(item) {
            return String(item);
          });
          argsWithFormat.unshift("Warning: " + format);
          Function.prototype.apply.call(console[level], console, argsWithFormat);
        }
      }
      var enableScopeAPI = false;
      var enableCacheElement = false;
      var enableTransitionTracing = false;
      var enableLegacyHidden = false;
      var enableDebugTracing = false;
      var REACT_MODULE_REFERENCE;
      {
        REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
      }
      function isValidElementType(type) {
        if (typeof type === "string" || typeof type === "function") {
          return true;
        }
        if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
          return true;
        }
        if (typeof type === "object" && type !== null) {
          if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
          // types supported by any Flight configuration anywhere since
          // we don't know which Flight build this will end up being used
          // with.
          type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
            return true;
          }
        }
        return false;
      }
      function getWrappedName(outerType, innerType, wrapperName) {
        var displayName = outerType.displayName;
        if (displayName) {
          return displayName;
        }
        var functionName = innerType.displayName || innerType.name || "";
        return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
      }
      function getContextName(type) {
        return type.displayName || "Context";
      }
      function getComponentNameFromType(type) {
        if (type == null) {
          return null;
        }
        {
          if (typeof type.tag === "number") {
            error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
          }
        }
        if (typeof type === "function") {
          return type.displayName || type.name || null;
        }
        if (typeof type === "string") {
          return type;
        }
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PORTAL_TYPE:
            return "Portal";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
        }
        if (typeof type === "object") {
          switch (type.$$typeof) {
            case REACT_CONTEXT_TYPE:
              var context = type;
              return getContextName(context) + ".Consumer";
            case REACT_PROVIDER_TYPE:
              var provider = type;
              return getContextName(provider._context) + ".Provider";
            case REACT_FORWARD_REF_TYPE:
              return getWrappedName(type, type.render, "ForwardRef");
            case REACT_MEMO_TYPE:
              var outerName = type.displayName || null;
              if (outerName !== null) {
                return outerName;
              }
              return getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE: {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;
              try {
                return getComponentNameFromType(init(payload));
              } catch (x2) {
                return null;
              }
            }
          }
        }
        return null;
      }
      var assign = Object.assign;
      var disabledDepth = 0;
      var prevLog;
      var prevInfo;
      var prevWarn;
      var prevError;
      var prevGroup;
      var prevGroupCollapsed;
      var prevGroupEnd;
      function disabledLog() {
      }
      disabledLog.__reactDisabledLog = true;
      function disableLogs() {
        {
          if (disabledDepth === 0) {
            prevLog = console.log;
            prevInfo = console.info;
            prevWarn = console.warn;
            prevError = console.error;
            prevGroup = console.group;
            prevGroupCollapsed = console.groupCollapsed;
            prevGroupEnd = console.groupEnd;
            var props = {
              configurable: true,
              enumerable: true,
              value: disabledLog,
              writable: true
            };
            Object.defineProperties(console, {
              info: props,
              log: props,
              warn: props,
              error: props,
              group: props,
              groupCollapsed: props,
              groupEnd: props
            });
          }
          disabledDepth++;
        }
      }
      function reenableLogs() {
        {
          disabledDepth--;
          if (disabledDepth === 0) {
            var props = {
              configurable: true,
              enumerable: true,
              writable: true
            };
            Object.defineProperties(console, {
              log: assign({}, props, {
                value: prevLog
              }),
              info: assign({}, props, {
                value: prevInfo
              }),
              warn: assign({}, props, {
                value: prevWarn
              }),
              error: assign({}, props, {
                value: prevError
              }),
              group: assign({}, props, {
                value: prevGroup
              }),
              groupCollapsed: assign({}, props, {
                value: prevGroupCollapsed
              }),
              groupEnd: assign({}, props, {
                value: prevGroupEnd
              })
            });
          }
          if (disabledDepth < 0) {
            error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
          }
        }
      }
      var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
      var prefix;
      function describeBuiltInComponentFrame(name, source, ownerFn) {
        {
          if (prefix === void 0) {
            try {
              throw Error();
            } catch (x2) {
              var match = x2.stack.trim().match(/\n( *(at )?)/);
              prefix = match && match[1] || "";
            }
          }
          return "\n" + prefix + name;
        }
      }
      var reentry = false;
      var componentFrameCache;
      {
        var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
        componentFrameCache = new PossiblyWeakMap();
      }
      function describeNativeComponentFrame(fn2, construct) {
        if (!fn2 || reentry) {
          return "";
        }
        {
          var frame = componentFrameCache.get(fn2);
          if (frame !== void 0) {
            return frame;
          }
        }
        var control;
        reentry = true;
        var previousPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var previousDispatcher;
        {
          previousDispatcher = ReactCurrentDispatcher.current;
          ReactCurrentDispatcher.current = null;
          disableLogs();
        }
        try {
          if (construct) {
            var Fake = function() {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, "props", {
              set: function() {
                throw Error();
              }
            });
            if (typeof Reflect === "object" && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x2) {
                control = x2;
              }
              Reflect.construct(fn2, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x2) {
                control = x2;
              }
              fn2.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x2) {
              control = x2;
            }
            fn2();
          }
        } catch (sample) {
          if (sample && control && typeof sample.stack === "string") {
            var sampleLines = sample.stack.split("\n");
            var controlLines = control.stack.split("\n");
            var s = sampleLines.length - 1;
            var c = controlLines.length - 1;
            while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
              c--;
            }
            for (; s >= 1 && c >= 0; s--, c--) {
              if (sampleLines[s] !== controlLines[c]) {
                if (s !== 1 || c !== 1) {
                  do {
                    s--;
                    c--;
                    if (c < 0 || sampleLines[s] !== controlLines[c]) {
                      var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                      if (fn2.displayName && _frame.includes("<anonymous>")) {
                        _frame = _frame.replace("<anonymous>", fn2.displayName);
                      }
                      {
                        if (typeof fn2 === "function") {
                          componentFrameCache.set(fn2, _frame);
                        }
                      }
                      return _frame;
                    }
                  } while (s >= 1 && c >= 0);
                }
                break;
              }
            }
          }
        } finally {
          reentry = false;
          {
            ReactCurrentDispatcher.current = previousDispatcher;
            reenableLogs();
          }
          Error.prepareStackTrace = previousPrepareStackTrace;
        }
        var name = fn2 ? fn2.displayName || fn2.name : "";
        var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
        {
          if (typeof fn2 === "function") {
            componentFrameCache.set(fn2, syntheticFrame);
          }
        }
        return syntheticFrame;
      }
      function describeFunctionComponentFrame(fn2, source, ownerFn) {
        {
          return describeNativeComponentFrame(fn2, false);
        }
      }
      function shouldConstruct(Component) {
        var prototype = Component.prototype;
        return !!(prototype && prototype.isReactComponent);
      }
      function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
        if (type == null) {
          return "";
        }
        if (typeof type === "function") {
          {
            return describeNativeComponentFrame(type, shouldConstruct(type));
          }
        }
        if (typeof type === "string") {
          return describeBuiltInComponentFrame(type);
        }
        switch (type) {
          case REACT_SUSPENSE_TYPE:
            return describeBuiltInComponentFrame("Suspense");
          case REACT_SUSPENSE_LIST_TYPE:
            return describeBuiltInComponentFrame("SuspenseList");
        }
        if (typeof type === "object") {
          switch (type.$$typeof) {
            case REACT_FORWARD_REF_TYPE:
              return describeFunctionComponentFrame(type.render);
            case REACT_MEMO_TYPE:
              return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
            case REACT_LAZY_TYPE: {
              var lazyComponent = type;
              var payload = lazyComponent._payload;
              var init = lazyComponent._init;
              try {
                return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
              } catch (x2) {
              }
            }
          }
        }
        return "";
      }
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var loggedTypeFailures = {};
      var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
      function setCurrentlyValidatingElement(element) {
        {
          if (element) {
            var owner = element._owner;
            var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
            ReactDebugCurrentFrame.setExtraStackFrame(stack);
          } else {
            ReactDebugCurrentFrame.setExtraStackFrame(null);
          }
        }
      }
      function checkPropTypes(typeSpecs, values, location, componentName, element) {
        {
          var has = Function.call.bind(hasOwnProperty);
          for (var typeSpecName in typeSpecs) {
            if (has(typeSpecs, typeSpecName)) {
              var error$1 = void 0;
              try {
                if (typeof typeSpecs[typeSpecName] !== "function") {
                  var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  err.name = "Invariant Violation";
                  throw err;
                }
                error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (ex) {
                error$1 = ex;
              }
              if (error$1 && !(error$1 instanceof Error)) {
                setCurrentlyValidatingElement(element);
                error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                setCurrentlyValidatingElement(null);
              }
              if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                loggedTypeFailures[error$1.message] = true;
                setCurrentlyValidatingElement(element);
                error("Failed %s type: %s", location, error$1.message);
                setCurrentlyValidatingElement(null);
              }
            }
          }
        }
      }
      var isArrayImpl = Array.isArray;
      function isArray(a) {
        return isArrayImpl(a);
      }
      function typeName(value) {
        {
          var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
          var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          return type;
        }
      }
      function willCoercionThrow(value) {
        {
          try {
            testStringCoercion(value);
            return false;
          } catch (e) {
            return true;
          }
        }
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        {
          if (willCoercionThrow(value)) {
            error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
            return testStringCoercion(value);
          }
        }
      }
      var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
      var RESERVED_PROPS = {
        key: true,
        ref: true,
        __self: true,
        __source: true
      };
      var specialPropKeyWarningShown;
      var specialPropRefWarningShown;
      var didWarnAboutStringRefs;
      {
        didWarnAboutStringRefs = {};
      }
      function hasValidRef(config) {
        {
          if (hasOwnProperty.call(config, "ref")) {
            var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
            if (getter && getter.isReactWarning) {
              return false;
            }
          }
        }
        return config.ref !== void 0;
      }
      function hasValidKey(config) {
        {
          if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) {
              return false;
            }
          }
        }
        return config.key !== void 0;
      }
      function warnIfStringRefCannotBeAutoConverted(config, self) {
        {
          if (typeof config.ref === "string" && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
            var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (!didWarnAboutStringRefs[componentName]) {
              error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);
              didWarnAboutStringRefs[componentName] = true;
            }
          }
        }
      }
      function defineKeyPropWarningGetter(props, displayName) {
        {
          var warnAboutAccessingKey = function() {
            if (!specialPropKeyWarningShown) {
              specialPropKeyWarningShown = true;
              error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
      }
      function defineRefPropWarningGetter(props, displayName) {
        {
          var warnAboutAccessingRef = function() {
            if (!specialPropRefWarningShown) {
              specialPropRefWarningShown = true;
              error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
      }
      var ReactElement = function(type, key, ref, self, source, owner, props) {
        var element = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: REACT_ELEMENT_TYPE,
          // Built-in properties that belong on the element
          type,
          key,
          ref,
          props,
          // Record the component responsible for creating this element.
          _owner: owner
        };
        {
          element._store = {};
          Object.defineProperty(element._store, "validated", {
            configurable: false,
            enumerable: false,
            writable: true,
            value: false
          });
          Object.defineProperty(element, "_self", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: self
          });
          Object.defineProperty(element, "_source", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: source
          });
          if (Object.freeze) {
            Object.freeze(element.props);
            Object.freeze(element);
          }
        }
        return element;
      };
      function jsxDEV(type, config, maybeKey, source, self) {
        {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          if (maybeKey !== void 0) {
            {
              checkKeyStringCoercion(maybeKey);
            }
            key = "" + maybeKey;
          }
          if (hasValidKey(config)) {
            {
              checkKeyStringCoercion(config.key);
            }
            key = "" + config.key;
          }
          if (hasValidRef(config)) {
            ref = config.ref;
            warnIfStringRefCannotBeAutoConverted(config, self);
          }
          for (propName in config) {
            if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
              props[propName] = config[propName];
            }
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          if (key || ref) {
            var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
            if (key) {
              defineKeyPropWarningGetter(props, displayName);
            }
            if (ref) {
              defineRefPropWarningGetter(props, displayName);
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
      }
      var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
      var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
      function setCurrentlyValidatingElement$1(element) {
        {
          if (element) {
            var owner = element._owner;
            var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
            ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
          } else {
            ReactDebugCurrentFrame$1.setExtraStackFrame(null);
          }
        }
      }
      var propTypesMisspellWarningShown;
      {
        propTypesMisspellWarningShown = false;
      }
      function isValidElement(object) {
        {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
      }
      function getDeclarationErrorAddendum() {
        {
          if (ReactCurrentOwner$1.current) {
            var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
      }
      function getSourceInfoErrorAddendum(source) {
        {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
      }
      var ownerHasKeyUseWarning = {};
      function getCurrentComponentErrorInfo(parentType) {
        {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
      }
      function validateExplicitKey(element, parentType) {
        {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          setCurrentlyValidatingElement$1(element);
          error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
          setCurrentlyValidatingElement$1(null);
        }
      }
      function validateChildKeys(node, parentType) {
        {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
      }
      function validatePropTypes(element) {
        {
          var type = element.type;
          if (type === null || type === void 0 || typeof type === "string") {
            return;
          }
          var propTypes;
          if (typeof type === "function") {
            propTypes = type.propTypes;
          } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          type.$$typeof === REACT_MEMO_TYPE)) {
            propTypes = type.propTypes;
          } else {
            return;
          }
          if (propTypes) {
            var name = getComponentNameFromType(type);
            checkPropTypes(propTypes, element.props, "prop", name, element);
          } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
            propTypesMisspellWarningShown = true;
            var _name = getComponentNameFromType(type);
            error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
          }
          if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
            error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
          }
        }
      }
      function validateFragmentProps(fragment) {
        {
          var keys = Object.keys(fragment.props);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key !== "children" && key !== "key") {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
              setCurrentlyValidatingElement$1(null);
              break;
            }
          }
          if (fragment.ref !== null) {
            setCurrentlyValidatingElement$1(fragment);
            error("Invalid attribute `ref` supplied to `React.Fragment`.");
            setCurrentlyValidatingElement$1(null);
          }
        }
      }
      function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
        {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendum(source);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
          }
          var element = jsxDEV(type, props, key, source, self);
          if (element == null) {
            return element;
          }
          if (validType) {
            var children = props.children;
            if (children !== void 0) {
              if (isStaticChildren) {
                if (isArray(children)) {
                  for (var i = 0; i < children.length; i++) {
                    validateChildKeys(children[i], type);
                  }
                  if (Object.freeze) {
                    Object.freeze(children);
                  }
                } else {
                  error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
                }
              } else {
                validateChildKeys(children, type);
              }
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
      }
      function jsxWithValidationStatic(type, props, key) {
        {
          return jsxWithValidation(type, props, key, true);
        }
      }
      function jsxWithValidationDynamic(type, props, key) {
        {
          return jsxWithValidation(type, props, key, false);
        }
      }
      var jsx = jsxWithValidationDynamic;
      var jsxs = jsxWithValidationStatic;
      reactJsxRuntime_development.Fragment = REACT_FRAGMENT_TYPE;
      reactJsxRuntime_development.jsx = jsx;
      reactJsxRuntime_development.jsxs = jsxs;
    })();
  }
  return reactJsxRuntime_development;
}
if (process.env.NODE_ENV === "production") {
  jsxRuntime.exports = requireReactJsxRuntime_production_min();
} else {
  jsxRuntime.exports = requireReactJsxRuntime_development();
}
var jsxRuntimeExports = jsxRuntime.exports;
function m(n, e, ...t) {
  if (import.meta.NODE_ENV !== "production" && e === void 0)
    throw new Error("invariant requires an error message argument");
  if (!n) {
    let o;
    if (e === void 0)
      o = new Error(
        "Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings."
      );
    else {
      let s = 0;
      o = new Error(
        e.replace(/%s/g, function() {
          return t[s++];
        })
      ), o.name = "Invariant Violation";
    }
    throw o.framesToPop = 1, o;
  }
}
const l = (n) => typeof n == "function", P = (n) => n.length === 0, j = (n) => n.toString(), w = (n) => typeof n == "string", C = "/", h = "||";
const p = (n) => n, v = (n) => n === null;
function A(n, e = p, t) {
  m(
    l(e) || v(e),
    "Expected payloadCreator to be a function, undefined or null"
  );
  const o = v(e) || e === p ? p : (i, ...u) => i instanceof Error ? i : e(i, ...u), s = l(t), c = n.toString(), r = (...i) => {
    const u = o(...i), f = { type: n };
    return u instanceof Error && (f.error = true), u !== void 0 && (f.payload = u), s && (f.meta = t(...i)), f;
  };
  return r.toString = () => c, r;
}
const g = (n) => {
  if (typeof n != "object" || n === null)
    return false;
  let e = n;
  for (; Object.getPrototypeOf(e) !== null; )
    e = Object.getPrototypeOf(e);
  return Object.getPrototypeOf(n) === e;
}, x = (n) => Array.isArray(n), T = (n) => n == null, Z = (n) => n[n.length - 1], K = /\s/, _ = /([-.:_])/, q = /([a-z][A-Z]|[A-Z][a-z])/, O = "/", G = /[\W_]+(.|$)/g, Y = (n) => n.replace(G, (e, t) => t ? " " + t : ""), B = /(.)([A-Z]+)/g, H = (n) => n.replace(
  B,
  (e, t, o) => t + " " + o.toLowerCase().split("").join(" ")
), J = (n) => K.test(n) ? n.toLowerCase() : _.test(n) ? (Y(n) || n).toLowerCase() : q.test(n) ? H(n).toLowerCase() : n.toLowerCase(), Q = (n) => J(n).replace(/[\W_]+(.|$)/g, (e, t) => t ? " " + t : "").trim(), I = (n) => Q(n).replace(
  /\s(\w)/g,
  (e, t) => t.toUpperCase()
), R = (n) => n.includes(O) ? n.split(O).map(I).join(O) : I(n), S = (n, e) => n.reduce(
  (t, o) => e(t, o),
  {}
), b = (n) => typeof Map < "u" && n instanceof Map;
function $(n) {
  if (b(n))
    return Array.from(n.keys());
  if (typeof Reflect < "u" && typeof Reflect.ownKeys == "function")
    return Reflect.ownKeys(n);
  let e = Object.getOwnPropertyNames(n);
  return typeof Object.getOwnPropertySymbols == "function" && (e = e.concat(Object.getOwnPropertySymbols(n))), e;
}
function L(n, e) {
  return b(e) ? e.get(n) : e[n];
}
const M = (n) => function e(t, { namespace: o = C, prefix: s } = {}, c = {}, r = "") {
  function i(f) {
    if (!r)
      return f;
    const d = f.toString().split(h), a = r.split(h);
    return [].concat(
      ...a.map((E) => d.map((y) => `${E}${o}${y}`))
    ).join(h);
  }
  function u(f) {
    return r || !s || s && new RegExp(`^${s}${o}`).test(f) ? f : `${s}${o}${f}`;
  }
  return $(t).forEach((f) => {
    const d = u(i(f)), a = L(f, t);
    n(a) ? e(a, { namespace: o, prefix: s }, c, d) : c[d] = a;
  }), c;
}, X = M(g);
function k(n, { namespace: e = C, prefix: t } = {}) {
  function o(c, r, i) {
    const u = R(i.shift());
    P(i) ? r[u] = n[c] : (r[u] || (r[u] = {}), o(
      c,
      r[u],
      i
    ));
  }
  const s = {};
  return Object.getOwnPropertyNames(n).forEach((c) => {
    const r = t ? c.replace(`${t}${e}`, "") : c;
    return o(
      c,
      s,
      r.split(e)
    );
  }), s;
}
function fn(n, ...e) {
  const t = g(Z(e)) ? e.pop() : {};
  return m(
    e.every(w) && (w(n) || g(n)),
    "Expected optional object followed by string action types"
  ), w(n) ? N(
    [n, ...e],
    t
  ) : {
    ...F(n, t),
    ...N(e, t)
  };
}
function F(n, e) {
  const t = X(n, e), o = U(t);
  return k(o, e);
}
function U(n, { prefix: e, namespace: t = C } = {}) {
  function o(s) {
    if (l(s) || T(s))
      return true;
    if (x(s)) {
      const [c = p, r] = s;
      return l(c) && l(r);
    }
    return false;
  }
  return S(
    Object.keys(n),
    (s, c) => {
      const r = n[c];
      m(
        o(r),
        `Expected function, undefined, null, or array with payload and meta functions for ${c}`
      );
      const i = e ? `${e}${t}${c}` : c, u = x(r) ? A(i, ...r) : A(i, r);
      return { ...s, [c]: u };
    }
  );
}
function N(n, e) {
  const t = S(
    n,
    (s, c) => ({ ...s, [c]: p })
  ), o = U(t, e);
  return S(
    Object.keys(o),
    (s, c) => ({
      ...s,
      [R(c)]: o[c]
    })
  );
}
const tn = (n) => n === void 0;
function on(n, e = p, t) {
  const o = j(n).split(h);
  m(
    !tn(t),
    `defaultState for reducer handling ${o.join(", ")} should be defined`
  ), m(
    l(e) || g(e),
    "Expected reducer to be a function or object with next and throw reducers"
  );
  const [s, c] = l(e) ? [e, e] : [e.next, e.throw].map(
    (r) => T(r) ? p : r
  );
  return (r = t, i) => {
    const { type: u } = i;
    return !u || !o.includes(j(u)) ? r : (i.error === true ? c : s)(r, i);
  };
}
const rn = function() {
  for (var n = arguments.length, e = Array(n), t = 0; t < n; t++)
    e[t] = arguments[t];
  var o = typeof e[0] != "function" && e.shift(), s = e;
  if (typeof o > "u")
    throw new TypeError("The initial state may not be undefined. If you do not want to set a value for this reducer, you can use null instead of undefined.");
  return function(c, r) {
    for (var i = arguments.length, u = Array(i > 2 ? i - 2 : 0), f = 2; f < i; f++)
      u[f - 2] = arguments[f];
    var d = typeof c > "u", a = typeof r > "u";
    return d && a && o ? o : s.reduce(function(E, y, V) {
      if (typeof y > "u")
        throw new TypeError("An undefined reducer was passed in at index " + V);
      return y.apply(void 0, [E, r].concat(u));
    }, d && !a && o ? o : c);
  };
};
function cn(n) {
  const e = $(n), t = e.every(
    (o) => o === "next" || o === "throw"
  );
  return e.length > 0 && e.length <= 2 && t;
}
const sn = M(
  (n) => (g(n) || b(n)) && !cn(n)
);
function ln(n, e, t = {}) {
  m(
    g(n) || b(n),
    "Expected handlers to be a plain object."
  );
  const o = sn(n, t), s = $(o).map(
    (r) => on(r, L(r, o), e)
  ), c = rn(e, ...s);
  return (r = e, i) => c(r, i);
}
function parseXPath(xpath) {
  if (!xpath || xpath === "/") {
    return [];
  }
  const path = xpath.startsWith("/") ? xpath.slice(1) : xpath;
  const segments = path.split("/").filter((segment) => segment.length > 0);
  return segments.map((segment) => {
    const arrayMatch = segment.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      return {
        property: arrayMatch[1],
        index: parseInt(arrayMatch[2], 10),
        isArray: true
      };
    }
    return { property: segment };
  });
}
function combineXPaths(base, relative) {
  if (relative.startsWith("/")) {
    return relative;
  }
  if (relative === "..") {
    const segments = parseXPath(base);
    if (segments.length === 0)
      return "/";
    const result2 = segments.slice(0, -1).map(formatSegment).join("/");
    return result2 === "" ? "/" : "/" + result2;
  }
  if (relative.startsWith("../")) {
    const upLevels = (relative.match(/\.\.\//g) || []).length;
    const remainingPath = relative.replace(/^(\.\.\/)+/, "");
    const baseSegments2 = parseXPath(base);
    const newBaseSegments = baseSegments2.slice(0, Math.max(0, baseSegments2.length - upLevels));
    if (remainingPath) {
      const newSegments = parseXPath(remainingPath);
      const result3 = [...newBaseSegments, ...newSegments].map(formatSegment).join("/");
      return result3 === "" ? "/" : "/" + result3;
    }
    const result2 = newBaseSegments.map(formatSegment).join("/");
    return result2 === "" ? "/" : "/" + result2;
  }
  const baseSegments = parseXPath(base);
  const relativeSegments = parseXPath(relative);
  const result = [...baseSegments, ...relativeSegments].map(formatSegment).join("/");
  return result === "" ? "/" : "/" + result;
}
function formatSegment(segment) {
  if (segment.isArray && segment.index !== void 0) {
    return `${segment.property}[${segment.index}]`;
  }
  return segment.property;
}
function getDataAtXPath(data, xpath) {
  if (!xpath || xpath === "/") {
    return data;
  }
  const segments = parseXPath(xpath);
  let current = data;
  for (const segment of segments) {
    if (current === null || current === void 0) {
      return void 0;
    }
    if (segment.isArray && segment.index !== void 0) {
      const array = current[segment.property];
      if (!Array.isArray(array) || segment.index >= array.length) {
        return void 0;
      }
      current = array[segment.index];
    } else {
      current = current[segment.property];
    }
  }
  return current;
}
function setDataAtXPath(data, xpath, value, operation = "replace") {
  if (!xpath || xpath === "/") {
    if (operation === "merge" && typeof data === "object" && typeof value === "object") {
      return { ...data, ...value };
    }
    return operation === "delete" ? {} : value;
  }
  const segments = parseXPath(xpath);
  const result = { ...data };
  let current = result;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (segment.isArray && segment.index !== void 0) {
      if (!current[segment.property] || !Array.isArray(current[segment.property])) {
        current[segment.property] = [];
      }
      current[segment.property] = [...current[segment.property]];
      while (current[segment.property].length <= segment.index) {
        current[segment.property].push({});
      }
      current = current[segment.property][segment.index];
    } else {
      if (!current[segment.property]) {
        current[segment.property] = {};
      } else {
        current[segment.property] = { ...current[segment.property] };
      }
      current = current[segment.property];
    }
  }
  const lastSegment = segments[segments.length - 1];
  if (lastSegment.isArray && lastSegment.index !== void 0) {
    if (!current[lastSegment.property] || !Array.isArray(current[lastSegment.property])) {
      current[lastSegment.property] = [];
    }
    current[lastSegment.property] = [...current[lastSegment.property]];
    if (operation === "delete") {
      current[lastSegment.property].splice(lastSegment.index, 1);
    } else if (operation === "append") {
      current[lastSegment.property].push(value);
    } else {
      while (current[lastSegment.property].length <= lastSegment.index) {
        current[lastSegment.property].push({});
      }
      if (operation === "merge" && typeof current[lastSegment.property][lastSegment.index] === "object" && typeof value === "object") {
        current[lastSegment.property][lastSegment.index] = {
          ...current[lastSegment.property][lastSegment.index],
          ...value
        };
      } else {
        current[lastSegment.property][lastSegment.index] = value;
      }
    }
  } else {
    if (operation === "delete") {
      delete current[lastSegment.property];
    } else if (operation === "append") {
      if (!current[lastSegment.property] || !Array.isArray(current[lastSegment.property])) {
        current[lastSegment.property] = [];
      } else {
        current[lastSegment.property] = [...current[lastSegment.property]];
      }
      current[lastSegment.property].push(value);
    } else if (operation === "merge" && typeof current[lastSegment.property] === "object" && typeof value === "object") {
      current[lastSegment.property] = { ...current[lastSegment.property], ...value };
    } else {
      current[lastSegment.property] = value;
    }
  }
  return result;
}
function extractXPathParams(pattern, actual) {
  const patternSegments = parseXPath(pattern);
  const actualSegments = parseXPath(actual);
  const params = {};
  if (patternSegments.length !== actualSegments.length) {
    return params;
  }
  for (let i = 0; i < patternSegments.length; i++) {
    const patternSeg = patternSegments[i];
    const actualSeg = actualSegments[i];
    if (patternSeg.property.startsWith(":")) {
      const paramName = patternSeg.property.slice(1);
      params[paramName] = actualSeg.property;
    } else if (patternSeg.property !== actualSeg.property) {
      return {};
    }
    if (patternSeg.isArray && actualSeg.isArray) {
      if (patternSeg.index !== void 0 && actualSeg.index !== void 0) {
        if (patternSeg.index !== actualSeg.index) {
          return {};
        }
      }
    } else if (patternSeg.isArray !== actualSeg.isArray) {
      return {};
    }
  }
  return params;
}
const defaultState = {
  data: {},
  xpath: "/",
  history: [],
  location: 0,
  asyncStates: {},
  pendingOperations: /* @__PURE__ */ new Set(),
  commandQueue: {
    pending: [],
    executing: /* @__PURE__ */ new Map(),
    maxConcurrent: 3
  },
  optimisticUpdates: {}
};
const reducer = ln({
  NAVIGATE: (state, action) => {
    let { history, location } = state;
    if (location > 0) {
      history = history.slice(0, history.length - location);
    }
    const newXPath = combineXPaths(state.xpath, action.payload);
    if (newXPath === state.xpath) {
      return state;
    }
    return {
      ...state,
      xpath: newXPath,
      history: [state.xpath, ...history],
      location: 0
    };
  },
  BACK: (state, action) => {
    const steps = Math.max(1, action.payload);
    const targetLocation = state.location + steps;
    if (targetLocation > state.history.length) {
      return state;
    }
    const historyIndex = targetLocation - 1;
    const newXPath = state.history[historyIndex];
    if (!newXPath) {
      return state;
    }
    return {
      ...state,
      xpath: newXPath,
      location: targetLocation
    };
  },
  FORWARD: (state, action) => {
    const steps = Math.max(1, action.payload);
    const targetLocation = state.location - steps;
    if (targetLocation < 0) {
      return state;
    }
    if (targetLocation === 0) {
      return state;
    }
    const historyIndex = targetLocation - 1;
    const newXPath = state.history[historyIndex];
    if (!newXPath) {
      return state;
    }
    return {
      ...state,
      xpath: newXPath,
      location: targetLocation
    };
  },
  DATA_OPERATION: (state, action) => {
    const { xpath, operation, data } = action.payload;
    const absoluteXPath = combineXPaths(state.xpath, xpath);
    const newData = setDataAtXPath(state.data, absoluteXPath, data, operation);
    return {
      ...state,
      data: newData
    };
  },
  ASYNC_START: (state, action) => {
    const { xpath, requestId, optimisticData } = action.payload;
    const absoluteXPath = combineXPaths(state.xpath, xpath);
    let newData = state.data;
    let newOptimisticUpdates = state.optimisticUpdates;
    if (optimisticData !== void 0) {
      const optimisticId = `${requestId}_${absoluteXPath}`;
      newOptimisticUpdates = {
        ...state.optimisticUpdates,
        [optimisticId]: {
          id: optimisticId,
          xpath: absoluteXPath,
          originalData: state.data,
          optimisticData,
          rollbackOnError: true
        }
      };
      newData = setDataAtXPath(state.data, absoluteXPath, optimisticData, "replace");
    }
    return {
      ...state,
      data: newData,
      asyncStates: {
        ...state.asyncStates,
        [absoluteXPath]: {
          status: "loading",
          timestamp: Date.now(),
          requestId
        }
      },
      pendingOperations: /* @__PURE__ */ new Set([...state.pendingOperations, requestId]),
      optimisticUpdates: newOptimisticUpdates
    };
  },
  ASYNC_SUCCESS: (state, action) => {
    const { xpath, requestId, data, timestamp } = action.payload;
    const absoluteXPath = combineXPaths(state.xpath, xpath);
    const newData = setDataAtXPath(state.data, absoluteXPath, data, "replace");
    const newPendingOperations = new Set(state.pendingOperations);
    newPendingOperations.delete(requestId);
    const optimisticId = `${requestId}_${absoluteXPath}`;
    const newOptimisticUpdates = { ...state.optimisticUpdates };
    delete newOptimisticUpdates[optimisticId];
    return {
      ...state,
      data: newData,
      asyncStates: {
        ...state.asyncStates,
        [absoluteXPath]: {
          status: "success",
          timestamp,
          requestId
        }
      },
      pendingOperations: newPendingOperations,
      optimisticUpdates: newOptimisticUpdates
    };
  },
  ASYNC_ERROR: (state, action) => {
    const { xpath, requestId, error, shouldRollback } = action.payload;
    const absoluteXPath = combineXPaths(state.xpath, xpath);
    const optimisticId = `${requestId}_${absoluteXPath}`;
    const optimisticUpdate = state.optimisticUpdates[optimisticId];
    let newData = state.data;
    const newOptimisticUpdates = { ...state.optimisticUpdates };
    if (shouldRollback && optimisticUpdate) {
      newData = optimisticUpdate.originalData;
      delete newOptimisticUpdates[optimisticId];
    }
    const newPendingOperations = new Set(state.pendingOperations);
    newPendingOperations.delete(requestId);
    return {
      ...state,
      data: newData,
      asyncStates: {
        ...state.asyncStates,
        [absoluteXPath]: {
          status: "error",
          error,
          timestamp: Date.now(),
          requestId
        }
      },
      pendingOperations: newPendingOperations,
      optimisticUpdates: newOptimisticUpdates
    };
  },
  ASYNC_CANCEL: (state, action) => {
    const { xpath, requestId } = action.payload;
    const absoluteXPath = combineXPaths(state.xpath, xpath);
    const optimisticId = `${requestId}_${absoluteXPath}`;
    const optimisticUpdate = state.optimisticUpdates[optimisticId];
    let newData = state.data;
    const newOptimisticUpdates = { ...state.optimisticUpdates };
    if (optimisticUpdate) {
      newData = optimisticUpdate.originalData;
      delete newOptimisticUpdates[optimisticId];
    }
    const newPendingOperations = new Set(state.pendingOperations);
    newPendingOperations.delete(requestId);
    return {
      ...state,
      data: newData,
      asyncStates: {
        ...state.asyncStates,
        [absoluteXPath]: {
          status: "idle",
          timestamp: Date.now(),
          requestId
        }
      },
      pendingOperations: newPendingOperations,
      optimisticUpdates: newOptimisticUpdates
    };
  },
  COMMAND_QUEUE_UPDATE: (state, action) => {
    const { operation, command, commandId } = action.payload;
    switch (operation) {
      case "add":
        if (!command)
          return state;
        return {
          ...state,
          commandQueue: {
            ...state.commandQueue,
            pending: [...state.commandQueue.pending, command]
          }
        };
      case "execute":
        if (!command)
          return state;
        const newExecuting = new Map(state.commandQueue.executing);
        newExecuting.set(command.id, command);
        return {
          ...state,
          commandQueue: {
            ...state.commandQueue,
            pending: state.commandQueue.pending.filter((c) => c.id !== command.id),
            executing: newExecuting
          }
        };
      case "remove":
        if (!commandId)
          return state;
        const updatedExecuting = new Map(state.commandQueue.executing);
        updatedExecuting.delete(commandId);
        return {
          ...state,
          commandQueue: {
            ...state.commandQueue,
            executing: updatedExecuting
          }
        };
      default:
        return state;
    }
  }
}, defaultState);
const DataContext = createContext(defaultState);
const DataDispatchContext = createContext(null);
const DataRouteContext = createContext({
  xpath: "/",
  data: {},
  targetData: {},
  params: {}
});
function DataProvider({ initialData = {}, initialXPath = "/", children }) {
  const initialState = useMemo(() => ({
    data: initialData,
    xpath: initialXPath,
    history: [],
    location: 0,
    asyncStates: {},
    pendingOperations: /* @__PURE__ */ new Set(),
    commandQueue: {
      pending: [],
      executing: /* @__PURE__ */ new Map(),
      maxConcurrent: 3
    },
    optimisticUpdates: {}
  }), [initialData, initialXPath]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const dataContextValue = useMemo(() => state, [
    state.data,
    state.xpath,
    state.history,
    state.location,
    state.asyncStates,
    state.pendingOperations,
    state.commandQueue,
    state.optimisticUpdates
  ]);
  const dispatchContextValue = useMemo(() => dispatch, [dispatch]);
  const routeContextValue = useMemo(() => {
    const targetData = getDataAtXPath(state.data, state.xpath);
    const params = extractXPathParams("*", state.xpath);
    return {
      xpath: state.xpath,
      data: state.data,
      targetData,
      params
    };
  }, [state.data, state.xpath]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DataContext.Provider, { value: dataContextValue, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DataDispatchContext.Provider, { value: dispatchContextValue, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DataRouteContext.Provider, { value: routeContextValue, children }) }) });
}
const {
  navigate,
  back,
  forward,
  dataOperation,
  asyncStart,
  asyncSuccess,
  asyncError,
  asyncCancel,
  commandQueueUpdate
} = fn({
  NAVIGATE: (xpath) => xpath,
  BACK: (count = 1) => Math.max(1, count),
  FORWARD: (count = 1) => Math.max(1, count),
  DATA_OPERATION: (xpath, operation, data) => ({ xpath, operation, data }),
  ASYNC_START: (xpath, requestId, operation, priority = "normal", optimisticData) => ({ xpath, requestId, operation, priority, optimisticData }),
  ASYNC_SUCCESS: (xpath, requestId, data, timestamp = Date.now()) => ({ xpath, requestId, data, timestamp }),
  ASYNC_ERROR: (xpath, requestId, error, shouldRollback = true) => ({ xpath, requestId, error, shouldRollback }),
  ASYNC_CANCEL: (xpath, requestId) => ({ xpath, requestId }),
  COMMAND_QUEUE_UPDATE: (operation, command, commandId) => ({ operation, command, commandId })
});
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
function useNavigate() {
  const dispatch = useContext(DataDispatchContext);
  if (!dispatch) {
    throw new Error("useNavigate must be used within a DataProvider");
  }
  return (xpath) => dispatch(navigate(xpath));
}
function useNavigation() {
  const dispatch = useContext(DataDispatchContext);
  const dataState = useContext(DataContext);
  if (!dispatch || !dataState) {
    throw new Error("useNavigation must be used within a DataProvider");
  }
  return {
    navigate: (xpath) => dispatch(navigate(xpath)),
    back: (count = 1) => dispatch(back(count)),
    forward: (count = 1) => dispatch(forward(count)),
    hasBack: dataState.location < dataState.history.length,
    hasForward: dataState.location > 0,
    xpath: dataState.xpath,
    history: dataState.history,
    location: dataState.location
  };
}
function useHistory() {
  const dataState = useContext(DataContext);
  if (!dataState) {
    throw new Error("useHistory must be used within a DataProvider");
  }
  return dataState.history;
}
function useXPath() {
  const dataState = useContext(DataContext);
  if (!dataState) {
    throw new Error("useXPath must be used within a DataProvider");
  }
  return dataState.xpath;
}
function useData() {
  const dataState = useContext(DataContext);
  if (!dataState) {
    throw new Error("useData must be used within a DataProvider");
  }
  return dataState.data;
}
function useTargetData() {
  const routeContext = useContext(DataRouteContext);
  if (!routeContext) {
    throw new Error("useTargetData must be used within a DataProvider");
  }
  return routeContext.targetData;
}
function useDataAtXPath(xpath) {
  const dataState = useContext(DataContext);
  if (!dataState) {
    throw new Error("useDataAtXPath must be used within a DataProvider");
  }
  return getDataAtXPath(dataState.data, xpath);
}
function useDataManipulation() {
  const dispatch = useContext(DataDispatchContext);
  if (!dispatch) {
    throw new Error("useDataManipulation must be used within a DataProvider");
  }
  return {
    setData: (xpath, data, operation = "replace") => {
      dispatch(dataOperation(xpath, operation, data));
    },
    mergeData: (xpath, data) => {
      dispatch(dataOperation(xpath, "merge", data));
    },
    replaceData: (xpath, data) => {
      dispatch(dataOperation(xpath, "replace", data));
    },
    appendData: (xpath, data) => {
      dispatch(dataOperation(xpath, "append", data));
    },
    deleteData: (xpath) => {
      dispatch(dataOperation(xpath, "delete", null));
    }
  };
}
class CommandQueueManager {
  constructor(dispatch, maxConcurrent = 3) {
    __publicField(this, "queue", {
      pending: [],
      executing: /* @__PURE__ */ new Map(),
      maxConcurrent: 3
    });
    __publicField(this, "dispatch");
    this.dispatch = dispatch;
    this.queue = { ...this.queue, maxConcurrent };
  }
  createCommand(xpath, operation, promise, priority = "normal") {
    const abortController = new AbortController();
    const commandId = generateRequestId();
    const wrappedPromise = promise.then(
      (result) => {
        this.removeFromExecuting(commandId);
        return result;
      },
      (error) => {
        this.removeFromExecuting(commandId);
        throw error;
      }
    );
    return {
      id: commandId,
      xpath,
      operation,
      abortController,
      promise: wrappedPromise,
      timestamp: Date.now(),
      priority
    };
  }
  enqueue(command) {
    this.dispatch({
      type: "COMMAND_QUEUE_UPDATE",
      payload: { operation: "add", command }
    });
    this.processQueue();
  }
  cancel(commandId) {
    const executingCommand = this.queue.executing.get(commandId);
    if (executingCommand) {
      executingCommand.abortController.abort();
      this.removeFromExecuting(commandId);
    }
    this.queue = {
      ...this.queue,
      pending: this.queue.pending.filter((cmd) => cmd.id !== commandId)
    };
  }
  cancelByXPath(xpath) {
    this.queue.executing.forEach((command, id) => {
      if (command.xpath === xpath) {
        command.abortController.abort();
        this.removeFromExecuting(id);
      }
    });
    this.queue = {
      ...this.queue,
      pending: this.queue.pending.filter((cmd) => cmd.xpath !== xpath)
    };
  }
  processQueue() {
    while (this.queue.executing.size < this.queue.maxConcurrent && this.queue.pending.length > 0) {
      const sortedPending = [...this.queue.pending].sort((a, b2) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b2.priority] - priorityOrder[a.priority] || a.timestamp - b2.timestamp;
      });
      const command = sortedPending[0];
      if (command) {
        this.executeCommand(command);
      } else {
        break;
      }
    }
  }
  executeCommand(command) {
    this.dispatch({
      type: "COMMAND_QUEUE_UPDATE",
      payload: { operation: "execute", command }
    });
    command.promise.then((result) => {
      this.dispatch({
        type: "ASYNC_SUCCESS",
        payload: {
          xpath: command.xpath,
          requestId: command.id,
          data: result,
          timestamp: Date.now()
        }
      });
    }).catch((error) => {
      if (error.name !== "AbortError") {
        this.dispatch({
          type: "ASYNC_ERROR",
          payload: {
            xpath: command.xpath,
            requestId: command.id,
            error,
            shouldRollback: true
          }
        });
      }
    });
  }
  removeFromExecuting(commandId) {
    this.dispatch({
      type: "COMMAND_QUEUE_UPDATE",
      payload: { operation: "remove", commandId }
    });
    setTimeout(() => this.processQueue(), 0);
  }
  updateQueue(newQueue) {
    this.queue = newQueue;
  }
  hasPendingOperations(xpath) {
    if (!xpath) {
      return this.queue.pending.length > 0 || this.queue.executing.size > 0;
    }
    return this.queue.pending.some((cmd) => cmd.xpath === xpath) || Array.from(this.queue.executing.values()).some((cmd) => cmd.xpath === xpath);
  }
  getQueuedOperations(xpath) {
    const allCommands = [
      ...this.queue.pending,
      ...Array.from(this.queue.executing.values())
    ];
    return xpath ? allCommands.filter((cmd) => cmd.xpath === xpath) : allCommands;
  }
}
function useAsyncData(xpath, fetcher, config = {}) {
  const dataState = useContext(DataContext);
  const dispatch = useContext(DataDispatchContext);
  if (!dataState || !dispatch) {
    throw new Error("useAsyncData must be used within a DataProvider");
  }
  const {
    enabled = true,
    staleTime = 0,
    cacheTime = 5 * 60 * 1e3,
    // 5 minutes
    refetchOnWindowFocus = false,
    refetchOnReconnect = false,
    retryCount = 3,
    retryDelay = 1e3,
    onSuccess,
    onError
  } = config;
  const absoluteXPath = combineXPaths(dataState.xpath, xpath);
  const asyncState = dataState.asyncStates[absoluteXPath];
  const currentData = getDataAtXPath(dataState.data, absoluteXPath);
  const commandQueueRef = useRef();
  const retryCountRef = useRef(0);
  const currentRequestIdRef = useRef();
  if (!commandQueueRef.current) {
    commandQueueRef.current = new CommandQueueManager(dispatch);
  }
  useEffect(() => {
    if (commandQueueRef.current) {
      commandQueueRef.current.updateQueue(dataState.commandQueue);
    }
  }, [dataState.commandQueue]);
  const executeRequest = useCallback(async (requestId) => {
    try {
      dispatch(asyncStart(absoluteXPath, requestId, "fetch"));
      const result = await fetcher();
      dispatch(asyncSuccess(absoluteXPath, requestId, result));
      retryCountRef.current = 0;
      onSuccess == null ? void 0 : onSuccess(result);
      return result;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return executeRequest(requestId);
      }
      dispatch(asyncError(absoluteXPath, requestId, errorInstance, false));
      onError == null ? void 0 : onError(errorInstance);
      throw errorInstance;
    }
  }, [absoluteXPath, fetcher, dispatch, retryCount, retryDelay, onSuccess, onError]);
  const refetch = useCallback(async () => {
    const requestId = generateRequestId();
    currentRequestIdRef.current = requestId;
    if (commandQueueRef.current) {
      const command = commandQueueRef.current.createCommand(
        absoluteXPath,
        "fetch",
        executeRequest(requestId),
        "normal"
      );
      commandQueueRef.current.enqueue(command);
      return command.promise;
    }
    return executeRequest(requestId);
  }, [absoluteXPath, executeRequest]);
  const cancel = useCallback(() => {
    if (currentRequestIdRef.current && commandQueueRef.current) {
      commandQueueRef.current.cancel(currentRequestIdRef.current);
    }
  }, []);
  const invalidate = useCallback(() => {
    if (commandQueueRef.current) {
      commandQueueRef.current.cancelByXPath(absoluteXPath);
    }
    if (asyncState) {
      dispatch({
        type: "ASYNC_CANCEL",
        payload: {
          xpath: absoluteXPath,
          requestId: asyncState.requestId || generateRequestId()
        }
      });
    }
  }, [absoluteXPath, asyncState, dispatch]);
  const isStale = useCallback(() => {
    if (!(asyncState == null ? void 0 : asyncState.timestamp))
      return true;
    return Date.now() - asyncState.timestamp > staleTime;
  }, [asyncState == null ? void 0 : asyncState.timestamp, staleTime]);
  useEffect(() => {
    if (enabled && (!asyncState || asyncState.status === "idle" || isStale())) {
      refetch().catch(() => {
      });
    }
  }, [enabled, absoluteXPath, asyncState == null ? void 0 : asyncState.status, refetch, isStale]);
  useEffect(() => {
    if (!refetchOnWindowFocus)
      return;
    const handleFocus = () => {
      if (enabled && isStale()) {
        refetch().catch(() => {
        });
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [enabled, refetchOnWindowFocus, refetch, isStale]);
  useEffect(() => {
    if (!refetchOnReconnect)
      return;
    const handleOnline = () => {
      if (enabled && isStale()) {
        refetch().catch(() => {
        });
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [enabled, refetchOnReconnect, refetch, isStale]);
  useEffect(() => {
    return () => {
      if (cacheTime === 0) {
        invalidate();
      }
    };
  }, [cacheTime, invalidate]);
  const status = (asyncState == null ? void 0 : asyncState.status) || "idle";
  return {
    data: currentData,
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    isIdle: status === "idle",
    error: asyncState == null ? void 0 : asyncState.error,
    refetch,
    cancel,
    invalidate
  };
}
function useAsyncMutation(xpath, mutationFn, config = {}) {
  const dataState = useContext(DataContext);
  const dispatch = useContext(DataDispatchContext);
  if (!dataState || !dispatch) {
    throw new Error("useAsyncMutation must be used within a DataProvider");
  }
  const {
    optimisticUpdate,
    rollbackOnError = true,
    invalidate = [],
    retryCount = 0,
    // Mutations typically don't retry by default
    retryDelay = 1e3,
    onSuccess,
    onError,
    onSettled
  } = config;
  const absoluteXPath = combineXPaths(dataState.xpath, xpath);
  const asyncState = dataState.asyncStates[absoluteXPath];
  const currentData = getDataAtXPath(dataState.data, absoluteXPath);
  const commandQueueRef = useRef();
  const retryCountRef = useRef(0);
  const lastVariablesRef = useRef();
  if (!commandQueueRef.current) {
    commandQueueRef.current = new CommandQueueManager(dispatch);
    commandQueueRef.current.updateQueue(dataState.commandQueue);
  }
  const executeMutation = useCallback(async (variables, requestId) => {
    try {
      let optimisticData;
      if (optimisticUpdate && currentData !== void 0) {
        optimisticData = optimisticUpdate(currentData, variables);
      }
      dispatch(asyncStart(
        absoluteXPath,
        requestId,
        "mutate",
        "high",
        // Mutations get high priority
        optimisticData
      ));
      const result = await mutationFn(variables);
      dispatch(asyncSuccess(absoluteXPath, requestId, result));
      if (invalidate.length > 0 && commandQueueRef.current) {
        invalidate.forEach((path) => {
          const invalidatePath = combineXPaths(dataState.xpath, path);
          commandQueueRef.current.cancelByXPath(invalidatePath);
          dispatch({
            type: "ASYNC_CANCEL",
            payload: {
              xpath: invalidatePath,
              requestId: generateRequestId()
            }
          });
        });
      }
      retryCountRef.current = 0;
      onSuccess == null ? void 0 : onSuccess(result, variables);
      onSettled == null ? void 0 : onSettled(result, void 0, variables);
      return result;
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return executeMutation(variables, requestId);
      }
      dispatch(asyncError(absoluteXPath, requestId, errorInstance, rollbackOnError));
      onError == null ? void 0 : onError(errorInstance, variables);
      onSettled == null ? void 0 : onSettled(void 0, errorInstance, variables);
      throw errorInstance;
    }
  }, [
    absoluteXPath,
    mutationFn,
    optimisticUpdate,
    currentData,
    dispatch,
    invalidate,
    dataState.xpath,
    retryCount,
    retryDelay,
    rollbackOnError,
    onSuccess,
    onError,
    onSettled
  ]);
  const mutateAsync = useCallback(async (variables) => {
    const requestId = generateRequestId();
    lastVariablesRef.current = variables;
    if (commandQueueRef.current) {
      const command = commandQueueRef.current.createCommand(
        absoluteXPath,
        "mutate",
        executeMutation(variables, requestId),
        "high"
      );
      commandQueueRef.current.enqueue(command);
      return command.promise;
    }
    return executeMutation(variables, requestId);
  }, [absoluteXPath, executeMutation]);
  const mutate = useCallback((variables) => {
    return mutateAsync(variables).catch((error) => {
      console.error("Mutation failed:", error);
      throw error;
    });
  }, [mutateAsync]);
  const reset = useCallback(() => {
    if ((asyncState == null ? void 0 : asyncState.requestId) && commandQueueRef.current) {
      commandQueueRef.current.cancel(asyncState.requestId);
    }
    dispatch({
      type: "ASYNC_CANCEL",
      payload: {
        xpath: absoluteXPath,
        requestId: (asyncState == null ? void 0 : asyncState.requestId) || generateRequestId()
      }
    });
    retryCountRef.current = 0;
  }, [absoluteXPath, asyncState == null ? void 0 : asyncState.requestId, dispatch]);
  const status = (asyncState == null ? void 0 : asyncState.status) || "idle";
  return {
    mutate,
    mutateAsync,
    reset,
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    isIdle: status === "idle",
    data: currentData,
    error: asyncState == null ? void 0 : asyncState.error
  };
}
function useAsyncState(xpath) {
  const dataState = useContext(DataContext);
  if (!dataState) {
    throw new Error("useAsyncState must be used within a DataProvider");
  }
  const absoluteXPath = combineXPaths(dataState.xpath, xpath);
  const asyncState = dataState.asyncStates[absoluteXPath];
  const currentData = getDataAtXPath(dataState.data, absoluteXPath);
  const isPending = dataState.pendingOperations.has((asyncState == null ? void 0 : asyncState.requestId) || "");
  const asyncStateInfo = useMemo(() => {
    if (!asyncState)
      return void 0;
    return {
      ...asyncState,
      xpath: absoluteXPath,
      hasPendingOperation: isPending,
      isStale: (staleTime = 0) => {
        if (!asyncState.timestamp)
          return true;
        return Date.now() - asyncState.timestamp > staleTime;
      }
    };
  }, [asyncState, absoluteXPath, isPending]);
  const status = (asyncState == null ? void 0 : asyncState.status) || "idle";
  return {
    data: currentData,
    asyncState: asyncStateInfo,
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    isIdle: status === "idle",
    error: asyncState == null ? void 0 : asyncState.error,
    isPending,
    lastUpdated: asyncState == null ? void 0 : asyncState.timestamp
  };
}
function useAsyncStates(xpaths) {
  const dataState = useContext(DataContext);
  if (!dataState) {
    throw new Error("useAsyncStates must be used within a DataProvider");
  }
  return useMemo(() => {
    const results = {};
    xpaths.forEach((xpath) => {
      const absoluteXPath = combineXPaths(dataState.xpath, xpath);
      const asyncState = dataState.asyncStates[absoluteXPath];
      const currentData = getDataAtXPath(dataState.data, absoluteXPath);
      const isPending = dataState.pendingOperations.has((asyncState == null ? void 0 : asyncState.requestId) || "");
      const asyncStateInfo = asyncState ? {
        ...asyncState,
        xpath: absoluteXPath,
        hasPendingOperation: isPending,
        isStale: (staleTime = 0) => {
          if (!asyncState.timestamp)
            return true;
          return Date.now() - asyncState.timestamp > staleTime;
        }
      } : void 0;
      const status = (asyncState == null ? void 0 : asyncState.status) || "idle";
      results[xpath] = {
        data: currentData,
        asyncState: asyncStateInfo,
        isLoading: status === "loading",
        isError: status === "error",
        isSuccess: status === "success",
        isIdle: status === "idle",
        error: asyncState == null ? void 0 : asyncState.error,
        isPending,
        lastUpdated: asyncState == null ? void 0 : asyncState.timestamp
      };
    });
    return results;
  }, [dataState, xpaths]);
}
function useGlobalAsyncState() {
  const dataState = useContext(DataContext);
  if (!dataState) {
    throw new Error("useGlobalAsyncState must be used within a DataProvider");
  }
  return useMemo(() => {
    const allStates = Object.entries(dataState.asyncStates);
    const pendingCount = dataState.pendingOperations.size;
    const executingCount = dataState.commandQueue.executing.size;
    const queuedCount = dataState.commandQueue.pending.length;
    const summary = {
      totalStates: allStates.length,
      loadingStates: allStates.filter(([, state]) => state.status === "loading").length,
      errorStates: allStates.filter(([, state]) => state.status === "error").length,
      successStates: allStates.filter(([, state]) => state.status === "success").length,
      idleStates: allStates.filter(([, state]) => state.status === "idle").length,
      pendingOperations: pendingCount,
      executingOperations: executingCount,
      queuedOperations: queuedCount,
      hasAnyLoading: allStates.some(([, state]) => state.status === "loading"),
      hasAnyError: allStates.some(([, state]) => state.status === "error"),
      optimisticUpdateCount: Object.keys(dataState.optimisticUpdates).length
    };
    const statesByStatus = {
      loading: allStates.filter(([, state]) => state.status === "loading"),
      error: allStates.filter(([, state]) => state.status === "error"),
      success: allStates.filter(([, state]) => state.status === "success"),
      idle: allStates.filter(([, state]) => state.status === "idle")
    };
    return {
      summary,
      statesByStatus,
      asyncStates: dataState.asyncStates,
      pendingOperations: dataState.pendingOperations,
      commandQueue: dataState.commandQueue,
      optimisticUpdates: dataState.optimisticUpdates
    };
  }, [dataState]);
}
function useAsyncBatch(operations, config = {}) {
  const dataState = useContext(DataContext);
  const dispatch = useContext(DataDispatchContext);
  if (!dataState || !dispatch) {
    throw new Error("useAsyncBatch must be used within a DataProvider");
  }
  const {
    concurrency = 3,
    failFast = false,
    retryCount = 1,
    retryDelay = 1e3,
    onBatchComplete,
    onBatchError
  } = config;
  const commandQueueRef = useRef();
  const resultsRef = useRef([]);
  const statusRef = useRef("idle");
  const batchIdRef = useRef();
  if (!commandQueueRef.current) {
    commandQueueRef.current = new CommandQueueManager(dispatch, concurrency);
    commandQueueRef.current.updateQueue(dataState.commandQueue);
  }
  const executeOperation = useCallback(async (operation, retryAttempt = 0) => {
    var _a, _b;
    const absoluteXPath = combineXPaths(dataState.xpath, operation.xpath);
    const requestId = generateRequestId();
    try {
      dispatch(asyncStart(absoluteXPath, requestId, "fetch", operation.priority));
      const result = await operation.fetcher();
      dispatch(asyncSuccess(absoluteXPath, requestId, result));
      (_a = operation.onSuccess) == null ? void 0 : _a.call(operation, result);
      return {
        xpath: operation.xpath,
        status: "success",
        data: result
      };
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      if (retryAttempt < retryCount) {
        const delay = retryDelay * Math.pow(2, retryAttempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return executeOperation(operation, retryAttempt + 1);
      }
      dispatch(asyncError(absoluteXPath, requestId, errorInstance, false));
      (_b = operation.onError) == null ? void 0 : _b.call(operation, errorInstance);
      return {
        xpath: operation.xpath,
        status: "error",
        error: errorInstance
      };
    }
  }, [dataState.xpath, dispatch, retryCount, retryDelay]);
  const execute = useCallback(async () => {
    var _a;
    if (statusRef.current === "loading") {
      throw new Error("Batch operation is already in progress");
    }
    statusRef.current = "loading";
    batchIdRef.current = generateRequestId();
    resultsRef.current = operations.map((op) => ({
      xpath: op.xpath,
      status: "pending"
    }));
    try {
      const promises = operations.map(async (operation, index) => {
        try {
          const result = await executeOperation(operation);
          resultsRef.current[index] = result;
          if (failFast && result.status === "error" && commandQueueRef.current) {
            operations.slice(index + 1).forEach((op) => {
              const absoluteXPath = combineXPaths(dataState.xpath, op.xpath);
              commandQueueRef.current.cancelByXPath(absoluteXPath);
            });
            throw result.error;
          }
          return result;
        } catch (error) {
          const errorResult = {
            xpath: operation.xpath,
            status: "error",
            error: error instanceof Error ? error : new Error(String(error))
          };
          resultsRef.current[index] = errorResult;
          if (failFast) {
            throw error;
          }
          return errorResult;
        }
      });
      const results = await Promise.allSettled(promises);
      const finalResults = results.map(
        (result, index) => result.status === "fulfilled" ? result.value : {
          xpath: operations[index].xpath,
          status: "error",
          error: result.reason instanceof Error ? result.reason : new Error(String(result.reason))
        }
      );
      resultsRef.current = finalResults;
      const hasErrors = finalResults.some((r) => r.status === "error");
      statusRef.current = hasErrors ? "error" : "success";
      if (hasErrors && onBatchError) {
        const firstError = (_a = finalResults.find((r) => r.status === "error")) == null ? void 0 : _a.error;
        onBatchError(firstError || new Error("Batch operation failed"), finalResults);
      } else if (!hasErrors && onBatchComplete) {
        onBatchComplete(finalResults);
      }
      return finalResults;
    } catch (error) {
      statusRef.current = "error";
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      if (onBatchError) {
        onBatchError(errorInstance, resultsRef.current);
      }
      throw errorInstance;
    }
  }, [operations, executeOperation, failFast, onBatchComplete, onBatchError, dataState.xpath]);
  const cancel = useCallback(() => {
    if (commandQueueRef.current && batchIdRef.current) {
      operations.forEach((operation) => {
        const absoluteXPath = combineXPaths(dataState.xpath, operation.xpath);
        commandQueueRef.current.cancelByXPath(absoluteXPath);
      });
    }
    statusRef.current = "idle";
    resultsRef.current = [];
  }, [operations, dataState.xpath]);
  const progress = useMemo(() => {
    const total = operations.length;
    const completed = resultsRef.current.filter((r) => r.status === "success").length;
    const failed = resultsRef.current.filter((r) => r.status === "error").length;
    const pending = resultsRef.current.filter((r) => r.status === "pending").length;
    return {
      total,
      completed,
      failed,
      pending,
      percentage: total > 0 ? Math.round((completed + failed) / total * 100) : 0
    };
  }, [operations.length, resultsRef.current]);
  return {
    execute,
    cancel,
    isLoading: statusRef.current === "loading",
    isError: statusRef.current === "error",
    isSuccess: statusRef.current === "success",
    isIdle: statusRef.current === "idle",
    results: resultsRef.current,
    progress
  };
}
function useAsyncParallel(operations, config) {
  return useAsyncBatch(
    operations.map((op) => ({ ...op, priority: "normal" })),
    { ...config, concurrency: operations.length }
  );
}
function useAsyncSequential(operations, config) {
  return useAsyncBatch(
    operations.map((op) => ({ ...op, priority: "normal" })),
    { ...config, concurrency: 1 }
  );
}
function useOptimisticUpdates(xpath, config = {}) {
  const dataState = useContext(DataContext);
  const dispatch = useContext(DataDispatchContext);
  if (!dataState || !dispatch) {
    throw new Error("useOptimisticUpdates must be used within a DataProvider");
  }
  const {
    onRollback,
    onCommit
  } = config;
  const absoluteXPath = combineXPaths(dataState.xpath, xpath);
  const apply = useCallback((newData) => {
    const updateId = generateRequestId();
    dispatch({
      type: "ASYNC_START",
      payload: {
        xpath: absoluteXPath,
        requestId: updateId,
        operation: "mutate",
        priority: "normal",
        optimisticData: newData
      }
    });
    return updateId;
  }, [absoluteXPath, dispatch]);
  const rollback = useCallback((updateId) => {
    const optimisticId = `${updateId}_${absoluteXPath}`;
    const optimisticUpdate = dataState.optimisticUpdates[optimisticId];
    if (optimisticUpdate) {
      dispatch({
        type: "ASYNC_CANCEL",
        payload: {
          xpath: absoluteXPath,
          requestId: updateId
        }
      });
      onRollback == null ? void 0 : onRollback(optimisticUpdate.originalData);
    }
  }, [absoluteXPath, dataState.optimisticUpdates, dispatch, onRollback]);
  const commit = useCallback((updateId) => {
    const optimisticId = `${updateId}_${absoluteXPath}`;
    const optimisticUpdate = dataState.optimisticUpdates[optimisticId];
    if (optimisticUpdate) {
      dispatch({
        type: "ASYNC_SUCCESS",
        payload: {
          xpath: absoluteXPath,
          requestId: updateId,
          data: optimisticUpdate.optimisticData,
          timestamp: Date.now()
        }
      });
      onCommit == null ? void 0 : onCommit(optimisticUpdate.optimisticData);
    }
  }, [absoluteXPath, dataState.optimisticUpdates, dispatch, onCommit]);
  const rollbackAll = useCallback(() => {
    Object.entries(dataState.optimisticUpdates).forEach(([optimisticId, update]) => {
      if (update.xpath === absoluteXPath) {
        const updateId = optimisticId.split("_")[0];
        rollback(updateId);
      }
    });
  }, [dataState.optimisticUpdates, absoluteXPath, rollback]);
  const getOriginalData = useCallback((updateId) => {
    const optimisticId = `${updateId}_${absoluteXPath}`;
    const optimisticUpdate = dataState.optimisticUpdates[optimisticId];
    return optimisticUpdate ? getDataAtXPath(optimisticUpdate.originalData, absoluteXPath) : void 0;
  }, [dataState.optimisticUpdates, absoluteXPath]);
  const optimisticUpdateIds = Object.keys(dataState.optimisticUpdates).filter((id) => id.endsWith(`_${absoluteXPath}`)).map((id) => id.split("_")[0]);
  return {
    apply,
    rollback,
    commit,
    rollbackAll,
    getOriginalData,
    hasOptimisticUpdates: optimisticUpdateIds.length > 0,
    optimisticUpdateIds
  };
}
function useOptimisticList(xpath, config = {}) {
  const baseResult = useOptimisticUpdates(xpath, config);
  const dataState = useContext(DataContext);
  const absoluteXPath = combineXPaths(dataState.xpath, xpath);
  const currentList = getDataAtXPath(dataState.data, absoluteXPath) || [];
  const addItem = useCallback((item, position) => {
    const newList = [...currentList];
    if (position !== void 0 && position >= 0 && position <= newList.length) {
      newList.splice(position, 0, item);
    } else {
      newList.push(item);
    }
    return baseResult.apply(newList);
  }, [currentList, baseResult]);
  const updateItem = useCallback((index, item) => {
    if (index < 0 || index >= currentList.length) {
      throw new Error(`Index ${index} is out of bounds for list of length ${currentList.length}`);
    }
    const newList = [...currentList];
    newList[index] = item;
    return baseResult.apply(newList);
  }, [currentList, baseResult]);
  const removeItem = useCallback((index) => {
    if (index < 0 || index >= currentList.length) {
      throw new Error(`Index ${index} is out of bounds for list of length ${currentList.length}`);
    }
    const newList = [...currentList];
    newList.splice(index, 1);
    return baseResult.apply(newList);
  }, [currentList, baseResult]);
  const moveItem = useCallback((fromIndex, toIndex) => {
    if (fromIndex < 0 || fromIndex >= currentList.length || toIndex < 0 || toIndex >= currentList.length) {
      throw new Error("Move indices are out of bounds");
    }
    const newList = [...currentList];
    const [movedItem] = newList.splice(fromIndex, 1);
    newList.splice(toIndex, 0, movedItem);
    return baseResult.apply(newList);
  }, [currentList, baseResult]);
  return {
    ...baseResult,
    addItem,
    updateItem,
    removeItem,
    moveItem
  };
}
function useOptimisticObject(xpath, config = {}) {
  const baseResult = useOptimisticUpdates(xpath, config);
  const dataState = useContext(DataContext);
  const absoluteXPath = combineXPaths(dataState.xpath, xpath);
  const currentObject = getDataAtXPath(dataState.data, absoluteXPath) || {};
  const updateProperty = useCallback((key, value) => {
    const newObject = { ...currentObject, [key]: value };
    return baseResult.apply(newObject);
  }, [currentObject, baseResult]);
  const updateProperties = useCallback((updates) => {
    const newObject = { ...currentObject, ...updates };
    return baseResult.apply(newObject);
  }, [currentObject, baseResult]);
  const removeProperty = useCallback((key) => {
    const newObject = { ...currentObject };
    delete newObject[key];
    return baseResult.apply(newObject);
  }, [currentObject, baseResult]);
  const mergeObject = useCallback((updates) => {
    const newObject = { ...currentObject };
    Object.entries(updates).forEach(([key, value]) => {
      if (typeof newObject[key] === "object" && typeof value === "object" && newObject[key] !== null && value !== null) {
        newObject[key] = { ...newObject[key], ...value };
      } else {
        newObject[key] = value;
      }
    });
    return baseResult.apply(newObject);
  }, [currentObject, baseResult]);
  return {
    ...baseResult,
    updateProperty,
    updateProperties,
    removeProperty,
    mergeObject
  };
}
function useInvalidation() {
  const dataState = useContext(DataContext);
  const dispatch = useContext(DataDispatchContext);
  if (!dataState || !dispatch) {
    throw new Error("useInvalidation must be used within a DataProvider");
  }
  const commandQueueManager = new CommandQueueManager(dispatch);
  commandQueueManager.updateQueue(dataState.commandQueue);
  const invalidate = useCallback((xpath, config = {}) => {
    const {
      includeChildren = false,
      includeParents = false,
      clearData = false
    } = config;
    const absoluteXPath = combineXPaths(dataState.xpath, xpath);
    const pathsToInvalidate = /* @__PURE__ */ new Set([absoluteXPath]);
    if (includeChildren) {
      Object.keys(dataState.asyncStates).forEach((statePath) => {
        if (statePath.startsWith(absoluteXPath + "/") || statePath.startsWith(absoluteXPath + "[")) {
          pathsToInvalidate.add(statePath);
        }
      });
    }
    if (includeParents) {
      const segments = parseXPath(absoluteXPath);
      for (let i = segments.length - 1; i >= 0; i--) {
        const parentSegments = segments.slice(0, i);
        const parentPath = parentSegments.length === 0 ? "/" : "/" + parentSegments.map(
          (seg) => seg.isArray && seg.index !== void 0 ? `${seg.property}[${seg.index}]` : seg.property
        ).join("/");
        if (dataState.asyncStates[parentPath]) {
          pathsToInvalidate.add(parentPath);
        }
      }
    }
    pathsToInvalidate.forEach((path) => {
      const asyncState = dataState.asyncStates[path];
      commandQueueManager.cancelByXPath(path);
      if (asyncState) {
        dispatch({
          type: "ASYNC_CANCEL",
          payload: {
            xpath: path,
            requestId: asyncState.requestId || generateRequestId()
          }
        });
      }
      if (clearData) {
        dispatch({
          type: "DATA_OPERATION",
          payload: {
            xpath: path,
            operation: "delete",
            data: null
          }
        });
      }
    });
  }, [dataState, dispatch, commandQueueManager]);
  const invalidateMany = useCallback((xpaths, config = {}) => {
    xpaths.forEach((xpath) => invalidate(xpath, config));
  }, [invalidate]);
  const invalidatePattern = useCallback((pattern, config = {}) => {
    const regex = new RegExp(
      pattern.replace(/\*/g, ".*").replace(/\[(\d+)\]/g, "\\[$1\\]").replace(/\[\*\]/g, "\\[\\d+\\]")
    );
    const matchingPaths = Object.keys(dataState.asyncStates).filter(
      (path) => regex.test(path)
    );
    invalidateMany(matchingPaths, config);
  }, [dataState.asyncStates, invalidateMany]);
  const invalidateAll = useCallback(() => {
    dataState.commandQueue.executing.forEach((command) => {
      command.abortController.abort();
    });
    dataState.commandQueue.pending.forEach((command) => {
      command.abortController.abort();
    });
    Object.keys(dataState.asyncStates).forEach((path) => {
      const asyncState = dataState.asyncStates[path];
      dispatch({
        type: "ASYNC_CANCEL",
        payload: {
          xpath: path,
          requestId: asyncState.requestId || generateRequestId()
        }
      });
    });
    dispatch({
      type: "COMMAND_QUEUE_UPDATE",
      payload: {
        operation: "remove",
        commandId: "all"
      }
    });
  }, [dataState, dispatch]);
  const revalidate = useCallback((xpath) => {
    const absoluteXPath = combineXPaths(dataState.xpath, xpath);
    const asyncState = dataState.asyncStates[absoluteXPath];
    if (asyncState) {
      dispatch({
        type: "ASYNC_START",
        payload: {
          xpath: absoluteXPath,
          requestId: generateRequestId(),
          operation: "fetch",
          priority: "normal"
        }
      });
    }
  }, [dataState, dispatch]);
  const revalidateMany = useCallback((xpaths) => {
    xpaths.forEach((xpath) => revalidate(xpath));
  }, [revalidate]);
  const getInvalidationCount = useCallback(() => {
    return Object.keys(dataState.asyncStates).filter((path) => {
      const state = dataState.asyncStates[path];
      return state.status === "idle" || state.status === "error";
    }).length;
  }, [dataState.asyncStates]);
  return {
    invalidate,
    invalidateMany,
    invalidatePattern,
    invalidateAll,
    revalidate,
    revalidateMany,
    getInvalidationCount
  };
}
function useAutoInvalidation(dependencies, config = {}) {
  const { invalidateMany } = useInvalidation();
  const { debounceMs = 100, onInvalidate, ...invalidationConfig } = config;
  const debouncedInvalidate = useCallback(
    /* @__PURE__ */ (() => {
      let timeoutId;
      return (paths) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          invalidateMany(paths, invalidationConfig);
          onInvalidate == null ? void 0 : onInvalidate(paths);
        }, debounceMs);
      };
    })(),
    [invalidateMany, invalidationConfig, debounceMs, onInvalidate]
  );
  return {
    trigger: () => debouncedInvalidate(dependencies),
    invalidateDependencies: () => invalidateMany(dependencies, invalidationConfig)
  };
}
function useQueryInvalidation() {
  const dataState = useContext(DataContext);
  const { invalidatePattern, invalidateMany } = useInvalidation();
  const invalidateQueries = useCallback((queryKey) => {
    if (Array.isArray(queryKey)) {
      invalidateMany(queryKey);
    } else {
      invalidatePattern(queryKey);
    }
  }, [invalidatePattern, invalidateMany]);
  const invalidateQueriesMatching = useCallback((predicate) => {
    const matchingPaths = Object.keys(dataState.asyncStates).filter(predicate);
    invalidateMany(matchingPaths);
  }, [dataState.asyncStates, invalidateMany]);
  const getQueries = useCallback((queryKey) => {
    if (!queryKey) {
      return Object.keys(dataState.asyncStates);
    }
    if (Array.isArray(queryKey)) {
      return queryKey.filter((path) => dataState.asyncStates[path]);
    }
    const regex = new RegExp(queryKey.replace(/\*/g, ".*"));
    return Object.keys(dataState.asyncStates).filter((path) => regex.test(path));
  }, [dataState.asyncStates]);
  return {
    invalidateQueries,
    invalidateQueriesMatching,
    getQueries
  };
}
function Form({
  xpath = "",
  operation = "merge",
  onSubmit,
  children,
  ...props
}) {
  const navigate2 = useNavigate();
  const { setData } = useDataManipulation();
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new window.FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    if (onSubmit) {
      onSubmit(data, navigate2);
    } else if (xpath) {
      setData(xpath, data, operation);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { ...props, onSubmit: handleSubmit, children });
}
function Button({
  dataAction = "merge",
  targetXPath,
  navigateTo,
  children,
  onClick,
  type = "submit",
  ...props
}) {
  const { setData } = useDataManipulation();
  const navigate2 = useNavigate();
  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    if (event.defaultPrevented) {
      return;
    }
    if (type === "submit") {
      const form = event.currentTarget.closest("form");
      if (form && targetXPath) {
        const formData = new window.FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
          if (data[key]) {
            if (Array.isArray(data[key])) {
              data[key].push(value);
            } else {
              data[key] = [data[key], value];
            }
          } else {
            data[key] = value;
          }
        }
        setData(targetXPath, data, dataAction);
      }
    }
    if (navigateTo) {
      navigate2(navigateTo);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type, ...props, onClick: handleClick, children });
}
const Link = forwardRef(({ to, children, ...rest }, ref) => {
  const navigate2 = useNavigate();
  const handleClick = (event) => {
    if (!event.defaultPrevented) {
      event.preventDefault();
      navigate2(to);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "a",
    {
      ...rest,
      href: "#",
      ref,
      onClick: handleClick,
      children
    }
  );
});
Link.displayName = "Link";
export {
  Button,
  CommandQueueManager,
  DataProvider,
  Form,
  Link,
  asyncCancel,
  asyncError,
  asyncStart,
  asyncSuccess,
  commandQueueUpdate,
  generateRequestId,
  useAsyncBatch,
  useAsyncData,
  useAsyncMutation,
  useAsyncParallel,
  useAsyncSequential,
  useAsyncState,
  useAsyncStates,
  useAutoInvalidation,
  useData,
  useDataAtXPath,
  useDataManipulation,
  useGlobalAsyncState,
  useHistory,
  useInvalidation,
  useNavigate,
  useNavigation,
  useOptimisticList,
  useOptimisticObject,
  useOptimisticUpdates,
  useQueryInvalidation,
  useTargetData,
  useXPath
};
//# sourceMappingURL=index.es.js.map
