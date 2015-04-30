/**
 * Copyright (C) 2015 yanni4night.com
 * url.js
 *
 * changelog
 * 2015-04-28[10:42:08]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

var $ = require('./$');


/**
 * 统一资源定位符的包装类。
 *
 * @param {String} url
 * @since 1.0.0
 */
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

    $.extend(this, {
        /**
         * 重新设置URL。
         *
         * @param {String} newUrl 新的URL
         * @return {String} 新设置的URL
         * @since 1.0.0
         */
        setUrl: function (newUrl) {
            return (url = newUrl);
        },
        /**
         * 获取URL。
         *
         * @return {String}
         * @since 1.0.0
         */
        getUrl: function () {
            return url;
        },
        /**
         * 获取Hash值，无Hash则返回空字符串。
         *
         * @return {String} Hash值
         * @since 1.0.0
         */
        getHash: function () {
            return handleHash.call(this);
        },
        /**
         * 移除Hash。
         *
         * @return {this}
         * @since 1.0.0
         */
        removeHash: function () {
            handleHash.call(this, true);
            return this;
        },
        /**
         * 获取Path。
         *
         * @return {String}
         * @since 1.0.0
         */
        getPath: function () {
            return handlePathSearch.call(this);
        },
        /**
         * 获取Search参数。
         *
         * @param  {[type]} splited 是否解析成对象
         * @return {String|Object}
         * @since 1.0.0
         */
        getSearch: function (splited) {
            var searchStr = handlePathSearch.call(this, true);
            if (splited) {
                return split(searchStr);
            } else {
                return searchStr;
            }
        },
        /**
         * 克隆一份具有同样URL值的对象。
         *
         * @return {Object}
         * @since 1.0.0
         */
        clone: function () {
            return new Url(url);
        },
        /**
         * 更新Search参数。
         *
         * @param  {Object} params 新的Search参数键值对
         * @return {this}
         */
        mixinSearch: function (params) {
            var newSearch = $.extend(this.getSearch(true), params);
            var searchArray = [];
            var hash = this.getHash();

            $.each(newSearch, function (key, val) {
                searchArray.push(key + '=' + val);
            });

            url = this.getPath() + '?' + searchArray.join('&') + (hash ? ('#' +
                hash) : '');
            return this;
        },
        /**
         * 移除指定的Search参数。
         *
         * @param  {String|Array} key
         * @return {this}
         */
        removeSearch: function (key) {
            var newSearch = this.getSearch(true);
            var searchArray = [];
            var hash = this.getHash();

            if ($.isArray(key)) {
                $.each(key, function (idx, k) {
                    delete newSearch[k];
                });
            } else if(!arguments.length){
                newSearch = {};
            }else{
                delete newSearch[key];
            }

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