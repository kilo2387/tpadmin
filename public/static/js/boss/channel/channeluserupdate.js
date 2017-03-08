/**
 * Created by SEELE on 2016/11/5.
 */
BOSS.UserUpdateInfo = {
    myFrm : $("#my_frm"),
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
            var UserUpdateInfo = BOSS.UserUpdateInfo;
            var login_page_id = $('input[name="hid_flogin_page_id"]').val(),
                parentId = $('input[name="hid_fpid"]').val(),
                province_id = $('input[name="hid_fprovince_id"]').val(),
                city_id = $('input[name="hid_fcity_id"]').val(),
                area_id = $('input[name="hid_farea_id"]').val(),
                role_id = $('input[name="hid_frole_id"]').val();
            //父id
            if(parentId != ""){
                $('select[name="Fpid"] option[value="' + parentId +'"]').attr("selected", true);
            };
            //登录页
            if(login_page_id != ""){
                $('select[name="Flogin_page_id"] option[value="' + login_page_id +'"]').attr("selected", true);
            };
            //省
            if(province_id != ""){
                $('select[name="Fprovince_id"] option[value="' + province_id +'"]').attr("selected", true);
            };
            //市
            if(city_id != ""){
                $('select[name="Fcity_id"] option[value="' + city_id +'"]').attr("selected", true);
            };
            //区
            if(area_id != ""){
                $('select[name="Farea_id"] option[value="' + area_id +'"]').attr("selected", true);
            };
            //用户角色
            if(role_id != ""){
                $('select[name="Frole_id"] option[value="' + role_id +'"]').attr("selected", true);
            };

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
            //用户信息提交
            $('body').on('click','#sub_frm', function () {
                var model = UserUpdateInfo.myFrm,Frole_id = $("select[name='Frole_id']"),
                    Farea_id = $("select[name='Farea_id']"),Flogin_page_id = $("select[name='Flogin_page_id']"),
                    validateParams = {
                        Foffice_clerk_name : {
                            required: true,
                        },Femail : {
                            required: true,
                            email: true,
                        }
                    };
                var selectEl = {"Frole_id":Frole_id,"Farea_id":Farea_id,"Flogin_page_id":Flogin_page_id};
                var isPassChecked = UserUpdateInfo.Menu.checkSelectOption(selectEl);
                if(!isPassChecked){
                    return false;
                }
                if($("input[name='hid_fuserid']").val()==null || $("input[name='hid_fuserid']").val()==''){
                    $("input[name='Fuser_password']").val(BOSS.Util.times33($("input[name='time_password']").val()));
                }

                UserUpdateInfo.Menu.checkValidate(model, validateParams);
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
         * 验证并提交请求
         * @param model
         * @param validateParams
         */
        checkValidate : function (model, validateParams) {
            var $parentBox = model;
            $parentBox.validate({
                debug: true,
                ignore: [],
                rules: validateParams,
                submitHandler : function () {
                    // if($parentBox.hasClass('form-visit')){
                    BOSS.UserUpdateInfo.getAjax(BOSS.api.saveChannelUserInfo, $parentBox.serialize(), function (d) {
                        if(d.data){
                            BOSS.floatTips.successTips('信息保存成功!');
                            setTimeout(function () {
                                window.location.href = BOSS.api.channelUserList;
                            }, 1000);
                        } else {

                            BOSS.floatTips.errorTips(d.errstr);
                        }

                    }, 0);
                    // }
                }
            });
        }
    },

}
BOSS.UserUpdateInfo.init();