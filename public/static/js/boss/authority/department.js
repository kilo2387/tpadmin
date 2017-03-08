/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.Department = {
    addDepartment : $('#addDepartment'),
    editDepartment : $('#editDepartment'),
    ListDom : $('#listTemplate'),
    TemplateFilter : {},
    validateParams : {
        rules : {
            Fdepartment_name : 'required',

        },
        msg : {
            Fdepartment_name : '名称不能为空！',
        }
    },
    pagesize : 10,
    init:function(){
        var that = this;
        //获得列表模版
        that.Template.getListTemp();
        that.getList(1);

        //添加弹窗
        that.addDepartment.one('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget);
            that.checkAddValidate(model);
        });

        //修改弹窗
        that.editDepartment.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget),id = button.data('id'), name = button.data('name');

            //初始化自已的id
            $('[name="Fdepartment_id"]',model).val(id);
            //初始化名称
            $('[name="Fdepartment_name"]',model).val(name);

            that.checkEditValidate(model);
        });

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


    getList : function(pageindex){
        if(!BOSS.Lock.lock(BOSS.Department.ListDom)){
            return false;
        }
        var filter = {
            "pagesize": this.pagesize,
            "pageindex": pageindex
        }
        BOSS.Department.getAjax(BOSS.api.getDepartmentList,filter, function (d) {
            if(d.errcode == 0){
                BOSS.Department.Template.Draw(d.data.result);
                BOSS.Department.RefreshPage({ total: d.data.pageinfo.total, pagesize: d.data.pageinfo.pagesize },$('.panel-footer'),pageindex);
            } else {
                BOSS.floatTips.errorTips(d.errstr);
            }
        });
        BOSS.Lock.unlock(BOSS.Department.ListDom);
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

    //模版加载
    Template : {
        //得到模版并保存在本地缓存
        getListTemp : function(){
            BOSS.Department.TemplateFilter.List = BOSS.Department.ListDom.html();
            BOSS.Util.storage.serialize('BOSS_Department_List_Template', BOSS.Department.TemplateFilter.List);
        },
        Draw : function (data){
            var listStr = '',
                template = BOSS.Util.storage.deserialize('BOSS_Department_List_Template'),
                template = BOSS.control.HTMLDeCode(template);

            if(!BOSS.valid.checkEmptyObj(data)){
                for (var i=0; i<data.length; i++){
                    data[i].fdepartment_name = BOSS.string.replaceHTML(data[i].fdepartment_name);
                    listStr += tmpl(template, data[i]);
                }
            } else {
                listStr = '<tr><td class="text-center" colspan="9" rowspan="5">暂无数据</td></tr>';
            }
            listDom = $(listStr);
            BOSS.Department.ListDom.html(listDom);
        }
    },


    /**
     * 添加验证并提交请求
     * @param model
     * @param validateParams
     */
    checkAddValidate : function (model) {
        var $parentBox = model.find('form');
        $parentBox.validate({
            debug: false,
            ignore: [],
            rules : BOSS.Department.validateParams.rules,
            messages :  BOSS.Department.validateParams.msg,
            submitHandler : function () {
                if(!BOSS.Lock.lock(BOSS.Department.addDepartment)){
                    return false;
                }
                BOSS.Department.getAjax(BOSS.api.addDepartment, $parentBox.serialize(), function (d) {
                    if (d.data != null) {
                        var msg = '添加成功！页面将在2秒内刷新';
                        BOSS.floatTips.successTips(msg);
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    } else {
                        BOSS.floatTips.errorTips(d.errstr);
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    }
                    BOSS.Lock.unlock(BOSS.Department.addDepartment);
                    model.hide();
                }, 0);

            }
        });
    },

    /**
     * 修改验证并提交请求
     * @param model
     * @param validateParams
     */
    checkEditValidate : function (model) {
        var $parentBox = model.find('form');
        $parentBox.validate({
            debug: false,
            ignore: [],
            rules : BOSS.Department.validateParams.rules,
            messages :  BOSS.Department.validateParams.msg,
            submitHandler : function () {
                if(!BOSS.Lock.lock(BOSS.Department.editDepartment)){
                    return false;
                }
                BOSS.Department.getAjax(BOSS.api.editDepartment, $parentBox.serialize(), function (d) {
                    if (d.data != null) {
                        var msg = '修改成功！页面将在2秒内刷新';
                        BOSS.floatTips.successTips(msg);
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    } else {
                        BOSS.floatTips.errorTips(d.errstr);
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    }
                    BOSS.Lock.unlock(BOSS.Department.editDepartment);
                    model.hide();
                }, 0);

            }
        });
    },


};
BOSS.Department.init();