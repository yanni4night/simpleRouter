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

(function (window, document, $, undefined) {
    'use strict';
    var supports = {
        pushStateSupported: !!(window.history && 'pushState' in window.history),
        hashChangeSupported: 'onhashchange' in window
    };

    var Url = function (url) {
        this.url = url;

        var _hash = function (doRemove) {
            var hashLoc = this.url.lastIndexOf('#');
            var tmp;
            return hashLoc < 0 ? '' : ((doRemove ? this.url : tmp) = this.url.slice(hashLoc + 1));
        };

        var _path_search = function (getSearch) {
            var shadow = new this.constructor(this.url);
            shadow.removeHash();
            var askLoc = shadow.getUrl().indexOf('?');
            return askLoc < 0 ? shadow.getUrl() : (getSearch ? shadow.getUrl().slice(askLoc + 1) : shadow.getUrl()
                .slice(0, askLoc));
        };

        $.extend(true, this, {
            getUrl: function () {
                return this.url;
            },
            getHash: function () {
                return _hash();
            },
            removeHash: function () {
                return _hash(true);
            },
            getPath: function () {
                return _path_search();
            }
            getSearch: function () {
                return _path_search(true);
            }
        });
    };


    var Router = function () {

        var nav = function(){};

        $.extend(true, this, {
            init: function (options) {
                this.options = $.extend(true, {
                    getCurrentLocation: function () {
                        return window.location.href;
                    }
                }, options);
                return window.SimpleRouter;
            }
        });
    };

    var singletonRouter = new Router();

    window.SimpleRouter = function () {
        return singletonRouter.init.apply(this, arguments);
    };

    $.extend(true, window.SimpleRouter, singletonRouter);

})(window, document, jQuery);