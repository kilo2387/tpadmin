/**
 * Created by SEELE on 2016/11/5.
 */
BOSS.HeaderHandle = {
    requestExtend : 'UserNumber',
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
            //角色
            if($urlParam.roleId != null && $urlParam.roleId != undefined && $urlParam.roleId != ""){
                $('select[name="role_id"] option[value="' + $urlParam.roleId +'"]').attr("selected", true);
                filter.roleId = $urlParam.roleId;
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
            UseHeaderHandle.Menu.getListData(BOSS.api.getUserNumberList + '?requestExtend=' + UseHeaderHandle.requestExtend, filter);
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
            //搜索渠道用户信息
            $('body').on('click', '#user-search', function () {
                var searchType = $('select[name="search_type"]').val(),
                    searchWord = $('input[name="searchWord"]').val(),
                    begDate = $('input[name="begDate"]').val(),
                    endDate = $('input[name="endDate"]').val(),
                    roleId = $('select[name="role_id"]').val(),
                    provinceId = $('select[name="province_id"]').val(),
                    cityId = $('select[name="city_id"]').val(),
                    areaId = $('select[name="area_id"]').val(),
                    url = location.href;

                //门店类型
                if(roleId != ''){
                    url = BOSS.Util.updateUrlParams(url, 'roleId', roleId, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'roleId');
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
                    BOSS.HeaderHandle.getAjax(BOSS.api.userChangeStatus, $parentBox.serialize(), function (d) {
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
        getListData : function (requestLink, data) {
            BOSS.HeaderHandle.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    BOSS.HeaderHandle.jobNumberListTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                } else {
                    BOSS.HeaderHandle.jobNumberListTemplate.draw();
                    $('.orders-num').text(0);
                    $('.orders-prices').text(0);
                    BOSS.floatTips.errorTips('暂无数据！');
                }
            }, 0);
        },

    },

    /**
     * 获取待渠道列表模板
     */
    jobNumberListTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.panel-body-table table tbody'), item = $('tr', list);
            // 引用 View/UserNumber/jobNumberListTemplate.html
            $.get('http://' + BOSS.domain + '/UserNumber/jobNumberListTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){

                        data[i].fuser_id = BOSS.string.replaceHTML(data[i].fuser_id);
                        data[i].fuser_name = BOSS.string.replaceHTML(data[i].fuser_name);
                        if(data[i].frole_name==null){
                            data[i].frole_name = '无';
                        }
                        if(data[i].fjob_number==null){
                            data[i].fjob_number = '无';
                        }
                        if(data[i].fchannel_name==null){
                            data[i].fchannel_name = '无';
                        }
                        if(data[i].fchannel_member_name==null){
                            data[i].fchannel_member_name = '无';
                        }
                        data[i].frole_name = BOSS.string.replaceHTML(data[i].frole_name);
                        data[i].fjob_number = BOSS.string.replaceHTML(data[i].fjob_number);
                        data[i].forganization_name = BOSS.string.replaceHTML(data[i].forganization_name);
                        data[i].fchannel_name = BOSS.string.replaceHTML(data[i].fchannel_name);
                        data[i].fchannel_member_name = BOSS.string.replaceHTML(data[i].fchannel_member_name);
                        data[i].fcard_id = BOSS.string.replaceHTML(data[i].fcard_id);
                        data[i].faddress_str = BOSS.string.replaceHTML(data[i].faddress_str);
                        data[i].fcreate_time = BOSS.string.replaceHTML(data[i].fcreate_time);
                        data[i].fupdate_time = BOSS.string.replaceHTML(data[i].fupdate_time);
                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="12" rowspan="5">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        }
    },

}
BOSS.HeaderHandle.init();