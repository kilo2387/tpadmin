/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.OutLibraryList = {
    requestExtend : 'Inventory',
    outLibraryGoBack: $('#outLibrary_goBack'),
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
            var OutLibraryList = BOSS.OutLibraryList,
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
            //出库仓
            if($urlParam.storageHouse != null && $urlParam.storageHouse != 'undefined' && $urlParam.storageHouse != ""){
                $('select[name="search_storage_house"] option[value="' + $urlParam.storageHouse +'"]').attr("selected", true);
                filter.storageHouse = $urlParam.storageHouse;
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

            //获取出库列表
            OutLibraryList.Menu.getOutLibraryList(BOSS.api.ajaxOutLibraryList, filter);

            //出库
            OutLibraryList.outLibraryGoBack.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), inventoryId = button.data('id'),
                    tdFlag = button.parent('td'),
                    validateParams = {
                        back_amount : {
                            required: true,
                        }
                    };
                var iMei = tdFlag.siblings('.td-text-iMei').text(),
                    product_name = tdFlag.siblings('.td-text-product_name').text(),
                    back_amount = tdFlag.siblings('.td-text-amount').text();
                $("#frm-show-iMei").text(iMei);
                $("#frm-show-product_name").text(product_name);
                model.find('[name="back_amount"]').attr('value', back_amount);
                model.find('[name="inventoryId"]').attr('value', inventoryId);
                OutLibraryList.Menu.checkValidate(model, validateParams);
            });


            //搜索出库信息
            $('body').on('click', '#order-search', function () {
                var searchType = $('select[name="search_type"]').val(),
                    searchWord = $('input[name="searchWord"]').val(),
                    begDate = $('input[name="begDate"]').val(),
                    endDate = $('input[name="endDate"]').val(),
                    channelType = $('select[name="channelType"]').val(),
                    storageHouse = $('select[name="search_storage_house"]').val(),
                    url = location.href;
                //渠道搜索处理
                if(channelType && channelType != 0){
                    url = BOSS.Util.updateUrlParams(url, 'channelType', channelType, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'channelType');
                }
                //出库仓
                if(storageHouse && storageHouse != 0){
                    url = BOSS.Util.updateUrlParams(url, 'storageHouse', storageHouse, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'storageHouse');
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
                    if ($parentBox.hasClass('product-goBack')) {
                        BOSS.OutLibraryList.getAjax(BOSS.api.productGoBack, $parentBox.serialize(), function (d) {
                            if (d.data != null) {
                                BOSS.floatTips.successTips('退回成功！页面将在2秒内刷新');
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
                }

            });
        },

        /**
         * 获取出库列表
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getOutLibraryList : function (requestLink, data) {
            BOSS.OutLibraryList.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    BOSS.OutLibraryList.outLibraryTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                    $('.orders-prices').text(d.data.prices);
                } else {
                    BOSS.OutLibraryList.outLibraryTemplate.draw();
                    $('.orders-num').text(0);
                    $('.orders-prices').text(0);
                    BOSS.floatTips.errorTips('暂无数据！');
                }
            }, 0);
        },

    },

    /**
     * 获取待出库订单列表
     */
    outLibraryTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.panel-body-table table tbody'), item = $('tr', list);
            // 引用 View/Inventory/outLibraryListTemplate.html
            $.get('http://' + BOSS.domain + '/Inventory/outLibraryListTemplate.html',function(template) {
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
                        data[i].fstorage_outtime = BOSS.string.replaceHTML(data[i].fstorage_outtime);

                        

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
BOSS.OutLibraryList.init();