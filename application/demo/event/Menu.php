<?php
/**
 * Created by PhpStorm.
 * User: SEELE
 * Date: 2017/3/17
 * Time: 11:14
 */
// +----------------------------------------------------------------------
// | Name: [生成目录事件]
// +----------------------------------------------------------------------
// | Tips: 生成两个目录缓存:A)全部目录数据(7200秒) B)生成个人目录缓存(7200秒)
// +----------------------------------------------------------------------
// | Date: 2017/3/17
// +----------------------------------------------------------------------
// | Author: Kilo
// +----------------------------------------------------------------------

namespace app\demo\event;
use app\demo\logic\Tree;
use app\demo\model\Catalog;
use think\Db;

class Menu{
    private static $active = 'active';
    /**
     * 获取栏目列表信息:保存数据7200秒
     * @return mixed
     */
    function getCatalogList(){
//        if(empty(S('catalog_list'))){
//            $result = model('Catalog')->getList(array('where' => array('status' => 0)));
        $result = Catalog::all();
        $result = $result->toArray();
//            S('catalog_list', $result['data'], 300);//更新缓存
//        }
        return $result;
//        return S('catalog_list');
    }

    /**
    * 获取栏目信息
    * @param $catalog_id 需要获取的栏目id
    * @param null $field 需要的字段，多个字段需要用（,）都好分开
    * @return mixed|string
    */
    function getCatalogInfo($catalog_id, $field = null){
        if (empty($catalog_id) || !is_numeric($catalog_id)) {
            return '';
        }

        $current_catalog = array_filter($this->getCatalogList(), function($list) use($catalog_id){
            return $list['catalog_id'] == $catalog_id;
        });

        $current_catalog = array_shift($current_catalog);//转换

        if(is_null($field)) return $current_catalog;
        //当存在多个字段
        if(stripos($field, ',')){
            $field = explode(',', $field);
            array_walk($field, function(&$value){
                $value = trim($value);
            });
            $need_catalog_info = array();
            foreach($current_catalog as $key => $value){
                if(in_array($key, $field)){
                    $need_catalog_info[$key] = $value;
                }
            }
            return $need_catalog_info;
        } else {
            return $current_catalog[$field];
        }
    }

    /**
     * 获取当前栏目的所有父级栏目
     * @param $catalog_id 当前栏目编号
     * @return array
     */
    function getParentCatalog($catalog_id){
        if(empty($catalog_id))  return '';
        $catalog_list = $this->getCatalogList();
        $current_catalog = $this->getCatalogInfo($catalog_id);

        $pid = $current_catalog['pid'];
        $parent_catalog = array();
        array_unshift($parent_catalog, $current_catalog);
        while (true) {
            foreach ($catalog_list as $key => $value) {
                if ($value['catalog_id'] == $pid) {
                    $pid = $value['pid'];
                    array_unshift($parent_catalog, $value);
                }
            }
            if ($pid == 0) break;
        }
        return $parent_catalog;
    }

    /**
     * 获取控制器菜单数组,二级菜单元素位于一级菜单的'_child'元素中
     * @author 谢剑伟
     */
    final public function getMenus(){
//        //当前链接
//        $current_url = !empty(ACTION_NAME) ? strtolower('/'.CONTROLLER_NAME.'/'.ACTION_NAME.'/'): strtolower('/'.CONTROLLER_NAME.'/');
//        $catalog_info = array_filter(getCatalogList(), function($list) use($current_url){
//            return $list['url'] == $current_url;
//        });
//        $this->catalog_info = array_shift($catalog_info);
//        //获取所有上级栏目（包括自己）
//        $active_catalog = $this->getParentCatalog($this->catalog_info['catalog_id']);
//        //拿到当前栏目的所有父级ID
//        self::$active_catalog_id = array_column($active_catalog, 'catalog_id');
        $tree = $this->getCatalogList();
//        var_dump($tree);
//        //过滤没有权限的栏目
//        if(C('IS_CHECK_AUTH')){
//            foreach ($tree as $key){
//                if (!in_array($key['catalog_id'], $this->user_catalog)) {
//                    unset($tree[$key]);
//                }
//            }
//        }

        //生成树形菜单
        $options = array(
            'primary_key'   => 'Fcatalog_id',//主键
            'parent_key'    => 'Fpid',//父级ID
            'expanded_key'  => 'Fis_active',//展开属性
        );
        $tree = Tree::makeTree($tree, $options);
//        echo '<pre>';
//print_r($tree);
//        echo '</pre>';
        //组合模板
        $treeHtml = self::foreachMenus($tree);// 循环子集菜单;
//        print_r($treeHtml);die();
        return $treeHtml;

    }

    /**
     * 遍历子级菜单，生成菜单html模板
     * @param $array 树形菜单数组
     * @param int $num 当前循环次数 需在外部初始化
     * @return bool|string
     */
    private static function foreachMenus($array, &$num = 0){
        if(!is_array($array)){
            return false;
        }
        if($num == 0){
            $children_html = '<ul class="x-navigation">';
        } else {
            $children_html = '<ul>';
        }
        foreach($array as $k => $v){
            $num++;
//            self::$active = (in_array($v['Fcatalog_id'], self::$active_catalog_id)) ? ' active' : 'active';
            if(isset($v['leaf']) && $v['leaf'] == 1){//判断是否含有子集
                $children_html .= '<li class="'.self::$active.'">';
                $children_html .= '<a href="'.$v['Furl'].'">'.$v['Fname'].'</a>';
                $children_html .= '</li>';
            } else {
                $children_html .= '<li class="xn-openable '.self::$active.'">';
                $children_html .= '<a href="javascript:;">';
                if($v['Fpid'] == 0){
                    $children_html .= '<span class="fa fa-sitemap"></span>';
                }
                $children_html .= '<span class="xn-text">'.$v['Fname'].'</span></a>';
                $children_html .= self::foreachMenus($v['children']);// 循环子集菜单
                $children_html .= '</li>';
            }
        }
        $children_html .= '</ul>';
        return $children_html;
    }
}