(function() {
	
	let _doc = $(document),
		_body = $('body'),
		_calDom = $('#calendar'),
		_calOverlay = $('.cal-overlay'),
		_calEvent = $('.calendar-event'),
		_calLoader = $('.calendar-event > .view-port > .loading'),
		//quickview stuff
		_temp = {},
		_selectedDate = {},
		_dateRange = null,
		_eventUniqueId = null,
		_eventFromRepeat = null,
		_eventDate = $('#event-date'),
		_eventQuestion = $('event-type-question'),
		_eventFromTime = $('#lblfromTime'),
		_eventToTime = $('#lbltoTime'),
		_eventMainContact = $('#mainContact'),
		_eventPhone = $('#phone'),
		_eventType = $('[name="eventType"]'),
		_eventStartTime = $('#startTimeDD'),
		_eventEndTime = $('#endTimeDD'),
		_eventChannelDD = $('#channelDD'),
		_eventOrders = $('#order-list'),
		_eventNotes = $('#txtEventDesc'),
		_eventSaveButton = $('#eventSave'),
		_eventDeleteButton = $('#eventDelete'),
		_eventRecipe = $('#input-recipe'),
		_eventAmount = $('#input-recipe-amt'),
		_eventRecipelist = $('#grocery-list'),
		_eventNewEventId = null;

	function _init() {

		$('.select-2').each(function(e){
			$(this).select2({
            	minimumResultsForSearch: -1
        	});
        });	

        _calendar.init();
	};

	const _calendar = {
		options: {
			allDaySlot: false,
			timeZone: 'UTC',
			header: {
				left: 'title myCustomButton',
				// center: 'month,agendaWeek,agendaDay',
				right: 'today prev,next'
			},
			themeButtonIcons: {
			  prev: 'circle-triangle-w',
			  next: 'circle-triangle-e'
			},
			defaultDate: null,
			defaultView: 'agendaWeek',
			titleFormat: 'DD MMM, YYYY',
			titleRangeSeparator: '-',
			editable: true,
			events: [],
			minTime: '00:00',
	        maxTime: '21:00',
	        firstDay: 1,
			columnFormat: 'ddd D',
	  		disableDragging: true,
	  		slotLabelFormat: [
			  'MMMM YYYY', // top level of text
			  'h (:mm)a'        // lower level of text
			],
	  		timeFormat: 'H:mm',
		    dayRender: (date, element, view) => {
		    },
	        dayClick: (date, jsEvent, view) => {

		        let start = moment(date).format('YYYY-MM-DD HH:mm'),
		        	end = moment(date).add(1,'hours').format('YYYY-MM-DD HH:mm'),
		        	clickedDate = moment(date).format('YYYY-MM-DD'),
		        	startTime = moment(start).format('HH:mm'),
		        	endTime = moment(end).format('HH:mm'),
		        	begOfWeekDay = moment().startOf('isoweek').format('YYYY-MM-DD');

		        if(clickedDate >= begOfWeekDay) {
		        	_dateRange = moment(clickedDate).startOf('isoweek').format('YYYY-MM-DD');
		        	_dateRange = _dateRange + '|' + moment(_dateRange).add(6,'days').format('YYYY-MM-DD');
		        	_selectedDate = clickedDate;
		        	_calEvent.attr('data-event-type','new'),
		  			_eventDate.html(moment(start).format('ddd, MMM Do YYYY')),
		  			_eventFromTime.html('&nbsp;&nbsp;' + startTime),
		  			_eventToTime.html(endTime),
		  			_eventMainContact.html('-'),
		  			_eventPhone.html('-'),
		  			_eventStartTime.val(startTime).select2().trigger('change'),	  			
	  				_eventEndTime.val(endTime).select2().trigger('change'),
	  				_eventChannelDD.val('').select2().trigger('change'),
		  			_eventChannelDD.removeAttr('disabled'),  
		  			_eventSaveButton.text('Create New Event'),			
					_toggleQuickview();
		  			
		  			let a = $('#calendar').fullCalendar('clientEvents'),
		  				id = _randfunction(20);

		  				localStorage.setItem('new_event_id', id);

	                $.when(
		  				a.push({
		  					'id': id,
		  					'title': 'New Event', 
		  					'start': moment(date),
		  					'end': moment(date).add(1,'hours'),
		  					'textColor': '#fff',
		  					'other': {}
		  				})
	                ).done(() => {
	                	_calDom.fullCalendar('removeEvents');
	                	_calDom.fullCalendar('renderEvents', a);
	                });

		  			$('#channelDD').on('change',(e) => {
		  				
		  				let channel = e.currentTarget.value;

		  				if(_calEvent.attr('data-event-type') == 'new' && channel != '') {

		                	$.ajax({
				                dataType: "json",
				                type: "POST",
				                data: { 
				                    forecastViaChannel: 1,
				                    start: startTime,
				                    end: endTime,
				                    channel: channel,
				                    date: clickedDate
				                },
				                beforeSend: () => {
				                	_calLoader.show();
				                },
				                success: (d) => {
				                	setTimeout(() => {
				                		_calLoader.hide(),
				                		_eventMainContact.html('&nbsp;&nbsp;' + d.main_contact),
			  							_eventPhone.html('&nbsp;&nbsp;<a href="tel:' + d.contact + '">' + d.phone + '</a>');
			  							let a = $('#calendar').fullCalendar('clientEvents');
			  							$.when(
						                	a[a.length - 1].title = d.name,
						                	a[a.length - 1].channel = parseInt(channel),
						                	a[a.length - 1].backgroundColor = d.channel_color,
						                	a[a.length - 1].borderColor = d.channel_color,
						                	a[a.length - 1].textColor = d.channel_text,
						                	a[a.length - 1].other.contact = d.main_contact,
						                	a[a.length - 1].other.phone = d.phone
						                ).done(() => {
						                	_calDom.fullCalendar('removeEvents');
						                	_calDom.fullCalendar('addEventSource', a);
						                });
				                	},700)
				                },
				                error: () => {
				                	setTimeout(() => {
				                		_calLoader.hide();
				                	},700)
				                }
				            });
		                }
		  				
		  			})
		  		}
			},
	        loading: (isLoading, view) => {
	        	console.log(isLoading, view);
	        },
		  	eventResize: (event, delta) => {

		  		console.log(event);

			    let startTime = moment(event.start).format('HH:mm'),
		  			endTime = moment(event.end).format('HH:mm'),
		  			date = moment(event.start).format('YYYY-MM-DD'),
		  			eventType = event.event_type,
		  			oldEndTime = moment(event.end)
		  						.subtract(delta._milliseconds,'milliseconds')
		  						.format('HH:mm');

				_selectedDate = date;
				_eventUniqueId = event.unique_id;
				_eventFromRepeat = event.from_repeat;

	  			_dateRange = moment(date).startOf('isoweek').format('YYYY-MM-DD'),
	        	_dateRange = _dateRange + '|' + moment(_dateRange).add(6,'days').format('YYYY-MM-DD');

		    	$.ajax({
	                dataType: "json",
	                type: "POST",
	                data: { 
	                    updateForecastTime: 1,
	                    start: startTime,
                		eventType: eventType,
	                    dateRange: _dateRange,
	                    end: endTime,
	                    channel: event.channel,
	                    date: date,
	                    eventUniqueId: _eventUniqueId,
		                fromRepeat: _eventFromRepeat,
		                dateRange: _dateRange,
                		recipes: 0
	                },
	                success: (data) => {
	                	_loadevents(moment(date).startOf('isoweek').format('YYYY-MM-DD'), 
	                				moment(date).startOf('isoweek').add(6,'days').format('YYYY-MM-DD'));
	                }
	            });
		  	},
		  	eventDrop: (event, delta) => {

		  		let channel = event.channel,
		  			id = event.id,
		  			date = moment(event.start).format('YYYY-MM-DD'),
		  			newStartTime = moment(event.start).format('HH:mm'),
		  			eventType = event.event_type,
		  			newEndTime = moment(event.end).format('HH:mm'),
		  			oldDay = moment(event.start).subtract(delta._days,'days').format('YYYY-MM-DD'),
		  			oldEndTimeStart = moment(event.start).subtract(delta._milliseconds,'milliseconds').format('HH:mm'),
		  			oldEndTimeEnd = moment(event.end).subtract(delta._milliseconds,'milliseconds').format('HH:mm'),
		  			a = _calDom.fullCalendar('clientEvents');

		  			_selectedDate = date;
		        	_eventUniqueId = event.unique_id;
		        	_eventFromRepeat = event.from_repeat;

		        	_dateRange = moment(date).startOf('isoweek').format('YYYY-MM-DD');
		        	_dateRange = _dateRange + '|' + moment(_dateRange).add(6,'days').format('YYYY-MM-DD');

		  		if(delta._days > 0 || delta._days < 0) {
		  			let oldEvent = event;
		  			oldEvent.start = moment(oldDay + 'T' + oldEndTimeStart);
		  			oldEvent.end = moment(oldDay + 'T' + oldEndTimeEnd);
		  			
		  			_calDom.fullCalendar('removeEvents',id);
		  			_calDom.fullCalendar('renderEvent', oldEvent);
		  			$.alert({
					    title: 'Oops!',
				        buttons: {
				        	ok: {
					        	text: 'Okay',
					            btnClass: 'btn-primary',
					            // action: function(){}
					        }
				        },
					    content: 'Sorry you cannot move an event to a different day.<br/><br/>Please create a new event on that day.',
					});
		  		
		  		} else {

		  			$.ajax({
		                dataType: "json",
		                type: "POST",
		                data: { 
		                    updateForecastTime: 1,
                			eventType: eventType,
		                    start: newStartTime,
		                    end: newEndTime,
		                    channel: channel,
		                    date: date,
		                    eventUniqueId: _eventUniqueId,
			                fromRepeat: _eventFromRepeat,
			                dateRange: _dateRange,
                			recipes: 0
		                },
		                success: (data) => {
	                		_loadevents(moment(date).startOf('isoweek').format('YYYY-MM-DD'), 
	                					moment(date).startOf('isoweek').add(6,'days').format('YYYY-MM-DD'));
		                }
		            });
		  		}
		  	},
	  		eventClick: (a) => {
	  				//get monday of week
	  			let begOfWeekDay = moment().startOf('isoweek').format('YYYY-MM-DD HH:mm'),
	  				//get clicked date
	  				clickedDate = moment(a.start).format('YYYY-MM-DD HH:mm'),
	  				yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm');

	  				console.log(a);

	  			//make sure the event clicked is greater than or equal to the monday of this week.
	  			// if(clickedDate >= yesterday) {
		  			let startTime = moment(a.start).format('HH:mm'),
		  				endTime = moment(a.end).format('HH:mm'),
		  				date = moment(a.start).format('YYYY-MM-DD');

		        	_selectedDate = date;
		  			_dateRange = moment(_selectedDate).startOf('isoweek').format('YYYY-MM-DD');
		        	_dateRange = _dateRange + '|' + moment(_dateRange).add(6,'days').format('YYYY-MM-DD');
		        	_eventUniqueId = a.unique_id;
		        	_eventFromRepeat = a.from_repeat;
		        	_calEvent.attr('data-event-type','existing'),
		        	$('.user-status[value="' + a.event_type + '"]'). prop("checked", true),
		  			_eventDate.html(moment(a.start).format('ddd, MMM Do YYYY')),
		  			_eventFromTime.html('&nbsp;&nbsp;' + moment(a.start).format('HH:mm')),
		  			_eventToTime.html(moment(a.end).format('HH:mm')),
		  			_eventMainContact.html('&nbsp;&nbsp;' + a.other.contact),
		  			_eventPhone.html('&nbsp;&nbsp;<a href="tel:' + a.other.phone + '">' + a.other.phone + '</a>'),
	  				_eventStartTime.val(startTime).select2().trigger('change'),
	  				_eventEndTime.val(endTime).select2().trigger('change'),
	  				_eventNotes.val(a.other.notes),
	  				_eventChannelDD.val(a.channel).select2().trigger('change'),
	  				_eventChannelDD.attr('disabled','disabled'),
		  			_eventSaveButton.text('Save Event'),
		  			_buildRecipesFromLoadedEvent(a.other.recipes),
					_toggleQuickview();
	  			// }
	  		},
		    viewRender: (view, element) => {

	            let start = moment(view.start._i).add(1, 'day').format('YYYY-MM-DD'),
	                end = moment(view.end._i).format('YYYY-MM-DD');
	                $('.fc-myCustomButton-button').attr('onclick', "window.location.href='/forecast/" + start + "|" + end + "'");

		    	_loadevents(start, end);
		    	view.el.find('.fc-day-header').each(function(){
		    		let str = $(this).find('span').html(),
		    			cl = $(this).hasClass('fc-today') ? 'today bg-primary' : '',
		    			cl2 = $(this).hasClass('fc-today') ? 'text-primary' : '';
		    			str = str.split(' ');
		    			$(this).html('<small class="' + cl2 + '">' + str[0] + '</small><h3 class="' + cl + '">' + str[1] + '</h3>');
		    	});
		    },
			customButtons: {
				myCustomButton: {
					text: 'List View',
					click: function(a,b,c) {
					}
				}
			},
		    eventAfterAllRender: (view) => {
		    },
		},
		init: function() {
			$.when(
				_calendar.setUpDefaultDate()
			).done(function(){
				_calDom.fullCalendar(_calendar.options);
			})
		},
		setUpDefaultDate: function() {
			if(localStorage.getItem('range') === null) {
				_calendar.options.defaultDate = null;
			} else {
				_calendar.options.defaultDate = localStorage.getItem('range');
			}
			console.log(_calendar.options);
			localStorage.removeItem('range');
		}
	}

	const _loadevents = (start, end) => {

		let channel = $('#channelFilterDD').val();
		
		$.ajax({
            dataType: "json",
            type: "POST",
            data: { 
                loadForecasts: 1,
                channel: channel,
                start: start,
                end: end
            },
            success: (data) => {
                $.when(
                	_calDom.fullCalendar('removeEvents')
                ).done(() => {
                	_calDom.fullCalendar('renderEvents', data);
                });
            }
        });
	};

	const _toggleQuickview = (option = 'open') => {

		if(option == 'close') {
			// first check if it is a new event or old event');
  			if(_calEvent.attr('data-event-type') == 'new') {
  				// if it's new first check if the event has changes to it
  				// like updated channel or recipe etc...
  				if(_eventChannelDD.val() != '') {

  					$.confirm({
					    title: 'Are you sure?',
					    content: "By exiting you will loose your changes.\n If you want to keep these changes please hit save first.",
					    buttons: {
					        cancel: {
					        	btnClass: 'btn-primary',
					        	text: 'Stay',
					        	action: () => {
						            // $.alert('Confirmed!');
						        }
					        },
					        confirm: {
					        	btnClass: 'btn-danger',
					        	text: 'Leave',
					        	action: () => {
						            // if they say close? Then close without saving delete the new events
						            _eventUniqueId = null,
									_eventFromRepeat = null,
									_dateRange = null,
				            		_temp = {},
					  				_eventOrders.html('list empty'),
					  				_eventAmount.val(''),
					  				_eventType.prop('checked', false),
									_calOverlay.addClass('hidden'),
						  			_calEvent.removeClass('open'),
						  			_body.removeClass('no-scroll'),
						  			a = _calDom.fullCalendar('clientEvents');
					  				//first we need to check if the 
									$.when(
							  			$.each(a, (i,e) => {
											if(e.id == localStorage.getItem('new_event_id')) {
												delete a[i];
												a.splice(i,1);
												return false;
											}
										})
									).done(() => {
										$.when(
						            		_calDom.fullCalendar('removeEvents')
						            	).done(() => {
						            		_calDom.fullCalendar('renderEvents', a);
						            	});
						            	localStorage.removeItem('new_event_id')
						            });
						        }
						    }
					    }
					});
					return;
  				}
  				_temp = {},
  				_eventOrders.html('list empty'),
  				_eventAmount.val(''),
  				_eventType.prop('checked', false),
  				_calOverlay.addClass('hidden'),
	  			_calEvent.removeClass('open'),
	  			_body.removeClass('no-scroll'),
	  			a = _calDom.fullCalendar('clientEvents');
  				//first we need to check if the 
				$.when(
		  			$.each(a, (i,e) => {
						if(e.id == localStorage.getItem('new_event_id')) {
							delete a[i];
							a.splice(i,1);
							return false;
						}
					})
				).done(() => {
					$.when(
	            		_calDom.fullCalendar('removeEvents')
	            	).done(() => {
	            		_calDom.fullCalendar('renderEvents', a);
	            	});
	            	localStorage.removeItem('new_event_id')
	            });
	            return false;
  			} else {
  				_temp = {},
  				_eventOrders.html('list empty'),
  				_eventAmount.val(''),
  				_eventType.prop('checked', false),
  				_calOverlay.addClass('hidden'),
	  			_calEvent.removeClass('open'),
	  			_body.removeClass('no-scroll');
  			}
		} else {
			_calOverlay.removeClass('hidden');
			_calEvent.addClass('open');
			_body.addClass('no-scroll');
		}
	};

	const _randfunction = (n) => {
	    let add = 1, 
	    	max = 12 - add; 

	    if ( n > max ) {
	    	return _randfunction(max) + _randfunction(n - max);
	    }

	    max = Math.pow(10, n + add);
	    let min = max/10,
	    	number = Math.floor( Math.random() * (max - min + 1) ) + min;

	    number = parseInt(("" + number).substring(add));

	    return number;
	};

	_doc.on('change','#channelFilterDD',() => {
		let start = moment(_calDom.fullCalendar('getView').start._i).add(1, 'day').format('YYYY-MM-DD'),
			end = moment(_calDom.fullCalendar('getView').end._i).format('YYYY-MM-DD');

		_loadevents(start, end);
	});

	_doc.on('click','.cal-overlay, [data-close-it="quickview"]',function(e) {
		_toggleQuickview('close');
		e.preventDefault();
	});

	_doc.keyup((e) => {
	    if (e.key === "Escape" && 
			_calEvent.hasClass('open') && 
				!$('.jconfirm').length) { //check if jquery confirm is open
			_toggleQuickview('close');
	    }
	});

    _doc.on('change','#startTimeDD',function() {

        let time = $(this).val(),
        	x = 0;
        $('#endTimeDD option').each(function() {

        	let thisTime = $(this).text();

            if(thisTime <= time) {
                $(this).attr('disabled','disabled');
            	$(this).removeAttr('selected');
            } else {
                $(this).removeAttr('disabled');
                if(x == 0) {
                	_eventEndTime.val(thisTime).select2().trigger('change')
                }
                x++;
            }
        })
    });

	_doc.on('click','#eventDelete',() => {
		$.confirm({
		    title: 'Are you sure?',
		    // content: "By exiting you will loose your changes.\n If you want to keep these changes please hit save first.",
		    buttons: {
		        cancel: {
		        	btnClass: 'btn-white',
		        	text: 'Cancel',
		        	action: () => {
			            // $.alert('Confirmed!');
			        }
		        },
		        confirm: {
		        	btnClass: 'btn-danger',
		        	text: 'Yes Delete!',
		        	action: () => {
		        		//begin ajax
						let channel = _eventChannelDD.val(),
							startTime = _eventStartTime.val(),
							endTime = _eventEndTime.val(),
							date = _selectedDate;

		        		$.ajax({
				            dataType: "json",
				            type: "POST",
				            data: { 
				                deleteEvent: 1,
				                start: startTime,
				                end: endTime,
				                channel: channel,
				                date: date,
                				dateRange: _dateRange,
				                eventUniqueId: _eventUniqueId,
				                fromRepeat: _eventFromRepeat,
				            },
				            beforeSend: () => {
				            	_calLoader.show();
				            },
				            success: (d) => {
				            	setTimeout(() => {
				            		_calLoader.hide();
				            		_loadevents(moment(date).startOf('isoweek').format('YYYY-MM-DD'), 
					                				moment(date).startOf('isoweek').add(6,'days').format('YYYY-MM-DD'));
									_eventUniqueId = null,
									_eventFromRepeat = null,
									_dateRange = null,
				            		_temp = {},
					  				_eventOrders.html(''),
					  				_eventAmount.val(''),
									_calOverlay.addClass('hidden'),
						  			_calEvent.removeClass('open'),
						  			_body.removeClass('no-scroll');
				            	},700)
				            },
				            always: () => {
				            	setTimeout(() => {
				            		_calLoader.hide();
				            	},700)
				            },
				            error: () => {
				            	setTimeout(() => {
				            		_calLoader.hide();
				            	},700)
				            }
				        });
				        //end ajax
			        }
			    }
		    }
		});
	});

	_doc.on('click','#eventSave',() => {

		let channel = _eventChannelDD.val(),
			eventType = $('input[name="eventType"]:checked').val(),
			startTime = _eventStartTime.val(),
			endTime = _eventEndTime.val(),
			notes = _eventNotes.val(),
			date = _selectedDate;
		
		if(channel == '') {
			$.alert({
			    title: 'Oops!',
		        buttons: {
		        	ok: {
			        	text: 'Okay',
			            btnClass: 'btn-primary'
			        }
		        },
			    content: 'Please pick a Client.',
			});
			return false;
		}

		if(eventType === undefined) {
			$.alert({
			    title: 'Oops!',
		        buttons: {
		        	ok: {
			        	text: 'Okay',
			            btnClass: 'btn-primary'
			        }
		        },
			    content: 'Please pick an Event Type.',
			});
			return false;
		}
	
		if(Object.keys(_temp).length == 0) {
			$.alert({
			    title: 'Oops!',
		        buttons: {
		        	ok: {
			        	text: 'Okay',
			            btnClass: 'btn-primary',
			            // action: function(){}
			        }
		        },
			    content: 'You must pick some recipes',
			});
			return false;
		}

		$.ajax({
            dataType: "json",
            type: "POST",
            data: { 
                updateForecastTime: 1,
                eventType: eventType,
                start: startTime,
                end: endTime,
                channel: channel,
                date: date,
                notes: notes,
                eventUniqueId: _eventUniqueId,
                fromRepeat: _eventFromRepeat,
                dateRange: _dateRange,
                recipes: JSON.stringify(_temp)
            },
            beforeSend: () => {
            	_calLoader.show();
            },
            success: (d) => {
            	console.log(_temp);
            	setTimeout(() => {
            		_calLoader.hide();
            		localStorage.removeItem('new_event_id');
            		_loadevents(moment(date).startOf('isoweek').format('YYYY-MM-DD'), 
	                				moment(date).startOf('isoweek').add(6,'days').format('YYYY-MM-DD'));
					_eventUniqueId = null,
					_eventFromRepeat = null,
					_dateRange = null,
            		_temp = {},
	  				_eventOrders.html(''),
	  				_eventAmount.val(''),
					_calOverlay.addClass('hidden'),
		  			_calEvent.removeClass('open'),
		  			_body.removeClass('no-scroll');
            	},700)
            },
            always: () => {
            	setTimeout(() => {
            		_calLoader.hide();
            	},700)
            },
            error: () => {
            	setTimeout(() => {
            		_calLoader.hide();
            	},700)
            }
        });
	});

	_doc.on('click','#calendar-event #order-list a',function(e) {

		$.when(
			_deleteSubRecipeByElement($(this))
		).done(function(){
			_buildRecipeToDiv();
		})
		
	});

	_doc.on('click','.event-type-question',function(e) {

		$.alert({
		    title: 'Public vs Private Events',
	        buttons: {
	        	ok: {
		        	text: 'Okay',
		            btnClass: 'btn-primary',
		            // action: function(){}
		        }
	        },
		    content: '<strong>What is the difference?</strong><br/><br/>' + 
		    		 '<strong>Public Events</strong> are events that you go to sell to that are not prepaid.  ' + 
		    		 'This is because you may not know how much you are going to sell, so in this case the forecast is actually an estimate.  In the' + 
		    		 'case of public events, your invoice will only be sent once you fill out how much you <strong>ACUTALLY</strong> sell.<br/><br/>' + 
		    		 '<strong>Private Events</strong> are events that you go to sell that are already prepaid by the client.  This is bascially a' + 
		    		 'pre-order of items and is a given that you will sell this much.',
		});
		return false;
		
	});

	const _deleteSubRecipeByElement = (el) => {

		let recipe_id = el.data('recipe'),
			sub_recipe_id = el.data('sub-recipe');

		delete _temp[recipe_id].variations_picked[sub_recipe_id];

		if(Object.keys(_temp[recipe_id].variations_picked).length == 0) {
			delete _temp[recipe_id];
		}
	};

	_doc.on('click','.add-offer',() => {
		$.when(
			loadUpRecipes()
		).done(() => {
			_eventAmount.val(''),
			_eventOrders.html('');
		}).then(() => {
			_buildRecipeToDiv();
		});
	});

	_eventAmount.on('change',function(){
		if($(this).val() < 0) {
			$(this).val(1);
		}
	});

	const _buildRecipeToDiv = () => {

		let html = '';
		_eventOrders.html('');

		if(Object.keys(_temp).length == 0) {
			_eventOrders.html('list empty');
		}

		$.each(_temp, (i,e) => {

			html += '<strong class="block m-b-5">' + e.recipe_name + '</strong>';
			let m = 1;
			$.each(e.variations_picked, (o,q) => {

				let dotted = m < Object.keys(e.variations_picked).length ? "border-bottom: 1px dotted #CCC;" : "";
				
				html += '<div class="block full-width p-t-5 p-b-5" style="height: 30px; ' + dotted + '">';
				html += '<a data-sub-recipe="' + o + '" data-recipe="' + i + '" id="removeSubRecipe" class="pull-left fs-12 p-l-10 p-r-5 inline-block">';
				html += '<i class="flaticon flaticon-round-minus"></i>';
				html += '</a>&nbsp;&nbsp;<span class="font-montserrat fs-12 inline-block pull-left">' + q.sub_name + '</span>';
				html += '<span class="font-montserrat fs-12 inline-block pull-right p-r-20">' + q.amount + ' units</span>';
				html += '</div>';

				m++;
			});
		});
		_eventOrders.append(html);
	};

	const loadUpRecipes = () => {

		let recipe_sub_id = _eventRecipe.val(),
			recipe_id = _eventRecipe.find('option:selected').attr('data-recipe-id'),
			recipe_name = _eventRecipe.find('option:selected').attr('data-recipe-name'),
			recipe_sub_name = _eventRecipe.find('option:selected').attr('data-recipe-sub-name'),
			recipe_sub_price = _eventRecipe.find('option:selected').attr('data-recipe-sub-price'),
			amount = _eventAmount.val();

		$('.pgn-wrapper').remove();

		if(amount == '') {

            $('body').pgNotification({
                style: 'flip',
                message: 'Please enter an amount',
                position: 'top-right',
                timeout: 0,
                type: 'danger'
            }).show(),
            setTimeout(() => {
                $('.pgn-wrapper').remove();
            }, 3000);

            return false;
		}

		console.log('recipe_sub_id: ' + recipe_sub_id  + ', recipe_id: ' + recipe_id  + ', recipe_name: ' + recipe_name  + ', recipe_sub_name: ' + recipe_sub_name  + ', recipe_sub_price: ' + recipe_sub_price);

		if(_temp.hasOwnProperty(recipe_id)) {

			_temp[recipe_id].variations_picked[recipe_sub_id] = {
				'sub_name': recipe_sub_name,
				'sub_price': parseFloat(recipe_sub_price),
				'amount': parseInt(amount)
			}

		} else {

			_temp[recipe_id] = {
				'recipe_name': recipe_name,
				'variations_picked': {
					[recipe_sub_id]: {
						'sub_name': recipe_sub_name,
						'sub_price': parseFloat(recipe_sub_price),
						'amount': parseInt(amount)
					}
				}
			};
		}

		console.log(_temp);
	};

	const _buildRecipesFromLoadedEvent = (recipes) => {

		_temp = {};

		console.log(recipes);

		$.each(recipes, function(i,e){

			if(_temp.hasOwnProperty(e.recipe_id)) {

				_temp[e.recipe_id].variations_picked[e.sub_recipe_id] = {
					'sub_name': e.sub_recipe_name,
					'sub_price': parseFloat(e.instantaneous_subrecipe_price),
					'amount': parseInt(e.total)
				}

			} else {

				_temp[e.recipe_id] = {
					'recipe_name': e.recipe_name,
					'variations_picked': {
						[e.sub_recipe_id]: {
							'sub_name': e.sub_recipe_name,
							'sub_price': parseFloat(e.instantaneous_subrecipe_price),
							'amount': parseInt(e.total)
						}
					}
				};
			}
		});

		_buildRecipeToDiv();
	};

    $('textarea').each(function () {
      this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
    }).on('input', function () {
      this.style.height = (this.scrollHeight) + 'px';
    });

    setTimeout(() => {
    	_calOverlay.addClass('hidden');
    },700);

	return {
		init: _init()
	}
})();