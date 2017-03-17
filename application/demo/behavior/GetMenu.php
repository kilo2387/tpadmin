<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/3/17
 * Time: 15:06
 */
namespace app\demo\behavior;
use app\demo\event\Menu;
class GetMenu{
    public function run(&$params){
        $menu = new Menu();
        $data = $menu->getMenus();
        return $data;
    }
}