(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Copyright (C) 2014 yanni4night.com
 * test.js
 *
 * changelog
 * 2015-04-26[20:33:45]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

var sr = window.SimpleRouter;

var output = function (msg) {
    $('.console').html(msg);
};

sr({}).map('/SimpleRouter?no=:no&fcid=:fcid').to(function (params) {
    output(JSON.stringify(params, null, 2));
    console.log('params:', params);
}).end().listen();


// Test cases
var cases = ['/SimpleRouter?no=1&fcid=2', '/SimpleRouter?fcid=1&no=2', '/SimpleRouter?no&fcid=2', '/SimpleRouter',
    '/SimpleRouter?no=9#fcid=7'
];
$.each(cases, function (idx, href) {
    $('.navigation').append($('<li/>').append($('<a/>', {
        href: href
    }).text(href)))
});
$('.navigation a').click(function (e) {
    e.preventDefault();
    var href = $(this).attr('href');
    sr.nav(href);
});
},{}]},{},[1]);
