/**
 * Copyright (C) 2015 tieba.baidu.com
 * $.js
 *
 * changelog
 * 2015-04-28[10:45:36]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

var hasOwn = ({}).hasOwnProperty;

var isArray = function(obj) {
  return Array.isArray ? Array.isArray(obj) : '[object Array]' === ({}).toString.call(obj);
};

var each = function(obj, fn, thisArg) {
  if (isArray(obj)) {
    for (var i = 0; i < obj.length; ++i) {
      fn.call(thisArg, i, obj[i], obj);
    }
  } else {
    for (var e in obj) {
      if (hasOwn.call(obj, e)) {
        fn.call(thisArg, e, obj[e], obj);
      }
    }
  }
};

var extend = function() {
  var args = Array.prototype.slice.call(arguments, 1);
  var dest = arguments[0] || {};
  if (!args.length) {
    return {};
  }
  each(args, function(key, val) {
    dest[key] = val;
  });
  return dest;
};

module.exports = /*window.jQuery ||*/ {
  extend: extend,
  each: each,
  isArray: isArray
};