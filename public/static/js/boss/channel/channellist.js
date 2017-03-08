/**
 * Created by SEELE on 2016/11/5.
 */
BOSS.ChannelList = {
    requestExtend : 'Channel',
    updateChannelInfo : $('#update_channelmol'),
    valuationCalcShow : $("#mol_valuation_id"),
    quotationDescContent : $("#mol_quotation_id"),
    approximationDescContent : $("#mol_approximation_id"),
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
            var ChannelList = BOSS.ChannelList,
                $urlParam = BOSS.Util.getUrlParamList(),
                filter = {};



            filter.search = BOSS.valid.checkEmptyObj($urlParam);   //判断是否为搜索

            //当前链接地址
            filter.url = window.location.href;

            //当前页
            if($urlParam.page != null && $urlParam.page != 'undefined' && $urlParam.page != ""){
                filter.page = $urlParam.page < 1 ? 1 : $urlParam.page;
            };

            //开始时间
            if($urlParam.begDate != null && $urlParam.begDate != 'undefined' && $urlParam.begDate != ""){
                $('input[name="begDate"]').val($urlParam.begDate);
                filter.begDate = $urlParam.begDate;
            } /*else {
                $('input[name="begDate"]').val(begDate);
            };*/


            //结束时间
            if($urlParam.endDate != null && $urlParam.endDate != 'undefined' && $urlParam.endDate != ""){
                $('input[name="endDate"]').val($urlParam.endDate);
                filter.endDate = $urlParam.endDate;
            } /*else {
                $('input[name="endDate"]').val(endDate);
            };*/

            //时间选择器
            BOSS.Util.datePicker($('input[name="begDate"]'), $('input[name="endDate"]'));
            //渠道类型
            if($urlParam.channelType != null && $urlParam.channelType != undefined && $urlParam.channelType != ""){
                $('select[name="channel_type"] option[value="' + $urlParam.channelType +'"]').attr("selected", true);
                filter.channelType = $urlParam.channelType;
            };

            //渠道标识
            if($urlParam.channelFlag != null && $urlParam.channelFlag != undefined && $urlParam.channelFlag != ""){
                $('select[name="channel_flag"] option[value="' + $urlParam.channelFlag +'"]').attr("selected", true);
                filter.channelFlag = $urlParam.channelFlag;
            };
            //关键词
            if($urlParam.searchWord != null && $urlParam.searchWord != undefined && $urlParam.searchWord != ""){
                $('input[name="searchWord"]').val(decodeURIComponent($urlParam.searchWord));
                filter.searchWord = decodeURIComponent($urlParam.searchWord);
            };
            //查找类型
            if($urlParam.searchType != null && $urlParam.searchType != 'undefined' && $urlParam.searchType != ""){
                $('select[name="search_type"] option[value="' + $urlParam.searchType +'"]').attr("selected", true);
                filter.searchType = $urlParam.searchType;
            }
            //获取渠道列表
            ChannelList.Menu.getChannelListData(BOSS.api.getChannelList + '?requestExtend=' + ChannelList.requestExtend, filter);

            //搜索渠道信息
            $('body').on('click', '#user-search', function () {
                var searchType = $('select[name="search_type"]').val(),
                    searchWord = $('input[name="searchWord"]').val(),
                    begDate = $('input[name="begDate"]').val(),
                    endDate = $('input[name="endDate"]').val(),
                    channelType = $('select[name="channel_type"]').val(),
                    channelFlag = $('select[name="channel_flag"]').val(),
                    url = location.href;
                //渠道类型
                if(channelType != ''){
                    url = BOSS.Util.updateUrlParams(url, 'channelType', channelType, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'channelType');
                }
                //渠道标识
                if(channelFlag != ''){
                    url = BOSS.Util.updateUrlParams(url, 'channelFlag', channelFlag, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'channelFlag');
                }

                //搜索方式处理
                if(searchType && searchType != 0){
                    url = BOSS.Util.updateUrlParams(url, 'searchType', searchType, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'searchType');
                }
                //关键词搜索处理
                if(searchWord){
                    url = BOSS.Util.updateUrlParams(url, 'searchWord', $.trim(searchWord), 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'searchWord');
                }
                //时间搜索处理
                if(begDate && begDate!=false){
                    url = BOSS.Util.updateUrlParams(url, 'begDate', begDate);
                }else{
                    url = BOSS.Util.deleteUrlParams(url, 'begDate');
                }
                if(endDate && endDate!=false){
                    url = BOSS.Util.updateUrlParams(url, 'endDate', endDate);
                }else{
                    url = BOSS.Util.deleteUrlParams(url, 'endDate');
                }

                location.href = url;
            });
            //数据更新
            ChannelList.updateChannelInfo.on('show.bs.modal', function(event){
                var model = $(this), button = $(event.relatedTarget), hidChannelId = button.data('id'),
                    valuationId = $("#mol_valuation_id"),quotationId = $("#mol_quotation_id"),approximationId = $("#mol_approximation_id"),
                    channelType = $("#mol_channel_type"),
                    validateParams = {
                        mol_channel_name : {
                            required: true,
                        }
                    };
                 ChannelList.channelCreate();
                //图片初始化
                BOSS.ChannelList.channelImgCreate();
                //console.log(hidChannelId.length);
                if(hidChannelId){
                    $('.add-edit-modal').text('编辑渠道信息');
                    $('.add-show-element').css('display','none');
                    var selectEl = {"mol_valuation_id":valuationId,"mol_quotation_id":quotationId,"mol_approximation_id":approximationId};
                    ChannelList.Menu.defaultOptionData(button);
                    model.find('[name="mol_channel_id"]').attr('value', hidChannelId);
                }else{
                    $('.add-edit-modal').text('新增渠道');
                    $('.add-show-element').css('display','block');
                    var selectEl = {"mol_channel_type":channelType,"mol_valuation_id":valuationId,"mol_quotation_id":quotationId,"mol_approximation_id":approximationId};
                    ChannelList.getValuationShowAndCalc(0);

                }

                ChannelList.Menu.checkValidate(model, validateParams, selectEl);
            });
            //估价模型计价顺序和展示顺序
            ChannelList.valuationCalcShow.on('change', function(){
               var valuationId = $(this).val();
                BOSS.ChannelList.getValuationShowAndCalc(valuationId);
            });
            //获取报价方案描述
            ChannelList.quotationDescContent.on('change', function(){
                var quotationId = $(this).val();
                BOSS.ChannelList.getQuotationDesc(quotationId);
            });
            //获取近似方案描述
            ChannelList.approximationDescContent.on('change', function(){
                var approximationId = $(this).val();
                BOSS.ChannelList.getApproximationDesc(approximationId);
            });
            //获取本地图片路径
            function getObjectURL(file) {
                var url = null ;
                if (window.createObjectURL!=undefined) { // basic
                    url = window.createObjectURL(file) ;
                } else if (window.URL!=undefined) { // mozilla(firefox)
                    url = window.URL.createObjectURL(file) ;
                } else if (window.webkitURL!=undefined) { // webkit or chrome
                    url = window.webkitURL.createObjectURL(file) ;
                }
                return url ;
            }
            //渠道logo
            $('#fie_channel_logo').bind('change', function(e) {
                //建立一個可存取到該file的url

                var fileDom = $(this);
                // console.log(imgName);
                // console.log(imgPath);
                //上传图片
                var objUrl = getObjectURL(this.files[0]) ;
                $('#fie_channel_img').ajaxSubmit({
                    url: BOSS.api.channelLogo,
                    type: "post",
                    dataType: "json",
                    success: function(d) {
                        //$("#mol_channel_logo").attr('src',imgPath);
                        if (d.data && d.errcode == 0) {
                            $("#channel_logo_url").val(d.data.savepath+""+d.data.savename);
                            //console.log("objUrl = "+objUrl) ;
                            $("#mol_channel_logo").remove();
                            $("#del_channel_logo").remove();
                            /**/
                            var iStyleCss = 'style = "position: relative;top: -22px; cursor: pointer; color: red; font-style: normal; font-weight: bold;"';
                            var imgShowHtm = '<img src="" class="img-thumbnail" id="mol_channel_logo" style="width:63px; height:63px;"/><i id="del_channel_logo" data-img="del_channel_logo" '+iStyleCss+'>X</i>';
                            $("#channel_logo_url").after(imgShowHtm);
                            if (objUrl) {
                                $("#mol_channel_logo").attr("src", objUrl) ;
                            }
                            $("#fie_channel_logo-error").remove();
                        } else {
                            $("#fie_channel_logo").after('<label id="fie_channel_logo-error" class="error" for="fie_channel_logo">'+d.msg+'</label>');
                        }
                    }
                });
            });
            //营业执照上传成功显示图片
            function appendLicenseLogo(index){
                $("#mol_license_logo"+index).remove();
                $("#del_license_logo"+index).remove();
                var iStyleCss = 'style = "position: relative;top: -22px; cursor: pointer; color: red; font-style: normal; font-weight: bold;"';
                var imgShowHtm = '<img src="" class="img-thumbnail" id="mol_license_logo'+index+'" style="width:63px; height:63px;"/><i id="del_license_logo'+index+'" data-img="del_license_logo'+index+'" '+iStyleCss+'>X</i>';
                $("#license_logo3_url").after(imgShowHtm);
                $("#fie_channel_logo-error").remove();
            }
            //营业执照
            $('#fie_license_logo').bind('change', function(e) {
                //建立一個可存取到該file的url

                var fileDom = $(this),
                    license_logo1_url = $("#license_logo1_url"),
                    license_logo2_url = $("#license_logo2_url"),
                    license_logo3_url = $("#license_logo3_url");
                if((license_logo1_url.val()!='') && (license_logo2_url.val()!='') && (license_logo3_url.val()!='')){
                    $("#fie_license_logo").after('<label id="fie_license_logo-error" class="error" for="fie_channel_logo">营业执照最多只能上传3张</label>');
                }else{
                    $("#fie_license_logo-error").remove();
                    var objUrl = getObjectURL(this.files[0]);
                    $('#fie_channel_img').ajaxSubmit({
                        url: BOSS.api.licenseLogo,
                        type: "post",
                        dataType: "json",
                        success: function(d) {
                            //$("#mol_channel_logo").attr('src',imgPath);
                            if (d.data && d.errcode == 0) {
                                if(license_logo1_url.val() == ''){
                                    license_logo1_url.val(d.data.savepath+""+d.data.savename);
                                    appendLicenseLogo(1);
                                    $("#mol_license_logo1").attr("src", objUrl) ;

                                }else if(license_logo2_url.val() == ''){
                                    license_logo2_url.val(d.data.savepath+""+d.data.savename);
                                    appendLicenseLogo(2);
                                    $("#mol_license_logo2").attr("src", objUrl) ;
                                }else if(license_logo3_url.val() == ''){
                                    license_logo3_url.val(d.data.savepath+""+d.data.savename);
                                    appendLicenseLogo(3);
                                    $("#mol_license_logo3").attr("src", objUrl) ;
                                }

                                fileDom.val('');
                            } else {
                                $("#fie_license_logo-error").remove();
                                $("#fie_license_logo").after('<label id="fie_license_logo-error" class="error" for="fie_channel_logo">'+d.msg+'</label>');
                            }
                        }
                    });
                }

            });
            //删除图片
            $("body").on('click', '.upload_img i', function() {
                var v = $(this).attr('data-img');
                if (v == "del_channel_logo") {
                    //删除logo
                    $("#mol_channel_logo").remove();
                    $("#del_channel_logo").remove();
                    $("#channel_logo_url").val("");
                }else if(v == "del_license_logo1"){
                    $("#mol_license_logo1").remove();
                    $("#del_license_logo1").remove();
                    $("#license_logo1_url").val("");
                }else if(v == "del_license_logo2"){
                    $("#mol_license_logo2").remove();
                    $("#del_license_logo2").remove();
                    $("#license_logo2_url").val("");
                }else if(v == "del_license_logo3"){
                    $("#mol_license_logo3").remove();
                    $("#del_license_logo3").remove();
                    $("#license_logo3_url").val("");
                }

                console.log(v);
            });
        },
        /**
         * 获取更新页面原始数据
         * @param button
         */
        defaultOptionData : function(button){
            var hid_channel_name = button.siblings('input[name="hid_channel_name"]').val(),hid_channel_desc = button.siblings('input[name="hid_channel_desc"]').val(),
                hid_partner_id = button.siblings('input[name="hid_partner_id"]').val(),hid_channel_logo = button.siblings('input[name="hid_channel_logo"]').val(),
                hid_license_logo1 = button.siblings('input[name="hid_license_logo1"]').val(),hid_license_logo2 = button.siblings('input[name="hid_license_logo2"]').val(),
                hid_license_logo3 = button.siblings('input[name="hid_license_logo3"]').val(),hid_valuation_id = button.siblings('input[name="hid_valuation_id"]').val(),
                hid_quotation_id = button.siblings('input[name="hid_quotation_id"]').val(),hid_is_need_login = button.siblings('input[name="hid_is_need_login"]').val(),
                hid_user_begin = button.siblings('input[name="hid_user_begin"]').val(),hid_approximation_id = button.siblings('input[name="hid_approximation_id"]').val(),
                hid_rick_id = button.siblings('input[name="hid_rick_id"]').val(),hid_postage_strategy_id = button.siblings('input[name="hid_postage_strategy_id"]').val();
            //渠道名
            $("#mol_channel_name").val(hid_channel_name);
            //渠道描述
            $("#mol_channel_desc").val(hid_channel_desc);
            //合作方
            if(hid_partner_id==0 || hid_partner_id=='') {
                $('select[name="mol_partner_id"]').val('0');
            }else{
                $('select[name="mol_partner_id"]').val(hid_partner_id);
            }
            BOSS.ChannelList.selectReset($('select[name="mol_partner_id"]'));

            //渠道logo
            $("#channel_logo_url").val(hid_channel_logo);
            var iStyleCss = 'style = "position: relative;top: -22px; cursor: pointer; color: red; font-style: normal; font-weight: bold;"';
            if(hid_channel_logo){
                var imgShowHtm = '<img src="'+BOSS.uploadImg+hid_channel_logo+'" class="img-thumbnail" id="mol_channel_logo" style="width:63px; height:63px;"/><i id="del_channel_logo" data-img="del_channel_logo" '+iStyleCss+'>X</i>';
                $("#channel_logo_url").after(imgShowHtm);
            }

            //营业执照1
            $("#license_logo1_url").val(hid_license_logo1);
            var licenseImgShowHtm = "";
            if(hid_license_logo1){
                licenseImgShowHtm += '<img src="'+BOSS.uploadImg+hid_license_logo1+'" class="img-thumbnail" id="mol_license_logo1" style="width:63px; height:63px;"/><i id="del_license_logo1" data-img="del_license_logo1" '+iStyleCss+'>X</i>';
            }
            //营业执照2
            $("#license_logo2_url").val(hid_license_logo2);
            if(hid_license_logo1){
                licenseImgShowHtm += '<img src="'+BOSS.uploadImg+hid_license_logo2+'" class="img-thumbnail" id="mol_license_logo2" style="width:63px; height:63px;"/><i id="del_license_logo2" data-img="del_license_logo2" '+iStyleCss+'>X</i>';
            }
            //营业执照3
            $("#license_logo3_url").val(hid_license_logo3);
            if(hid_license_logo1){
                licenseImgShowHtm += '<img src="'+BOSS.uploadImg+hid_license_logo3+'" class="img-thumbnail" id="mol_license_logo3" style="width:63px; height:63px;"/><i id="del_license_logo3" data-img="del_license_logo3" '+iStyleCss+'>X</i>';
            }
            $("#license_logo3_url").after(licenseImgShowHtm);
            //估价方案mol_valuation_id
            if(hid_valuation_id==0 || hid_valuation_id=='') {
                $('select[name="mol_valuation_id"]').val('');
            }else{
                $('select[name="mol_valuation_id"]').val(hid_valuation_id);
            }
            BOSS.ChannelList.selectReset($('select[name="mol_valuation_id"]'));

            //估价方案描述
            BOSS.ChannelList.getValuationShowAndCalc(hid_valuation_id);

            //报价方案mol_quotation_id
            if(hid_quotation_id==0 || hid_quotation_id=='') {
                $('select[name="mol_quotation_id"]').val('');
            }else{
                $('select[name="mol_quotation_id"]').val(hid_quotation_id);
            }
            BOSS.ChannelList.selectReset($('select[name="mol_quotation_id"]'));
            //报价方案描述
            BOSS.ChannelList.getQuotationDesc(hid_quotation_id);
            //是否需要登录
            $("input[name='mol_is_need_login'][value='"+hid_is_need_login+"']").attr("checked",true);
            //工号前缀
            $("#mol_user_begin").val(hid_user_begin);
            //价格近似方案mol_approximation_id
            if(hid_approximation_id==0 || hid_approximation_id=='') {
                $('select[name="mol_approximation_id"]').val('');
            }else{
                $('select[name="mol_approximation_id"]').val(hid_approximation_id);
            }
            BOSS.ChannelList.selectReset($('select[name="mol_approximation_id"]'));
            //价格近似方案描述
            BOSS.ChannelList.getApproximationDesc(hid_approximation_id);
            //渠道风险配置mol_rick_id
            if(hid_rick_id==0 || hid_rick_id=='') {
                $('select[name="mol_rick_id"]').val('');
            }else{
                $('select[name="mol_rick_id"]').val(hid_rick_id);
            }
            BOSS.ChannelList.selectReset($('select[name="mol_rick_id"]'));
            //运费策略配置mol_postage_strategy_id
            if(hid_postage_strategy_id==0 || hid_postage_strategy_id=='') {
                $('select[name="mol_postage_strategy_id"]').val('');
            }else{
                $('select[name="mol_postage_strategy_id"]').val(hid_postage_strategy_id);
            }
            BOSS.ChannelList.selectReset($('select[name="mol_postage_strategy_id"]'));

        },
        /**
         * 验证<select>表单类型提示
         * @param selElArr
         * @returns {boolean}
         */
        checkSelectOption : function (selElArr){
            if(selElArr){
                var flag = true;
                $.each(selElArr,function(name,value) {
                    if(value.val()==null || value.val()==''){
                        flag = false;
                        //console.log($("#"+name+"-error").text());
                        if($("#"+name+"-error").text()=='' || $("#"+name+"-error").text()==null){
                            value.parent('div').append('<label id="'+name+'-error" class="error" for="'+name+'">这个字段是空的.</label>');
                        }
                    }else{
                        $("#"+name+"-error").remove();
                    }

                });
                return flag;
            }

        },
        /**
         * 验证并提交请求
         * @param model
         * @param validateParams
         */
        checkValidate : function (model, validateParams, selectEl) {
            var $parentBox = model.find('form');
            $parentBox.validate({
                debug: true,
                ignore: [],
                rules: validateParams,
                submitHandler : function () {
                    var isPassChecked = BOSS.ChannelList.Menu.checkSelectOption(selectEl);
                    if(!isPassChecked){
                        return false;
                    }
                    var channel_id = $parentBox.find("input[name='mol_channel_id']").val();
                    var user_begin = $parentBox.find("input[name='mol_user_begin']").val();
                    // console.log(channel_id);
                    // console.log(user_begin);
                    //2c渠道不判断工号前缀
                    if (parseInt(channel_id) < 10000001 && user_begin.length==0) {
                        $parentBox.find("input[name='mol_user_begin']").after('<label id="mol_user_begin-error" class="error" for="mol_user_begin">必须填写工号前缀.</label>');
                        return;
                    }else{
                        $("#mol_user_begin-error").remove();
                    }
                    //2c渠道不判断工号前缀
                    if (parseInt(channel_id) < 10000001 && !(user_begin.match(/^(?:[A-Za-z]{2}){1,2}[0-9]{4}$/))) {
                        $parentBox.find("input[name='mol_user_begin']").after('<label id="mol_user_begin-error" class="error" for="mol_user_begin">格式不正确.</label>');
                        return;
                    }else{
                        $("#mol_user_begin-error").remove();
                    }
                        BOSS.ChannelList.getAjax(BOSS.api.editChannelInfo, $parentBox.serialize(), function (d) {
                            if (d.data != null) {
                                BOSS.floatTips.successTips('操作成功!页面将在2秒内刷新');
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
         * 获取用户列表
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getChannelListData : function (requestLink, data) {
            BOSS.ChannelList.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    BOSS.ChannelList.channelListTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                } else {
                    BOSS.ChannelList.channelListTemplate.draw();
                    $('.orders-num').text(0);
                    $('.orders-prices').text(0);
                    BOSS.floatTips.errorTips('暂无数据！');
                }
            }, 0);
        },

    },
    /**
     * Menu结束
     * 估价方案展示和计算顺序
     * @param valuation_id
     */
    getValuationShowAndCalc : function(valuation_id){
        BOSS.ChannelList.getAjax(BOSS.api.getValuationCalcOrShow, {"valuationId":valuation_id}, function (d) {
            if (d.data != null) {
                $('.valuation_colc_show').html('');
                $('.valuation_colc_show').html(d.htmlStr);

            } else {
                $('.valuation_colc_show').html('');
                $('.valuation_colc_show').html(d.htmlStr);
            }
        }, 0);
    },
    /**
     * select表单重置
     * @param element
     */
    selectReset : function(element){
        element.selectpicker('refresh');
        element.selectpicker('show');
    },
    /**
     * 初始化modal表单
     */
    channelCreate : function () {
        //渠道id
        $("input[name='mol_channel_id']").val('');
        //渠道类别
        $("select[name='mol_channel_type']").val('');
        BOSS.ChannelList.selectReset($("select[name='mol_channel_type']"));
        //渠道名称
        $("input[name='mol_channel_name']").val('');
        //渠道描述
        $("input[name='mol_channel_desc']").val('');
        //合作方
        $("select[name='mol_partner_id']").val('0');
        BOSS.ChannelList.selectReset($("select[name='mol_partner_id']"));

        //估价方案
        $("select[name='mol_valuation_id']").val('');
        BOSS.ChannelList.selectReset($("select[name='mol_valuation_id']"));
        //报价方案
        $("select[name='mol_quotation_id']").val('');
        BOSS.ChannelList.selectReset($("select[name='mol_quotation_id']"));
        //报价方案描述
        $('.quotation_desc_content').val('');
        //是否需要登陆
        $("input[name='mol_is_need_login'][value='1']").attr("checked",true);
        //工号前缀
        $("input[name='mol_user_begin']").val('');
        //价格近似方案
        $("select[name='mol_approximation_id']").val('');
        BOSS.ChannelList.selectReset($("select[name='mol_approximation_id']"));
        //价格近似方案描述
        $('.approximation_desc_content').val('');
        //渠道风险配置
        $("select[name='mol_rick_id']").val('');
        BOSS.ChannelList.selectReset($("select[name='mol_rick_id']"));
        //运费策略配置
        $("select[name='mol_postage_strategy_id']").val('');
        BOSS.ChannelList.selectReset($("select[name='mol_postage_strategy_id']"));


    },
    /**
     * 上传图片初始化
     */
    channelImgCreate : function(){
        //渠道logo初始化
        $("#fie_channel_logo").val('');
        $("#channel_logo_url").val('');
        $("#mol_channel_logo").remove();
        $("#del_channel_logo").remove();
        $("#fie_channel_logo-error").remove();
        //营业执照初始化
        $("#fie_license_logo").val('');

        $("#license_logo1_url").val('');
        $("#mol_license_logo1").remove();
        $("#del_license_logo1").remove();
        $("#license_logo2_url").val('');
        $("#mol_license_logo2").remove();
        $("#del_license_logo2").remove();
        $("#license_logo3_url").val('');
        $("#mol_license_logo3").remove();
        $("#del_license_logo3").remove();

        $("#fie_license_logo-error").remove();
    },
    /**
     * 报价方案描述
     * @param quotation_id
     */
    getQuotationDesc : function(quotation_id){
        BOSS.ChannelList.getAjax(BOSS.api.getQuotationDescContent, {"quotationId":quotation_id}, function (d) {
                $('.quotation_desc_content').val('');
                $('.quotation_desc_content').val(d.data);

        }, 0);
    },
    /**
     * 近似方案描述
     * @param approximation_id
     */
    getApproximationDesc : function(approximation_id){
        BOSS.ChannelList.getAjax(BOSS.api.getApproximationDescContent, {"approximationId":approximation_id}, function (d) {
            $('.approximation_desc_content').val('');
            $('.approximation_desc_content').val(d.data);

        }, 0);
    },
    /**
     * 获取待渠道列表模板
     */
    channelListTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.panel-body-table table tbody'), item = $('tr', list);
            // 引用 View/Channel/channelListTemplate.html
            $.get('http://' + BOSS.domain + '/Channel/channelListTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){
                        data[i].fchannel_id = BOSS.string.replaceHTML(data[i].fchannel_id);
                        data[i].fchannel_name = BOSS.string.replaceHTML(data[i].fchannel_name);
                        data[i].fchannel_type_name = BOSS.string.replaceHTML(data[i].fchannel_type_name);
                        data[i].fchannel_flag_name = BOSS.string.replaceHTML(data[i].fchannel_flag_name);
                        data[i].fpartner_name = BOSS.string.replaceHTML(data[i].fpartner_name);
                        data[i].fchannel_desc = BOSS.string.replaceHTML(data[i].fchannel_desc);
                        data[i].fcreate_time = BOSS.string.replaceHTML(data[i].fcreate_time);
                        data[i].fupdate_time = BOSS.string.replaceHTML(data[i].fupdate_time);
                        data[i].fpartner_id = BOSS.string.replaceHTML(data[i].fpartner_id);
                        data[i].fchannel_logo = BOSS.string.replaceHTML(data[i].fchannel_logo);
                        data[i].flicense_logo1 = BOSS.string.replaceHTML(data[i].flicense_logo1);
                        data[i].flicense_logo2 = BOSS.string.replaceHTML(data[i].flicense_logo2);
                        data[i].flicense_logo3 = BOSS.string.replaceHTML(data[i].flicense_logo3);
                        data[i].fvaluation_id = BOSS.string.replaceHTML(data[i].fvaluation_id);
                        data[i].fquotation_id = BOSS.string.replaceHTML(data[i].fquotation_id);
                        data[i].fis_need_login = BOSS.string.replaceHTML(data[i].fis_need_login);
                        data[i].fuser_begin = BOSS.string.replaceHTML(data[i].fuser_begin);
                        data[i].fapproximation_id = BOSS.string.replaceHTML(data[i].fapproximation_id);
                        data[i].frick_id = BOSS.string.replaceHTML(data[i].frick_id);
                        data[i].fpostage_strategy_id = BOSS.string.replaceHTML(data[i].fpostage_strategy_id);
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="10" rowspan="5">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        }
    },

}
BOSS.ChannelList.init();