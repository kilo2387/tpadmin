<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/4/1
 * Time: 16:20
 */
namespace app\demo\controller;
use think\Controller;

class Wechat extends Controller{
    private static $token = 'kilo'; //微信标识

    /**
     * 微信接入
     */
    public function checkSignature()
    {
        $signature = $_GET["signature"];
        $timestamp = $_GET["timestamp"];
        $nonce     = $_GET["nonce"];

        $echostr   = $_GET["echostr"];

        $tmpArr = array($timestamp, self::$token, $nonce);
        sort($tmpArr, SORT_STRING);
        $tmpStr = sha1(join($tmpArr));
        if($tmpStr == $signature){
            echo $echostr;
        }else{
            echo '';
        }
    }
}