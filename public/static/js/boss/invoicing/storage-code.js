/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.storageCode = {
    requestExtend : 'Storage',
    storageBox : $('.storage-code table tbody'),
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
            var storageCode = BOSS.storageCode;
            $('input[name="fseries_number"]').focus();//条码输入框获取焦点


            //扫码获取产品信息
            $('body').on('keyup', 'input[name="fseries_number"]', function (event) {
                var $storageItem = $('tr', storageCode.storageBox),
                    filter = {};
                if(event.keyCode == 13){
                    filter.search = false;
                    filter.searchWord = $(this).val();
                    filter.searchType = 6;
                    if(filter.searchWord && filter.searchWord != ''){
                        //获取订单
                        storageCode.Menu.getOrder(BOSS.api.getOrders + '?requestExtend=' + storageCode.requestExtend, filter);
                        $('.phone-num').text($storageItem.length + 1);//统计已入库的手机数量
                    } else {
                        BOSS.floatTips.errorTips('请输入条码');
                    }
                    $('input[name="fseries_number"]').val("");
                }
            });


            //点击将产品入库
            $('body').on('click', 'button.storage-code', function () {
                var $storageItem = $('tr', storageCode.storageBox),
                    $parentBox = $('.order-search'),
                    data = {};
                data.batch = $parentBox.find('select[name="batch"]').val();
                data.storageHouseType = $parentBox.find('select[name="storageHouseType"]').val();
                data.orderId = [];
                $.each($storageItem, function (i, item) {
                    data.orderId.push($(item).attr('data-id'));
                });

                //产品入库
                storageCode.getAjax(BOSS.api.productStorage + '?is_batch=1', data, function (d) {
                    if(d.data != null){
                        BOSS.floatTips.successTips('入库成功，页面将在2秒后刷新。');
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    } else {
                        BOSS.floatTips.errorTips(d.errstr);
                    }
                }, 0);
            });
        },

        /**
         * 获取订单信息
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getOrder : function (requestLink, data) {
            BOSS.storageCode.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    console.log(d.data.data);
                    BOSS.storageCode.storageCodeTemplate.draw(d.data.data);
                } else {
                    BOSS.floatTips.errorTips('获取订单数据失败，请修改搜索条件。');
                }
            }, 0);
        },

    },

    /**
     * 获取待入库订单列表模板
     */
    storageCodeTemplate : {
        draw : function(data, isCode){
            isCode || (isCode = true);
            var listStr = '',listDom;
            // 引用 View/storage/storageCodeTemplate.html
            $.get('http://' + BOSS.domain + '/storage/storageCodeTemplate.html',function(template) {
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
                BOSS.storageCode.storageBox.append(listDom);
            });
        }
    },
}
BOSS.storageCode.init();