/**
 * Copyright (C) 2015 yanni4night.com
 * router.js
 *
 * changelog
 * 2015-04-24[16:31:20]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

var Url = require('./url');
var $ = require('./$');

var finalPath;

var supports = {
    pushStateSupported: !!window.history.pushState,
    hashChangeSupported: 'onhashchange' in window
};


var Path = function () {
    var options;
    var routes = {
        current: null,
        defined: {}
    };

    var iframe;

    var listened = false;

    var match = function (pattern, source) {
        var reg = /(\w+)=:\1/g;
        var matches;
        var ret = {};
        var patterns = [];

        var pattUrl = new Url(pattern);
        pattUrl.removeHash();

        var srcUrl = new Url(source);
        srcUrl.removeHash();

        if (pattUrl.getPath() !== srcUrl.getPath()) {
            return false;
        }

        pattern = pattUrl.getUrl();
        source = srcUrl.getUrl();

        while (!!(matches = reg.exec(pattern))) {
            patterns.push(matches[1]);
        }

        for (var i = patterns.length - 1; i >= 0; i--) {
            var key = patterns[i];
            var regexp = new RegExp(key + '=([^\?/\\&#]*)');
            if (regexp.test(source)) {
                ret[key] = RegExp.$1;
            }
        }

        return ret;
    };

    var execute = function (path, refresh) {
        var route, matches;

        if (path === '') {
            var currentUrl = new Url(options.getCurrentLocation());
            currentUrl.removeHash();
            path = currentUrl.getUrl();
        }

        for (var i in routes.defined) {
            route = routes.defined[i];
            matches = match(route.path, path);
            if (matches) {
                route.action.call(route, matches, refresh);
                return;
            }
        }

        if (typeof options.defaultAction === 'function') {
            options.defaultAction.call(null, path, refresh);
        }

    };

    var dispatch = function (path) {
        if (path === routes.current) {
            return;
        }

        routes.current = path;

        if (!supports.hashChangeSupported) {
            options.setHash(path);
        }

        execute(path);
    };

    $.extend(this, {
        init: function (opts) {
            options = $.extend({
                /**
                 * Ignore 'protocol' & 'host'.
                 *
                 * @return {String}
                 */
                getCurrentLocation: function () {
                    return window.location.href.replace(location.protocol +
                        '://' + location.host, '');
                },
                setHash: function (hash) {
                    window.location.hash = hash;
                }
            }, opts);

            /* var rootUrl = new Url(options.getCurrentLocation());

             if (/^\/\w+=[^?&\/=]+/.test(rootUrl.getHash())) {
                 rootUrl.mergeParam(rootUrl.getHash(true));
                 //rootUrl.removeHash();
                 location.href = rootUrl.getUrl();
             }*/

            return finalPath;
        },
        map: function (path) {
            if (!routes.defined[path]) {
                routes.defined[path] = new Path.Route(path);
            }
            return routes.defined[path];
        },
        /**
         * 导航到某一URL，URL应是以"/"开头的路径，可以带参数，
         * 但不应带HASH。
         *
         * @param  {String} path
         * @return {this}
         */
        nav: function (path) {
            if (!listened) {
                return;
            }

            if ('/' !== path.charAt(0)) {
                path = '/' + path;
            }

            if (supports.pushStateSupported) {
                window.history.pushState(null, null, path);
                //不会触发，必须手动调用
                dispatch(path);
            } else if (supports.hashChangeSupported) {
                // hash方式会自动除法onhashchange
                options.setHash(path);
            } else {
                // 这个是轮询，因此也会触发
                iframe.document.open().close();
                iframe.location.hash = path;
            }

            return this;
        },
        updateParams: function (params) {
            var currentUrl = new Url(routes.current);
            currentUrl.mixinSearch(params);
            this.nav(currentUrl.getUrl());
            return this;
        },
        listen: function () {
            if (listened) {
                return this;
            }

            var fn, path;
            var locationData;
            if (supports.pushStateSupported) {
                var hashlessUrl = function () {
                    locationData = new Url(options.getCurrentLocation());
                    locationData.removeHash();
                    return locationData.getUrl();
                };
                fn = function () {
                    dispatch(hashlessUrl());
                };
                path = hashlessUrl();
                window.onpopstate = fn;

            } else {
                path = new Url(options.getCurrentLocation()).getHash();
                if (supports.hashChangeSupported) {
                    fn = function () {
                        locationData = new Url(options.getCurrentLocation());
                        dispatch(locationData.getHash());
                    };
                    window.onhashchange = fn;
                } else {
                    fn = function () {
                        dispatch(new Url(iframe.location).getHash());
                    };

                    iframe = document.createElement('iframe');
                    iframe.src = 'about:blank';
                    iframe.tabindex = -1;
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    iframe = iframe.contentWindow;
                    iframe.document.open().close();
                    iframe.location.hash = new Url(iframe.location).getHash();

                    setInterval(fn, 50);
                }

                if (path !== '') {
                    fn();
                }

            }

            routes.current = path;
            listened = true;
            return this;
        }
    });
};

$.extend(Path, {
    Route: function (path) {
        this.action = null;
        this.path = path;
    }
});

Path.Route.prototype = {
    to: function (fn) {
        this.action = fn;
        return this;
    },
    end: function () {
        return finalPath;
    }
};

var singletonRouter = new Path();

finalPath = function () {
    return singletonRouter.init.apply(this, arguments);
};

$.extend(finalPath, singletonRouter);

window.SimpleRouter = finalPath;