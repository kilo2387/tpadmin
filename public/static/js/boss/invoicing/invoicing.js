/**
 * Created by xjw on 2016/9/9.
 */
BOSS.Invoicing = {
    modalVisit : $('#modal_visit'),
    modalRemittance : $('#modal_remittance'),
    modalStatus : $('#modal_status'),
    requestExtend : 'Invoicing',
    filed : {},
    init : function () {
        this.Menu.init();
    },
    /**
     * 定义ajax请求
     * @param requestLink 请求链接
     * @param filter 传输的数据
     * @param suc
     * @param err
     */
    getAjax : function (requestLink, filter, suc, err) {
        $.ajax({
            url:requestLink,
            type: 'POST',
            data: filter,
            dataType: 'json',
            success: function(d){
                suc && suc(d);
            },
            error : function(){
                err && err();
            }
        });
    },
    
    Menu : {
        init : function () {
            var Invoicing = BOSS.Invoicing,
                now = new Date(),
                begDate = new Date(now.getTime() - 24 * 30 * 3600000), // 前1个月时间
                endDate = new Date(now.getTime() + 24 * 1 * 3600000), // 明天
                begDate = BOSS.Util.formatDate(begDate, 'yy-MM-dd'),
                endDate = BOSS.Util.formatDate(endDate, 'yy-MM-dd'),

                $urlParam = BOSS.Util.getUrlParamList(),
                filter = {};
            var recordedDate = BOSS.Util.formatDate(new Date(now.getTime()), 'yy-MM-dd');
            $('input[name="date"]').val(recordedDate);
            // filter.search = BOSS.valid.checkEmptyObj($urlParam);   //判断是否为搜索

            filter.url = window.location.href;

            if($urlParam.search != null && $urlParam.search != 'undefined' && $urlParam.search != ""){
                filter.search = $urlParam.search;
            }

            //分页
            if($urlParam.page != null && $urlParam.page != 'undefined' && $urlParam.page != ""){
                filter.page = $urlParam.page < 1 ? 1 : $urlParam.page;
            }

            //开始时间
            if($urlParam.begDate != null && $urlParam.begDate != 'undefined' && $urlParam.begDate != ""){
                $('input[name="begDate"]').val($urlParam.begDate);
                filter.begDate = $urlParam.begDate;
            } else {
                $('input[name="begDate"]').val(begDate);
            };

            //结束时间
            if($urlParam.endDate != null && $urlParam.endDate != 'undefined' && $urlParam.endDate != ""){
                $('input[name="endDate"]').val($urlParam.endDate);
                filter.endDate = $urlParam.endDate;
            } else {
                $('input[name="endDate"]').val(endDate);
            }

            //时间选择器
            BOSS.Util.datePicker($('input[name="begDate"]'), $('input[name="endDate"]'));

            //渠道
            if($urlParam.channel != null && $urlParam.channel != 'undefined' && $urlParam.channel != ""){
                $('select[name="channel"] option[value="' + $urlParam.channel +'"]').attr("selected", true);
                filter.channel = $urlParam.channel;
            }
            //门店
            if($urlParam.organization_id != null && $urlParam.organization_id != 'undefined' && $urlParam.organization_id != ""){
                $('select[name="organization_id"] option[value="' + $urlParam.organization_id +'"]').attr("selected", true);
                filter.organization_id = $urlParam.organization_id;
            }
            //城市经理
            if($urlParam.city_manager != null && $urlParam.city_manager != 'undefined' && $urlParam.city_manager != ""){
                $('select[name="city_manager"] option[value="' + $urlParam.city_manager +'"]').attr("selected", true);
                filter.city_manager = $urlParam.city_manager;
            }
            //渠道经理
            if($urlParam.channel_manager != null && $urlParam.channel_manager != 'undefined' && $urlParam.channel_manager != ""){
                $('select[name="channel_manager"] option[value="' + $urlParam.channel_manager +'"]').attr("selected", true);
                filter.channel_manager = $urlParam.channel_manager;
            }
            //状态
            if($urlParam.status != null && $urlParam.status != 'undefined' && $urlParam.status != ""){
                var $statusStr = decodeURIComponent($urlParam.status),
                    $statusObj = $statusStr.split(",");
                $.each($statusObj, function (i,item) {
                    $('.order-status-list input[value="' + item + '"]').parent().click();
                });
                filter.status = $statusStr;
            }

            //查找类型
            if($urlParam.searchType != null && $urlParam.searchType != 'undefined' && $urlParam.searchType != ""){
                $('select[name="search_type"] option[value="' + $urlParam.searchType +'"]').attr("selected", true);
                filter.searchType = $urlParam.searchType;
            }

            //关键词
            if($urlParam.searchWord != null && $urlParam.searchWord != 'undefined' && $urlParam.searchWord != ""){
                $('input[name="searchWord"]').val(decodeURIComponent($urlParam.searchWord));
                filter.searchWord = decodeURIComponent($urlParam.searchWord);
            }

            //获取订单列表
            Invoicing.Menu.getOrders(BOSS.api.getOrders + '?requestExtend=' + Invoicing.requestExtend, filter);

            //查看回访数据
            Invoicing.modalVisit.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), orderId = button.data('id'), data = {orderId : orderId},
                    validateParams = {
                        comment : {
                            required: true,
                            minlength: 10,
                            maxlength: 30
                        }
                    };
                model.find('[name="orderId"]').attr('value', orderId);
                Invoicing.Menu.checkValidate(Invoicing.modalVisit, validateParams);
                Invoicing.Menu.getVisit(BOSS.api.returnVisit, data);
            });

            //查看订单退款信息
            Invoicing.modalRemittance.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), orderId = button.data('id'), data = {orderId : orderId},
                    validateParams = {
                        amount : {
                            required: true,
                        },
                        date : {
                            required: true,
                        },
                        comment : {
                            required: true,
                            minlength: 3,
                            maxlength: 100
                        }
                    };
                model.find('[name="orderId"]').attr('value', orderId);
                Invoicing.Menu.checkValidate(Invoicing.modalRemittance, validateParams);
                Invoicing.Menu.getOrder(BOSS.api.returnOrder, data, model);
            });

            //搜索订单信息
            $('body').on('click', '#order-search', function () {
                var url = Invoicing.Menu.searchOrExplodeMap('search');
                location.href = url;
            });
            //根据渠道获取门店option
            $('body').on('change', '#zt_channel', function(){
                BOSS.Invoicing.Menu.getOrganization();
            });
            //根据城市经理获取渠道经理option
            $('body').on('change', '#city_manager', function(){
                BOSS.Invoicing.Menu.getChannelManager();
            })

            //根据搜索条件到处execel表格
            $('body').on('click','#order-excel',function(){
                var url = Invoicing.Menu.searchOrExplodeMap('excel');

                location.href = url;

            })
        },
        /**
         * 搜索和导出条件
         * @param ac
         * @returns {string}
         */
        searchOrExplodeMap : function(ac){
            var channel = $('select[name="channel"]').val(),
                organization_id = $('select[name="organization_id"]').val(),
                city_manager = $('select[name="city_manager"]').val(),
                channel_manager = $('select[name="channel_manager"]').val(),
                $statusBox = $('#modal_status .order-status-list'),
                $status = $statusBox.find('[name="status"]:checked'),
                $statusObj = [],
                searchWord = $('input[name="searchWord"]').val(),
                begDate = $('input[name="begDate"]').val(),
                endDate = $('input[name="endDate"]').val(),
                searchType = $('select[name="search_type"]').val();

            switch (ac){
                case 'search':
                    var url = location.href;
                    break;
                case 'excel':
                    url = '/Excel/excelOrders';
                    break;
                default :
                    var url = location.href;
            }


            url = BOSS.Util.updateUrlParams(url, 'search', false, 'page');

            //状态选项处理
            if($status.length > 0){
                $.each($status, function (i, item) {
                    $statusObj.push($(item).val());
                });
            } else {
                $statusObj.push(0);
            }

            //渠道搜索处理
            if(channel && channel != 0){
                url = BOSS.Util.updateUrlParams(url, 'channel', channel, 'page');
            } else {
                url = BOSS.Util.deleteUrlParams(url, 'channel');
            }
            //门店
            if(organization_id && organization_id != 0){
                url = BOSS.Util.updateUrlParams(url, 'organization_id', organization_id, 'page');
            } else {
                url = BOSS.Util.deleteUrlParams(url, 'organization_id');
            }

            //城市经理
            if(city_manager && city_manager != 0){
                url = BOSS.Util.updateUrlParams(url, 'city_manager', city_manager, 'page');
            } else {
                url = BOSS.Util.deleteUrlParams(url, 'city_manager');
            }

            //渠道经理
            if(channel_manager && channel_manager != 0){
                url = BOSS.Util.updateUrlParams(url, 'channel_manager', channel_manager, 'page');
            } else {
                url = BOSS.Util.deleteUrlParams(url, 'channel_manager');
            }

            //状态搜索处理
            if($statusObj && $statusObj != 0){
                url = BOSS.Util.updateUrlParams(url, 'status', $statusObj, 'page');
            } else {
                url = BOSS.Util.deleteUrlParams(url, 'status');
            }

            //时间搜索处理
            url = BOSS.Util.updateUrlParams(url, 'begDate', begDate);
            url = BOSS.Util.updateUrlParams(url, 'endDate', endDate);

            //搜索方式处理
            if(searchType && searchType != 0){
                url = BOSS.Util.updateUrlParams(url, 'searchType', searchType, 'page');
            } else {
                url = BOSS.Util.deleteUrlParams(url, 'searchType');
            }

            //关键词搜索处理
            if(searchWord){
                url = BOSS.Util.updateUrlParams(url, 'searchWord', $.trim(searchWord), 'page');
            } else {
                url = BOSS.Util.deleteUrlParams(url, 'searchWord');
            }
            return url;
        },
        /**
         * 获取级联门店
         * @param cityIdName
         * @param areaIdName
         */
        getOrganization : function () {
            var channel_id = $("#zt_channel").val();
            $.get('http://' + BOSS.domain + '/Invoicing/getOrganization',{"channel_id":channel_id},function(oData){
                var el1 = $('#organization_id');
                el1.empty();
                var option_str = "<option value=''>选择门店</option>";
                if(oData!=null){
                    $.each(oData,function(i,val){
                        option_str += "<option value='"+i+"'>"+val+"</option>";
                    })
                }
                el1.append(option_str);
                BOSS.Invoicing.Menu.selectReset(el1);
            })
        },
        /**
         * 获取级联渠道经理
         * @param cityIdName
         * @param areaIdName
         */
        getChannelManager : function () {
            var boss_user_id = $("#city_manager").val();
            $.get('http://' + BOSS.domain + '/Invoicing/getChannelManager',{"boss_user_id":boss_user_id},function(oData){
                var el1 = $('#channel_manager');
                el1.empty();
                var option_str = "<option value=''>选择渠道经理</option>";
                if(oData!=null){
                    $.each(oData,function(i,val){
                        option_str += "<option value='"+i+"'>"+val+"</option>";
                    })
                }
                el1.append(option_str);
                BOSS.Invoicing.Menu.selectReset(el1);
            })
        },
        /**
         * select表单重置
         * @param element
         */
        selectReset : function(element){
            element.selectpicker('refresh');
            element.selectpicker('show');
        },
        /**
         * 获取订单回访数据
         * @param requestLink  请求链接
         * @param data 传输的数据
         */
        getVisit : function (requestLink, data) {
            BOSS.Invoicing.getAjax(requestLink, data,function (d) {
                if(d){
                    BOSS.Invoicing.visitTemplate.draw(d.data);
                } else {
                    BOSS.floatTips.errorTips('获取回访数据失败。');
                }
            }, 0);
        },
        /**
         * 获取单个订单信息
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getOrder : function (requestLink, data, model) {
            BOSS.Invoicing.getAjax(requestLink, data,function (d) {
                if(d){
                    BOSS.Invoicing.orderTemplate.draw(d.data);
                    model.find('[name="amount"]').attr('value', d.data.fpay_out_price);
                } else {
                    BOSS.floatTips.errorTips('获取订单数据失败。');
                }
            }, 0);
        },

        /**
         * 获取订单列表
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getOrders : function (requestLink, data) {
            BOSS.Invoicing.getAjax(requestLink, data,function (d) {
                if(d.data){
                    BOSS.Invoicing.ordersListTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                    $('.orders-prices').text(d.data.prices);
                } else {
                    BOSS.Invoicing.ordersListTemplate.draw();
                    $('.orders-num').text(0);
                    $('.orders-prices').text(0);
                    BOSS.floatTips.errorTips('暂无数据。');
                }
            }, 0);
        },
        /**
         * 验证并提交请求
         * @param model
         * @param validateParams
         */
        checkValidate : function (model, validateParams) {
            var $parentBox = model.find('form');
            $parentBox.validate({
                debug: true,
                ignore: [],
                rules: validateParams,
                submitHandler : function () {
                    if($parentBox.hasClass('form-visit')){
                        BOSS.Invoicing.getAjax(BOSS.api.addRecord, $parentBox.serialize(), function (d) {
                            if(d.data){
                                BOSS.floatTips.successTips('订单回访添加成功，页面将在2秒后刷新。');
                                setTimeout(function () {
                                    window.location.reload();
                                }, 2000);
                            } else {
                                BOSS.floatTips.errorTips('订单回访添加失败，页面将在2秒后刷新。');
                                setTimeout(function () {
                                    window.location.reload();
                                }, 2000);
                            }
                            model.hide();
                        }, 0);
                    } else {
                        BOSS.Invoicing.getAjax(BOSS.api.addRefundOrderRecord, $parentBox.serialize(), function (d) {
                            if(d.data){
                                BOSS.floatTips.successTips('添加成功，页面将在2秒后刷新。');
                                setTimeout(function () {
                                    window.location.reload();
                                }, 2000);
                            } else {
                                BOSS.floatTips.errorTips('添加失败，页面将在2秒后刷新。');
                                setTimeout(function () {
                                    window.location.reload();
                                }, 2000);
                            }
                            model.hide();
                        }, 0);
                    }
                }
            });
        }
    },
    //订单回访数据模板
    visitTemplate : {
        draw : function (data) {
            var listStr = '',listDom, list = $('#modal_visit .table tbody'), item = $('tr', list);
            $.get('http://' + BOSS.domain + '/Invoicing/visitTemplate.html',function(template){
                if(item.length){
                    for(var i=0; i<item.length; i++){
                        $(item[i]).remove();
                    }
                }
                if(data){
                    for (var i=0; i<data.length; i++){
                        data[i].fcreatetime = BOSS.string.replaceHTML(data[i].fcreatetime);
                        data[i].fcomment = BOSS.string.replaceHTML(data[i].fcomment);
                        data[i].foperator_name = BOSS.string.replaceHTML(data[i].foperator_name);
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="3">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.append(listDom);
            });
        },
    },
    //单个订单数据模板
    orderTemplate : {
        draw : function (data) {
            var listStr = '',listDom, list = $('#modal_remittance ul.list-group'), item = $('.list-group-item', list);
            $.get('http://' + BOSS.domain + '/Invoicing/orderTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if (data) {
                    data.forder_id = BOSS.string.replaceHTML(data.forder_id);//订单号
                    data.fimei = BOSS.string.replaceHTML(data.fimei);//IEMI
                    data.fproduct_name = BOSS.string.replaceHTML(data.fproduct_name);//手机型号
                    data.fpay_out_price = BOSS.string.replaceHTML(data.fpay_out_price);//回收金额
                    data.fchannel_name = BOSS.string.replaceHTML(data.fchannel_name);//回收网店
                    listStr = tmpl(template, data);
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        },
    },
    ordersListTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.order-list table tbody'), item = $('tr', list);
            // 引用 View/Invoicing/OrderListTemplate.html 
            $.get('http://' + BOSS.domain + '/Invoicing/OrderListTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if(!BOSS.valid.checkEmptyObj(data) && data != null){
                    for (var i=0; i<data.length; i++){
                        data[i].forder_id = BOSS.string.replaceHTML(data[i].forder_id);
                        data[i].fproduct_name = BOSS.string.replaceHTML(data[i].fproduct_name);
                        data[i].fimei = BOSS.string.replaceHTML(data[i].fimei);
                        data[i].fchannel_name = BOSS.string.replaceHTML(data[i].fchannel_name);
                        data[i].forganization_name = BOSS.string.replaceHTML(data[i].forganization_name);
                        data[i].fuser_name = BOSS.string.replaceHTML(data[i].fuser_name);
                        data[i].fuser_desc = BOSS.string.replaceHTML(data[i].fuser_desc);
                        data[i].fphone_num = BOSS.string.replaceHTML(data[i].fphone_num);
                        data[i].fpay_out_time = BOSS.string.replaceHTML(data[i].fpay_out_time);
                        data[i].forder_status_name = BOSS.string.replaceHTML(data[i].forder_status_name);
                        data[i].fpay_out_price = BOSS.string.replaceHTML(data[i].fpay_out_price);
                        data[i].fcreatetime = BOSS.string.replaceHTML(data[i].fcreatetime);
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="13" rowspan="5">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        }
    }
}
BOSS.Invoicing.init();