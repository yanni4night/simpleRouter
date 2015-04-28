/**
 * Copyright (C) 2015 tieba.baidu.com
 * url.js
 *
 * changelog
 * 2015-04-28[10:42:08]:revised
 *
 * @author yinyong02@baidu.com
 * @version 0.1.0
 * @since 0.1.0
 */

var $ = require('./$');

var Url = function (url) {

    if (null === url || undefined === url || String !== url.constructor) {
        throw new TypeError('"url" must be a string.');
    }

    var handleHash = function (doRemove) {
        var hashLoc = url.indexOf('#');
        return hashLoc < 0 ? '' : (doRemove ? (url = url.slice(0, hashLoc)) : url.slice(
            hashLoc + 1));
    };

    var handlePathSearch = function (getSearch) {
        var shadow = this.clone();
        shadow.removeHash();
        var askLoc = shadow.getUrl().indexOf('?');
        if (getSearch) {
            return askLoc < 0 ? '' : shadow.getUrl().slice(askLoc + 1);
        } else {
            return askLoc < 0 ? shadow.getUrl() : shadow.getUrl()
                .slice(0, askLoc);
        }

    };

    var split = function (str) {
        var search = {};
        var eqLoc;
        var searchArray = str.split('&');
        $.each(searchArray, function (idx, pair) {
            if (-1 === (eqLoc = pair.indexOf('='))) {
                return;
            }
            search[pair.slice(0, eqLoc)] = pair.slice(eqLoc + 1);
        });
        return search;
    };

    $.extend(true, this, {
        setUrl: function (newUrl) {
            return (url = newUrl);
        },
        getUrl: function () {
            return url;
        },
        getHash: function () {
            return handleHash.call(this);
        },
        removeHash: function () {
            return handleHash.call(this, true);
        },
        getPath: function () {
            return handlePathSearch.call(this);
        },
        getSearch: function (splited) {
            var searchStr = handlePathSearch.call(this, true);
            if (splited) {
                return split(searchStr);
            } else {
                return searchStr;
            }
        },
        clone: function () {
            return new Url(url);
        },
        mergeParam: function (params) {
            var newSearch = $.extend(this.getSearch(true), params);
            var searchArray = [];
            var hash = this.getHash();
            $.each(newSearch, function (key, val) {
                searchArray.push(key + '=' + val);
            });

            url = this.getPath() + '?' + searchArray.join('&') + (hash ? ('#' +
                hash) : '');
            return this;
        }
    });
};

module.exports = Url;