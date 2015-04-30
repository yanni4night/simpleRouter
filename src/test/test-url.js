/**
 * Copyright (C) 2015 yanni4night.com
 * test-url.js
 *
 * changelog
 * 2015-04-28[11:02:11]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
var Url = require('../url');

var assert = require('assert');

describe('Url', function () {
    describe('#getUrl()', function () {
        it('should get the correct url', function () {
            var urlStr = '/doc/?a=1#mark';
            assert.equal(urlStr, new Url(urlStr).getUrl());
        });
    });
    describe('#setUrl()', function () {
        it('should set the correct url', function () {
            var url = new Url('');
            var urlStr = '/doc/?a=1#mark';
            assert.equal(urlStr, url.setUrl(urlStr));
            assert.equal(urlStr, url.getUrl());
        });
    });
    describe('#getPath()', function () {
        it('should find the correct path', function () {
            assert.equal('/doc/', new Url('/doc/?a=1#mark').getPath());
        });
    });
    describe('#getHash()', function () {
        it('should find the correct hash', function () {
            assert.equal('mark', new Url('/doc/?a=1#mark').getHash());
            assert.equal('mark?a=1', new Url('/doc/#mark?a=1').getHash());
        });
    });
    describe('#removeHash()', function () {
        it('should remove the hash', function () {
            var url = new Url('/doc/?a=1#mark');
            assert.equal('/doc/?a=1', url.removeHash());
            assert.equal('/doc/?a=1', url.getUrl());
        });
    });
    describe('#getSearch()', function () {
        it('should find the correct search', function () {
            assert.equal('a=1', new Url('/doc/?a=1#mark').getSearch());
            assert.equal('', new Url('/doc/#mark?a=1').getSearch());
        });
    });
    describe('#getSearch(true)', function () {
        it('should find the correct splited search', function () {
            var searches = new Url('/doc/?a=1&b=2#mark').getSearch(true);
            assert.equal('1', searches.a);
            assert.equal('2', searches.b);
        });
    });
    describe('#mergeParam()', function () {
        it('should merge search', function () {
            var url = new Url('/doc/?a=1&b=2#mark');
            url.mergeParam({
                b: 3,
                c: 4
            });
            var searches = url.getSearch(true);
            assert.equal('1', searches.a);
            assert.equal('3', searches.b);
            assert.equal('4', searches.c);
            assert.equal('/doc/', url.getPath());
            assert.equal('mark', url.getHash());
        });
    });
    describe('#clone()', function () {
        it('should clone', function () {
            var urlStr = '/doc/?a=1#mark';
            assert.equal(urlStr, new Url(urlStr).clone().getUrl());
        });
    });
});