/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.Inventory = {
    productTransfer : $('#product_transfer'),
    productTransferWhere : $('#transfer_where'),
    productOutside : $('#product_outside'),
    requestExtend : 'Inventory',

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
            var Inventory = BOSS.Inventory,
                now = new Date(),
                begDate = new Date(now.getTime() - 24 * 30 * 3600000), // 前1个月时间
                endDate = new Date(now.getTime() + 24 * 1 * 3600000), // 明天
                begDate = BOSS.Util.formatDate(begDate, 'yy-MM-dd'),
                endDate = BOSS.Util.formatDate(endDate, 'yy-MM-dd'),
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

            if($urlParam.storageHouse != null && $urlParam.storageHouse != 'undefined' && $urlParam.storageHouse != ""){
                filter.storageHouse = decodeURIComponent($urlParam.storageHouse);
            };

            //获取库存列表
            Inventory.Menu.getInventorys(BOSS.api.getInventoryData + '?requestExtend=' + Inventory.requestExtend, filter);

            //搜索库存信息
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
                //时间搜索处理
                url = BOSS.Util.updateUrlParams(url, 'begDate', begDate);
                url = BOSS.Util.updateUrlParams(url, 'endDate', endDate);

                location.href = url;
            });

            //优品仓
            $('body').on('click', '#storage_house', function () {
                var storageHouseVal = $(this).attr("data-id");
                var curUrl = BOSS.Util.updateUrlParams(location.href, 'storageHouse', storageHouseVal, 'page');
                var paramArr = new Array('begDate','endDate','channelType','searchWord','searchType');
                for(var i=0; i<5; i++){
                    curUrl = BOSS.Util.deleteUrlParams(curUrl,paramArr[i]);
                }
                location.href = curUrl;

            });


            //active切换
            if($("#ypc_checked").val()==2){
                $(".warehouse_1").removeClass('active');
                $(".warehouse_2").addClass('active');
            }
            //出库
            Inventory.productOutside.one('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), inventoryId = button.data('id'),
                    validateParams = {};
                model.find('[name="inventoryId"]').attr('value', inventoryId);
                Inventory.Menu.checkValidate(model, validateParams, BOSS.api.productOutsides);
            });
            //单个商品调拨
            Inventory.productTransfer.one('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), inventoryId = button.data('id'),
                    toStorageHouse = model.find('[name="storage_house"]').val(),
                    validateParams = {};
                model.find('[name="inventoryId"]').attr('value', inventoryId);
                if(toStorageHouse==1){
                    $("#allot_msg").text("确认将该条记录调拨到 中转仓 吗？");
                }
                if(toStorageHouse==2){
                    $("#allot_msg").text("确认申请将该条记录调拨到 优品仓 吗？");
                }
                Inventory.Menu.checkValidate(model, validateParams, BOSS.api.oneAllot);
            });
            //批量调拨
            Inventory.productTransferWhere.one('show.bs.modal', function () {
                var models = $(this), validateParams = {};
                    Inventory.Menu.checkValidate(models, validateParams, BOSS.api.batchAllot);

            });
        },
        /**
         * 验证并提交请求
         * @param model
         * @param validateParams
         */
        checkValidate : function (model, validateParams, goUrl) {
            var $parentBox = model.find('form');
            $parentBox.validate({
                debug: true,
                ignore: [],
                rules: validateParams,
                submitHandler : function () {
                        BOSS.Inventory.getAjax(goUrl, $parentBox.serialize(), function (d) {
                            if (d.errcode == 0) {
                                BOSS.floatTips.successTips(d.errstr+'！页面将在2秒内刷新');
                                setTimeout(function () {
                                    window.location.reload();
                                }, 2000);
                            } else {
                                BOSS.floatTips.errorTips(d.errstr);
                                setTimeout(function () {
                                    window.location.reload();
                                }, 2000);
                            }
                            model.hide();
                        }, 0);
                }

            });
        },

        /**
         * 获取库存列表
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getInventorys : function (requestLink, data) {
            BOSS.Inventory.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    BOSS.Inventory.inventoryTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                    $('.orders-prices').text(d.data.prices);
                } else {
                    BOSS.Inventory.inventoryTemplate.draw();
                    $('.orders-num').text(0);
                    $('.orders-prices').text(0);
                    BOSS.floatTips.errorTips('暂无数据。');
                }
            }, 0);
        },

    },

    /**
     * 获取待库存订单列表
     */
    inventoryTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.panel-body-table table tbody'), item = $('tr', list);
            // 引用 View/Inventory/inventoryListTemplate.html
            $.get('http://' + BOSS.domain + '/Inventory/inventoryListTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){
                        data[i].finventory_id = BOSS.string.replaceHTML(data[i].finventory_id);
                        data[i].fbatch = BOSS.string.replaceHTML(data[i].fbatch);
                        data[i].fseries_number = BOSS.string.replaceHTML(data[i].fseries_number);
                        data[i].fproduct_name = BOSS.string.replaceHTML(data[i].fproduct_name);
                        data[i].fimei = BOSS.string.replaceHTML(data[i].fimei);
                        data[i].fchannel_flag_name = BOSS.string.replaceHTML(data[i].fchannel_flag_name);
                        data[i].fstorage_type_name = BOSS.string.replaceHTML(data[i].fstorage_type_name);
                        if(data[i].foutlibrary_num == false || data[i].foutlibrary_num == undefined){
                            data[i].fstorage_amount = BOSS.string.replaceHTML(data[i].fstorage_amount);
                            data[i].fstorage_time = BOSS.string.replaceHTML(data[i].fstorage_time);
                        }else{
                            data[i].fstorage_amount = BOSS.string.replaceHTML(data[i].fback_amount);
                            data[i].fstorage_time = BOSS.string.replaceHTML(data[i].fstorage_outtime);
                        }

                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="9" rowspan="5">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        }
    },

}
BOSS.Inventory.init();