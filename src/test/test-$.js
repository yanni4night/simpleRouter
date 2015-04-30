/**
 * Copyright (C) 2015 yanni4night.com
 * test-$.js
 *
 * changelog
 * 2015-04-30[11:50:45]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

var assert = require('assert');

var $ = require('../$');

describe('$', function () {
    describe('#each()', function () {
        it('should foreach every element in array', function () {
            var index = 0;
            $.each([2, 3, 4], function (idx, val) {
                if (1 === ++index) {
                    assert.deepEqual(idx, 0);
                    assert.deepEqual(val, 2);
                }
            });
        });
        it('should foreach every element in object', function () {
            $.each({
                    a: 1,
                    b: 2,
                    c: 3
                },
                function (key, val) {
                    switch (key) {
                    case 'a':
                        assert.deepEqual(1, val);
                        break;
                    case 'b':
                        assert.deepEqual(2, val);
                        break;
                    case 'c':
                        assert.deepEqual(3, val);
                        break;
                    default:
                        ;
                    }
                });
        });
    });

    describe('#extend()', function () {
        var a = {
            pn: 9
        };

        var b = $.extend(a, {
            num: 10
        }, {
            pn: 1
        });

        assert.deepEqual(b, a);
        assert.deepEqual(a.pn, 1);
        assert.deepEqual(a.num, 10);
    });

    describe('#isArray()', function () {
        assert.ok($.isArray([]));
        assert.ok(!$.isArray({
            length: 0
        }));
        assert.ok(!$.isArray(true));
        assert.ok(!$.isArray(arguments));
    });
});