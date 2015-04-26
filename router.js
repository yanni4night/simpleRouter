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

/*jshint bitwise:true*/
/*jshint camelcase:true*/
/*jshint curly:true*/
/*jshint eqeqeq:true*/
/*jshint indent:4*/
/*jshint latedef:true*/
/*jshint noarg:true*/
/*jshint quotmark:true*/
/*jshint undef:true*/
/*jshint unused:true*/
/*jshint eqnull:true*/
/*jshint evil:true*/
/*jshint loopfunc:true*/
/*jshint proto:true*/
/*jshint browser:true*/
/*jshint jquery:true*/
/*jshint node:true*/
(function(factory) {
    'use strict';
    if ('undefined' !== typeof define && define.amd) {
        require([], factory);
    } else if ('undefined' !== typeof define && define.cmd) {
        define(function(require, exports, module) {
            module.exports = factory();
        });
    } else if ('undefined' !== typeof module && module.exports) {
        module.exports = factory();
    } else if ('undefined' !== typeof window) {
        window.SimpleRouter = factory();
    }
})(function() {

    return (function(window, document, $, undefined) {
        'use strict';

        var finalPath;

        var supports = {
            pushStateSupported: !!(window.history && window.history.pushState),
            hashChangeSupported: 'onhashchange' in window
        };

        var Url = function(url) {

            if (!url || String !== url.constructor) {
                throw new TypeError('"url" must be a string.');
            }

            var handleHash = function(doRemove) {
                var hashLoc = url.lastIndexOf('#');
                return hashLoc < 0 ? '' : (doRemove ? (url = url.slice(hashLoc + 1)) : url.slice(hashLoc + 1));
            };

            var handlePathSearch = function(getSearch) {
                var shadow = this.clone();
                shadow.removeHash();
                var askLoc = shadow.getUrl().indexOf('?');
                return askLoc < 0 ? shadow.getUrl() : (getSearch ? shadow.getUrl().slice(askLoc + 1) : shadow.getUrl()
                    .slice(0, askLoc));
            };

            $.extend(true, this, {
                setUrl: function(newUrl) {
                    return (url = newUrl);
                },
                getUrl: function() {
                    return url;
                },
                getHash: function() {
                    return handleHash.call(this);
                },
                removeHash: function() {
                    return handleHash.call(this, true);
                },
                getPath: function() {
                    return handlePathSearch.call(this);
                },
                getSearch: function() {
                    return handlePathSearch.call(this, true);
                },
                clone: function() {
                    return new Url(url);
                }
            });
        };


        var Path = function() {
            var self = this;
            var options;
            var routes = {
                current: null,
                defined: {}
            };

            var iframe;

            var listened = false;

            var match = function(pattern, source) {
                var reg = /(\w+)=:\1/g;
                var matches;
                var ret;
                var patterns = [];

                if(supports.pushStateSupported){
                    pattern = new Url(pattern).getSearch();
                    source = new Url(source).getSearch();
                }else {
                    pattern = new Url(pattern).getHash();
                    source = new Url(source).getHash();
                }


                while (!!(matches = reg.exec(pattern))) {
                    patterns.push(matches[1]);
                }

                for (var i = patterns.length - 1; i >= 0; i--) {
                    var key = patterns[i];
                    var regexp = new RegExp(key + '=([^\?/\\&#]*)');
                    if (regexp.test(source)) {
                        ret = ret || {};
                        ret[key] = RegExp.$1;
                    }
                }

                return ret;
            };

            var execute = function(path, refresh) {
                var route, isMatch;

                if (path === '') {
                    var currentUrl = new Url(options.getCurrentLocation());
                    currentUrl.removeHash();
                    path = currentUrl.getUrl();
                }

                for (var i in routes.defined) {
                    route = routes.defined[i];
                    isMatch = match(route.path, path);
                    if (isMatch) {
                        route.action.call(route, isMatch, refresh);
                        return;
                    }
                }

                if (typeof options.defaultAction === 'function') {
                    options.defaultAction.call(null, path, refresh);
                }

            };

            var dispatch = function(path) {
                if (path === routes.current) {
                    return;
                }

                routes.current = path;

                if (!supports.hashChangeSupported) {
                    options.setHash(path);
                }

                execute(path);
            };

            $.extend(true, this, {
                init: function(opts) {
                    options = $.extend(true, {
                        /**
                         * Ignore 'protocol' & 'host'.
                         *
                         * @return {String}
                         */
                        getCurrentLocation: function() {
                            return window.location.href.replace(location.protocol + '://' + location.host, '');
                        },
                        setHash: function(hash) {
                            window.location.hash = hash;
                        }
                    }, opts);
                    return finalPath;
                },
                map: function(path) {
                    if (!routes.defined[path]) {
                        routes.defined[path] = new Path.Route(path);
                    }
                    return routes.defined[path];
                },
                nav: function(path) {
                    if (!listened) {
                        return;
                    }

                    if (supports.pushStateSupported) {
                        window.history.pushState(null, null, path);
                        dispatch(path);
                    } else if (supports.hashChangeSupported) {
                        options.setHash(path);
                    } else {
                        iframe.document.open().close();
                        iframe.location.hash = path;
                    }
                },
                listen: function() {
                    if (listened) {
                        return this;
                    }

                    var fn, path;
                    var locationData;
                    if (this.pushStateSupported) {
                        fn = function() {
                            locationData = new Url(options.getCurrentLocation());
                            locationData.removeHash();
                            dispatch(locationData.getUrl());
                        };

                        window.onpopstate = fn;

                    } else {

                        if (supports.hashChangeSupported) {
                            fn = function() {
                                locationData = new Url(options.getCurrentLocation());
                                dispatch(locationData.getHash());
                            };
                            window.onhashchange = fn;
                        } else {
                            fn = function() {
                                dispatch(new Url(iframe.location).getHash());
                            };

                            iframe = document.createElement('<iframe src="javascript:0" tabindex="-1">');
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
            Route: function(path) {
                this.action = null;
                this.path = path;
            }
        })

        Path.Route.prototype = {
            to: function(fn) {
                this.action = fn;
                return this;
            },
            end: function() {
                return finalPath;
            }
        };



        var singletonRouter = new Path();

        finalPath = function() {
            return singletonRouter.init.apply(this, arguments);
        };

        $.extend(true, finalPath, singletonRouter);

        return finalPath;

    })(window, document, jQuery);

});