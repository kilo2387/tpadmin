/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.Catalog = {
    addCatalog:$('#addCatalog'),
    editCatalog:$('#editCatalog'),
    lockCatalog:$('#lockCatalog'),
    init:function(){
        var that = this;
        //添加弹窗
        that.addCatalog.on('show.bs.modal', function (event) {
            var model = $(this), button = $(event.relatedTarget), id = button.data('id')
                validateParams = {},$dom = $('[name="pid"]',model);
            $dom.find('option').each(function(){
                if($(this).val() == id){
                    var name = $(this).html();
                    $(this).attr('selected',true);
                    $(this).parent().next().find('button').attr('title',name).find('span').first().html(name);
                }
            });

            that.checkAddValidate(model, validateParams);
        });
        //修改弹窗
        that.editCatalog.on('show.bs.modal',function(event){
            var model = $(this), button = $(event.relatedTarget), id = button.data('id'),pid = button.data('pid'),status = button.data('status'),
                name = button.data('name'),url = button.data('url'),
                validateParams = {},$dom = $('[name="pid"]',model);
            //初始化上级
            $dom.find('option').each(function(){
                if($(this).val() == pid){
                    var sel_name = $(this).html();
                    $(this).attr('selected',true);
                    $(this).parent().next().find('button').attr('title',sel_name).find('span').first().html(sel_name);
                }
            });
            //初始化自已的id
            $('[name="catalog_id"]',model).val(id);
            //初始化栏目名称
            $('[name="name"]',model).val(name);
            //初始化栏目链接
            $('[name="url"]',model).val(url);
            //初始化状态
            $('[name="status"]',model).val(status);

            that.checkEditValidate(model, validateParams);
        });


        //解锁、锁定弹窗
        that.lockCatalog.on('show.bs.modal',function(event){
            var model = $(this), button = $(event.relatedTarget), id = button.data('id'),pid = button.data('pid'),
                name = button.data('name'),url = button.data('url'),status = button.data('status'),title = '锁定目录',msg = '确认将该栏目锁定？',
                validateParams = {},$dom = $('[name="pid"]',model);

            status == 1 && (title = '解锁目录');
            status == 1 && (msg = '确认将该栏目解锁？');
            //status 取反
            status = 1 - status;
            //初始化上级
            $('[name="pid"]',model).val(pid);
            //初始化自已的id
            $('[name="catalog_id"]',model).val(id);
            //初始化栏目名称
            $('[name="name"]',model).val(name);
            //初始化栏目链接
            $('[name="url"]',model).val(url);
            //初始化栏目状态
            $('[name="status"]',model).val(status);
            //初始化窗口名称
            $('#myLockLabel').html(title);
            //初始化窗口提示
            $('.modal-body',model).find('span').html(msg);

            that.checkEditValidate(model, validateParams);
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

    /**
     * 添加验证并提交请求
     * @param model
     * @param validateParams
     */
    checkAddValidate : function (model, validateParams) {
        var $parentBox = model.find('form');
        $parentBox.validate({
            debug: true,
            ignore: [],
            rules: validateParams,
            submitHandler : function () {
                BOSS.Catalog.getAjax(BOSS.api.addCatalog, $parentBox.serialize(), function (d) {
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
    checkEditValidate : function (model, validateParams) {
        var $parentBox = model.find('form');
        $parentBox.validate({
            debug: true,
            ignore: [],
            rules: validateParams,
            submitHandler : function () {
                BOSS.Catalog.getAjax(BOSS.api.editCatalog, $parentBox.serialize(), function (d) {
                    if (d.data != null) {

                        var msg = '修改成功！页面将在2秒内刷新';

                        if(model.attr('aria-labelledby') == 'myLockLabel'){
                            var status = model.find('[name="status"]').val();
                            temp = '锁定';
                            status == 0 && (temp = '解锁');
                            msg = temp+'栏目成功！页面将在2秒内刷新';
                        }
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
                    model.hide();
                }, 0);
            }
        });
    },

};
BOSS.Catalog.init();