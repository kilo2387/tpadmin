/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.Diff = {
    ListDom : $('#listTemplate'),
    ReportDom : $('#reportTemplate'),
    readReport : $('#qualityReport'),
    followNote : $('#follow_note'),
    overOrderNote : $('#over_note'),
    followNoteRead : $('#follow_note_read'),
    TemplateFilter : {},
    pagesize : 10,
    validateParams : {
        rules : {
            note :{
                required : true,
                maxlength : 30
            },

        },
        msg : {
            note : {
                required : '备注不能为空！',
                maxlength : '备注不可以超过30个字符！'
            },
        }
    },
    STATUS : {
        ORDER_TAKEN : 10, //已下单
        WC_PAYOUT_BEFOR : 14, //已预付款
        PAY_FOR_ANOTHER : 15, //合作商代付
        SHIPPING : 20, //已发货
        WAREHOUSING : 40, //待检测
        WAREHOUSED : 50, //已检测
        TOBE_PAYED : 60, //待付款
        PAYED : 70, //已付款
        GET_PAYED : 130, //已确认收款

        PRE_REFUSE : 84, //待拒签
        TOBE_SETTLE_POSTAGE : 86, //待补贴运费

        GOODS_TO_RETURN : 90, //待退货
        GOODS_BARGAINING : 100, //待议价
        GOODS_RETURNED : 110, //已退货
        GOODS_RETURNED_TRUE : 120, //已确认退货

        CANCELED : 80,

        TAKED_ORDER: 210,  //已接单
        VISITED: 220,      //已上门
        DETECTION_FOR_DOOR: 250,      //已检测(上门回收)
        DETECTION_WAITFOR_CLEAR: 240,      //待清除数据(上门回收)
        DETECTION_WAITFOR_USER_AFFIRM: 230,      //待用户确认
        PAYEDOUT_FOR_DOOR: 260,      //已付款(上门回收)
        SHUNFENG: 24,  //顺丰上门
        TOBE_CLEAN: 56,   //待清除数据
        FAILED: 124,      //交易失败
        STATEMENTED: 126,      //提前结单
        CONFIRM_PAYMENT: 130, //已确认付款
        HAVE_EVALUATION: 140, //已取消

        HAVE_SENDOUT:150,
        GET_IN: 300,  //已入库
        GET_OUT: 310, //已出库
        SELL: 320,  //已销售
        FOLLOW_WAIT: 1, //待跟进
        FOLLOW_ING: 2, //跟进中
        FOLLOW_END: 3 //已结单
    },
    statusArr : [],

    init:function(){
        var that = this;
        this.statusArr = [
            {id : this.STATUS.ORDER_TAKEN, name : '已下单'},
            {id : this.STATUS.WC_PAYOUT_BEFOR,name:'已预付款'},
            {id : this.STATUS.PAY_FOR_ANOTHER,name:'合作商代付'},
            {id : this.STATUS.SHIPPING, name : '已发货'},
            {id : this.STATUS.WAREHOUSING, name : '已收货'},
            {id : this.STATUS.WAREHOUSED, name : '已检测'},
            {id : this.STATUS.GOODS_BARGAINING, name : '待议价'},
            {id : this.STATUS.TOBE_PAYED, name : '待付款'},
            {id : this.STATUS.PAYED, name : '已付款'},
            {id : this.STATUS.GET_PAYED, name : '确认收款'},
            {id : this.STATUS.TOBE_SETTLE_POSTAGE, name : '待补贴运费'},
            {id : this.STATUS.PRE_REFUSE, name : '待拒签'},
            {id : this.STATUS.GOODS_TO_RETURN, name : '待退货'},
            {id : this.STATUS.GOODS_RETURNED, name : '已退货'},
            {id : this.STATUS.GOODS_RETURNED_TRUE, name : '确认退货'},
            {id : this.STATUS.CANCELED, name : '已取消'},
            {id : this.STATUS.SHUNFENG,name:'顺丰上门'},
            {id : this.STATUS.TAKED_ORDER,name:'已接单'},
            {id : this.STATUS.VISITED,name:'已上门'},
            {id : this.STATUS.DETECTION_FOR_DOOR,name:'待支付'},
            {id : this.STATUS.PAYEDOUT_FOR_DOOR,name:'已付款（上门）'},
            {id : this.STATUS.DETECTION_WAITFOR_CLEAR,name:'待清除数据（上门）'},
            {id : this.STATUS.DETECTION_WAITFOR_USER_AFFIRM,name:'待用户确认'},
            {id : this.STATUS.TOBE_CLEAN,name:'待清除数据'},
            {id : this.STATUS.FAILED,name:'交易失败'},
            {id : this.STATUS.STATEMENTED,name:'提前结单'},
            {id : this.STATUS.CONFIRM_PAYMENT,name:'已确认付款'},
            {id : this.STATUS.HAVE_EVALUATION,name:'已评价'},
            {id : this.STATUS.GET_IN, name : '已入库'},
            {id : this.STATUS.GET_OUT, name : '已出库'},
            {id : this.STATUS.SELL, name : '已销售'},
            {id : this.STATUS.FOLLOW_WAIT, name : '待跟进'},
            {id : this.STATUS.FOLLOW_ING, name : '跟进中'},
            {id : this.STATUS.FOLLOW_END, name : '已结单'}
        ];
        //获得列表模版
        that.Template.getListTemp();
        that.Template.getReportTemp();

        //初始化时间
        //now = new Date(),
        //    begDate = new Date(now.getTime() - 24 * 30 * 3600000), // 前1个月时间
        //    endDate = new Date(now.getTime() + 24 * 1 * 3600000), // 明天
        //    begDate = BOSS.Util.formatDate(begDate, 'yy-MM-dd'),
        //    endDate = BOSS.Util.formatDate(endDate, 'yy-MM-dd');
        //
        //
        //$('input[name="orderStartTime"]').val(begDate);
        //$('input[name="followStartTime"]').val(begDate);
        //$('input[name="orderEndTime"]').val(endDate);
        //$('input[name="followEndTime"]').val(endDate);

        that.getList(1);

        //查看质检报告
        $('body').on('click','.readReport',function(){
           var orderid = $(this).data('orderid'), goodsid = $(this).data('goodsid');
            that.getReport(orderid,goodsid, function (d) {
                BOSS.Diff.Template.reportDraw(d.data);
                that.readReport.modal('show');
            });
        });

        //that.readReport.on('show.bs.modal', function (event) {
        //    var model = $(this), button = $(event.relatedTarget), orderid = button.data('orderid'), goodsid = button.data('goodsid');
        //    that.getReport(orderid,goodsid, function (d) {
        //        BOSS.Diff.Template.reportDraw(d.data);
        //    },function(d){
        //
        //    });
        //});

        //跟进备注
        that.followNote.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget), id = button.data('id'), note = button.data('note');
            $('[name="diffid"]',model).val(id);
            $('[name="note"]',model).val(note);
            that.checkValidate(model);
        });
        //结单备注
        that.overOrderNote.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget), id = button.data('id'), note = button.data('note'),endType = button.data('endtype');
            $('[name="diffid"]',model).val(id);
            $('[name="note"]',model).val(note);
            // console.log(endType);
            $("[name='over_note_type'][value='"+endType+"']",model).prop("checked",true);
            that.checkValidate(model);
        });
        //跟进备注查看
        that.followNoteRead.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget),  note = button.data('note');
            $('.modal-body',model).html(note);
        });
        //查询按钮绑定事件
        $('body').on('click','#diff-search',function(){
            that.getList(1);
        });
        //excel导出
        $('body').on('click','.excel_btn',function(){
            that.getExcelList();
        })


    },

    getStatusStr : function(sid){
        for(i in this.statusArr){
            if(this.statusArr[i].id == sid){
                return this.statusArr[i].name;
            }
        }
        return '';
    },
    
    /**
     * 定义ajax请求
     * @param requestLink 请求链接
     * @param filter 传输的数据
     * @param suc
     * @param err
     */
    getAjax : function (requestLink, filter, suc, err, async) {
        var asyncFlag = true;  // 默认为异步请求， async = true;
        if(async == 'sync'){
            asyncFlag = false; // 如果设置为同步请求， async = false;
        }
        $.ajax({
            url:requestLink,
            type: 'POST',
            async: asyncFlag,
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


    /**
     * 获取excel数据
     * @param pageindex
     */
    getExcelList : function(){
        var filter = {
            "orderStartTime" : $("input[name='orderStartTime']").val(),
            "orderEndTime" : $("input[name='orderEndTime']").val(),
            "followStartTime" : $("input[name='followStartTime']").val(),
            "followEndTime" : $("input[name='followEndTime']").val(),
            "receivingStartTime" : $("input[name='receivingStartTime']").val(),
            "receivingEndTime" : $("input[name='receivingEndTime']").val(),
            "bargainStartTime" : $("input[name='bargainStartTime']").val(),
            "bargainEndTime" : $("input[name='bargainEndTime']").val(),
            "order_status" : $("select[name='order_status']").val(),
            "follow_status" : $("select[name='follow_status']").val(),
            "channel_store" : $("select[name='channel_store']").val(),
            "channelManner" : $("select[name='channelManner']").val(),
            "cityManner" : $("select[name='cityManner']").val(),
            "organ" : $("input[name='organ']").val(),
            "orderid" : $("input[name='orderid']").val(),
        }
        parms = jQuery.param(filter);
        location.href = BOSS.api.getDiffExcelList + '?' + parms;
    },

    /**
     * 获取角色列表
     * @param pageindex
     */
    getList : function(pageindex){

        if(!BOSS.Lock.lock(BOSS.Diff.ListDom)){
            return false;
        }
        var filter = {
            "orderStartTime" : $("input[name='orderStartTime']").val(),
            "orderEndTime" : $("input[name='orderEndTime']").val(),
            "followStartTime" : $("input[name='followStartTime']").val(),
            "followEndTime" : $("input[name='followEndTime']").val(),
            "receivingStartTime" : $("input[name='receivingStartTime']").val(),
            "receivingEndTime" : $("input[name='receivingEndTime']").val(),
            "bargainStartTime" : $("input[name='bargainStartTime']").val(),
            "bargainEndTime" : $("input[name='bargainEndTime']").val(),
            "order_status" : $("select[name='order_status']").val(),
            "follow_status" : $("select[name='follow_status']").val(),
            "channel_store" : $("select[name='channel_store']").val(),
            "channelManner" : $("select[name='channelManner']").val(),
            "cityManner" : $("select[name='cityManner']").val(),
            "organ" : $("input[name='organ']").val(),
            "orderid" : $("input[name='orderid']").val(),
            "pagesize": this.pagesize,
            "pageindex": pageindex
        }
        BOSS.Diff.getAjax(BOSS.api.getDiffList,filter, function (d) {
            if(d.errcode == 0){
                BOSS.Diff.Template.Draw(d.data.result);
                BOSS.Diff.RefreshPage({total : d.data.pageinfo.total, pagesize : d.data.pageinfo.pagesize },$('.panel-footer'),pageindex);
                $('.orders-num').html(d.data.stores.total);
                $('.orders-prices').html(d.data.stores.total_price/100);
                $('.orders-diff-prices').html(d.data.stores.total_diff/100);

            } else {
                BOSS.floatTips.errorTips(d.errstr);
            }
            BOSS.Lock.unlock(BOSS.Diff.ListDom);
        });
    },

    getReport : function (orderid,goodsid,suc,err){
        if(!BOSS.Lock.lock(BOSS.Diff.readReport)){
            return false;
        }
        var filter = {
            "goodsid": goodsid,
            "orderid": orderid
        }
        BOSS.Diff.getAjax(BOSS.api.getReport,filter, function (d) {
            if(d.errcode == 0){
                suc && suc(d);
            } else {
                err && err(d);
                BOSS.floatTips.errorTips(d.errstr);
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            }
            BOSS.Lock.unlock(BOSS.Diff.readReport);
        });

    },

    //模版加载
    Template : {
        //得到模版并保存在本地缓存
        getListTemp : function(){
            BOSS.Diff.TemplateFilter.List = BOSS.Diff.ListDom.html();
            BOSS.Util.storage.serialize('BOSS_Diff_List_Template', BOSS.Diff.TemplateFilter.List);
        },
        Draw : function (data){
            var listStr = '',
                template = BOSS.Util.storage.deserialize('BOSS_Diff_List_Template'),
                template = BOSS.control.HTMLDeCode(template);

            if(!BOSS.valid.checkEmptyObj(data)){
                for (var i=0; i<data.length; i++){
                    data[i].fdifference_id = BOSS.string.replaceHTML(data[i].fdifference_id);
                    data[i].forder_id = BOSS.string.replaceHTML(data[i].forder_id);
                    data[i].fproduct_name = BOSS.string.replaceHTML(data[i].fproduct_name);
                    data[i].forder_time = BOSS.string.replaceHTML(data[i].forder_time);
                    data[i].fpartner_name = BOSS.string.replaceHTML(data[i].fpartner_name);
                    data[i].ffollow_status = BOSS.Diff.getStatusStr(data[i].ffollow_status);
                    data[i].forganization_name = BOSS.string.replaceHTML(data[i].forganization_name);
                    data[i].fuser_name = BOSS.string.replaceHTML(data[i].fuser_name);
                    data[i].frealName = BOSS.string.replaceHTML(data[i].frealName);
                    data[i].fchannel_manager = BOSS.string.replaceHTML(data[i].fchannel_manager);
                    data[i].fcity_manager = BOSS.string.replaceHTML(data[i].fcity_manager);
                    data[i].fpay_out_price = data[i].fpay_out_price/100;
                    data[i].fdetect_price = data[i].fdetect_price/100;
                    data[i].fdiff_price = data[i].fdiff_price/100;
                    data[i].ffollow_up_note = BOSS.string.replaceHTML(data[i].ffollow_up_note);
                    data[i].note = BOSS.Diff.subString(BOSS.string.replaceHTML(data[i].ffollow_up_note),16,1);
                    data[i].foperator_name = BOSS.string.replaceHTML(data[i].foperator_name);
                    data[i].ffollow_up_time = data[i].ffollow_up_time;
                    data[i].fover_order_desc = BOSS.string.replaceHTML(data[i].fover_order_desc);
                    data[i].fover_order_type = BOSS.string.replaceHTML(data[i].fover_order_type);
                    data[i].forder_status = BOSS.Diff.getStatusStr(data[i].forder_status);
                    listStr += tmpl(template, data[i]);
                }
            } else {
                listStr = '<tr><td class="text-center" colspan="20">暂无数据</td></tr>';
            }
            listDom = $(listStr);
            BOSS.Diff.ListDom.html(listDom);
        },

        getReportTemp : function(){
            BOSS.Diff.TemplateFilter.Report = BOSS.Diff.ReportDom.html();
            BOSS.Util.storage.serialize('BOSS_Diff_report_Template', BOSS.Diff.TemplateFilter.Report);
        },

        reportDraw : function(data){
            var listStr = '',
                template = BOSS.Util.storage.deserialize('BOSS_Diff_report_Template'),
                template = BOSS.control.HTMLDeCode(template);

            if(!BOSS.valid.checkEmptyObj(data)){
                listStr = tmpl(template, data);
            } else {
                listStr = '<tr><td class="text-center" colspan="3">暂无数据</td></tr>';
            }
            listDom = $(listStr);
            BOSS.Diff.ReportDom.html(listDom);
        }

    },

    /**
     * 创建/刷新渠道列表翻页控件
     * @param  {[type]} pg          翻页信息
     * @param  {[type]} pgContainer 控件容器
     * @param  {[type]} filter      渠道过滤关键词
     * @return {[type]}             [description]
     */
    RefreshPage: function(pg, pgContainer,pageNow) {
        var that = this;
        pageNum = Math.ceil(pg.total / pg.pagesize);
        if (pageNum > 1) {
            var p = {
                pageDom: pgContainer,
                pageNum: pageNum,
                pageNow: pageNow,
                onPageSwitch: function(index,onPageSwitchedCB) {
                    that.getList(index);
                }
            };
            new BOSS.control.page(p);
        } else {
            pgContainer.empty();
        }
    },

    //截取字符串 包含中文处理
    //(串,长度,增加...)
    subString : function(str, len, hasDot)
    {
        var newLength = 0;
        var newStr = "";
        var chineseRegex = /[^\x00-\xff]/g;
        var singleChar = "";
        var strLength = str.replace(chineseRegex,"**").length;
        for(var i = 0;i < strLength;i++)
        {
            singleChar = str.charAt(i).toString();
            if(singleChar.match(chineseRegex) != null)
            {
                newLength += 2;
            }
            else
            {
                newLength++;
            }
            if(newLength > len)
            {
                break;
            }
            newStr += singleChar;
        }

        if(hasDot && strLength > len)
        {
            newStr += "...";
        }
        return newStr;
    },
    /**
     * 启用、禁用验证并提交请求
     * @param model
     * @param validateParams
     */
    checkValidate : function (model) {
        var $parentBox = model.find('form');
        $parentBox.validate({
            debug: true,
            ignore: [],
            rules : BOSS.Diff.validateParams.rules,
            messages :  BOSS.Diff.validateParams.msg,
            submitHandler : function () {
                if(!BOSS.Lock.lock(BOSS.Diff.followNote)){
                    return false;
                };
                BOSS.Diff.getAjax(BOSS.api.editFollowUpNote, $parentBox.serialize(), function (d) {
                    if (d.data != null) {
                        BOSS.floatTips.successTips('更新成功！页面将在2秒内刷新');
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                        model.hide();
                    } else {
                        layer.open({
                            icon : 2,
                            skin: 'layui-layer-molv', //样式类名
                            content: d.errstr,
                            scrollbar: false
                        });
                        /*BOSS.floatTips.errorTips(d.errstr);
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);*/
                    }
                    BOSS.Lock.unlock(BOSS.Diff.followNote);

                }, 0);

            }
        });
    },

};
BOSS.Diff.init();