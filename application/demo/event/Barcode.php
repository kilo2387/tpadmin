<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/3/16
 * Time: 13:57
 */

namespace app\demo\event;
use think\exception\ErrorException;

require_once  '../extend/phpqrcode.php';
//use think\Loader;
class Barcode {
    public function __construct(){
//        Loader::import('phpqrcode', EXTEND_PATH);
    }

    /**
     * 生成二维码
     * @param array $data 数据,文件名
     * @return array
     */
    public static function makeCode($data = []){
        $ret = ['ret'=>'0', 'data'=>'', 'errcode'=>'1', 'msg'=>'成功'];
        if(!is_string($data['data'])){
            $ret['ret'] = 2;
            $ret['msg'] = '参数必须是字符串';
            return $ret;
        }

        if(!isset($data['filename']) || empty($data['filename'])){
            $rand = md5(microtime() . rand(10000, 99999));
            $fileName = $rand . '.png';
        }else{
            $fileName = $data['filename'].'.png';
        }

        $filePath = './tmp/' . $fileName;
        $errorCorrectionLevel = 'L';
        $matrixPointSize = 4;
        \QRcode::png($data['data'], $filePath, $errorCorrectionLevel, $matrixPointSize, 2);
        try{
            chmod($filePath, 0755);
        }catch (ErrorException $e){
            $ret['errcode'] = $e->getCode() ? 0 : 1;
            $ret['msg'] = '没有目录权限';
            return $ret;
        }
        if (!$ret){
//            unlink($filePath) or $ret['msg'] = "删除指定目录的临时文件失败";
        }
        return $ret;
    }
}