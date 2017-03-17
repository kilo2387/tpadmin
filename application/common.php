<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 流年 <liu21st@gmail.com>
// +----------------------------------------------------------------------

// 应用公共文件

/**
 * 判断是否登录函数
 */
function is_login(){
    $user = session('auth');
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
    $lineMsg = date('Y-m-d H:i:s') . ' [' . getRemoteIp() . '] [' . $_COOKIE['ssid'] . '] [' . $file . ':' . $last['line'] . '] ' . $msg;
    // @file_get_contents('http://localhost:1377/'.rawurlencode($lineMsg));
    file_put_contents('/data/plog/logs.log', $lineMsg, FILE_APPEND);
}

/**
 * 数据签名认证
 * @param  array $data 被认证的数据
 * @return string       签名
 * @author 麦当苗儿 <zuojiazi@vip.qq.com>
 */
function data_auth_sign($data)
{
    //数据类型检测
    if (!is_array($data)) {
        $data = (array)$data;
    }
    ksort($data); //排序
    $code = http_build_query($data); //url编码并生成query字符串
    $sign = sha1($code); //生成签名
    return $sign;
}
/**
 * Times33  hash加密
 * @param $str
 * @return int
 */
function times33($str)
{
    $hash = 5381;
    for($i=0; $i<strlen($str); $i++) {
        $hash += ($hash << 5) + charCodeAt($str, $i);
    }
    return $hash & 0x7FFFFFFF;
}

/**
 * 系统非常规MD5加密方法
 * @param  string $str 要加密的字符串
 * @return string
 */
if (!defined('USER_COMMON_COMMON_PHP')) {
    function think_ucenter_md5($str, $key = 'JGuanGYao')
    {
        return '' === $str ? '' : md5(sha1($str) . $key);
    }

    /**
     * 系统加密方法
     * @param string $data 要加密的字符串
     * @param string $key 加密密钥
     * @param int $expire 过期时间 (单位:秒)
     * @return string
     */
    function think_ucenter_encrypt($data, $key, $expire = 0)
    {
        $key = md5($key);
        $data = base64_encode($data);
        $x = 0;
        $len = strlen($data);
        $l = strlen($key);
        $char = '';
        for ($i = 0; $i < $len; $i++) {
            if ($x == $l) $x = 0;
            $char .= substr($key, $x, 1);
            $x++;
        }
        $str = sprintf('%010d', $expire ? $expire + time() : 0);
        for ($i = 0; $i < $len; $i++) {
            $str .= chr(ord(substr($data, $i, 1)) + (ord(substr($char, $i, 1))) % 256);
        }
        return str_replace('=', '', base64_encode($str));
    }

    /**
     * 系统解密方法
     * @param string $data 要解密的字符串 （必须是think_encrypt方法加密的字符串）
     * @param string $key 加密密钥
     * @return string
     */
    function think_ucenter_decrypt($data, $key)
    {
        $key = md5($key);
        $x = 0;
        $data = base64_decode($data);
        $expire = substr($data, 0, 10);
        $data = substr($data, 10);
        if ($expire > 0 && $expire < time()) {
            return '';
        }
        $len = strlen($data);
        $l = strlen($key);
        $char = $str = '';
        for ($i = 0; $i < $len; $i++) {
            if ($x == $l) $x = 0;
            $char .= substr($key, $x, 1);
            $x++;
        }
        for ($i = 0; $i < $len; $i++) {
            if (ord(substr($data, $i, 1)) < ord(substr($char, $i, 1))) {
                $str .= chr((ord(substr($data, $i, 1)) + 256) - ord(substr($char, $i, 1)));
            } else {
                $str .= chr(ord(substr($data, $i, 1)) - ord(substr($char, $i, 1)));
            }
        }
        return base64_decode($str);
    }
}

//防止重复定义
define('USER_COMMON_COMMON_PHP', 1);
