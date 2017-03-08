/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.Role = {
    addRole : $('#addRole'),
    editRole : $('#editRole'),
    enableRole : $('#enableRole'),
    appendAuthority : $('#appendAuthority'),
    ListDom : $('#listTemplate'),
    TemplateFilter : {},
    pagesize : 10,
    zNodes : {},
    currentAuthority : [],
    validateParams : {
        rules : {
            role_name : 'required',

        },
        msg : {
            role_name : '名称不能为空！',
        }
    },
    init:function(){
        var that = this;

        //获得列表模版
        that.Template.getListTemp();
        that.getList(1);

        //添加角色
        that.addRole.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget);
            that.checkValidate(model);
        });

        //修改角色
        that.editRole.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget), id = button.data('id');
            that.getOne(id, model);
            that.checkValidate(model);
        });

        //启用、禁用弹窗
        that.enableRole.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget), title = '禁用权限', msg = '确认将该权限禁用？', id = button.data('id'), usable = button.data('usable');

            usable == 1 && (title = '启用权限');
            usable == 1 && (msg = '确认将该权限启用？');
            //status 取反
            usable = 1 - usable;

            //初始化角色的id
            $('[name="role_id"]', model).val(id);

            //初始化状态
            $('[name="role_usable"]', model).val(usable);

            //初始化窗口名称
            $('#myEnableLabel').html(title);

            //初始化窗口提示
            $('.modal-body', model).find('span').html(msg);
            that.checkEnableValidate(model);
        });

        //添加权限
        that.appendAuthority.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget), id = button.data('id'), setting = {
                check: {enable: true},
                data: {simpleData: {enable: true}},
                callback: {onCheck: that.onCheck},
            };

            //初始化权限树
            that.getAuthoritTree($("#treeDemo"), setting);

            //初始化角色的id
            $('[name="role_id"]', model).val(id);
            that.checkAuthorityValidate(model);
        });

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
     * 获取角色列表
     * @param pageindex
     */
    getList : function(pageindex){

        if(!BOSS.Lock.lock(BOSS.Role.ListDom)){
            return false;
        }
        var filter = {
            "pagesize": this.pagesize,
            "pageindex": pageindex
        }
        BOSS.Role.getAjax(BOSS.api.getRoleList,filter, function (d) {

            if(d.errcode == 0){
                BOSS.Role.Template.Draw(d.data.result);
                BOSS.Role.RefreshPage({total : d.data.pageinfo.total, pagesize : d.data.pageinfo.pagesize },$('.panel-footer'),pageindex);
            } else {
                BOSS.floatTips.errorTips(d.errstr);
            }

        });

        BOSS.Lock.unlock(BOSS.Role.ListDom);
    },
    /**
     * 获取单个角色
     * @param id
     * @param model
     */
    getOne : function(id, model) {
        var filter = {
            role_id : id,
        }
        BOSS.Role.getAjax(BOSS.api.getOneRole, filter , function (d) {
            if (d.data != null) {
                var $departmentDom = $('[name="department_id"]', model)
                $departmentDom.find('option').each(function(){
                    if($(this).val() == d.data.fdepartment_id){
                        var name = $(this).html();
                        $(this).attr('selected',true);
                        $(this).parent().next().find('button').attr('title',name).find('span').first().html(name);
                    }
                });
                $('[name="role_id"]',model).val(d.data.frole_id);
                $('[name="role_name"]',model).val(d.data.frole_name);
                $('[name="role_desc"]',model).val(d.data.frole_desc);
                $('.role-type [value="' + d.data.frole_type + '"]').click();
                $('.role-usable [value="' + d.data.frole_usable + '"]').click();
            } else {
                BOSS.floatTips.errorTips(d.errstr);
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            };
        });
    },

    /**
     * 获取权限树
     * @param dom
     * @param setting
     */
    getAuthoritTree : function(dom, setting){
        BOSS.Role.getAjax(BOSS.api.authorityTree, '' , function (d) {
            if (d.data != null) {
                var data = {}, roleAuthority;
                BOSS.Role.zNodes = d.data;

                data.role_id = dom.siblings('[name="role_id"]').val();
                BOSS.Role.getAjax(BOSS.api.getOneRole, data , function (d) {
                    if (d.data != null) {
                        roleAuthority = d.data.fauthority_id.split('#');
                    };
                }, null, 'sync');
                $.each(BOSS.Role.zNodes, function (i, item) {
                    roleAuthority.forEach( function (it) {
                        if (it == item.id) {
                            item.checked = true;
                        }
                    })

                });
                $.fn.zTree.init(dom, setting, BOSS.Role.zNodes);
            } else {
                BOSS.floatTips.errorTips(d.errstr);
                setTimeout(function () {
                    window.location.reload();
                }, 2000);
            };
        });
    },

    /**
     * 获取选中后的所有权限
     * @param event
     * @param treeId
     * @param treeNode
     */
    onCheck : function(event, treeId, treeNode){
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        var $itemAuthority = zTree.getCheckedNodes(true);
        BOSS.Role.currentAuthority = [];
        if($itemAuthority.length > 0){
            $.each($itemAuthority, function (i, item) {
                BOSS.Role.currentAuthority.push(item.id);
            });
        } else {
            BOSS.Role.currentAuthority = [];
        }
        $('[name="authority_id"]', BOSS.Role.appendAuthority).val(BOSS.Role.currentAuthority);
    },


    //模版加载
    Template : {
        //得到模版并保存在本地缓存
        getListTemp : function(){
            BOSS.Role.TemplateFilter.List = BOSS.Role.ListDom.html();
            BOSS.Util.storage.serialize('BOSS_Role_List_Template', BOSS.Role.TemplateFilter.List);
        },
        Draw : function (data){
            var listStr = '',
                template = BOSS.Util.storage.deserialize('BOSS_Role_List_Template'),
                template = BOSS.control.HTMLDeCode(template);

            if(!BOSS.valid.checkEmptyObj(data)){
                for (var i=0; i<data.length; i++){
                    data[i].frole_id = BOSS.string.replaceHTML(data[i].frole_id);
                    data[i].frole_name = BOSS.string.replaceHTML(data[i].frole_name);
                    data[i].fdepartment_name = BOSS.string.replaceHTML(data[i].fdepartment_name);
                    data[i].fupdate_time = BOSS.string.replaceHTML(data[i].fupdate_time);
                    data[i].foperator_name = BOSS.string.replaceHTML(data[i].foperator_name);
                    data[i].frole_usable = BOSS.string.replaceHTML(data[i].frole_usable);
                    listStr += tmpl(template, data[i]);
                }
            } else {
                listStr = '<tr><td class="text-center" colspan="9" rowspan="5">暂无数据</td></tr>';
            }
            listDom = $(listStr);
            BOSS.Role.ListDom.html(listDom);
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


    /**
     * 验证并提交请求
     * @param model
     * @param validateParams
     */
    checkValidate : function (model) {
        var $parentBox = model.find('form');
        $parentBox.validate({
            debug: true,
            ignore: [],
            rules : BOSS.Role.validateParams.rules,
            messages : BOSS.Role.validateParams.msg,
            submitHandler : function () {
                if($parentBox.hasClass('add-role')){
                    if(!BOSS.Lock.lock(BOSS.Role.addRole)){
                        return false;
                    }
                    BOSS.Role.getAjax(BOSS.api.addRole, $parentBox.serialize(), function (d) {
                        if (d.data != null) {
                            BOSS.floatTips.successTips('添加成功！页面将在2秒内刷新');
                            setTimeout(function () {
                                window.location.reload();
                            }, 2000);
                        } else {
                            BOSS.floatTips.errorTips(d.errstr);
                            setTimeout(function () {
                                window.location.reload();
                            }, 2000);
                        }
                        BOSS.Lock.unlock(BOSS.Role.addAuth);
                        model.hide();
                    }, 0);
                } else {
                    if(!BOSS.Lock.lock(BOSS.Role.editRole)){
                        return false;
                    }
                    BOSS.Role.getAjax(BOSS.api.editRole, $parentBox.serialize(), function (d) {
                        if (d.data != null) {
                            BOSS.floatTips.successTips('修改成功！页面将在2秒内刷新');
                            setTimeout(function () {
                                window.location.reload();
                            }, 2000);
                        } else {
                            BOSS.floatTips.errorTips(d.errstr);
                            setTimeout(function () {
                                window.location.reload();
                            }, 2000);
                        }
                        BOSS.Lock.unlock(BOSS.Role.editRole);
                        model.hide();
                    }, 0);
                };
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
            debug: true,
            ignore: [],
            submitHandler : function () {
                if(!BOSS.Lock.lock(BOSS.Role.enableRole)){
                    return false;
                };
                BOSS.Role.getAjax(BOSS.api.enableRole, $parentBox.serialize(), function (d) {
                    if (d.data != null) {
                        BOSS.floatTips.successTips('修改成功！页面将在2秒内刷新');
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    } else {
                        BOSS.floatTips.errorTips(d.errstr);
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    }
                    BOSS.Lock.unlock(BOSS.Role.enableRole);
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
    checkAuthorityValidate : function (model) {
        var $parentBox = model.find('form');
        $parentBox.validate({
            debug: true,
            ignore: [],
            submitHandler : function () {
                if(!BOSS.Lock.lock(BOSS.Role.appendAuthority)){
                    return false;
                };
                BOSS.Role.getAjax(BOSS.api.updateRoleAuthority, $parentBox.serialize(), function (d) {
                    if (d.data != null) {
                        BOSS.floatTips.successTips('角色权限更新成功！页面将在2秒内刷新');
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    } else {
                        BOSS.floatTips.errorTips(d.errstr);
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    }
                    BOSS.Lock.unlock(BOSS.Role.appendAuthority);
                    model.hide();
                }, 0);

            }
        });
    },

};
BOSS.Role.init();