/**
 * Created by Administrator on 2016/10/11.
 */
BOSS.storageList = {
    productStorage : $('#product_storage'),
    storageBatch : $('#model_batch'),
    requestExtend : 'Storage',
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
            var storageList = BOSS.storageList,
                now = new Date(),
                begDate = new Date(now.getTime() - 24 * 30 * 3600000), // 前1个月时间
                begDate = BOSS.Util.formatDate(begDate, 'yy-MM-dd'),
                endDate = BOSS.Util.formatDate(now, 'yy-MM-dd'),
                $urlParam = BOSS.Util.getUrlParamList(),
                filter = {};

            filter.search = BOSS.valid.checkEmptyObj($urlParam);   //判断是否为搜索

            //当前链接地址
            filter.url = window.location.href;

            //当前页
            if($urlParam.page != null && $urlParam.page != 'undefined' && $urlParam.page != ""){
                filter.page = $urlParam.page < 1 ? 1 : $urlParam.page;
            };

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
            };

            //时间选择器
            BOSS.Util.datePicker($('input[name="begDate"]'), $('input[name="endDate"]'));

            //渠道类型
            if($urlParam.channelType != null && $urlParam.channelType != 'undefined' && $urlParam.channelType != ""){
                $('select[name="channelType"] option[value="' + $urlParam.channelType +'"]').attr("selected", true);
                filter.channelType = $urlParam.channelType;
            };

            //渠道
            if($urlParam.channel != null && $urlParam.channel != 'undefined' && $urlParam.channel != ""){
                $('select[name="channel"] option[value="' + $urlParam.channel +'"]').attr("selected", true);
                filter.channel = $urlParam.channel;
            };

            //订单状态
            if($urlParam.status != null && $urlParam.status != 'undefined' && $urlParam.status != ""){
                var $statusStr = decodeURIComponent($urlParam.status),
                    $statusObj = $statusStr.split(",");
                $.each($statusObj, function (i,item) {
                    $('.order-status-list input[value="' + item + '"]').parent().click();
                });
                filter.status = $statusStr;
            };

            //查找类型
            if($urlParam.searchType != null && $urlParam.searchType != 'undefined' && $urlParam.searchType != ""){
                $('select[name="search_type"] option[value="' + $urlParam.searchType +'"]').attr("selected", true);
                filter.searchType = $urlParam.searchType;
            }

            //关键词
            if($urlParam.searchWord != null && $urlParam.searchWord != 'undefined' && $urlParam.searchWord != ""){
                $('input[name="searchWord"]').val(decodeURIComponent($urlParam.searchWord));
                filter.searchWord = decodeURIComponent($urlParam.searchWord);
            };

            //获取订单列表
            storageList.Menu.getOrders(BOSS.api.getOrders + '?requestExtend=' + storageList.requestExtend, filter);

            //搜索订单信息
            $('body').on('click', '#order-search', function () {
                var searchType = $('select[name="search_type"]').val(),
                    searchWord = $('input[name="searchWord"]').val(),
                    begDate = $('input[name="begDate"]').val(),
                    endDate = $('input[name="endDate"]').val(),
                    channelType = $('select[name="channelType"]').val(),
                    url = location.href;

                //渠道搜索处理
                if(channelType && channelType != 0){
                    url = BOSS.Util.updateUrlParams(url, 'channelType', channelType, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'channelType');
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


                location.href = url;
            });

            //单个产品入库
            storageList.productStorage.one('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), orderId = button.data('id'),
                    validateParams = {};
                model.find('[name="orderId"]').attr('value', orderId);
                storageList.Menu.checkValidate(model, validateParams);
            });

            //撤销
            $('body').on('click', '.revoked', function () {
                $(this).closest('tr').remove();
            })
        },

        /**
         * 获取订单列表
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getOrders : function (requestLink, data) {
            BOSS.storageList.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    BOSS.storageList.storageListTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                    $('.orders-prices').text(d.data.prices);
                } else {
                    BOSS.storageList.storageListTemplate.draw();
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
                    BOSS.storageList.getAjax(BOSS.api.productStorage, $parentBox.serialize(), function (d) {
                        if(d.data != null){
                            BOSS.floatTips.successTips('入库成功，页面将在2秒后刷新。');
                            setTimeout(function () {
                                window.location.reload();
                            }, 2000);
                        } else {
                            BOSS.floatTips.errorTips(d.errstr);
                        }
                        model.hide();
                    }, 0);
                }
            });
        }
    },

    /**
     * 获取待入库订单列表
     */
    storageListTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.panel-body-table table tbody'), item = $('tr', list);
            // 引用 View/storage/storageListTemplate.html
            $.get('http://' + BOSS.domain + '/storage/storageListTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){
                        data[i].forder_id = BOSS.string.replaceHTML(data[i].forder_id);
                        data[i].fseries_number = BOSS.string.replaceHTML(data[i].fseries_number);
                        data[i].fproduct_name = BOSS.string.replaceHTML(data[i].fproduct_name);
                        data[i].fimei = BOSS.string.replaceHTML(data[i].fimei);
                        data[i].fchannel_flag_name = BOSS.string.replaceHTML(data[i].fchannel_flag_name);
                        data[i].forganization_name = BOSS.string.replaceHTML(data[i].forganization_name);
                        data[i].fpay_out_time = BOSS.string.replaceHTML(data[i].fpay_out_time);
                        data[i].forder_status_name = BOSS.string.replaceHTML(data[i].forder_status_name);
                        data[i].fpay_out_price = BOSS.string.replaceHTML(data[i].fpay_out_price);
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="13" rowspan="5">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        }
    },
}
BOSS.storageList.init();