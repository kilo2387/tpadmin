/**
 * Created by Administrator on 2016/10/19.
 */
BOSS.AllotCheck = {
    requestExtend : 'AllotCheck',
    passCheck : $("#pass_check"),
    noPassCheck : $("#no_pass_check"),
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
            var that = BOSS.AllotCheck,
                now = new Date(),
                begDate = new Date(now.getTime() - 24 * 30 * 3600000), // 前1个月时间
                endDate = new Date(now.getTime() + 24 * 1 * 3600000), // 明天
                begDate = BOSS.Util.formatDate(begDate, 'yy-MM-dd'),
                endDate = BOSS.Util.formatDate(endDate, 'yy-MM-dd'),
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
            } else {
                $('input[name="begDate"]').val(begDate);
            };


            //结束时间
            if($urlParam.endDate != null && $urlParam.endDate != 'undefined' && $urlParam.endDate != ""){
                $('input[name="endDate"]').val($urlParam.endDate);
                filter.endDate = $urlParam.endDate;
            } else {
                $('input[name="endDate"]').val(endDate);
            };

            //时间选择器
            BOSS.Util.datePicker($('input[name="begDate"]'), $('input[name="endDate"]'));

            //渠道类型
            if($urlParam.channelType != null && $urlParam.channelType != 'undefined' && $urlParam.channelType != ""){
                $('select[name="channelType"] option[value="' + $urlParam.channelType +'"]').attr("selected", true);
                filter.channelType = $urlParam.channelType;
            };

            //查找类型
            if($urlParam.searchType != null && $urlParam.searchType != 'undefined' && $urlParam.searchType != ""){
                $('select[name="search_type"] option[value="' + $urlParam.searchType +'"]').attr("selected", true);
                filter.searchType = $urlParam.searchType;
            }

            //关键词
            if($urlParam.searchWord != null && $urlParam.searchWord != 'undefined' && $urlParam.searchWord != ""){
                $('input[name="searchWord"]').val(decodeURIComponent($urlParam.searchWord));
                filter.searchWord = decodeURIComponent($urlParam.searchWord);
            };
            //获取申请调拨列表
            that.Menu.getAllotList(BOSS.api.ajaxAllotData, filter);

            //搜索库存信息
            $('body').on('click', '#order-search', function () {
                var searchType = $('select[name="search_type"]').val(),
                    searchWord = $('input[name="searchWord"]').val(),
                    begDate = $('input[name="begDate"]').val(),
                    endDate = $('input[name="endDate"]').val(),
                    channelType = $('select[name="channelType"]').val(),
                    url = location.href;
                //渠道搜索处理
                if(channelType && channelType != 0){
                    url = BOSS.Util.updateUrlParams(url, 'channelType', channelType, 'page');
                } else {
                    url = BOSS.Util.deleteUrlParams(url, 'channelType');
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
                url = BOSS.Util.updateUrlParams(url, 'begDate', begDate);
                url = BOSS.Util.updateUrlParams(url, 'endDate', endDate);

                location.href = url;
            });
            //购买渠道
            $("input[name='buy_channel_id']").on('click', function(){
            	if($(this).val()==3){
                    $('#other_buy_channel').attr("disabled",false);
            	}
            	if($(this).val()!=3){
                    $('#other_buy_channel').val('');
                    $('#other_buy_channel').attr("disabled",true);

            	}
            });
            //颜色
            $("input[name='color_id']").on('click', function(){
            	if($(this).val()==6){
                    $('#other_color_desc').attr("disabled",false);
            	}
            	if($(this).val()!=6){
                    $('#other_color_desc').val('');
                    $('#other_color_desc').attr("disabled",true);
                }
            });
          //物理按键
            $("input[name='physics_key']").on('click', function(){
            	if($(this).val()==2){
                    $('#key_desc').attr("disabled",false);
            	}
            	if($(this).val()!=2){
                    $('#key_desc').val('');
                    $('#key_desc').attr("disabled",true);
            	}
            });
          //产品功能
            $("input[name='product_function']").on('click', function(){
            	if($(this).val()==2){
                    $('#function_desc').attr("disabled",false);
            	}
            	if($(this).val()!=2){
                    $('#function_desc').val('');
                    $('#function_desc').attr("disabled",true);
            	}
            });
            //运营商
            $('body').on('change', '#operation_store_id', function(){
            	var self_val = $(this).val();
            	switch(self_val){
            	case '1' :
                    that.Menu.operationStoreSelect(1, 1, 1);
            		break;
            	case '2' :
                    that.Menu.operationStoreSelect(1, 3, 4);
            		break;
            	case '3' :
                    that.Menu.operationStoreSelect(3, 1, 4);
            		break;
            	case '4' :
                    that.Menu.operationStoreSelect(3, 3, 1);
            		break;
            	case '5' :
                    that.Menu.operationStoreSelect(1, 1, 4);
            		break;
            	case '6' :
                    that.Menu.operationStoreSelect(3, 1, 1);
            		break;
            	}
            	that.Menu.webSupportReset();
            });
          //成色
            $('body').on('change', '#fineness_level_id', function(){
            	var self_val = $(this).val();
            	switch(self_val){
            	case '1' :
            		that.Menu.finenessChecked(3);
            		break;
            	case '2' :
            		that.Menu.finenessChecked(3);
            		break;
            	case '3' :
            		that.Menu.finenessChecked(3);
            		break;
            	case '4' :
            		that.Menu.finenessChecked(1);
            		break;
            	case '5' :
            		that.Menu.finenessChecked(2);
            		break;
            	case '6' :
                    that.Menu.finenessChecked(2);
                    break;
            		break;
            	}
            });
            //通过审核
            that.passCheck.on('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), inventoryId = button.data('id'),
                    product_name = button.siblings("input[name='tmp_product_name']").val(),IMEI = button.siblings("input[name='tmp_IMEI']").val(),
                    storage_amount = button.siblings("input[name='tmp_storage_amount']").val(),
                    validateParams = {
                	rules : {
                		product_name : {
                            required : true,
                            maxlength : 20
                        },
                        model_num : {
                            maxlength : 20
                        },
                        IMEI : {
                            required : true,
                            maxlength : 20
                        },
                        system_version : {
                            maxlength : 20
                        },
                        maintain_record : {
                            required : true,
                        },
                        appearance_screen : {
                            required : true,
                        },
                        appearance_back : {
                            required : true,
                        },
                        appearance_top : {
                            required : true,
                        },
                        appearance_bottom : {
                            required : true,
                        },
                        appearance_side : {
                            required : true,
                        },
                        appearance_around : {
                            required : true,
                        }
                    },
                    msg : {
                    	product_name : {
                            required : '产品名称不能为空',
                            maxlength : '最多输入20个字符'
                        },
                        model_num : {
                            maxlength : '最多输入20个字符'
                        },
                        IMEI : {
                            required : 'IMEI不能为空',
                            maxlength : '最多输入20个字符'
                        },
                        system_version : {
                            maxlength : '最多输入20个字符'
                        },
                        maintain_record : {
                            required : '请选择维修记录',
                        },
                        appearance_screen : {
                            required : '请选择屏幕外观',
                        },
                        appearance_back : {
                            required : '请选择背部外观',
                        },
                        appearance_top : {
                            required : '请选择顶部外观',
                        },
                        appearance_bottom : {
                            required : '请选择底部外观',
                        },
                        appearance_side : {
                            required : '请选择侧边外观',
                        },
                        appearance_around : {
                            required : '请选择四角外观',
                        }
                    }};
                model.find('[name="inventoryId"]').val('');
                model.find('[name="product_name"]').val('');
                model.find('[name="IMEI"]').val('');
                model.find('[name="procurement_money"]').val('');
                model.find('[name="inventoryId"]').val(inventoryId);
                model.find('[name="product_name"]').val(product_name);
                model.find('[name="IMEI"]').val(IMEI);
                model.find('[name="procurement_money"]').val(storage_amount);
                that.Menu.checkValidate(model, validateParams, BOSS.api.allotPassInfo);
            })
            that.noPassCheck.one('show.bs.modal', function (event) {
                var model = $(this), button = $(event.relatedTarget), inventoryId = button.data('id'),validateParams = {};
                model.find('[name="inventoryId"]').attr('value', inventoryId);
                that.Menu.checkValidate(model, validateParams, BOSS.api.rejectAllotApply);
            });
        },
        /**
         * 网络支持重置
         */
        webSupportReset : function(){
        	var mobile_support = $('select[name="mobile_support"]'),
        	unicom_support = $('select[name="unicom_support"]'),
        	telecom_support = $('select[name="telecom_support"]');
//        	console.log(mobile_support.val());
//        	console.log(unicom_support.val());
//        	console.log(telecom_support.val());
        	BOSS.AllotCheck.Menu.selectReset(mobile_support);
    		BOSS.AllotCheck.Menu.selectReset(unicom_support);
    		BOSS.AllotCheck.Menu.selectReset(telecom_support);
        },
        /**
         * 运营商选中
         */
        operationStoreSelect : function(a, b, c){
            $('select[name="mobile_support"]').val(a);
            $('select[name="unicom_support"]').val(b);
            $('select[name="telecom_support"]').val(c);
        },
        /**
         * 成色选中
         */
        finenessChecked : function(a){
        	$("input[name='appearance_screen'][value='"+a+"']").prop("checked","checked");
        	$("input[name='appearance_back'][value='"+a+"']").prop("checked","checked");
        	$("input[name='appearance_top'][value='"+a+"']").prop("checked","checked");
        	$("input[name='appearance_bottom'][value='"+a+"']").prop("checked","checked");
        	$("input[name='appearance_side'][value='"+a+"']").prop("checked","checked");
        	$("input[name='appearance_around'][value='"+a+"']").prop("checked","checked");
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
                        var sel_msg = '';
                        switch (name){
                            case 'warranty_id':
                                sel_msg = "请选择保修期";
                                break;
                            case 'capacity_id':
                                sel_msg = "请选择机器容量";
                                break;
                            case 'fineness_level_id':
                                sel_msg = "请选择成色等级";
                                break;
                            case 'original_goto_id':
                                sel_msg = "请选择原定去向";
                                break;
                            default:
                                sel_msg = '请选择';

                        }

                        $("#"+name).focus();
                        if($("#"+name+"-error").text()=='' || $("#"+name+"-error").text()==null){
                            value.parent('div').append('<label id="'+name+'-error" class="error" for="'+name+'">'+sel_msg+'</label>');
                        }
                    }else{
                        $("#"+name+"-error").remove();
                    }

                });
                return flag;
            }

        },
        /**
         * 检测radio选中值
         * @param ell
         * @returns {boolean}
         */
        checkRadioVal : function(ell){

            var r_flag = true;
            $("#"+ell[0]['name']+"-error").remove();
            if(ell[2]['real_val'] == undefined && ell[0]['check_val'] == undefined){
                r_flag = false;
                $("#"+ell[0]['name']).parent('label').after('<label id="'+ell[0]['name']+'-error" class="error" for="'+ell[0]['name']+'">'+ell[2]['msg']+'</label>');
            }
            if(ell[1]['real_val'] == ell[0]['check_val'] && $.trim(ell[1]['check_txt_val']) == ''){
                r_flag = false;
                $("#"+ell[0]['name']).parent('label').after('<label id="'+ell[0]['name']+'-error" class="error" for="'+ell[0]['name']+'">'+ell[1]['msg']+'</label>');
            }
            if($.trim(ell[3]['check_txt_val']).length > 20){
                r_flag = false;
                $("#"+ell[0]['name']).parent('label').after('<label id="'+ell[0]['name']+'-error" class="error" for="'+ell[0]['name']+'">'+ell[3]['msg']+'</label>');
            }
            return r_flag;
        },
        /**
         * 自定义检测表单元素
         * @returns {boolean}
         */
        editCustomCheck : function(){
            var buy_channel_ck = $("input[name='buy_channel_id']:checked").val(),
                txt_other_buy_channel = $("#other_buy_channel").val(),
                color_ck = $("input[name='color_id']:checked").val(),
                txt_other_color_desc = $("#other_color_desc").val(),
                physics_key_ck = $("input[name='physics_key']:checked").val(),
                txt_key_desc = $("#key_desc").val(),
                product_function_ck = $("input[name='product_function']:checked").val(),
                txt_function_desc = $("#function_desc").val();
            var result_flag = new Array();
            //购买渠道
            var radioEl1 = [
                {"name":"other_buy_channel","check_val":buy_channel_ck},
                {"real_val":"3","check_txt_val":txt_other_buy_channel,"msg":"请输入购买渠道"},
                {"real_val":undefined,"msg":"请选择购买渠道"},
                {"check_txt_val":txt_other_buy_channel,"msg":"最多输入20个字符"}
            ];
            result_flag[1] = BOSS.AllotCheck.Menu.checkRadioVal(radioEl1);
            //机身颜色
            var radioEl2 = [
                {"name":"other_color_desc","check_val":color_ck},
                {"real_val":"6","check_txt_val":txt_other_color_desc,"msg":"请输入机身颜色"},
                {"real_val":undefined,"msg":"请选择机身颜色"},
                {"check_txt_val":txt_other_color_desc,"msg":"最多输入20个字符"}
            ];
            result_flag[2] = BOSS.AllotCheck.Menu.checkRadioVal(radioEl2);
            //物理按键
            var radioEl3 = [
                {"name":"key_desc","check_val":physics_key_ck},
                {"real_val":"2","check_txt_val":txt_key_desc,"msg":"请输入异常情况"},
                {"real_val":undefined,"msg":"请选择物理按键"},
                {"check_txt_val":txt_key_desc,"msg":"最多输入20个字符"}
            ];
            result_flag[3] = BOSS.AllotCheck.Menu.checkRadioVal(radioEl3);
            //产品功能
            var radioEl4 = [
                {"name":"function_desc","check_val":product_function_ck},
                {"real_val":"2","check_txt_val":txt_function_desc,"msg":"请输入异常情况"},
                {"real_val":undefined,"msg":"请选择产品功能"},
                {"check_txt_val":txt_function_desc,"msg":"最多输入20个字符"}
            ];
            result_flag[4] = BOSS.AllotCheck.Menu.checkRadioVal(radioEl4);

            //机器容量,保修期，成色等级，原定去向
            var capacity_id_el = $("#capacity_id"),warranty_id_el=$("#warranty_id"),fineness_level_id_el=$("#fineness_level_id"),original_goto_id_el=$("#original_goto_id");
            var selectEl = {"capacity_id":capacity_id_el,"warranty_id":warranty_id_el,"fineness_level_id":fineness_level_id_el,"original_goto_id":original_goto_id_el};
            var isPassChecked = BOSS.AllotCheck.Menu.checkSelectOption(selectEl);

            if((!isPassChecked) || (!result_flag[1]) || (!result_flag[2]) || (!result_flag[3]) || (!result_flag[4])){
                return false;
            }else{
                return true;
            }
        },
        /**
         * 验证并提交请求
         * @param model
         * @param validateParams
         */
        checkValidate : function (model, validateParams, goUrl) {
            var $parentBox = model.find('form');
            $parentBox.validate({
                errorPlacement: function(error, element) {
                    // Append error within linked label
                    $( element )
                        .closest( "div" ).append( error );
                },
                debug: true,
                ignore: [],
                rules: validateParams.rules,
                messages:validateParams.msg,
                submitHandler : function () {
                    if($parentBox.hasClass('pass_check_ok')){
                        var custom_check_info = BOSS.AllotCheck.Menu.editCustomCheck();
                        if(!custom_check_info){
                            return false;
                        }
                    }
                        BOSS.AllotCheck.getAjax(goUrl, $parentBox.serialize(), function (d) {
                            if (d.errcode == 0) {
                                BOSS.floatTips.successTips(d.errstr+'！页面将在2秒内刷新');
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
         * 获取列表数据
         * @param requestLink 请求链接
         * @param data 传输的数据
         */
        getAllotList : function (requestLink, data) {
            BOSS.AllotCheck.getAjax(requestLink, data,function (d) {
                if(d.data != null){
                    BOSS.AllotCheck.allotListTemplate.draw(d.data.data);
                    $('.panel-footer').html(d.data.pageInfo);
                    $('.orders-num').text(d.data.num);
                    $('.orders-prices').text(d.data.prices);
                } else {
                    BOSS.AllotCheck.allotListTemplate.draw();
                    $('.orders-num').text(0);
                    $('.orders-prices').text(0);
                    BOSS.floatTips.errorTips('暂无数据。');
                }
            }, 0);
        },

    },

    /**
     * 获取优品仓申请模板
     */
    allotListTemplate : {
        draw : function(data){
            var listStr = '',listDom, list = $('.panel-body-table table tbody'), item = $('tr', list);
            // 引用 模板
            $.get('http://' + BOSS.domain + '/AllotCheck/allotListTemplate.html',function(template) {
                if (item.length) {
                    for (var i = 0; i < item.length; i++) {
                        $(item[i]).remove();
                    }
                }
                if(!BOSS.valid.checkEmptyObj(data)){
                    for (var i=0; i<data.length; i++){
                        data[i].finventory_id = BOSS.string.replaceHTML(data[i].finventory_id);
                        data[i].fbatch = BOSS.string.replaceHTML(data[i].fbatch);
                        data[i].fseries_number = BOSS.string.replaceHTML(data[i].fseries_number);
                        data[i].fproduct_name = BOSS.string.replaceHTML(data[i].fproduct_name);
                        data[i].fimei = BOSS.string.replaceHTML(data[i].fimei);
                        data[i].fchannel_flag_name = BOSS.string.replaceHTML(data[i].fchannel_flag_name);
                        data[i].fstorage_type_name = BOSS.string.replaceHTML(data[i].fstorage_type_name);
                        if(data[i].foutlibrary_num == false || data[i].foutlibrary_num == undefined){
                            data[i].fstorage_amount = BOSS.string.replaceHTML(data[i].fstorage_amount);
                            data[i].fstorage_time = BOSS.string.replaceHTML(data[i].fstorage_time);
                        }else{
                            data[i].fstorage_amount = BOSS.string.replaceHTML(data[i].fback_amount);
                            data[i].fstorage_time = BOSS.string.replaceHTML(data[i].fstorage_outtime);
                        }

                        listStr += tmpl(template, data[i]);
                    }
                } else {
                    listStr = '<tr><td class="text-center" colspan="9" rowspan="5">暂无数据</td></tr>';
                }
                listDom = $(listStr);
                list.html(listDom);
            });
        }
    },

}
BOSS.AllotCheck.init();