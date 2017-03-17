<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/3/17
 * Time: 14:55
 */
/**
 * 行为标签配置页
 * $key:标签(位),包括系统标签和应用中自己定义的标签.
 * $value:行为类(可以有多个按顺序触发),包括系统的行为和自己定义的行为
 * @自己定义的标签要Listen才可以触发:添加My_tag标签侦听
 * \Think\Hook::listen('my_tag', $params);
 * @$params 必须一个引用传递的参数,所以一定是一变量(数组)
 */
return [
    // 应用初始化
    'app_init'     => [],
    // 应用开始
    'app_begin'    => [],
    // 模块初始化
    'module_init'  => [],
    // 操作开始执行
    'action_begin' => [],
    // 视图内容过滤
    'view_filter'  => [],
    // 日志写入
    'log_write'    => [],
    // 应用结束
    'app_end'      => [],
    // 生成目录
    'getMenus'     => [
        'app\\demo\\behavior\\GetMenu',
    ],
];