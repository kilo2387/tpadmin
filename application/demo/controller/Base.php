<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/3/8
 * Time: 16:48
 */
namespace app\demo\controller;
use app\demo\logic\Func;
use think\Controller;
use think\Hook;

class Base extends Controller{
    static $is_login = null;
    protected function _initialize(){
//        self::$is_login = new Func();
//        $user = self::$is_login->is_login();
//        if(!$user){
//            $this->redirect('login/login');
//        }
        $data = Hook::listen('getMenus');
//        print_r($data);
//        echo $data;
        $this->assign('__MENU__', $data[0]);
    }
    public function test(){

    }
}