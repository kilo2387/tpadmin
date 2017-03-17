<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/3/17
 * Time: 15:35
 */
namespace app\demo\model;
class Catalog extends Base{
    // 数据表名称
    protected $table = "t_catalog";
    // 当前模型名称
//    protected $name = "Catalog";
    // 是否采用批量验证
    protected $batchValidate = true;
    // 数据表主键 复合主键使用数组定义 不设置则自动获取
    protected $pk = "catalog_id";
    // 只读字段
    protected $readonly = ['catalog_id'];
    protected $resultSetType = 'collection';

    //类型转换
//    protected $type = [
//        'status'    =>  'integer',
//        'score'     =>  'float',
//        'birthday'  =>  'datetime',
//        'info'      =>  'array',
//    ];

    /**
     * @var array
     * 表的对应字段，定义这个为了防止tp自动去select数据库。
     */
    protected $fields = array(
        'Fcatalog_id',
        'Flevel',
        'Fpid',
        'Fname',
        'Furl',
        'Fstatus',
        'Fcreate_time',
        'Fupdate_time',
        'Foperator_id',
        'Foperator_name',
    );

    /**
     * @var array
     * 目录模型字段映射
     */
    protected $mapFields = array(
        'catalog_id'        => 'Fcatalog_id',       //目录ID
        'level'             => 'Flevel',            //级别
        'pid'               => 'Fpid',              //父级ID
        'name'              => 'Fname',             //名称
        'url'               => 'Furl',              //目录链接
        'status'            => 'Fstatus',           //目录状态
        'create_time'       => 'Fcreate_time',      //创建时间
        'update_time'       => 'Fupdate_time',      //更新时间
        'operator_id'       => 'Foperator_id',          //操作用户Id
        'operator_name'     => 'Foperator_name',        //操作用户名称
    );
}