(function () {

    var Path = {
        map: function (path) {
            if (!this.routes.defined[path]) {
                this.routes.defined[path] = new this.Route(path);
            }
            return this.routes.defined[path];
        },
        listened: false,
        listen: function () {
            this.listened = true;

            this.pushStateSupported = !!(window.history && window.history.pushState);
            this.oldIE = (navigator.userAgent.toLowerCase().search('msie') > 0) && (!document.documentMode ||
                document.documentMode < 8);

            var fn, path;
            var locationData = $.tb.location;
            if (this.pushStateSupported) {
                fn = function () {
                    Path.dispatch(locationData.getPathname() + locationData.getSearch());
                };

                window.onpopstate = fn;

                path = locationData.getPathname() + locationData.getSearch();
            } else {
                path = this.getHash();

                if (!this.oldIE) {
                    fn = function () {
                        Path.dispatch(locationData.getHash().replace('#', ''));
                    };
                    window.onhashchange = fn;
                } else {
                    fn = function () {
                        Path.dispatch(Path.getHash(Path.iframe.location));
                    };

                    this.iframe = document.createElement('<iframe src="javascript:0" tabindex="-1">');
                    this.iframe.style.display = 'none';
                    document.body.appendChild(this.iframe);
                    this.iframe = this.iframe.contentWindow;
                    this.iframe.document.open().close();
                    this.iframe.location.hash = path;

                    setInterval(fn, 50); // to be solved
                }

                if (path !== '') { //第一次不需要
                    this.execute(path);
                }

            }

            this.routes.current = path;

        },
        nav: function (path) {
            if (!this.listened) {
                return;
            }

            if (this.pushStateSupported) {
                window.history.pushState(null, null, path);
                this.dispatch(path);
            } else if (!this.oldIE) {
                $.tb.location.setHash(path);
            } else {
                // old IE
                this.iframe.document.open().close();
                this.iframe.location.hash = path;
            }
        },
        refresh: function () {
            this.execute(this.routes.current, true);
        },
        setDefaultAction: function (fn) {
            this.defaultAction = fn;
        },
        //------- private --------------
        Route: function (path) {
            this.action = null;
            this.path = path;
        },
        routes: {
            current: null,
            defined: {}
        },
        dispatch: function (path) {
            if (path === this.routes.current) {
                return;
            }
            this.routes.current = path;

            if (this.oldIE) {
                $.tb.location.setHash(path);
            }

            this.execute(path);

        },
        execute: function (path, refresh) {

            if (path === '') {
                path = $.tb.location.getPathname() + $.tb.location.getSearch();
            }

            var route, isMatch;
            for (var i in Path.routes.defined) {
                route = Path.routes.defined[i];
                isMatch = Path.match(route.path, path);
                if (isMatch) {
                    route.action.call(route, isMatch[0], isMatch.slice(1), refresh);
                    return;
                }
            }
            if (typeof this.defaultAction === 'function') {
                this.defaultAction.call(this, path, refresh);
            }

        },
        match: function (pattern, source) {
            var reg = /(\w+)=:\1/g;
            var matches;
            var ret = {};
            var patterns = [];

            var pattAskLoc = pattern.indexOf('?');
            var pattHostname = pattern.slice(pattAskLoc);
            
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
        },
        getHash: function (loc) {
            var match = "";
            if (loc) {
                match = loc.href.match(/#(.*)$/);
            } else {
                match = $.tb.location.getHref().match(/#(.*)$/);
            }
            return match ? match[1] : '';
        }
    };

    Path.Route.prototype = {
        to: function (fn) {
            this.action = fn;
        }
    };



    /**
     * 通用无刷新。
     *
     * @author yinyong02@baidu.com
     * @version 0.1.0
     * @desc 没用的东西
     */
    _.Module.define({
        path: 'pfrs/widget/CommonNoRefresh',
        sub: {
            xhr: null,
            cur_num: 0,
            pushState: false,
            rootUrl: null,
            notTop: false,
            initial: function (url, notTop) {
                var self = this;
                this.rootUrl = url;
                this.notTop = notTop;
                var pushState = this.pushState = !!(window.history && window.history.pushState);

                $('#refresh').click(function (e) { /*贴子页刷新按钮事件绑定*/
                    Path.refresh();
                    e.preventDefault();
                    return false;
                });

                this.initPagerClick();

                Path.map(pushState ? url.replace(/\bfcid=[^\?&]*/, 'fcid=:fcid').replace(
                    /\bscid=[^\?&]*/, 'scid=:scid') + ':num' : '/pn=:num').to(function (url, params,
                    refresh) {

                    self.fetchPage(+params[2], refresh, {
                        fcid: params[0],
                        scid: params[1]
                    });
                });

                Path.setDefaultAction(function (path, refresh) { /*找不到路由的时候的默认行为*/
                    if (path.replace('#', '') === '' || refresh) {
                        var num = path.match(/&pn=(\d+)/i);
                        num = num ? num[1] : (self.cur_num === undefined ? 0 : self.cur_num);
                        self.fetchPage(num, refresh);
                    }

                });

                Path.listen(); /*开始监听url变化*/

                $(document).on('local_deal_cates_changed', function (evt, fcid, scid) {
                    self._updateExtParams({
                        fcid: fcid,
                        scid: scid,
                        pn: 0
                    });
                });

                return this;
            },
            /*gotoTop: function () {
                var top = $(window).scrollTop();
                if (top > 0) {
                    window.scrollTo(0, 1);
                    setTimeout(function () {
                        window.scrollTo(0, 0);
                    }, 0);
                }
            },*/
            initPagerClick: function () {
                var self = this;
                $('#frs_list_pager').click(function (e) {
                    var locationData = $.tb.location;
                    var t = e.target,
                        key;

                    if (!PageData.user.is_login) {
                        var jumpUrl = 'http://tieba.baidu.com' + $.tb.unescapeHTML($(t).tbattr(
                            'href'));
                        window.open('/f/user/passport?jumpUrl=' + jumpUrl +
                            '&statsInfo=frs_pager#login_anchor');
                        return false;
                    } else {
                        if (t.tagName.toLowerCase() === 'a') {
                            key = t.getAttribute('href', 2).replace(locationData.getProtocol() +
                                '//' + locationData.getHost(), '');
                            if (!self.pushState) {
                                key = '/pn=' + key.match(/\d+$/);
                            }
                            Path.nav(key);
                            e.preventDefault();
                            return false;
                        }
                    }
                });
            },
            _mergeParamsToUrl: function (url, params) {
                for (var e in params) {
                    if (url.indexOf(e + '=') > -1) {
                        url = url.replace(new RegExp(e + '=[^&]*', 'ig'), e + '=' + encodeURIComponent(
                            params[e]));
                    } else {
                        url += '&' + e + '=' + encodeURIComponent(params[e]);
                    }
                }
                return url;
            },
            _updateExtParams: function (ids) {

                var replace = this._mergeParamsToUrl;

                $('#frs_list_pager a').each(function (idx, a) {
                    // 规避编译脚本对 attr 的检查，我可不想再因为 tbattr 使用
                    // replace('&amp;','&') 这种舍近求远的方式了。
                    var href = $.fn.attr.call($(a), 'href');
                    $.fn.attr.call($(a), 'href', replace(href));
                });
                var locationData = $.tb.location;
                var href = locationData.getHref().replace(locationData.getProtocol() + '//' +
                    locationData.getHost(), '');
                Path.nav(replace(href, ids));
                return this;
            },
            fetchPage: function (num, refresh, params) {
                var self = this;
                var _url = this.rootUrl + num + '&apage=1&t=' + (+new Date());
                if (params) {
                    _url = this._mergeParamsToUrl(_url, params);
                }

                if (refresh) {
                    _url += "&refresh=true";
                }

                if (self.xhr) {
                    if (self.cur_num === num && !params) { /*如果请求相同页 直接返回*/
                        return;
                    } else {
                        self.xhr.abort(); /*中断前一个请求*/
                    }
                }

                self.cur_num = num;

                self.xhr = $.get(_url, function (text) {
                    self.xhr = null;
                    /*if (self.notTop) { 
                        $(window).scrollTop($("#contet_wrap").offset().top - 10);
                    } else {
                        if (!Path.is_star) {
                            self.gotoTop();
                        } else {
                           
                            $(window).scrollTop($("#contet_wrap").offset().top - 10);
                            Path.is_star = false;
                        }
                    }
*/
                    setTimeout(function () {
                        var $liveContainer = $('#threadListGroupCnt').add(
                            "#thread_topic").add("#thread_pic");
                        if (refresh && $liveContainer.size() > 0) {
                            $liveContainer.nextAll().remove();
                            $('#content_leftList').append(text);
                        } else {
                            $('#content_leftList').empty().html(text); /*填充内容*/
                        }
                        self.initPagerClick(); /*由于区域包括了翻页区域 所以需要重新绑定事件*/
                    }, 0);

                }, 'text');
            }
        }
    });

})();