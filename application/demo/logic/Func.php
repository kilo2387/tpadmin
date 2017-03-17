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

    /**
     * 获取远程ip
     * @return mixed
     */
    function getRemoteIp(){
        return $_SERVER['REMOTE_ADDR'];
    }

    /**
     * 日志输出
     * @param string $msg
     */
    function err_log($msg = ''){
        $arr = debug_backtrace();
        $last = $arr[0];
        $file = str_replace('/home/huishoubao/root/php/application', 'APPPATH', $last['file']);
        $msg .= '
';
        $lineMsg = date('Y-m-d H:i:s') . ' [' . $this->getRemoteIp() . '] [' . $_COOKIE['ssid'] . '] [' . $file . ':' . $last['line'] . '] ' . $msg;
        // @file_get_contents('http://localhost:1377/'.rawurlencode($lineMsg));
        file_put_contents('/data/plog/logs.log', $lineMsg, FILE_APPEND);
    }
}