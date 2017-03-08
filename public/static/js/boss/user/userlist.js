/**
 * Created by SEELE on 2016/11/5.
 */
BOSS.UserList = {
    requestExtend : 'User',
    changeStatus : $("#user_delmol"),
    rePassword : $("#user_repassword"),
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
            var UserList = BOSS.UserList,/*
                now = new Date(),
                begDate = new Date(now.getTime() - 24 * 30 * 3600000), // 前1个月时间
                endDate = new Date(now.getTime() + 24 * 1 * 3600000), // 明天
                begDate = BOSS.Util.formatDate(begDate, 'yy-MM-dd'),
                endDate = BOSS.Util.formatDate(endDate, 'yy-MM-dd'),*/
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
            //部门mchid
            if($urlParam.mchId != null && $urlParam.mchId != undefined && $urlParam.mchId != ""){
                $('select[name="mchid"] option[value="' + $urlParam.mchId +'"]').attr("selected", true);
                filter.mchId = $urlParam.mchId;
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
            //市
            if($urlParam.areaId != null && $urlParam.areaId != undefined && $urlParam.areaId != ""){
                $('select[name="area_id"] option[value="' + $urlParam.areaId +'"]').attr("selected", true);
                filter.areaId = $urlParam.areaId;
            };
            //用户审核
            if($urlParam.isChecked != null && $urlParam.isChecked != undefined && $urlParam.isChecked != ""){
                $('select[name="user_is_checked"] option[value="' + $urlParam.isChecked +'"]').attr("selected", true);
                filter.isChecked = $urlParam.isChecked;
            };
            // 用户锁定
            if($urlParam.isLocked != null && $urlParam.isLocked != undefined && $urlParam.isLocked != ""){
                $('select[name="user_is_locked"] option[value="' + $urlParam.isLocked +'"]').attr("selected", true);
                filter.isLocked = $urlParam.isLocked;
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
            //获取用户列表
            UserList.Menu.getUserList(BOSS.api.getActiveUserList + '?requestExtend=' + UserList.requestExtend, filter);

            //更改用户状态
            UserList.changeStatus.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), userId = button.data('id'),
                    user_status = button.attr('data-status'),
                    validateParams = {};
                if(user_status==1){
                    user_status = 0;
                    $(".change-status-title").text("解锁");
                }else{
                    user_status = 1;
                    $(".change-status-title").text("锁定");
                }

                model.find('[name="is_locked_user"]').attr('value', user_status);
                model.find('[name="user_id"]').attr('value', userId);
                UserList.Menu.checkValidate(model, validateParams);
            });
            //密码重置
            UserList.rePassword.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), userId = button.data('id'),
                    validateParams = {};

                model.find('[name="user_password"]').attr('value', BOSS.Util.times33('123456'));
                model.find('[name="user_id"]').attr('value', userId);
                UserList.Menu.checkValidate(model, validateParams);
            });
            //获取级联市
            $('body').on('change', '#sel_province', function(){
                var province_id = $("#sel_province").val();
                $.get('http://' + BOSS.domain + '/Store/getAjaxCity',{"province_id":province_id},function(pData){
                    var cityEl = $('#sel_city');
                    var areaEl = $('#sel_area');
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
                    cityEl.selectpicker('refresh');
                    cityEl.selectpicker('show');
                    areaEl.selectpicker('refresh');
                    areaEl.selectpicker('show');
                })
            })
            //获取级联区
            $('body').on('change', '#sel_city', function(){
                var city_id = $("#sel_city").val();
                $.get('http://' + BOSS.domain + '/Store/getAjaxArea',{"city_id":city_id},function(pData){
                    var areaEl = $('#sel_area');
                    areaEl.empty();
                    var optionstr = "<option value=''>选择区</option>";
                    if(pData!=null){
                        $.each(pData,function(i,val){
                            optionstr += "<option value='"+i+"'>"+val+"</option>";
                        })
                    }
                    //console.log(optionstr);
                    areaEl.append(optionstr);
                    areaEl.selectpicker('refresh');
                    areaEl.selectpicker('show');
                })
            })

            //搜索用户信息
            $('body').on('click', '#user-search', function () {
                var searchType = $('select[name="search_type"]').val(),
                    searchWord = $('input[name="searchWord"]').val(),
                    begDate = $('input[name="begDate"]').val(),
                    endDate = $('input[name="endDate"]').val(),
                    mchId = $('select[name="mchid"]').val(),
                    provinceId = $('select[name="province_id"]').val(),
                    cityId = $('select[name="city_id"]').val(),
                    areaId = $('select[name="area_id"]').val(),
                    province_id = $('select[name="province_id"]').val(),
                    user_is_checked = $('select[name="user_is_checked"]').val(),
                    user_is_locked = $('select[name="user_is_locked"]').val(),
                    url = location.href;

                //部门处理
                if(mchId && mchId != 0){
                    url = BOSS.Util.updateUrlParams(url, 'mchId', mchId, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'mchId');
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
                //审核
                if(user_is_checked != ''){
                    url = BOSS.Util.updateUrlParams(url, 'isChecked', user_is_checked, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'isChecked');
                }
                //锁定
                if(user_is_locked != ''){
                    url = BOSS.Util.updateUrlParams(url, 'isLocked', user_is_locked, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'isLocked');
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


        },
        /**
         * 验证并提交请求
         * @param model
         * @param validateParams
         */
        checkValidate : function (model, validateParams) {
            var $parentBox = model.find('form');
            $parentBox.validate({
                debug: true,
                ignore: [],
                rules: validateParams,
                submitHandler : function () {
                    if ($parentBox.hasClass('user-repassword')){
                        BOSS.UserList.getAjax(BOSS.api.restPassword, $parentBox.serialize(), function (d) {
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
                }else{
                        BOSS.UserList.getAjax(BOSS.api.userChangeStatus, $parentBox.serialize(), function (d) {
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
                }

            });
        },

        /**
         * 获取用户列表
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getUserList : function (requestLink, data) {
            BOSS.UserList.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    BOSS.UserList.userListTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                } else {
                    BOSS.UserList.userListTemplate.draw();
                    $('.orders-num').text(0);
                    $('.orders-prices').text(0);
                    BOSS.floatTips.errorTips('暂无数据！');
                }
            }, 0);
        },

    },

    /**
     * 获取待用户列表模板
     */
    userListTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.panel-body-table table tbody'), item = $('tr', list);
            // 引用 View/User/UserListTemplate.html
            $.get('http://' + BOSS.domain + '/User/userListTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){
                        data[i].fuser_id = BOSS.string.replaceHTML(data[i].fuser_id);
                        data[i].fuser_name = BOSS.string.replaceHTML(data[i].fuser_name);
                        data[i].foffice_clerk_name = BOSS.string.replaceHTML(data[i].foffice_clerk_name);
                        data[i].frole_name = BOSS.string.replaceHTML(data[i].frole_name);
                        data[i].fmchid_name = BOSS.string.replaceHTML(data[i].fmchid_name);
                        data[i].fphone_num = BOSS.string.replaceHTML(data[i].fphone_num);
                        data[i].femail = BOSS.string.replaceHTML(data[i].femail);

                        data[i].faddress_str = BOSS.string.replaceHTML(data[i].faddress_str);

                        data[i].fchecked_name = BOSS.string.replaceHTML(data[i].fchecked_name);
                        data[i].flocked_name = BOSS.string.replaceHTML(data[i].flocked_name);
                        data[i].fis_locked = BOSS.string.replaceHTML(data[i].fis_locked);
                        data[i].fcreate_time = BOSS.string.replaceHTML(data[i].fcreate_time);
                        data[i].flast_visit_time = BOSS.string.replaceHTML(data[i].flast_visit_time);
                        if(data[i].fis_locked==1){
                            data[i].flocked_name_title = '解锁';
                        }else{
                            data[i].flocked_name_title = '锁定';
                        }

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
BOSS.UserList.init();