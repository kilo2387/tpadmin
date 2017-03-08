/**
 * Created by SEELE on 2016/11/5.
 */
BOSS.HeaderHandle = {
    requestExtend : 'Store',
    updateOrganizationInfo : $("#update_storemol"),
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
            var UseHeaderHandle= BOSS.HeaderHandle,
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
            //门店类型
            if($urlParam.storeType != null && $urlParam.storeType != undefined && $urlParam.storeType != ""){
                $('select[name="store_type"] option[value="' + $urlParam.storeType +'"]').attr("selected", true);
                filter.storeType = $urlParam.storeType;
            };

            //省
            if($urlParam.provinceId != null && $urlParam.provinceId != undefined && $urlParam.provinceId != ""){
                $('select[name="province_id"] option[value="' + $urlParam.provinceId +'"]').attr("selected", true);
                filter.provinceId = $urlParam.provinceId;
            };
            //市
            if($urlParam.cityId != null && $urlParam.cityId != undefined && $urlParam.cityId != ""){
                $('select[name="city_id"] option[value="' + $urlParam.cityId +'"]').attr("selected", true);
                filter.cityId = $urlParam.cityId;
            };
            //区
            if($urlParam.areaId != null && $urlParam.areaId != undefined && $urlParam.areaId != ""){
                $('select[name="area_id"] option[value="' + $urlParam.areaId +'"]').attr("selected", true);
                filter.areaId = $urlParam.areaId;
            };
            //状态
            if($urlParam.storeStatus != null && $urlParam.storeStatus != undefined && $urlParam.storeStatus != ""){
                $('select[name="store_status"] option[value="' + $urlParam.storeStatus +'"]').attr("selected", true);
                filter.storeStatus = $urlParam.storeStatus;
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
            //获取数据列表
            UseHeaderHandle.Menu.getListData(BOSS.api.getStoreList + '?requestExtend=' + UseHeaderHandle.requestExtend, filter);

            //获取级联市
            $('body').on('change', '#sel_province', function(){
                UseHeaderHandle.Menu.getCityData('sel_province', 'sel_city', 'sel_area');

            });
            //修改信息弹窗中获取级联市
            $('body').on('change', '#mol_sel_province', function(){
                UseHeaderHandle.Menu.getCityData('mol_sel_province', 'mol_sel_city', 'mol_sel_area');

            });
            //获取级联区
            $('body').on('change', '#sel_city', function(){
                UseHeaderHandle.Menu.getAreaData('sel_city', 'sel_area');
            });
            //修改信息弹窗中获取级联区
            $('body').on('change', '#mol_sel_city', function(){
                UseHeaderHandle.Menu.getAreaData('mol_sel_city', 'mol_sel_area');
            });
            //搜索渠道信息
            $('body').on('click', '#user-search', function () {
                var searchType = $('select[name="search_type"]').val(),
                    searchWord = $('input[name="searchWord"]').val(),
                    begDate = $('input[name="begDate"]').val(),
                    endDate = $('input[name="endDate"]').val(),
                    storeType = $('select[name="store_type"]').val(),
                    provinceId = $('select[name="province_id"]').val(),
                    cityId = $('select[name="city_id"]').val(),
                    areaId = $('select[name="area_id"]').val(),
                    storeStatus = $('select[name="store_status"]').val(),
                    url = location.href;

                //门店类型
                if(storeType != ''){
                    url = BOSS.Util.updateUrlParams(url, 'storeType', storeType, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'storeType');
                }
                //省
                if(provinceId != ''){
                    url = BOSS.Util.updateUrlParams(url, 'provinceId', provinceId, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'provinceId');
                }
                //市
                if(cityId != ''){
                    url = BOSS.Util.updateUrlParams(url, 'cityId', cityId, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'cityId');
                }
                //区
                if(areaId != ''){
                    url = BOSS.Util.updateUrlParams(url, 'areaId', areaId, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'areaId');
                }
                //状态
                if(storeStatus != ''){
                    url = BOSS.Util.updateUrlParams(url, 'storeStatus', storeStatus, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'storeStatus');
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
            //获取级联门店组
            $('body').on('change', '#mol_sel_channel_id', function(){
                UseHeaderHandle.Menu.getStoreGroup();
            })
            //修改信息
            UseHeaderHandle.updateOrganizationInfo.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), hidOrganizationId = button.data('id'),
                    validateParams = {
                        mol_organization_name : {
                        required: true,
                    }};
                UseHeaderHandle.Menu.storeCreate();
                if(hidOrganizationId){
                    $('.add-edit-modal').text('门店信息编辑');
                    $('.add-show-element').css('display','none');
                    $('.add-hide-element').css('display','block');
                    UseHeaderHandle.Menu.defaultOptionData(button);
                    model.find('[name="mol_organization_id"]').attr('value', hidOrganizationId);
                }else{
                    if($("#is_getChannel").val()==0){
                        UseHeaderHandle.Menu.getTwoBChannel();
                    }
                    $('.add-edit-modal').text('门店信息添加');
                    $('.add-hide-element').css('display','none');
                    $('.add-show-element').css('display','block');
                }
                //console.log($("select[name='mol_store_type']").val());
                UseHeaderHandle.Menu.checkValidate(model, validateParams);
            });

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
         * 进入更新页面默认值
         * @param button
         */
        defaultOptionData : function(button){

            var hidOrganizationName = button.siblings('input[name="hid_organization_name"]').val(),hidStoreType = button.siblings('input[name="hid_store_type"]').val(),
                hidChannelName = button.siblings('input[name="hid_channel_name"]').val(),hidProvinceId = button.siblings('input[name="hid_province_id"]').val(),
                hidCityId = button.siblings('input[name="hid_city_id"]').val(),hidAreaId = button.siblings('input[name="hid_area_id"]').val(),
                hidBossUserId = button.siblings('input[name="hid_boss_user_id"]').val(),hidStoreStatus = button.siblings('input[name="hid_store_status"]').val();
            //门店名
            $('input[name="mol_organization_name"]').val(hidOrganizationName);
            //门店类型
            if(hidStoreType==0 || hidProvinceId=='') {
                $('select[name="mol_store_type"]').val('');

            }else{
                $('select[name="mol_store_type"]').val(hidStoreType);
            }
            BOSS.HeaderHandle.Menu.selectReset($('select[name="mol_store_type"]'));
            //渠道名
            $('input[name="mol_channel_name"]').val(hidChannelName);
            //省
            if(hidProvinceId==0 || hidProvinceId==''){
                $('select[name="mol_province_id"]').val('');
            }else{
                $('select[name="mol_province_id"]').val(hidProvinceId);

            }
            BOSS.HeaderHandle.Menu.selectReset($('select[name="mol_province_id"]'));

            if(hidProvinceId){
                var province_id = hidProvinceId;
                $.get('http://' + BOSS.domain + '/Store/getAjaxCity',{"province_id":province_id},function(pData){
                    var cityEl = $('#mol_sel_city');
                    cityEl.empty();
                    var optionstr = "<option value=''>选择市</option>";
                    if(pData!=null){
                        $.each(pData,function(i,val){
                            if(i==hidCityId){
                                optionstr += "<option value='"+i+"' selected='selected'>"+val+"</option>";
                            }
                            optionstr += "<option value='"+i+"'>"+val+"</option>";
                        })
                    }
                    //console.log(optionstr);
                    cityEl.append(optionstr);
                    BOSS.HeaderHandle.Menu.selectReset(cityEl);
                })
            }
            if(hidCityId){
                var city_id = hidCityId;
                $.get('http://' + BOSS.domain + '/Store/getAjaxArea',{"city_id":city_id},function(pData){
                    var areaEl2 = $('#mol_sel_area');
                    areaEl2.empty();
                    var optionstr = "<option value=''>选择区</option>";
                    if(pData!=null){
                        $.each(pData,function(i,val){
                            if(i==hidAreaId){
                                optionstr += "<option value='"+i+"' selected='selected'>"+val+"</option>";
                            }
                            optionstr += "<option value='"+i+"'>"+val+"</option>";
                        })
                    }
                    //console.log(optionstr);
                    areaEl2.append(optionstr);
                    BOSS.HeaderHandle.Menu.selectReset(areaEl2);
                })
            }
            //渠道经理
            if(hidBossUserId==0 || hidBossUserId==''){

                $('select[name="mol_boss_user_id"]').val('');
            }else{
                $('select[name="mol_boss_user_id"]').val(hidBossUserId);

            }
            BOSS.HeaderHandle.Menu.selectReset($('select[name="mol_boss_user_id"]'));
            //门店状态
            $('select[name="mol_store_status"]').val(hidStoreStatus);

            BOSS.HeaderHandle.Menu.selectReset($('select[name="mol_store_status"]'));


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
         * 同步获取2B渠道合作商
         */
        getTwoBChannel : function () {

            $.ajax({
                type:"POST",
                url:'http://' + BOSS.domain + '/Store/getTwoBChannel',
                dataType:"json",
                async: false,
                success:function(result){
                    var  channelEl= $('#mol_sel_channel_id');
                    channelEl.empty();
                    var optionstr = "<option value=''>请选择</option>";
                    if(result!=null){
                        $("#is_getChannel").val(1);
                        $.each(result,function(i,val){
                            optionstr += "<option value='"+i+"'>"+val+"</option>";
                        })
                    }
                    channelEl.append(optionstr);
                    BOSS.HeaderHandle.Menu.selectReset(channelEl);
                }
            })
        },
        /**
         * 获取级联门店组
         */
        getStoreGroup : function () {
            var organizationId = $("#mol_sel_channel_id").val();
            $.get('http://' + BOSS.domain + '/Store/getStoreGroup',{"organizationId":organizationId},function(da){
                var storeGroupEl = $('#mol_sel_organization_groupId');
                storeGroupEl.empty();
                var optionstr = "<option value=''>请选择</option>";
                if(da!=null){
                    $.each(da,function(i,val){
                        optionstr += "<option value='"+i+"'>"+val+"</option>";
                    })
                }
                //console.log(optionstr);
                storeGroupEl.append(optionstr);
                BOSS.HeaderHandle.Menu.selectReset(storeGroupEl);
            })
        },
        /**
         * 获取级联市
         * @param provinceIdName
         * @param cityIdName
         * @param areaIdName
         */
        getCityData : function (provinceIdName, cityIdName, areaIdName) {
            var province_id = $("#"+provinceIdName).val();
            $.get('http://' + BOSS.domain + '/Store/getAjaxCity',{"province_id":province_id},function(pData){
                var cityEl = $('#'+cityIdName);
                var areaEl = $('#'+areaIdName);
                cityEl.empty();
                areaEl.empty();
                var optionstr = "<option value=''>选择市</option>";
                var optionstr2 = "<option value=''>选择区</option>";
                if(pData!=null){
                    $.each(pData,function(i,val){
                        optionstr += "<option value='"+i+"'>"+val+"</option>";
                    })
                }
                //console.log(optionstr);
                cityEl.append(optionstr);
                areaEl.append(optionstr2);
                BOSS.HeaderHandle.Menu.selectReset(cityEl);
                BOSS.HeaderHandle.Menu.selectReset(areaEl);
            })
        },
        /**
         * 获取级联区
         * @param cityIdName
         * @param areaIdName
         */
        getAreaData : function (cityIdName, areaIdName) {
            var city_id = $("#"+cityIdName).val();
            $.get('http://' + BOSS.domain + '/Store/getAjaxArea',{"city_id":city_id},function(pData){
                var areaEl = $('#'+areaIdName);
                areaEl.empty();
                var optionstr = "<option value=''>选择区</option>";
                if(pData!=null){
                    $.each(pData,function(i,val){
                        optionstr += "<option value='"+i+"'>"+val+"</option>";
                    })
                }
                //console.log(optionstr);
                areaEl.append(optionstr);
                BOSS.HeaderHandle.Menu.selectReset(areaEl);
            })
        },
        /**
         * 初始化modal表单
         */
        storeCreate : function () {
            //2B合作渠道
            $("select[name='mol_channel_id']").val('');
            BOSS.HeaderHandle.Menu.selectReset($("select[name='mol_channel_id']"));
            //门店组
            $("select[name='mol_organization_groupId']").html("<option value=''>请选择</option>");
            $("select[name='mol_organization_groupId']").val('');
            BOSS.HeaderHandle.Menu.selectReset($("select[name='mol_organization_groupId']"));
            //门店id
            $("input[name='mol_organization_id']").val('');
            //门店名称
            $("input[name='mol_organization_name']").val('');
            //门店类型
            $("select[name='mol_store_type']").val('');
            BOSS.HeaderHandle.Menu.selectReset($("select[name='mol_store_type']"));

            //渠道名称
            $("input[name='mol_channel_name']").val('');
            //省
            $("select[name='mol_province_id']").val('');
            BOSS.HeaderHandle.Menu.selectReset($("select[name='mol_province_id']"));
            //市
            $("select[name='mol_city_id']").html("<option value=''>选择市</option>");
            $("select[name='mol_city_id']").val('');
            BOSS.HeaderHandle.Menu.selectReset($("select[name='mol_city_id']"));
            //区
            $("select[name='mol_area_id']").html("<option value=''>选择区</option>");
            $("select[name='mol_area_id']").val('');
            BOSS.HeaderHandle.Menu.selectReset($("select[name='mol_area_id']"));
            //联系电话
            $("input[name='mol_phone_number']").val('');
            //渠道经理
            $("select[name='mol_boss_user_id']").val('');
            BOSS.HeaderHandle.Menu.selectReset($("select[name='mol_boss_user_id']"));
            //门店状态
            $("select[name='mol_store_status']").val('');
            BOSS.HeaderHandle.Menu.selectReset($("select[name='mol_store_status']"));
        },
        /**
         * 验证并提交请求
         * @param model
         * @param validateParams
         */
        checkValidate : function (model, validateParams) {
            var $parentBox = model.find('form');
            $parentBox.validate({
                debug: false,
                submitHandler : function () {
                    var checkStoreId = $parentBox.find("input[name='mol_organization_id']").val();
                    if(!checkStoreId){
                        var ck_channel_id = $("#mol_sel_channel_id"),
                            ck_store_group_id = $("#mol_sel_organization_groupId"),
                            ck_area_id = $("#mol_sel_area"),
                            ck_boss_user_id = $("#mol_sel_boss_user_id");
                        var selectEl = {"ck_channel_id":ck_channel_id, "ck_store_group_id":ck_store_group_id, "ck_area_id":ck_area_id, "ck_boss_user_id":ck_boss_user_id};
                        var isPassChecked = BOSS.HeaderHandle.Menu.checkSelectOption(selectEl);
                        if(!isPassChecked){
                            return false;
                        }
                    }

                        //console.log($parentBox.serialize());
                    BOSS.HeaderHandle.getAjax(BOSS.api.updateOrganization, $parentBox.serialize(), function (d) {
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
         * 获取机构列表
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getListData : function (requestLink, paramsData) {
            BOSS.HeaderHandle.getAjax(requestLink, paramsData,function (d) {
                if(d.data != null){
                        BOSS.HeaderHandle.storeListTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                } else {
                    BOSS.HeaderHandle.storeListTemplate.draw();
                    $('.orders-num').text(0);
                    $('.orders-prices').text(0);
                    BOSS.floatTips.errorTips('暂无数据！');
                }
            }, 0);
        },

    },
    /**
     * 获取机构列表模板
     */
    storeListTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.panel-body-table table tbody'), item = $('tr', list);
            // 引用 View/Store/storeListTemplate.html
            $.get('http://' + BOSS.domain + '/Store/storeListTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){

                        data[i].forganization_id = BOSS.string.replaceHTML(data[i].forganization_id);
                        data[i].forganization_name = BOSS.string.replaceHTML(data[i].forganization_name);
                        data[i].fstore_type = BOSS.string.replaceHTML(data[i].fstore_type);
                        data[i].fstore_type_name = BOSS.string.replaceHTML(data[i].fstore_type_name);
                        data[i].fpartner_name = BOSS.string.replaceHTML(data[i].fpartner_name);
                        data[i].fchannel_name = BOSS.string.replaceHTML(data[i].fchannel_name);
                        data[i].foffice_clerk_name = BOSS.string.replaceHTML(data[i].foffice_clerk_name);
                        data[i].fphone_number = BOSS.string.replaceHTML(data[i].fphone_number);
                        data[i].fprovince_id = BOSS.string.replaceHTML(data[i].fprovince_id);
                        data[i].fcity_id = BOSS.string.replaceHTML(data[i].fcity_id);
                        data[i].farea_id = BOSS.string.replaceHTML(data[i].farea_id);
                        data[i].faddress_str = BOSS.string.replaceHTML(data[i].faddress_str);
                        data[i].fjobnumbersum = BOSS.string.replaceHTML(data[i].fjobnumbersum);
                        data[i].fstore_status = BOSS.string.replaceHTML(data[i].fstore_status);
                        data[i].fstore_status_name = BOSS.string.replaceHTML(data[i].fstore_status_name);
                        data[i].fcreate_time = BOSS.string.replaceHTML(data[i].fcreate_time);
                        data[i].fupdate_time = BOSS.string.replaceHTML(data[i].fupdate_time);
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="13" rowspan="5">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        }
    },

}
BOSS.HeaderHandle.init();