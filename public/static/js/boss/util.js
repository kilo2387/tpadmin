/*================================================================*/
/*                         template engine                        */
/*================================================================*/
(function() {
    var cache = {};
    this.tmpl = function tmpl(str, data) {
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
                "with(obj){p.push('" +
                str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'") + "');}return p.join('');");
        return data ? fn(data) : fn;
    };
})();

/*================================================================*/
/*                       回收宝 Main Object                       */
/*================================================================*/
var BOSS = {};
/**
 * @namespace 通用工具
 */
BOSS.Util = {
    /**
     * Ajax工具, 支持自定义xhr
     * @param  {[type]} o 对象
     */
    ajax: function(o) {
        var xhr = (function() {
            var f;
            if (window.ActiveXObject) {
                f = function() {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                };
            } else if (window.XMLHttpRequest) {
                f = function() {
                    return new XMLHttpRequest();
                };
            } else {
                f = function() {
                    return;
                };
            }
            return f;
        })();

        var xmlHttp = o.xhr || xhr,
            complete, timeout;

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 1) {
                if (o.timeout && o.fail) { //超时
                    timeout = setTimeout(function() {
                        if (!complete) {
                            xmlHttp.abort();
                            o.fail();
                            xmlHttp = null;
                        }
                    }, o.timeout);
                }
            } else if (xmlHttp.readyState == 2) {
                if (o.send) {
                    o.send();
                }
            } else if (xmlHttp.readyState == 4) {
                complete = 1;
                if (xmlHttp.status == 200) {
                    o.success(xmlHttp.responseText);
                } else {
                    if (o.fail) {
                        clearTimeout(timeout);
                        o.fail();
                    }
                }
                xmlHttp = null;
            }
        }
        if (typeof o.data == 'object') {
            var data = [];
            for (var i in o.data) {
                data.push(i + '=' + encodeURIComponent(o.data[i]));
            }
            o.data = data.join('&');
        }
        if (o.type == 'get') {
            if (o.data == undefined) {
                xmlHttp.open('GET', o.url, true);
            } else {
                xmlHttp.open('GET', o.url + ((o.url.indexOf('?') != -1) ? '&' : '?') + o.data, true);
            }
            xmlHttp.send(null);
        } else {
            xmlHttp.open('POST', o.url, true);
            xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlHttp.send(o.data);
        }
        return xmlHttp;
    },
    /**
     * 将分转换为元（111分 == 1.11元）
     * @param {[Number]} money 钱
     */
    formatPenny: function(money) {
        if (!money || money == "")
            return 0;
        return (money / 100);
    },

    //反转义html代码
    escapeHtml: function(s) {
        var
            REGX_HTML_DECODE = /&\w+;|&#(\d+);/g,
            HTML_DECODE = {
                "&lt;": "<",
                "&gt;": ">",
                "&amp;": "&",
                "&nbsp;": " ",
                "&quot;": "\"",
                "©": ""
                    // ...
            };
        return (typeof s != "string") ? s :
            s.replace(REGX_HTML_DECODE,
                function($0, $1) {
                    var c = HTML_DECODE[$0];
                    if (c == undefined) {
                        if (!isNaN($1)) {
                            c = String.fromCharCode(($1 == 160) ? 32 : $1);
                        } else {
                            c = $0;
                        }
                    }
                    return c;
                });
    },

    //时间选择器
    datePicker : function (beginSelector,endSelector) {
        $(beginSelector).datepicker(
            {
                language:  "zh-CN",
                startView: 0,
                format: "yyyy-mm-dd",
                endDate:new Date()
            }).on('changeDate', function(ev){
            if(ev.date){
                $(endSelector).datepicker('setStartDate', new Date(ev.date.valueOf()))
            }else{
                $(endSelector).datepicker('setStartDate',null);
            }
        })

        $(endSelector).datepicker(
            {
                language:  "zh-CN",
                startView:0,
                format: "yyyy-mm-dd",
                endDate:new Date(new Date().getTime() + 24 * 1 * 3600000)
            }).on('changeDate', function(ev){
            if(ev.date){
                $(beginSelector).datepicker('setEndDate', new Date(ev.date.valueOf()))
            }else{
                $(beginSelector).datepicker('setEndDate',new Date());
            }

        })
    },

    /**
     * 获取指定名称的cookie值
     */
    getCookie: function(name) {
        var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"),
            m = document.cookie.match(r);
        return (!m ? "" : m[1]);
    },

    guid: function() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    },


    setCookie: function(name, value, expires, path, domain, secure) {
        var curCookie = name + "=" + escape(value) +
            ((expires) ? "; expires=" + expires.toGMTString() : "") +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");
        document.cookie = curCookie;
    },

    delCookie: function(name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = this.getCookie(name);
        if (cval != null)
            this.setCookie(name, cval, exp, '/', BOSS.domain);
    },

    times33: function(str) {
        var str = str || '';
        var hash = 5381;
        for (var i = 0, len = str.length; i < len; ++i) {
            hash += (hash << 5) + str.charCodeAt(i);
        }
        return hash & 0x7fffffff;
    },

    getUid: function() {
        var uid = BOSS.Util.getCookie('uid');
        if (!uid) {
            return 0;
        }
        return uid;
    },

    getFragment: function(url) {
        url = url || location.href;
        return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
    },

    /**
     * 获取url query参数或hash参数
     * @param name
     * @returns {string}
     */
    getUrlParam: function(name) {
        var re = new RegExp('(?:\\?|#|&)' + name + '=([^&#]*)(?:$|&|#)', 'i');
        var m = re.exec(window.location.href);
        return m ? m[1] : '';
    },

    /**
     *
     * 获取url query参数数组
     */
    getUrlParamList: function() { //
        var reg = /[^\?\&]+=[^\?\&]+/g,
            arr = location.search.match(reg),
            o = {};

        for (var i in arr) {
            var combo = arr[i].split('=');
            if (combo[0]) {
                o[combo[0]] = combo[1] || '';
            }
        }
        return o;
    },
    /**
     * 更新或增加url参数
     * @param url
     * @param name
     * @param value
     */
    updateUrlParams : function (url, name, value, removeParam) {
        var r = url || location.href;
        if (r != null && r != 'undefined' && r != "") {
            value = encodeURIComponent(value);
            var reg = new RegExp("(^|)" + name + "=([^&]*)(|$)"),tmp = name + "=" + value;
            if (url.match(reg) != null) {
                r = url.replace(eval(reg), tmp);
            }
            else {
                if (url.match("[\?]")) {
                    r = url + "&" + tmp;
                } else {
                    r = url + "?" + tmp;
                }
            }
        }
        if(removeParam != null && removeParam != 'undefined' && removeParam != ""){
            r = BOSS.Util.deleteUrlParams(r, removeParam);
        }
        return r;
    },

    deleteUrlParams : function (url, name) {
        var reg = new RegExp("(^|)" + name + "=([^&]*)(|$)");
        if (url.match(reg) != null) {
            var urlArray = url.split("?"),
                query = urlArray[1].split("&"),
                obj = {};
                for (var i = 0; i < query.length; i++) {
                    query[i] = query[i].split("=");
                    obj[query[i][0]] = query[i][1];
                };
            delete obj[name];
            url = urlArray[0]+ '?' + JSON.stringify(obj).replace(/[\"\{\}]/g,"").replace(/\:/g,"=").replace(/\,/g,"&");
            return url;
        } else {
            return url;
        }
    },

    newUnshift: function(data, item) {
        var newData = data;
        newData.unshift(item);
        return newData;
    },

    /**
     * 数字补零
     *
     * @param {Number} Number 数字
     * @return {Number} Number 补零位数
     * @return {String} String 补零后的字符串
     *            @example
     *            BOSS.Util.addZero(9,2); //返回 09
     */
    addZero: function(num, n) {
        n = n || 2;
        return Array(Math.abs(('' + num).length - (n + 1))).join(0) + num;
    },

    /**
     * 数字取小数点后两位
     *
     */
    toDecimal: function(number) {
        return Math.floor(number * 100) / 100
    },

    formPer: function(v) {
        if (v == "")
            return "";
        return (parseFloat(v)).toFixed(2) + '%';
    },
    /**
     * 格式化时间对象
     *
     * @param {Object} Object 时间对象
     * @param {String} String 时间格式
     * @return {String} String 格式化后的时间字符串
     *            @example
     *            var date = new Date();
     *            var dateString = BOSS.Util.formatDate(time,'yyyy-MM-dd hh:mm:ss');
     */
    formatDate: function(v, f) {
        var F = f.replace(/\W/g, ',').split(','),
            format = ['yyyy', 'MM', 'dd', 'hh', 'mm', 'ss', 'ww'];
        var date = {
            y: v.getFullYear(),
            M: v.getMonth() + 1,
            d: v.getDate(),
            h: v.getHours(),
            m: v.getMinutes(),
            s: v.getSeconds(),
            w: v.getDay()
        };
        for (var i = 0, num = F.length; i < num; i++) {
            var o = F[i];
            for (var j = 0; j < 7; j++) {
                var S = format[j].slice(-1);
                if (o.match(S)) {
                    if (S == 'w' && date[S] == 0) date[S] = 7; //Sunday
                    if (o.match(format[j])) {
                        f = f.replace(RegExp(format[j], 'g'), BOSS.Util.addZero(date[S]));
                    } else f = f.replace(RegExp(format[j].slice(format[j].length / 2), 'g'), date[S]);
                }
            }
        }
        return f;
    },

    updateTime: function(then, now) {
        if (!then) {
            return '';
        }
        var str = '',
            zeroPnt = t = Math.floor((+now + 8 * 3600) / 86400) * 86400 - 8 * 3600,
            Now = new Date(now * 1000),
            Then = new Date(then * 1000),
            Zero = new Date(zeroPnt * 1000),
            gapTime = now - then,
            gapZero = zeroPnt - then,
            minute = parseInt(gapTime / 60),
            hour = parseInt(gapTime / 3600),
            day = parseInt(gapTime / 86400),
            fullStr = BOSS.Util.formatDate(Then, 'yyyy年MM月dd日 hh:mm:ss');

        if (minute <= 0) {
            str = '刚刚';
        } else if (minute < 60) {
            str = minute + '分钟前';
        } else if (minute > 59 && day == 0 && gapZero <= 0) {
            str = '今天' + fullStr.split('日')[1];
        } else if (gapZero > 0 && gapZero < 86400) {
            str = '昨天' + fullStr.split('日')[1];
        } else if (Now.getFullYear() == Then.getFullYear()) {
            str = fullStr.split('年')[1];
        } else {
            str = fullStr;
        }
        return str || '';
    },

    updateTimeTwo: function(then, now) {
        if (!then) {
            return '';
        }
        var str = '',
            zeroPnt = t = Math.floor((+now + 8 * 3600) / 86400) * 86400 - 8 * 3600,
            Now = new Date(now * 1000),
            Then = new Date(then * 1000),
            Zero = new Date(zeroPnt * 1000),
            gapTime = now - then,
            gapZero = zeroPnt - then,
            minute = parseInt(gapTime / 60),
            hour = parseInt(gapTime / 3600),
            day = parseInt(gapTime / 86400),
            fullStr = BOSS.Util.formatDate(Then, 'MM月dd日 hh:mm:ss');

        if (minute <= 0) {
            str = '刚刚';
        } else if (minute < 60) {
            str = minute + '分钟前';
        } else if (minute > 59 && day == 0 && gapZero <= 0) {
            str = '今天' + fullStr.split('日')[1];
        } else if (gapZero > 0 && gapZero < 86400) {
            str = '昨天' + fullStr.split('日')[1];
        } else {
            str = fullStr;
        }
        return str || '';
    },

    storage: {
        isLSSupported: function() {
            if (window.localStorage) {
                return true;
            }
            return false;
        },

        /**
         * 将键值对写到LocalStorage
         * @param  {String} key   键
         * @param  {Object} value 值
         * @example
         *           BOSS.Util.storage.serialize('key', 'value');
         */
        serialize: function(key, value) { //写入localStorage
            if (typeof(key) == 'string') {
                var data = JSON.stringify(value);
                localStorage.setItem(key, data);
            }
        },

        /**
         * 从LocalStorage查找键对应的值
         * @param  {String} key   键
         * @return  {Object} value 值
         * @example
         *           var value = BOSS.Util.storage.deserialize('key');
         */
        deserialize: function(key) { //读取localStorage
            if (typeof(key) != 'string') return null;
            return JSON.parse(localStorage.getItem(key));
        },

        /**
         * 从LocalStorage中删除对应的值
         * @param  {String} key   键
         * @example
         *           BOSS.Util.storage.drop(QQT.header.DELAYED_BOSS_ID);
         */
        drop: function(key) {
            if (typeof(key) == 'string') {
                localStorage.removeItem(key);
            }
        }
    }
};

/**
 * @namespace 字符串工具
 */
BOSS.string = {
    /**
     * 获取字串长度(一个汉字算作2个字符)
     * @param  {String} str 原串
     * @return {Number}     字串长度
     */
    length: function(str) {
        var arr = (str || '').match(/[^\x00-\x80]/g);
        return str.length + (arr ? arr.length : 0);
    },

    trim: function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
    },

    ltrim: function(str) {
        return str.replace(/(^\s*)/g, "");
    },

    rtrim: function(str) {
        return str.replace(/(\s*$)/g, "");
    },
    l_rtrim: function(str) {
        return BOSS.string.ltrim(BOSS.string.rtrim(str));
    },
    /**
     * HTML编码(对' " < >字符进行转义)
     * @param  {String} str 原串
     * @return {String}     编码后的字串
     */
    replaceHTML: function(str) {
        if (str) return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#039;').replace(/"/g, '&quot;');
        return '';
    },

    /**
     * 正则转义
     * @param  {String} str 原串
     * @return {String}     转义后的字符串
     */
    escapeReg: function(str) {
        var buf = [];
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            switch (c) {
                case '.':
                case '$':
                case '^':
                case '{':
                case '[':
                case '(':
                case '|':
                case ')':
                case '*':
                case '+':
                case '?':
                case '\\':
                    buf.push('\\x' + c.charCodeAt(0).toString(16).toUpperCase());
                    break;
                default:
                    buf.push(c);
            }
        }
        return buf.join('');
    },
    subString: function(price, str) {
        var index = price.indexOf(str);
        if (index < 0) {
            return price;
        }
        return price.substring(index + 1);
    }
};

