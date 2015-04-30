/**
 * Copyright (C) 2015 yanni4night.com
 * test-router.js
 *
 * changelog
 * 2015-04-28[12:03:22]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
var assert = require('assert');

require('../router');
var sr = window.SimpleRouter;

sr().listen();

describe('Router', function () {
    describe('#nav()', function () {
        it('should get the correct parameters', function (done) {

            sr.map('/doc/?num=:num&cid=:cid').to(function (params) {
                assert.equal(80, params.num);
                assert.equal(9, params.cid);
                done();
            }).end().nav('/doc/?num=80&cid=9');
        });

        it('should get the correct parameters', function (done) {

            sr.map('/time/?num=:num&cid=:cid').to(function (params) {
                assert.equal(80, params.num);
                assert.equal(9, params.cid);
                done();
            }).end().nav('/time/?cid=9&num=80');
        });

        it('should get the correct parameters', function (done) {

            sr.map('/time/?num=:num&cid=:cid').to(function (params) {
                assert.equal(80, params.num);
                assert.equal(undefined, params.cid);
                done();
            }).end().nav('/time/?num=80');
        });

        it('should get the correct parameters', function (done) {

            sr.map('/time/?num=:num&cid=:cid').to(function (params) {
                assert.equal(undefined, params.num);
                assert.equal(undefined, params.cid);
                done();
            }).end().nav('time/');
        });
    });

    describe('#updateParams()', function () {
        it('should get the correct parameters', function (done) {

            sr.nav('time/').map('/time/?num=:num&cid=:cid').to(function (params) {
                assert.equal(5, params.num);
                assert.equal(6, params.cid);
                assert.equal(undefined, params.sid);
                done();
            }).end().updateParams({
                num: 5,
                cid: 6,
                sid: 7
            });
        });
    });
});