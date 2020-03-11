<?php

/**
 * @see       https://github.com/laminas/laminas-mvc-skeleton for the canonical source repository
 * @copyright https://github.com/laminas/laminas-mvc-skeleton/blob/master/COPYRIGHT.md
 * @license   https://github.com/laminas/laminas-mvc-skeleton/blob/master/LICENSE.md New BSD License
 */

declare(strict_types=1);

namespace Application\Controller;

use Laminas\Mvc\Controller\AbstractActionController;
use Laminas\View\Model\ViewModel;
use Laminas\View\Helper\InlineScript;
use Application\Helper\CalendarHelper;

class IndexController extends AbstractActionController
{

  public $calendar;

    public function __construct() {
      $this->calendar = new CalendarHelper();
    }

    public function indexAction()
    {     
      if(!empty($_POST['loadForecasts'])) {
        $this->calendar->loadEvents();
        exit;
      }

        
        return new ViewModel();
    }
}