BOSS.floatTips = {
    successTips : function (text) {
        this._show('alert-success', text);
    },
    errorTips : function (text) {
        this._show('alert-danger', text);
    },
    infoTips : function (text) {
        this._show('alert-info', text);
    },
    _time : null,
    _show : function (style, text) {
        var $dom = $(tmpl(this.tipsTemplate, { style: style, text: text })),
            old = $('.alert');
        if (old.length) {
            old.replaceWith($dom);
        } else {
            $('.page-title').after($dom);
        }
    },
    tipsTemplate: [
        '<div class="panel-body">',
        '<div class="alert <%=style%>" role="alert">',
        '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' ,
        '<%=text%>' ,
        '</div>',
        '</div>'
    ].join(''),
}

BOSS.img = {

    /**
     * 加载图片
     * @param  {Object} list 图片Dom的jQuery对象列表
     * @param  {Number} type 图片类型
     * @example
     * var imgs = $('.phoneImg', container);
     * BOSS.img.load(imgs, 1);
     */
    load: function(list, type) {
        if (!list)
            return;

        var i = 0,
            len = list.length;
        for (; i < len; i += 1) {
            this.__loadimg(list[i], type);
        }
    },

    __loadimg: function(tImg, type) {

        var preloadImg = new Image(),
            newUrl = tImg.getAttribute('picurl');
        // cl = tImg.classList;

        preloadImg.onload = function() {
            switch (type) {
                case 1:
                    var parent = tImg.parentNode,
                        defaultImg = $('.slot-inner', $(parent))[0];

                    tImg.src = newUrl;
                    if (defaultImg) {
                        tImg.parentNode.removeChild(defaultImg);
                    }
                    break;
                default:
                    break;
            }
        }

        preloadImg.onerror = function() {

            switch (type) {
                case 1:
                    var parent = tImg.parentNode;
                    parent.removeChild(tImg);
                    break;
                default:
                    break;
            }
            this.onerror = null;
        }

        if (!newUrl) {
            preloadImg.onerror();
            return;
        }
        preloadImg.src = newUrl;
    }
}

