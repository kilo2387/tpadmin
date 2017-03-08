<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/3/8
 * Time: 18:11
 */
namespace app\demo\Controller;
use think\Controller;
use think\View;

class Login extends Controller {
    public function login(){
//        return view('login:login');
//        echo ROOT_PATH.'public/widget/css';
//        echo THINK_PATH  ;
        return $this->fetch();
    }
}