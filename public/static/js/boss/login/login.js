/**
 * Created by Administrator on 2016/10/20.
 */
BOSS.Login = {
    init : function(){
        $('input[name="password"]').bind('input propertychange', function() {
            $('input[name="time_password"]').val(BOSS.Util.times33($(this).val()));
        });

    },
}
BOSS.Login.init();
