<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/3/8
 * Time: 18:00
 */
namespace app\demo\logic;
class Func{
    /**
     * 判断是否登录函数
     */
    public function is_login(){
        $user = session('is_login');
        if(empty($user)){
            return false;
        }
        return $user;
    }
}