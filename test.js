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

$(function() {
    'use strict';
    var sr = window.SimpleRouter;

    var output = function(msg) {
        $('.console').html(msg);
    };

    sr({}).map('/SimpleRouter?no=:no&fcid=:fcid').to(function(params) {
        output(JSON.stringify(params, null, 2));
        console.log(params);
    }).end().listen();


    // Test cases
    var cases = ['/SimpleRouter?no=1&fcid=2', '/SimpleRouter?fcid=1&no=2', '/SimpleRouter?no&fcid=2', '/SimpleRouter', '/SimpleRouter?no=9#fcid=7'];
    $.each(cases, function(idx, href) {
        $('.navigation').append($('<li/>').append($('<a/>', {
            href: href
        }).text(href)))
    });
    $('.navigation a').click(function(e) {
        e.preventDefault();
        sr.nav($(this).attr('href'));
    });
});