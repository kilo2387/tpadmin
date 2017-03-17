<?php
namespace app\demo\controller;
//use app\demo\controller\Base;
class Index extends Base
{
    public function index()
    {
//        echo 'sere';die();
        return $this->fetch();
    }
}
