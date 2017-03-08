/**
 * Created by Administrator on 2016/10/11.
 */
BOSS.storageBatch = {
    productStorage : $('#product_storage'),
    // storageBatch : $('#model_batch'),
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
            var storageBatch = BOSS.storageBatch,
                now = new Date(),
                begDate = new Date(now.getTime() - 24 * 30 * 3600000), // 前1个月时间
                begDate = BOSS.Util.formatDate(begDate, 'yy-MM-dd'),
                endDate = BOSS.Util.formatDate(now, 'yy-MM-dd'),
                $urlParam = BOSS.Util.getUrlParamList(),
                filter = {};

            filter.search = BOSS.valid.checkEmptyObj($urlParam);   //判断是否为搜索

            //当前链接地址
            filter.url = window.location.href;

            //开始日期
            if($urlParam.begDate != null && $urlParam.begDate != 'undefined' && $urlParam.begDate != ""){
                $('input[name="begDate"]').val($urlParam.begDate);
                filter.begDate = $urlParam.begDate;
            } else {
                $('input[name="begDate"]').val(begDate);
            };

            //开始时间
            if($urlParam.begTime != null && $urlParam.begTime != 'undefined' && $urlParam.begTime != ""){
                $('input[name="begTime"]').val($urlParam.begTime);
                filter.begTime = decodeURIComponent($urlParam.begTime);
            };

            //结束日期
            if($urlParam.endDate != null && $urlParam.endDate != 'undefined' && $urlParam.endDate != ""){
                $('input[name="endDate"]').val($urlParam.endDate);
                filter.endDate = $urlParam.endDate;
            } else {
                $('input[name="endDate"]').val(endDate);
            };

            //结束时间
            if($urlParam.endTime != null && $urlParam.endTime != 'undefined' && $urlParam.endTime != ""){
                $('input[name="endTime"]').val($urlParam.endTime);
                filter.endTime = decodeURIComponent($urlParam.endTime);
            };

            //时间选择器
            BOSS.Util.datePicker($('input[name="begDate"]'), $('input[name="endDate"]'));

            //渠道类型
            if($urlParam.channelType != null && $urlParam.channelType != 'undefined' && $urlParam.channelType != ""){
                $('select[name="channelType"] option[value="' + $urlParam.channelType +'"]').attr("selected", true);
                filter.channelType = $urlParam.channelType;
            };

            //获取入库批次
            if(!BOSS.valid.checkEmptyObj($urlParam)){
                storageBatch.Menu.getStorageBatch(BOSS.api.getStorageBatch, filter);
            } else {
                $('.storage-batch table tbody').html('<tr><td class="text-center" colspan="4">暂无数据</td></tr>')
            }


            //搜索订单信息
            $('body').on('click', '#order-search', function () {
                var begDate = $('input[name="begDate"]').val(),
                    endDate = $('input[name="endDate"]').val(),
                    begTime = $('input[name="begTime"]').val(),
                    endTime = $('input[name="endTime"]').val(),
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
                url = BOSS.Util.updateUrlParams(url, 'begTime', begTime);
                url = BOSS.Util.updateUrlParams(url, 'endDate', endDate);
                url = BOSS.Util.updateUrlParams(url, 'endTime', endTime);
                location.href = url;

            });



            //批量入库
            $('body').on('click', 'button.storage-batch-btn', function () {
                var $storeBox = $('.storage-batch table tbody'),
                    $storageItem = $('tr', $storeBox),
                    $parentBox = $('.storage-batch-parent'),
                    data = {};
                data.batch = $parentBox.find('select[name="batch"]').val();
                data.storageHouseType = $parentBox.find('select[name="storageHouseType"]').val();
                data.orderId = [];
                $.each($storageItem, function (i, item) {
                    data.orderId.push($(item).attr('data-id'));
                });

                storageBatch.getAjax(BOSS.api.productStorage + '?is_batch=1', data, function (d) {
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


            //撤销
            $('body').on('click', '.revoked', function () {
                var product_num = $('.batch-num').text();
                $('.batch-num').text(parseInt(product_num) - 1);
                $(this).closest('tr').remove();
            })
        },

        /**
         * 获取入库批次
         * @param requestLink
         * @param data
         */
        getStorageBatch : function (requestLink, data) {
            BOSS.storageBatch.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    BOSS.storageBatch.storageBatchTemplate.draw(d.data.data);
                    $('.batch-num').text(d.data.num);
                } else {
                    BOSS.storageBatch.storageBatchTemplate.draw();
                    $('.batch-num').text();
                    BOSS.floatTips.errorTips('获取入库批次失败，请修改搜索条件。');
                }
            }, 0);
        },
    },

    /**
     * 入库批次模板
     */
    storageBatchTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.storage-batch table tbody'), item = $('tr', list);
            // 引用 View/storage/storageBatchTemplate.html
            $.get('http://' + BOSS.domain + '/storage/storageBatchTemplate.html',function(template) {
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
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="4">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        }
    }
}
BOSS.storageBatch.init();