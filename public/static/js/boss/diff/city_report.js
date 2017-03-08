BOSS.CityReport = {
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
            date = preDate.getFullYear() + "-" + ((preDate.getMonth() + 1) < 10 ? ("0" + (preDate.getMonth())) : (preDate.getMonth()));
        $('input[name="time"]').val(date);

        $('input[name="time"]').datepicker({
            autoclose: true,
            format: "yyyy-mm",
            minViewMode: 1,
            todayBtn: false,
            endDate : date
        });
        //列表加载
        that.getList(1);
        //搜索按钮
        $('body').on('click','#order-search',function(){
            that.getList(1);
        });
    },
    getList : function(pageindex){
        if(!BOSS.Lock.lock(BOSS.CityReport.ListDom)){
            return false;
        }
        var filter = {
            "time" : $('input[name="time"]').val(),
            "pagesize": BOSS.CityReport.pagesize,
            "pageindex": pageindex
        }
        BOSS.CityReport.getAjax(BOSS.api.getCtiyReport,filter, function (d) {
            if(d.errcode == 0){
                BOSS.CityReport.Template.Draw(d.data.list);
                BOSS.CityReport.RefreshPage({total : d.data.pageinfo.total, pagesize : d.data.pageinfo.pagesize },$('.panel-footer'),pageindex);
                $('#recycledTotal').empty().html(d.data.total.recycledTotal);
                $('#recycledTotalPrice').empty().html(d.data.total.recycledTotalPrice);
                $('#closingTotal').empty().html(d.data.total.closingTotal);
            } else {
                BOSS.floatTips.errorTips(d.errstr);
            }
            BOSS.Lock.unlock(BOSS.CityReport.ListDom);
        });
    },

    /**
     * 模版操作
     */
    Template : {
        //得到模版并保存在本地缓存
        getListTemp : function(){
            BOSS.CityReport.TemplateFilter.List = BOSS.CityReport.ListDom.html();
            BOSS.Util.storage.serialize('BOSS_CityReport_List_Template', BOSS.CityReport.TemplateFilter.List);
        },


        Draw : function (data){
            var listStr = '',
                template = BOSS.Util.storage.deserialize('BOSS_CityReport_List_Template'),
                template = BOSS.control.HTMLDeCode(template);

            if(!BOSS.valid.checkEmptyObj(data)){
                for (var i=0; i<data.length; i++){
                    listStr += tmpl(template, data[i]);
                }
            } else {
                listStr = '<tr><td class="text-center" colspan="14">暂无数据</td></tr>';
            }
            listDom = $(listStr);
            BOSS.CityReport.ListDom.html(listDom);
            BOSS.CityReport.ListDom.show();
        }
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
BOSS.CityReport.init();