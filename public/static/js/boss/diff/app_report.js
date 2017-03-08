BOSS.AppReport = {
    /*================================================================*/
    /*                          渠道城市报表相关信息                          */
    /*================================================================*/
    pagesize : 15,
    TemplateFilter : {},
    ListDom : $('#listTemplate'),
    init : function(){
        var that = this;
        //获得列表模版
        that.Template.getListTemp();
        preDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            date = preDate.getFullYear() + "-" + ((preDate.getMonth() + 1) < 10 ? ("0" + (preDate.getMonth() + 1)) : (preDate.getMonth() + 1)) + "-" + (preDate.getDate() < 10 ? ("0" + preDate.getDate()) : (preDate.getDate()));
        $('input[name="time"]').val(date);
        $('input[name="time"]').datepicker({
            autoclose: true,
            format: "yyyy-mm-dd",
            minViewMode: 0,
            todayBtn: true,
            endDate : date
        });
        //列表加载
        that.getList(1);
        //搜索按钮
        $('body').on('click','#order-search',function(){
            that.getList(1);
        });
        //选择省份
        $('body').on('change','select[name="province"]',function(){
            var $dom = $(this),
                province_id = $dom.val();
            BOSS.AppReport.getCtiy({'province_id':province_id},function(d){
                BOSS.AppReport.Template.cityDraw(d.data);
            },function(){},$dom);
        });
        //如果有省份
        if($('select[name="province"]').val() != 0){
            var $dom = $('select[name="province"]'),
                province_id = $dom.val();
            BOSS.AppReport.getCtiy({'province_id':province_id},function(d){
                BOSS.AppReport.Template.cityDraw(d.data);
            },function(){},$dom);
        }
        //表头说明切换事件绑定
        $('.order-filter-list').parent().hover(function(){
            $(this).find('.order-filter-list').show();
        },function(){
            $(this).find('.order-filter-list').hide();
        });
    },
    getList : function(pageindex){
        if(!BOSS.Lock.lock(BOSS.AppReport.ListDom)){
           // return false;
        }
        var filter = {
            "time" : $('input[name="time"]').val(),
            "Fprovince_id" : $('select[name="province"]').val(),
            "Fcity_id" : $('select[name="city"]').val(),
            "Fpartner_id" : $('select[name="partner"]').val(),
            "Fboss_user_id" : $('select[name="Fboss_user_id"]').val(),
            "Forganization_name" : $('input[name="organ"]').val(),
            "pagesize": BOSS.AppReport.pagesize,
            "pageindex": pageindex
        }
        BOSS.AppReport.getAjax(BOSS.api.getAppReport,filter, function (d) {
            if(d.errcode == 0){
                BOSS.AppReport.Template.Draw(d.data.list);
                BOSS.AppReport.RefreshPage({total : d.data.pageinfo.total, pagesize : d.data.pageinfo.pagesize },$('.panel-footer'),pageindex);
                $('#recycledTotal').empty().html(d.data.total.recycledTotal);
                $('#recycledTotalPrice').empty().html(d.data.total.recycledTotalPrice);
                $('#closingTotal').empty().html(d.data.total.closingTotal);
            } else {
                BOSS.floatTips.errorTips(d.errstr);
            }
            BOSS.Lock.unlock(BOSS.AppReport.ListDom);
        });
    },
    //ajax 得到地区信息（城市）
    getCtiy:function(data,suc,err,dom,async){
        var data = data;
        if(!BOSS.Lock.lock(dom)){
            return false;
        }
        var asyncFlag = true;  // 默认为异步请求， async = true;
        if(async == 'sync'){
            asyncFlag = false; // 如果设置为同步请求， async = false;
        }
        $.ajax({
            url: BOSS.api.city_select,
            type: 'POST',
            async: asyncFlag,
            data:data,
            dataType: 'json',
            success: function(d) {
                suc && suc(d);
            },
            error: function() {
                err && err();
                BOSS.control.floadtip.showErrTip('网络或接口异常，查询失败');
            }
        })
        BOSS.Lock.unlock(dom);
    },
    /**
     * 模版操作
     */
    Template : {
        //得到模版并保存在本地缓存
        getListTemp : function(){
            BOSS.AppReport.TemplateFilter.List = BOSS.AppReport.ListDom.html();
            BOSS.Util.storage.serialize('BOSS_AppReport_List_Template', BOSS.AppReport.TemplateFilter.List);
        },


        Draw : function (data){
            var listStr = '',
                template = BOSS.Util.storage.deserialize('BOSS_AppReport_List_Template'),
                template = BOSS.control.HTMLDeCode(template);

            if(!BOSS.valid.checkEmptyObj(data)){
                for (var i=0; i<data.length; i++){
                    listStr += tmpl(template, data[i]);
                }
            } else {
                listStr = '<tr><td class="text-center" colspan="14">暂无数据</td></tr>';
            }
            listDom = $(listStr);
            BOSS.AppReport.ListDom.html(listDom);
            BOSS.AppReport.ListDom.show();
        },
        cityTMPL : [
            '<option value="<%=fcity_id%>"><%=fcity_name%></option>',
        ].join(''),

        cityDraw : function (data){
            if(!BOSS.valid.checkEmptyObj(data)){
                listStr = '<option value="0">全部</option>';
                for (var i=0; i<data.length; i++){
                    listStr += tmpl(BOSS.AppReport.Template.cityTMPL, data[i]);
                }
            } else {
                listStr = '<option value="0">全部</option>';
            }
            listDom = $(listStr);
            $('select[name="city"]').html(listDom);
            BOSS.AppReport.initSelect($('select[name="city"]'));
        },
    },
    //select下拉框初始化
    initSelect:function(dom){
        dom.selectpicker('refresh');
        dom.selectpicker('show');
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
}
BOSS.AppReport.init();