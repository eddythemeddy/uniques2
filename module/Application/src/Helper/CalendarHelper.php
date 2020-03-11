<?php

namespace Application\Helper;

use Application\Helper\DbAdapter;
use Laminas\Db\ResultSet\ResultSet;

class CalendarHelper
{
	function __construct() {

	}

 	public function loadEvents() 
 	{

 		$adapter = new DbAdapter();

 		$query = 'SELECT *, c.name AS client FROM forecast f 
 				  LEFT JOIN (
	                SELECT id, name, address
	                FROM channels
 				  ) AS c on c.`id` = f.`channel_id`
 				  WHERE updated_from_repeat = 0';
    	$data = $adapter->query($query);
        $data = $data->execute();
    	 $resultSet = new ResultSet;
        $resultSet->initialize($data);
        $array = [];
        foreach ($resultSet as $row) {
        	array_push($array, [
        		'id' => rand(),
        		'from_repeat' => 0,
        		'title' => $row->client,
        		'event_type' => $row->event_type,
        		'unique_id' => $row->id,
        		'start' => $row->date . 'T'  . $row->start_time,
        		'end' => $row->date . 'T'  . $row->end_time,
        	]);
        }

        echo json_encode($array);
        die;	

    //     $this->eqDb->where("channel_id", $resp['id']);
		  //       $this->eqDb->where("date", $dateOfEvent);
		  //       $this->eqDb->where("updated_from_repeat", 0);

				// $addedForecast = $this->eqDb->get("forecast f", null, '*');

				// foreach($addedForecast as $keyAdd => $added) {

				// 	$this->eqDb->where("forecast_id", $added['id']);
				// 	$forecastRecipes = $this->eqDb->get("forecast_recipes", null, '*');

				// 	$id = rand().rand();
				// 	$id = (int)$id;

				// 	$array = [
		  //   			'id'                  => rand().rand(),
		  //   			'day'                 => $date->format('d'),
		  //   			'channel'             => $resp['id'],
		  //   			'backgroundColor'     => $eventBgColor,
		  //   			'borderColor'         => $eventBgColor,
		  //   			'eventType'           => $added['event_type'],
		  //   			'textColor'           => $eventTextColor,
		  //   			'title'               => $resp['name'],
		  //   			//you can just also manually set below to 0 because it should always be 0
		  //   			'from_repeat'         => $added['updated_from_repeat'], 
		  //   			'unique_id'           => $added['id'],
	   //                  'start'               => $dateOfEvent . 'T' . $added['start_time'],
	   //                  'end'                 => $dateOfEvent . 'T' . $added['end_time'],
	   //                  'editable'            => $editable,
		  //   			'updated_from_repeat' => 0,
	   //                  'other'               => [
	   //                  	'contact' => $resp['main_contact'],
	   //                  	'phone'   => $resp['phone'],
	   //                      //You can have your custom list of attributes here
	   //                      'notes'   => $added['notes'],
	   //                      'recipes' => $forecastRecipes
	   //                  ]
		  //   		];
 	}   
}