BOSS.rootDomain = 'huishoubao.com.cn';
BOSS.domain = 'boss.huishoubao.com.cn';
BOSS.ajaxUrl = 'boss.huishoubao.com.cn/Ajax'
BOSS.ajaxChannel = 'boss.huishoubao.com.cn/AjaxChannel'
BOSS.cdnbase = $('.cdnbase').text() || '';
BOSS.spCdnBase = 'http://cdn.huishoubao.com.cn/';
BOSS.uploadImg = 'http://images.huishoubao.com.cn';
BOSS.page = {
    homePage: 'http://' + BOSS.domain + '/',
};

/**
 * @namespace 异步接口
 * @description api接口
 */
BOSS.api = {
    //*===================  登录  =====================*//
    login: 'http://' + BOSS.domain + 'Login/login',
    //*===================订单相关=====================*//
    //订单列表
    getOrders: 'http://' + BOSS.ajaxUrl + '/getOrders/',
    //获取单个订单信息
    returnOrder: 'http://' + BOSS.ajaxUrl + '/returnOrder/',
    //订单相关数据
    getOrdersAbout: 'http://' + BOSS.ajaxUrl + '/getOrdersAbout/',
    //库存相关数据
    getInventoryData : 'http://' + BOSS.ajaxUrl + '/getInventoryData/',
    //用户相关数据
    getActiveUserList: 'http://' + BOSS.ajaxUrl + '/getActiveUserList/',
    //渠道相关数据
    getChannelList: 'http://' + BOSS.ajaxChannel + '/getChannelList/',
    //上传渠道logo
    channelLogo : 'http://' + BOSS.domain + '/Channel/channelLogo/',
    //上传营业执照
    licenseLogo : 'http://' + BOSS.domain + '/Channel/licenseLogo/',
    //渠道信息更新
    editChannelInfo : 'http://' + BOSS.domain + '/Channel/editChannelInfo/',
    //获取估计模型计算和暂时信息
    getValuationCalcOrShow : 'http://' + BOSS.domain + '/Channel/getValuationCalcOrShow/',
    //获取报价方案描述内容
    getQuotationDescContent : 'http://' + BOSS.domain + '/Channel/getQuotationDescContent/',
    //获取近似方案描述
    getApproximationDescContent : 'http://' + BOSS.domain + '/Channel/getApproximationDescContent/',
    //门店相关数据
    getStoreList:'http://' + BOSS.ajaxChannel + '/getStoreList/',
    updateOrganization : 'http://' + BOSS.domain + '/Store/updateOrganization/',
    //渠道用户相关数据
    getChannelUserList:'http://' + BOSS.ajaxChannel + '/getChannelUserList/',
    channelUserList : 'http://' + BOSS.domain + '/ChannelMember/channelUserList/',
    saveChannelUserInfo: 'http://' + BOSS.domain + '/ChannelMember/saveChannelUserInfo/',
    //工号相关数据
    getUserNumberList:'http://' + BOSS.ajaxChannel + '/getUserNumberList/',
    //*===================在途管理=====================*//
    //搜索提交页面
    onWaySearch:'http://' + BOSS.domain + '/Invoicing/onWay/',
    //获取订单回访数据
    returnVisit: 'http://' + BOSS.ajaxUrl + '/returnVisit/',
    //添加订单回访
    addRecord: 'http://' + BOSS.domain + '/Invoicing/addRecord/',
    //添加2B订单退款标记
    addRefundOrderRecord: 'http://' + BOSS.domain + '/Invoicing/addRefundOrderRecord/',
    //*===================入库管理=====================*//
    productStorage : 'http://' + BOSS.domain + '/Storage/productStorage/',
    getStorageBatch : 'http://' + BOSS.domain + '/Storage/getStorageBatch/',
    //*===================库存管理=====================*//
    //库存管理-中转仓
    ajaxTransferList : 'http://' + BOSS.domain + '/Inventory/ajaxTransferList/',
    //库存管理-优品仓
    ajaxSuperiorProductsList : 'http://' + BOSS.domain + '/Inventory/ajaxSuperiorProductsList/',
    //单个调拨
    oneAllot : 'http://' + BOSS.domain + '/Inventory/oneAllot/',
    //批量调拨
    batchAllot : 'http://' + BOSS.domain + '/Inventory/batchAllot/',
    //调拨优品库审核通过
    allotPassInfo : 'http://' + BOSS.domain + '/AllotCheck/allotPassInfo/',
    //拒绝调拨申请
    rejectAllotApply : 'http://' + BOSS.domain + '/AllotCheck/rejectAllotApply/',
    //出库
    productOutsides : 'http://' + BOSS.domain + '/Inventory/productOutsides/',
    //申请调拨到优品仓
    ajaxAllotData : 'http://' + BOSS.domain + '/AllotCheck/ajaxAllotData/',
    //出库管理货物退回
    productGoBack : 'http://' + BOSS.domain + '/Inventory/productGoBack/',
    //出库管理-ajax请求列表数据
    ajaxOutLibraryList : 'http://' + BOSS.domain + '/Inventory/ajaxOutLibraryList/',
    //用户管理
    userList : 'http://' + BOSS.domain + '/User/userList/',
    //锁定用户
    userChangeStatus : 'http://' + BOSS.domain + '/User/userChangeStatus/',
    //重置密码
    restPassword : 'http://' + BOSS.domain + '/User/restPassword/',
    //保存过用户信息
    saveUserInfo: 'http://' + BOSS.domain + '/User/saveUserInfo/',
    //*===================栏目管理=====================*//
    //获取所有栏目
    getCatalog : 'http://' + BOSS.ajaxUrl + '/getCatelog/',
    //添加栏目
    addCatalog : 'http://' + BOSS.domain + '/catalog/add/',
    //修改栏目
    editCatalog : 'http://' + BOSS.domain + '/catalog/edit/',


    //*===================角色管理=====================*//

    getRoleList :  'http://' + BOSS.domain + '/role/getReadJson/',



    //*===================权限管理=====================*//
    //角色列表
    getRoleList :  'http://' + BOSS.domain + '/role/getReadJson/',
    //添加角色
    addRole :  'http://' + BOSS.domain + '/role/add/',
    //获取单个角色信息
    getOneRole :  'http://' + BOSS.domain + '/role/getOneRole/',
    //修改角色信息
    editRole :  'http://' + BOSS.domain + '/role/edit/',
    //启用、禁用
    enableRole :  'http://' + BOSS.domain + '/role/editStatus/',
    //权限树
    authorityTree :  'http://' + BOSS.domain + '/role/authorityTree/',
    //更新角色权限
    updateRoleAuthority :  'http://' + BOSS.domain + '/role/updateRoleAuthority/',

    //权限列表
    getAuthorityList :  'http://' + BOSS.domain + '/authority/getReadJson/',
    //添加权限
    addAuth :  'http://' + BOSS.domain + '/authority/add/',
    //修改权限
    editAuth :  'http://' + BOSS.domain + '/authority/edit/',
    //启用、禁用
    enableAuth :  'http://' + BOSS.domain + '/authority/editStatus/',

    //部门列表
    getDepartmentList : 'http://' + BOSS.domain + '/department/getReadJson/',
    //添加部门
    addDepartment :  'http://' + BOSS.domain + '/department/add/',
    //修改部门
    editDepartment :  'http://' + BOSS.domain + '/department/edit/',


    //*===================2B数据统计=====================*//

    //订单跟进
    getDiffList : 'http://' + BOSS.domain + '/diff/getReadJson/',
    //订单跟进excel导出
    getDiffExcelList : 'http://' + BOSS.domain + '/diff/getExcelJson/',
    //获得质检报告
    getReport : 'http://' + BOSS.domain + '/diff/getQualityReport/',
    //更新跟进备注
    editFollowUpNote : 'http://' + BOSS.domain + '/diff/edit/',
    //渠道日，月报
    getChannelReport : 'http://' + BOSS.domain + '/report/getReport/',
    //渠道日，月报excel下载
    getReportExcel : 'http://' + BOSS.domain + '/report/getReportExcel',
    //通过省份得到相应城市
    city_select : 'http://' + BOSS.domain + '/ajax/getCity/',
    //查看门店精英
    getElists : 'http://' + BOSS.domain + '/report/getElists/',
    //近15天趋势图
    getChart : 'http://' + BOSS.domain + '/report/getChart/',
    //城市月报
    getCtiyReport : 'http://' + BOSS.domain + '/report/getCtiyReport/',
    //app差异统计
    getAppReport : 'http://' + BOSS.domain + '/report/getAppReport/',

};





