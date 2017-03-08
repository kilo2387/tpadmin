/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.Authority = {
    addAuth : $('#addAuth'),
    editAuth : $('#editAuth'),
    enableAuth : $('#enableAuth'),
    ListDom : $('#listTemplate'),
    TemplateFilter : {},
    validateParams : {
        rules : {
            Fcatalog_path : 'required',
            Fauthority_name : 'required',
            Fauthority_url : 'required'
        },
        msg : {
            Fcatalog_path : '请选择栏目！',
            Fauthority_name : '权限名称不能为空！',
            Fauthority_url : '权限URL不能为空！'
        }
    },
    pagesize : 10,
    init:function(){
        var that = this;
        //获得列表模版
        that.Template.getListTemp();
        that.getList(0);

        //添加弹窗
        that.addAuth.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget), $dom = $('[name="Fpid"]',model),$catadom = $('[name="Fcatalog_id"]',model),
                pid = button.data('pid'),cataid = button.data('cataid');
            //上级初始化
            $dom.find('option').each(function(){
                $(this).attr('selected',false);
                if($(this).val() == pid){
                    var name = $(this).html();
                    $(this).attr('selected',true);
                    $dom.val($(this).val());
                    $(this).parent().next().find('button').attr('title',name).find('span').first().html(name);
                }
            });
            //栏目初始化
            $catadom.find('option').each(function(){
                $(this).attr('selected',false);
                if($(this).val() == cataid){
                    var name = $(this).html();
                    $(this).attr('selected',true);
                    $catadom.val($(this).val());
                    $(this).parent().next().find('button').attr('title',name).find('span').first().html(name);
                }
            });

            that.checkAddValidate(model);
        });

        //修改弹窗
        that.editAuth.on('show.bs.modal', function (event) {
            var model = $(this),
                button = $(event.relatedTarget),
                $dom = $('[name="Fpid"]', model),
                $catadom = $('[name="Fcatalog_path"]', model),
                pid = button.data('pid'),
                cataid = button.data('cataid'),
                cataPath = button.data('catapath'),
                id = button.data('id'),
                name = button.data('name'),
                desc = button.data('desc'),
                url = button.data('url');
            //上级初始化
            $dom.find('option').each(function(){
                $(this).attr('selected',false);
                $(this).show();
                if($(this).val() == id){
                    $(this).hide();
                }
                if($(this).val() == pid){
                    $(this).attr('selected',true);
                }
            });
            that.initselect($dom);
            //栏目初始化
            $catadom.find('option').each(function(){
                $(this).attr('selected',false);
                if($(this).val() == cataPath){
                    $(this).attr('selected',true);
                }
            });
            that.initselect($catadom);

            //初始化自已的id
            $('[name="Fauthority_id"]',model).val(id);
            //初始化名称
            $('[name="Fauthority_name"]',model).val(name);
            //初始化链接
            $('[name="Fauthority_url"]',model).val(url);
            //初始化描述
            $('[name="Fauthority_desc"]',model).html(desc);

            that.checkEditValidate(model);
        });

        //启用、禁用弹窗
        that.enableAuth.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget),title = '禁用权限', msg = '确认将该权限禁用？', id = button.data('id'), status = button.data('status');

            status == 1 && (title = '启用权限');
            status == 1 && (msg = '确认将该权限启用？');
            //status 取反
            status = 1 - status;

            //初始化自已的id
            $('[name="Fauthority_id"]',model).val(id);
            //初始化状态
            $('[name="Fstatus"]',model).val(status);
            //初始化窗口名称
            $('#myEnableLabel').html(title);
            //初始化窗口提示
            $('.modal-body',model).find('span').html(msg);

            that.checkEnableValidate(model);
        });

        //查看子级
        $('body').on('click', '.readChildren', function(e){
           $dom = $(e.target),id = $dom.data('id');
            that.getList(id);
        });

    },
    initselect:function($dom){
        $dom.selectpicker('refresh');
        $dom.selectpicker('show');
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


    getList : function(pid){
        if(!BOSS.Lock.lock(BOSS.Authority.ListDom)){
            return false;
        }
        var filter = {
            pid : pid
        }
        BOSS.Authority.getAjax(BOSS.api.getAuthorityList,filter, function (d) {
            if(d.errcode == 0){
                BOSS.Authority.Template.Draw(d.data.result);
            } else {
                BOSS.floatTips.errorTips(d.errstr);
            }
        });
        BOSS.Lock.unlock(BOSS.Authority.ListDom);
    },

    //模版加载
    Template : {
        //得到模版并保存在本地缓存
        getListTemp : function(){
            BOSS.Authority.TemplateFilter.List = BOSS.Authority.ListDom.html();
            BOSS.Util.storage.serialize('BOSS_Authority_List_Template', BOSS.Authority.TemplateFilter.List);
        },
        Draw : function (data){
            var listStr = '',
                template = BOSS.Util.storage.deserialize('BOSS_Authority_List_Template'),
                template = BOSS.control.HTMLDeCode(template);

            if(!BOSS.valid.checkEmptyObj(data)){
                for (var i=0; i<data.length; i++){
                    data[i].fname = BOSS.string.replaceHTML(data[i].fname);
                    data[i].fauthority_name = BOSS.string.replaceHTML(data[i].fauthority_name);
                    data[i].fauthority_desc = BOSS.string.replaceHTML(data[i].fauthority_desc);
                    data[i].fupdate_time = BOSS.string.replaceHTML(data[i].fupdate_time);
                    data[i].foperator_name = BOSS.string.replaceHTML(data[i].foperator_name);
                    data[i].fcatalog_path  = BOSS.string.replaceHTML(data[i].fcatalog_path );
                    listStr += tmpl(template, data[i]);
                }
            } else {
                listStr = '<tr><td class="text-center" colspan="9" rowspan="5">暂无数据</td></tr>';
            }
            listDom = $(listStr);
            BOSS.Authority.ListDom.html(listDom);
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
            rules : BOSS.Authority.validateParams.rules,
            messages :  BOSS.Authority.validateParams.msg,
            submitHandler : function () {
                if(!BOSS.Lock.lock(BOSS.Authority.addAuth)){
                    return false;
                }
                BOSS.Authority.getAjax(BOSS.api.addAuth, $parentBox.serialize(), function (d) {
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
                    BOSS.Lock.unlock(BOSS.Authority.addAuth);
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
            rules : BOSS.Authority.validateParams.rules,
            messages :  BOSS.Authority.validateParams.msg,
            submitHandler : function () {
                if(!BOSS.Lock.lock(BOSS.Authority.editAuth)){
                    return false;
                }
                BOSS.Authority.getAjax(BOSS.api.editAuth, $parentBox.serialize(), function (d) {
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
                    BOSS.Lock.unlock(BOSS.Authority.editAuth);
                    model.hide();
                }, 0);

            }
        });
    },

    /**
     * 启用、禁用验证并提交请求
     * @param model
     * @param validateParams
     */
    checkEnableValidate : function (model) {
        var $parentBox = model.find('form');
        $parentBox.validate({
            debug: false,
            ignore: [],
            submitHandler : function () {
                if(!BOSS.Lock.lock(BOSS.Authority.enableAuth)){
                    return false;
                }
                BOSS.Authority.getAjax(BOSS.api.enableAuth, $parentBox.serialize(), function (d) {
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
                    BOSS.Lock.unlock(BOSS.Authority.enableAuth);
                    model.hide();
                }, 0);

            }
        });
    },

};
BOSS.Authority.init();