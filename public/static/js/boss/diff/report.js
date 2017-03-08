BOSS.Report = {
    /*================================================================*/
    /*                          渠道报表相关信息                          */
    /*================================================================*/
    pagesize : 15,
    //日报js
    DayReport:{
        TemplateFilter : {},
        ListDom : $('#listTemplate'),
        elistsListDom : $('#ElistsTemplate'),
        echartsListDom : $('#showChart'),
        showElistsDom : $('#showElists'),
        pageindex : 1,
        myChart:{},
        init: function(){
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
                todayBtn: false,
                endDate : date
            });
            //初始化筛选数据
            BOSS.Report.initParms(BOSS.Report.DayReport);
            //日报列表加载
            that.getList(that.pageindex);

            //搜索按钮
            $('body').on('click','#order-search',function(){
                that.getList(1);
                BOSS.Report.createUrl(that.pageindex);
            });


            //选择省份
            $('body').on('change','select[name="province"]',function(){
                var $dom = $(this),
                    province_id = $dom.val();
                BOSS.Report.getCtiy({'province_id':province_id},function(d){
                    BOSS.Report.Template.cityDraw(d.data);
                },function(){},$dom);
            });
            //查看门店精英
            that.showElistsDom.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), orgid = button.data('orgid');
                that.getElists(orgid);
            });

            //初始化echarts

            that.myChart = echarts.init(document.getElementById('main'));
            that.echartsListDom.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), orgid = button.data('orgid');
                that.getEcharts(orgid);

            });

            //excel数据导出
            $('body').on('click', '.excel_btn', function(){
                BOSS.Report.getExcelList('d');
            });


        },
        //获取列表
        getList : function(pageindex){
            if(!BOSS.Lock.lock(BOSS.Report.DayReport.ListDom)){
                return false;
            }
            var filter = {
                "time" : $('input[name="time"]').val(),
                "Fprovince_id" : $('select[name="province"]').val(),
                "Fcity_id" : $('select[name="city"]').val(),
                "Fpartner_id" : $('select[name="partner"]').val(),
                "Fboss_user_id" : $('select[name="Fboss_user_id"]').val(),
                "Forganization_name" : $('input[name="organ"]').val(),
                "type" : 'd',
                "pagesize": BOSS.Report.pagesize,
                "pageindex": pageindex
            }
            BOSS.Report.createUrl(pageindex);
            BOSS.Report.DayReport.pageindex = pageindex;
            BOSS.Report.getAjax(BOSS.api.getChannelReport,filter, function (d) {
                if(d.errcode == 0){
                    BOSS.Report.DayReport.Template.Draw(d.data.list);
                    BOSS.Report.RefreshPage({total : d.data.pageinfo.total, pagesize : d.data.pageinfo.pagesize },$('.panel-footer'),pageindex,BOSS.Report.DayReport);
                    $('#recycledTotal').empty().html(d.data.total.recycledTotal);
                    $('#recycledTotalPrice').empty().html(d.data.total.recycledTotalPrice);
                    $('#closingTotal').empty().html(d.data.total.closingTotal);
                } else {
                    BOSS.floatTips.errorTips(d.errstr);
                }
                BOSS.Lock.unlock(BOSS.Report.DayReport.ListDom);
            });
        },

        //门店精英
        getElists : function(orgid){
            if(!BOSS.Lock.lock(BOSS.Report.DayReport.elistsListDom)){
                return false;
            }
            var filter = {
                "orgid" : orgid,
                "time" : $('input[name="time"]').val(),
            }
            BOSS.Report.getAjax(BOSS.api.getElists,filter, function (d) {
                if(d.errcode == 0){
                    BOSS.Report.DayReport.Template.elistsDraw(d.data);
                } else {
                    BOSS.Report.DayReport.Template.elistsDraw(d.data);
                    BOSS.floatTips.errorTips(d.errstr);
                }
                BOSS.Lock.unlock(BOSS.Report.DayReport.elistsListDom);
            });
        },
        //得到echarts数据
        getEcharts : function(orgid){
            if(!BOSS.Lock.lock(BOSS.Report.DayReport.echartsListDom)){
                return false;
            }
            var filter = {
                "orgid" : orgid,
                "time" : $('input[name="time"]').val(),
            }
            BOSS.Report.getAjax(BOSS.api.getChart,filter, function (d) {
                if(d.errcode == 0){
                    BOSS.Report.DayReport.echarts.drawGraTab(d);
                } else {
                    BOSS.floatTips.errorTips(d.errstr);
                }
                BOSS.Lock.unlock(BOSS.Report.DayReport.echartsListDom);
            });
        },
        //加载echarts数据
        echarts: {
            drawGraTab: function (d) {
                BOSS.Report.DayReport.myChart.setOption(
                    {
                        title: {
                            show:false,
                            text: '近15天趋势图'
                        },
                        tooltip:{ trigger: 'axis'},
                        legend: {
                            data:['检测量','回收量','回收金额']
                        },
                        xAxis: {
                            type: 'category',
                            data : d.data.category
                        },
                        yAxis: [
                            { type:'value'},
                            { type:'value'}
                        ],
                        series: [
                            {
                                name: '检测量',
                                type: 'bar',
                                tooltipIndex:0,
                                data: d.data.checkNum
                            },
                            {
                                name: '回收量',
                                tooltipIndex:0,
                                type: 'bar',
                                data: d.data.recycledNum
                            },
                            {
                                name: '回收金额',
                                type: 'line',
                                tooltipIndex:0,
                                yAxisIndex: 1,
                                data: d.data.recycledTotle
                            }

                        ]
                    }
                );
            }
        },
        /**
         * 模版操作
         */
        Template : {
            //得到模版并保存在本地缓存
            getListTemp : function(){
                BOSS.Report.DayReport.TemplateFilter.List = BOSS.Report.DayReport.ListDom.html();
                BOSS.Util.storage.serialize('BOSS_Report_DayReport_List_Template', BOSS.Report.DayReport.TemplateFilter.List);
                BOSS.Report.DayReport.TemplateFilter.elistsList = BOSS.Report.DayReport.elistsListDom.html();
                BOSS.Util.storage.serialize('BOSS_Report_DayReport_elistsList_Template', BOSS.Report.DayReport.TemplateFilter.elistsList);
            },


            Draw : function (data){
                var listStr = '',
                    template = BOSS.Report.DayReport.TemplateFilter.List;
                    if(BOSS.Report.DayReport.TemplateFilter.List == ''){
                        template = BOSS.Util.storage.deserialize('BOSS_Report_DayReport_List_Template');
                    }
                    template = BOSS.control.HTMLDeCode(template);
                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="14">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                BOSS.Report.DayReport.ListDom.html(listDom);
                BOSS.Report.DayReport.ListDom.show();
            },

            elistsDraw : function (data){
                var listStr = '',
                    template = BOSS.Util.storage.deserialize('BOSS_Report_DayReport_elistsList_Template'),
                    template = BOSS.control.HTMLDeCode(template);

                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){
                        data[i]['top'] = i+1;
                        data[i]['fpay_out_price'] = data[i]['fpay_out_price']/100;
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="5">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                BOSS.Report.DayReport.elistsListDom.html(listDom);
            },

        }
    },

    //月报js
    MonthReport:{
        TemplateFilter : {},
        ListDom : $('#listTemplate'),
        pageindex : 1,
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
            //初始化筛选数据
            BOSS.Report.initParms(BOSS.Report.MonthReport);
            //日报列表加载
            that.getList(that.pageindex);

            //搜索按钮
            $('body').on('click','#order-search',function(){
                that.getList(1);
                BOSS.Report.createUrl(that.pageindex);
            });


            //选择省份
            $('body').on('change','select[name="province"]',function(){
                var $dom = $(this),
                    province_id = $dom.val();
                BOSS.Report.getCtiy({'province_id':province_id},function(d){
                    BOSS.Report.Template.cityDraw(d.data);
                },function(){},$dom);
            });
            //excel数据导出
            $('body').on('click', '.excel_btn', function(){
                BOSS.Report.getExcelList('m');
            });

        },

        getList : function(pageindex){
            if(!BOSS.Lock.lock(BOSS.Report.MonthReport.ListDom)){
                return false;
            }
            var filter = {
                "time" : $('input[name="time"]').val(),
                "Fprovince_id" : $('select[name="province"]').val(),
                "Fcity_id" : $('select[name="city"]').val(),
                "Fpartner_id" : $('select[name="partner"]').val(),
                "Fboss_user_id" : $('select[name="Fboss_user_id"]').val(),
                "Forganization_name" : $('input[name="organ"]').val(),
                "type" : 'm',
                "pagesize": BOSS.Report.pagesize,
                "pageindex": pageindex
            }
            BOSS.Report.createUrl(pageindex);
            BOSS.Report.MonthReport.pageindex = pageindex;
            BOSS.Report.getAjax(BOSS.api.getChannelReport,filter, function (d) {
                if(d.errcode == 0){
                    BOSS.Report.MonthReport.Template.Draw(d.data.list);
                    BOSS.Report.RefreshPage({total : d.data.pageinfo.total, pagesize : d.data.pageinfo.pagesize },$('.panel-footer'),pageindex,BOSS.Report.MonthReport);
                    $('#recycledTotal').empty().html(d.data.total.recycledTotal);
                    $('#recycledTotalPrice').empty().html(d.data.total.recycledTotalPrice);
                    $('#closingTotal').empty().html(d.data.total.closingTotal);
                } else {
                    BOSS.floatTips.errorTips(d.errstr);
                }
                BOSS.Lock.unlock(BOSS.Report.MonthReport.ListDom);
            });
        },

        Template : {
            //得到模版并保存在本地缓存
            getListTemp : function(){
                BOSS.Report.MonthReport.TemplateFilter.List = BOSS.Report.MonthReport.ListDom.html();
                BOSS.Util.storage.serialize('BOSS_Report_MonthReport_List_Template', BOSS.Report.MonthReport.TemplateFilter.List);
            },

            Draw : function (data){
                var listStr = '',
                    template = BOSS.Util.storage.deserialize('BOSS_Report_MonthReport_List_Template'),
                    template = BOSS.control.HTMLDeCode(template);

                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="14">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                BOSS.Report.MonthReport.ListDom.html(listDom);
                BOSS.Report.MonthReport.ListDom.show();
            },
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

    //下载excle
    getExcelList : function(type){
        var filter = {
            "time" : $('input[name="time"]').val(),
            "Fprovince_id" : $('select[name="province"]').val(),
            "Fcity_id" : $('select[name="city"]').val(),
            "Fpartner_id" : $('select[name="partner"]').val(),
            "Fboss_user_id" : $('select[name="Fboss_user_id"]').val(),
            "Forganization_name" : $('input[name="organ"]').val(),
            "type" : type,
        }
        parms = jQuery.param(filter);
        location.href = BOSS.api.getReportExcel + '?' + parms;
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
     * 创建/刷新渠道列表翻页控件
     * @param  {[type]} pg          翻页信息
     * @param  {[type]} pgContainer 控件容器
     * @param  {[type]} filter      渠道过滤关键词
     * @return {[type]}             [description]
     */
    RefreshPage: function(pg, pgContainer,pageNow,dom) {

        pageNum = Math.ceil(pg.total / pg.pagesize);
        if (pageNum > 1) {
            var p = {
                pageDom: pgContainer,
                pageNum: pageNum,
                pageNow: pageNow,
                onPageSwitch: function(index,onPageSwitchedCB) {
                    dom.getList(index);
                }
            };
            new BOSS.control.page(p);
        } else {
            pgContainer.empty();
        }
    },

    Template:{
        cityTMPL : [
            '<option value="<%=fcity_id%>"><%=fcity_name%></option>',
        ].join(''),

        cityDraw : function (data){
            if(!BOSS.valid.checkEmptyObj(data)){
                listStr = '<option value="0">全部</option>';
                for (var i=0; i<data.length; i++){
                    listStr += tmpl(BOSS.Report.Template.cityTMPL, data[i]);
                }
            } else {
                listStr = '<option value="0">全部</option>';
            }
            listDom = $(listStr);
            $('select[name="city"]').html(listDom);
            BOSS.Report.initSelect($('select[name="city"]'));
        },
    },

    //select下拉框初始化
    initSelect:function(dom){
        dom.selectpicker('refresh');
        dom.selectpicker('show');
    },
    //初始化url
    createUrl:function(pageindex){
        var time = $('input[name="time"]').val(),
        Fprovince_id = $('select[name="province"]').val(),
        Fcity_id = $('select[name="city"]').val(),
        Fpartner_id = $('select[name="partner"]').val(),
        Fboss_user_id = $('select[name="Fboss_user_id"]').val(),
        Forganization_name = $('input[name="organ"]').val(),
        url = location.href;

        //搜索处理时间
            url = BOSS.Util.updateUrlParams(url, 'time', time);

        //省份
            url = BOSS.Util.updateUrlParams(url, 'Fprovince_id', Fprovince_id);

        //城市
            url = BOSS.Util.updateUrlParams(url, 'Fcity_id', Fcity_id);

        //合作商
            url = BOSS.Util.updateUrlParams(url, 'Fpartner_id', Fpartner_id);

        //渠道经理
            url = BOSS.Util.updateUrlParams(url, 'Fboss_user_id', Fboss_user_id);

        //门店
            url = BOSS.Util.updateUrlParams(url, 'Forganization_name', Forganization_name);

        //每页显示条数
            url = BOSS.Util.updateUrlParams(url, 'pageindex', pageindex);

        //只改变url
        history.pushState({}, '', url);
    },

    //通过url初始化选项值
    initParms : function(dom){
        var $urlParam = BOSS.Util.getUrlParamList();
        //初始化时间
        if($urlParam.time != null && $urlParam.time != 'undefined' && $urlParam.time != ""){
            $('input[name="time"]').val($urlParam.time);
        }
        //省份
        if($urlParam.Fprovince_id != null && $urlParam.Fprovince_id != 'undefined' && $urlParam.Fprovince_id != 0){
            //省份有值则加载城市
            BOSS.Report.getCtiy({'province_id':$urlParam.Fprovince_id},function(d){
                BOSS.Report.Template.cityDraw(d.data);
            },function(){},$('select[name="province"]'),'sync');

            $('select[name="province"]').val($urlParam.Fprovince_id);
            BOSS.Report.initSelect($('select[name="province"]'));
        }
        //城市
        if($urlParam.Fcity_id != null && $urlParam.Fcity_id != 'undefined' && $urlParam.Fcity_id != 0){
            $('select[name="city"]').val($urlParam.Fcity_id);
            BOSS.Report.initSelect($('select[name="city"]'));
        }
        //合作商
        if($urlParam.Fpartner_id != null && $urlParam.Fpartner_id != 'undefined' && $urlParam.Fpartner_id != 0){
            $('select[name="partner"]').val($urlParam.Fpartner_id);
            BOSS.Report.initSelect($('select[name="partner"]'));
        }
        //渠道经理
        if($urlParam.Fboss_user_id != null && $urlParam.Fboss_user_id != 'undefined' && $urlParam.Fboss_user_id != 0){
            $('select[name="Fboss_user_id"]').val($urlParam.Fboss_user_id);
            BOSS.Report.initSelect($('select[name="Fboss_user_id"]'));
        }
        //门店
        if($urlParam.Forganization_name != null && $urlParam.Forganization_name != 'undefined' && $urlParam.Forganization_name != ""){
            $('input[name="organ"]').val($urlParam.Forganization_name);
        }
        //页数
        if($urlParam.pageindex != null && $urlParam.pageindex != 'undefined' && $urlParam.pageindex != 0){
            dom.pageindex = $urlParam.pageindex;
        }
    }
}