BOSS.Lock = {
    lock: function(e) {
        if (e && e.length) {
            if (e.hasClass('locked')) {
                return false;
            } else {
                e.addClass('locked');
                return true;
            }
        }
        return false;
    },
    unlock: function(e) {
        if (e && e.length) {
            e.removeClass('locked');
        }
    }
}

BOSS.valid = {
    checkEmpty: function(val) {
        if (val == undefined || val == null || BOSS.string.trim(val) == '') {
            return false;
        }
        return true;
    },

    checkNumber: function(val) {
        var reg = /^\d+$/;
        return (reg.test(val));
    },
    
    checkEmptyObj: function (obj) {
        for (var name in obj)
        {
            return false;
        }
        return true;
    }
}

/**
 * @namespace 通用控件
 */
BOSS.control = {};

BOSS.control.HTMLDeCode = function(str){
    var    s    =    "";
    if    (str.length    ==    0)    return    "";
    s    =    str.replace(/&gt;/g,">");
    s    =    s.replace(/&lt;/g," <");
    s    =    s.replace(/&nbsp;/g," ");
    s    =    s.replace(/'/g,"\'");
    s    =    s.replace(/&quot;/g,"\"");
    s    =    s.replace(/ <br>/g,"\n");
    return    s;
}

BOSS.control.page = function(p) {
    p.pageNow = p.pageNow || 1;
    this.init(p);
}
BOSS.control.page.prototype = {
    init: function(p) {

        var Self = this,
            param = {
                pageNum: p.pageNum || 1,
                pageNow: p.pageNow || 1,
                onPageSwitch: p.onPageSwitch || function() {}
            },
            pageHTML = tmpl(this.TMPL, param),
            newPageDom = $(pageHTML);

        //render
        if (!Self.pageDom) {
            p.pageDom.empty().append(newPageDom);
        } else {
            Self.pageDom.replaceWith(newPageDom);
        }
        Self.pageDom = newPageDom;
        Self.onSwitch = param.onPageSwitch;

        //set new doms
        Self.pagePrev = $('.page-prev', Self.pageDom);
        Self.pageNext = $('.page-next', Self.pageDom);
        Self.pageNums = $('.page-num', Self.pageDom);

        Self.pageFisrt = $('.page-first', Self.pageDom);
        Self.pageLast = $('.page-last', Self.pageDom);

        //第一页
        Self.pageFisrt.unbind().bind('click', function() {

            var newParam = param;
            if (!BOSS.Lock.lock(Self.pageDom)) {
                return false;
            }


            if (newParam.pageNow > 1) {
                newParam.pageNow = 1;
                Self.onSwitch(newParam.pageNow, function(suc) { //callback
                    if (!suc) {
                        BOSS.Lock.unlock(Self.pageDom);
                        return false;
                    }
                    Self.init(newParam);
                    BOSS.Lock.unlock(Self.pageDom);
                });
            } else {
                BOSS.Lock.unlock(Self.pageDom);
            }
        });


        //最后一页
        Self.pageLast.unbind().bind('click', function() {

            var newParam = param;
            if (!BOSS.Lock.lock(Self.pageDom)) {
                return false;
            }

            if (newParam.pageNow < pageNum) {
                newParam.pageNow = pageNum;
                Self.onSwitch(newParam.pageNow, function(suc) { //callback
                    if (!suc) {
                        BOSS.Lock.unlock(Self.pageDom);
                        return false;
                    }
                    Self.init(newParam);
                    BOSS.Lock.unlock(Self.pageDom);
                });
            } else {
                BOSS.Lock.unlock(Self.pageDom);
            }
        });

        //上一页
        Self.pagePrev.unbind().bind('click', function() {
            var newParam = param;
            if (!BOSS.Lock.lock(Self.pageDom)) {
                return false;
            }
            if (newParam.pageNow > 1) {
                newParam.pageNow -= 1;
                Self.onSwitch(newParam.pageNow, function(suc) { //callback
                    if (!suc) {
                        BOSS.Lock.unlock(Self.pageDom);
                        return false;
                    }
                    Self.init(newParam);
                    BOSS.Lock.unlock(Self.pageDom);
                });
            } else {
                BOSS.Lock.unlock(Self.pageDom);
            }
        });

        //下一页
        Self.pageNext.unbind().bind('click', function() {
            var newParam = param;
            if (!BOSS.Lock.lock(Self.pageDom)) {
                return false;
            }
            if (newParam.pageNow < newParam.pageNum) {
                newParam.pageNow += 1;
                Self.onSwitch(newParam.pageNow, function(suc) { //callback
                    if (!suc) {
                        BOSS.Lock.unlock(Self.pageDom);
                        return false;
                    }
                    Self.init(newParam);
                    BOSS.Lock.unlock(Self.pageDom);
                });
            } else {
                BOSS.Lock.unlock(Self.pageDom);
            }
        });

        //数字click事件
        Self.pageNums.unbind().bind('click', function(e) {
            var newParam = param,
                t = $(e.target),
                page = +(t.attr('page'));
            if (!BOSS.Lock.lock(Self.pageDom)) {
                return false;
            }
            newParam.pageNow = page;
            //console.log(newParam);
            Self.onSwitch(newParam.pageNow, function(suc) { //callback
                if (!suc) {
                    BOSS.Lock.unlock(Self.pageDom);
                    return false;
                }
                Self.init(newParam);
                BOSS.Lock.unlock(Self.pageDom);
            });
        });
    },

    /**
     * 翻页控件模板
     * {Number}    pageNum   总页数
     * {Number}    pageNow   当前页数
     * {Boolean}   right     是否靠右
     * {Boolean}   jump      是否支持直接跳转
     */
    TMPL: [
        '<% if(pageNum > 1){ %>',
            '<span class="btn-group">共计<%= pageNum %>页</span>',
            '<ul class="pagination pagination-sm pull-right">',
                //第一页
                '<li class="page-first <% if(pageNow == 1){ %>disabled<% } %>"><a href="javascript:void(0);"><span class="fa fa-angle-double-left"></span></a></li>',
                //上一页
                '<li class="page-prev <% if(pageNow == 1){ %>disabled<% } %>"><a href="javascript:void(0);"><span class="fa fa-angle-left"></span></a></li>',
                //中间页
                '<% var start, end; %>',
                '<% if(pageNow<=3){ %>',
                //前
                '<% start = 1; %>',
                '<% end = Math.min(pageNum, start+4); %>',
                '<% }else if(pageNow > pageNum-3){ %>',
                //后
                '<% end = pageNum; %>',
                '<% start = Math.max(1, end-4); %>',
                '<% }else{ %>',
                //中
                '<% start = pageNow-2; %>',
                '<% end = pageNow+2; %>',
                '<% } %>',
                '<% for(var i=start; i<=end; i++){ %>',
                    '<li class="page-num <% if(pageNow == i){ %> active <%}%>"><a href="javascript:void(0);" title="<%= i %>" page="<%= i %>"><%= i %></a></li>',
                '<% } %>',
                //下一页
                '<li class="page-next <% if(pageNow == pageNum){ %> disabled<% } %>"><a href="javascript:void(0);"><span class="fa fa-angle-right"></span></a></li>',
                //最后一页
                '<li class="page-last <% if(pageNow == pageNum){ %> disabled<% } %>"><a href="javascript:void(0);"><span class="fa fa-angle-double-right"></span></a></li>',
            '</ul>',
        '<% } %>'
    ].join(''),
};


BOSS.Word = {

    /**
     * 生成Excel
     * zhenglinzi
     * @param table   string    表ID
     **/
    Excel: (function() {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html><head><meta charset="UTF-8"></head><body><table>{table}</table></body></html>',
            base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) },
            format = function(s, c) {
                return s.replace(/{(\w+)}/g,
                    function(m, p) { return c[p]; }) }
        return function(table, name) {
            if (!table.nodeType) table = document.getElementById(table)
            var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
            window.location.href = uri + base64(format(template, ctx))
        }
    })(),

    Excel_Array:function(headArray , bodyArray){

        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html><head><meta charset="UTF-8"></head><body><table border="1" cellspacing="0" cellpadding="0"><%=table%></table></body></html>',
            base64 = function(s){ return  window.btoa(unescape(encodeURIComponent(s))) },

            tbhtml = '',
            i=0,j=0;

        //列头
        tbhtml += "<thead><tr>";
        for(i=0 ; i<headArray.length; i++){
            tbhtml += "<td>"+headArray[i]+"</td>";
        }
        tbhtml += "</tr></thead>";

        //内容
        tbhtml +="<tbody>";
        for(i=0;i<bodyArray.length;i++){
            var items = bodyArray[i];
            tbhtml+="<tr>";
            for(j=0;j<items.length;j++){
                tbhtml +="<td>"+items[j]+"</td>";
            }
            tbhtml+="</tr>";
        }
        tbhtml +="</tbody>";

        var excelHtml = tmpl(template,{table:tbhtml});

        window.location.href = uri + base64(excelHtml);

    }
};
