<?php

namespace Application\Helper;

use Laminas\Db\Adapter\Adapter;

class DbAdapter extends Adapter
{
    public function __construct()
    {
        parent::__construct([
		    'driver'   => 'Mysqli',
		    'database' => 'ruru',
		    'username' => 'root',
		    'password' => '',
		]);
    }
}