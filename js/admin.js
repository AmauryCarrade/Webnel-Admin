$(document).ready(function() {
	$('.tooltip-top')   .tooltip();
	$('.tooltip-left')  .tooltip({ placement: 'left'   });
	$('.tooltip-right') .tooltip({ placement: 'right'  });
	$('.tooltip-bottom').tooltip({ placement: 'bottom' });

	$('#MessagesFormFieldText').autoResize({
		animate: { enabled: true },
		maxHeight: 140
	});

	$('.popover-right') .popover();
	$('.popover-left')  .popover({ placement: 'left'   });
	$('.popover-bottom').popover({ placement: 'bottom' });
	$('.popover-top')   .popover({ placement: 'top'   });

	$('.alert-close').click(function() {
		$(this).parent().parent().alert('close');
	});

	/** Various **/
	var objectLength = function(object, neededValue) {
		var counter = 0;
 
		for (var i in object) {
		    if (object.hasOwnProperty(i) && (neededValue === undefined || object[i] === neededValue)) {
			    counter++;
		    }
		}

		return counter;
	};
	
	/** Traductions (externalisé par la suite) **/
	var t = {
		messages: {
			author:         'Par %s — ',
			now:            'Maintenant',
			sending:        'Envoi en cours...',
			newMessage:     'Nouveau message',
			privateMessage: 'Message privé',
			groupeMessage:  'Message groupé',
			globalMessage:  'Message global',
			done:           'Terminé',
			cancel:         'Annuler'
		},
		notifications: {
			markAsRead:     'Marquer comme lu',
			markAsUnread:   'Marquer comme non-lu'
		}
	};
	
	/** Messages, notifications & background tasks counters **/
	var $messagesCount              = $('.messages-unread-count'),
		$messagesSystemCount        = $('#messagesUnreadSystemCount'), // Reference
		$messagesCountPopup         = $('#messagesUnreadCountBracketsInTitleOfPopup'),
		$notificationsCount         = $('.notifications-unread-count'),
		$notificationsSystemCount   = $('#notificationsUnreadSystemCount'), // Reference
		$notificationsCountPopup    = $('#notificationsUnreadCountBracketsInTitleOfPopup'),
		$backgroundTasksCount       = $('.background-tasks-count'),
		$backgroundTasksSystemCount = $('#backgroundTasksSystemCount'), // Reference
		$backgroundTasksCountPopup  = $('#backgroundTasksCountBracketsInTitleOfPopup'),
		$backgroundTasksBlock       = $('#background-tasks-link, #background-tasks-header'),
		$allCount                   = $('.all-unread-count'),
		
		messagesCount               = parseFloat($messagesSystemCount.html()),
		notificationsCount          = parseFloat($notificationsSystemCount.html()),
		backgroundTasksCount        = parseFloat($backgroundTasksSystemCount.html()),
		allCount                    = messagesCount + notificationsCount;
		
	// First, we update all count for coherences reasons.
	$messagesCount.text(messagesCount);
	$notificationsCount.text(notificationsCount);
	$backgroundTasksCount.text(backgroundTasksCount);
	$allCount.text(allCount);


	var updateAllCount = function() {
		allCount = messagesCount + notificationsCount;
		$allCount.text(allCount);
		if(allCount <= 0) {
			$allCount.hide();
		}
		else {
			$allCount.show();
		}
	};
	
	var changeMessagesCount = function(count, replace) {
		if(replace === true) {
			messagesCount = count;
		}
		else {
			messagesCount += count;
		}
		
		$messagesSystemCount.text(messagesCount);
		$messagesCount.text(messagesCount);
		
		if(messagesCount <= 0) {
			messagesCount = 0;
			$messagesCount.hide();
			$messagesCountPopup.hide();
		}
		else {
			$messagesCount.show();
			$messagesCountPopup.show();
		}
		updateAllCount();
	};
	var changeNotificationsCount = function(count, replace) {
		if(replace === true) {
			notificationsCount = count;
		}
		else {
			notificationsCount += count;
		}
		
		$notificationsSystemCount.text(notificationsCount);
		$notificationsCount.text(notificationsCount);
		
		if(notificationsCount <= 0) {
			notificationsCount = 0;
			$notificationsCount.hide();
			$notificationsCountPopup.hide();
		}
		else {
			$notificationsCount.show();
			$notificationsCountPopup.show();
		}
		
		updateAllCount();
	};
	
	var changeBackgroundTasksCount = function(count, replace) {
		if(replace === true) {
			backgroundTasksCount = count;
		}
		else {
			backgroundTasksCount += count;
		}
		
		$backgroundTasksSystemCount.text(backgroundTasksCount);
		$backgroundTasksCount.text(backgroundTasksCount);

		if(backgroundTasksCount <= 0) {
			backgroundTasksCount = 0;
			$backgroundTasksBlock.hide();
			$backgroundTasksCountPopup.hide();
		}
		else {
			$backgroundTasksBlock.show();
			$backgroundTasksCountPopup.show();
		}
	};
	
	/** Messages **/
	var $messages                        = $('#messages'),
		$messagesList                    = $('#messagesList'),
		$messagesListItem                = $('#messagesList ul li a'),
		$messagesThread                  = $('#messagesThread'),
		$messagesNothing                 = $('#messagesNothing'),
		$messagesNew                     = $('#messagesNew'),
		$messagesNewInputTo              = $('.messages-new-input-to'),
		$messagesNewInputsTo             = $('.messages-new-inputs-to'),
		$messagesObject                  = $('#messageObject'),
		$divSourceThread                 = null,
		$divThreadLoading                = $('#messagesSourceThreadLoading'),
		$messagesBackButton              = $('#messagesBtnBackToList'),
		$messagesUpdateThread            = $('#messagesUpdateThread'),
		$messagesForm                    = $('#messagesForm'),
		$messagesFormTextarea            = $messagesForm.find('textarea'),
		messagesAnswerInitialHeight      = $('#messagesForm').find('textarea').css('height'),
		
		$messagesBtnModify               = $('#messagesBtnModify'),
		$messagesBtnToolbarModifications = $('#messagesBtnToolbar'),
		$messagesBtnDelete               = $('#messagesBtnDelete'),
		$messagesBtnRead                 = $('#messagesBtnRead'),
		$messagesBtnUnread               = $('#messagesBtnUnread'),
		$messagesBtnInverse              = $('#messagesBtnInverse'),
		$messagesBtnCancelModification   = $('#messagesBtnCancelModification'),
		$messagesModifyCheckboxes        = $('.messagesList-checkbox'),
		$messagesBtnClose                = $('#messagesBtnClose'),
		$messagesBtnNew                  = $('#messagesBtnNew'),
		messagesSelectedCheckboxes       = 0,

		messageLocation                  = 'list',
		messageLocationId                = 0,
		messageLocationName              = null,
		messageType                      = null,

		messagesVisibles                 = $messagesListItem.length,

		messagesAnswersContents          = {};


	// Functions
	var updateThread = function(id) {
		var $threadSource = null;
		
		if(id == undefined) {
			$threadSource = $divSourceThread;
		}
		else {
			$threadSource = $('#messageSourceThread' + id);
		}
		
		// Loading...
		
		return;
	};
	var updateVisibleThread = function(id) {
		if(id != undefined) {
			$messagesThread.html($('#messageSourceThread' + id));
		}
		else {
			$messagesThread.html($divSourceThread.html());
		}
	};
	
	// Modal
	var $menuLeftItemMessages = $('#menuLeftItemMessages');
	$messages.modal({
		show: false
	});
	$('.show-messages').click(function() {
		$menuLeftItemMessages.addClass('active');
		$messages.modal('toggle');
		
		if(messageLocation == 'thread') {
			$messagesThread.scrollTop(100000);
		}
	});
	$messages.on('hide', function() {
		$menuLeftItemMessages.removeClass('active');
	});


	// Modifications
	var messagesSelectCheckboxes = function(what) {
		switch(what) {
			case 'check':
				$messagesModifyCheckboxes.find('input').attr('checked', true);
				break;

			case 'uncheck':
				$messagesModifyCheckboxes.find('input').attr('checked', false);
				break;
		}
	};
	var messagesGetNUmberOfSelectedCheckboxes = function() {
		var count = 0;
		$messagesModifyCheckboxes.each(function() {
			if($(this).find('input').is(':checked')) {
				count++;
			}
		});
		return count;
	}

	$messagesBtnModify.click(function() {
		$messagesModifyCheckboxes.animate({
			right: '0px',
			width: '25px'
		});
		$messagesBtnModify.hide();
		$messagesBtnNew.hide();
		$messagesBtnClose.hide();
		$messagesBackButton.hide();

		$messagesBtnToolbarModifications.show();
		$messagesBtnCancelModification.show();
		messagesSelectCheckboxes('uncheck');
		$messagesBtnToolbarModifications.find('.btn').addClass('disabled');

		messageLocation = 'modify';
	});
	$messagesBtnCancelModification.click(function() {
		$messagesModifyCheckboxes.animate({
			right: '30px',
			width: '0px'
		});
		$messagesBtnToolbarModifications.hide();
		$messagesBtnCancelModification.hide();

		if(messagesVisibles != 0) {
			$messagesBtnModify.show();
		}
		$messagesBtnNew.show();
		$messagesBtnClose.show();

		messageLocation = 'list';

		$messagesBtnCancelModification.text(t.messages.cancel);
	});
	$messagesModifyCheckboxes.find('input').click(function() {
		if(messagesGetNUmberOfSelectedCheckboxes() > 0) {
			$messagesBtnToolbarModifications.find('.btn').removeClass('disabled');
		}
		else {
			$messagesBtnToolbarModifications.find('.btn').addClass('disabled');
		}
	});

	var $item;
	$messagesBtnDelete.click(function() {
		if($messagesModifyCheckboxes.length == 0) {
			return;
		}

		$messagesModifyCheckboxes.each(function() {
			if($(this).find('input').is(':checked')) {
				$item = $(this).parent().parent().parent();
				var id = $item.find('a').data('id');

				if(id == undefined) return; 
				// In some case, the browser (tested with Chrome) add an unexisting message to the jQuery object.
				// The message isn't real if the id isn't gettable, so if his value is undefined.
				// Yes, this is a bancal fix. But I looking for a better solution to fix this issue.

				if($item.hasClass('unread')) {
					changeMessagesCount(-1);
					$item.removeClass('unread');
				}

				messagesVisibles--;

				if($item.hasClass('last')) {
					$item.siblings().filter(':last').addClass('last');
				}

				$item.slideUp('normal', function() {
					$item.empty().remove();

					// Because we remove some messages from the DOM, we need to update this.
					$messagesListItem = $('#messagesList ul li a');
				});

				if(messagesVisibles == 0) {
					$messagesNothing.slideDown();
					
					$messagesBtnToolbarModifications.find('.btn').addClass('disabled');
					// If all messages are deleted, what do you want to do?
				}

				$(this).find('input').attr('checked', false);
				// For a mysterious reason (I looking for a fix), $messagesListItem isn't quite updated.
				// So when we mark some messages as unread, or whan we inverse the read-state, these messages
				// are included to the selection. So we uncheck these; by the way, these will be exclude from 
				// this selection.

				$('#messageSourceThread' + id).remove();
				// Remove on server for current user.
			}
		});
		$messagesBtnCancelModification.text(t.messages.done);
	});

	$messagesBtnRead.click(function() {
		if($messagesModifyCheckboxes.length == 0) {
			return;
		}

		$messagesModifyCheckboxes.each(function() {
			if($(this).find('input').is(':checked')) {
				$item = $(this).parent().parent().parent();

				if($item.hasClass('unread')) {
					changeMessagesCount(-1);
					$item.removeClass('unread');
				}

				$item.find('h4 span').hide();

				var id = $item.data('id');
				// Save read-state.
			}
		});
		$messagesBtnCancelModification.text(t.messages.done);
	});

	$messagesBtnUnread.click(function() {
		if($messagesModifyCheckboxes.length == 0) {
			return;
		}
		
		$messagesModifyCheckboxes.each(function() {
			if($(this).find('input').is(':checked')) {
				$item = $(this).parent().parent().parent();

				if(!$item.hasClass('unread')) {
					changeMessagesCount(1);
					$item.addClass('unread');
				}

				$item.find('h4 span').css('display', 'inline-block'); // .show() sets the display property to "inline"; we need "inline-block".

				var id = $item.data('id');
				// Save unread-state.
			}
		});
		$messagesBtnCancelModification.text(t.messages.done);
	});

	$messagesBtnInverse.click(function() {
		if($messagesModifyCheckboxes.length == 0) {
			return;
		}
		
		$messagesModifyCheckboxes.each(function() {
			if($(this).find('input').is(':checked')) {
				$item = $(this).parent().parent().parent();
				var id = $item.find('a').data('id');

				if(id == undefined) return; 
				// Same as above.
				// In some case, the browser (tested with Chrome) add an unexisting message to the jQuery object.
				// The message isn't real if the id isn't gettable, so if his value is undefined.
				// Yes, this is a bancal fix. But I looking for a better solution to fix this issue.

				// alert('Messages visibles : ' + messagesVisibles + "\nMessages non lus : " + messagesCount + "\nLongeur de $messagesListItem : " + $messagesListItem.length + "\nId : " + id + "\nTitre : " + $item.find('h4').text() + "\nChecked : " + $(this).find('input').is(':checked'));
				

				if($item.hasClass('unread')) {
					changeMessagesCount(-1);
					$item.removeClass('unread');

					$item.find('h4 span').hide();

					// Save read-state.
				}
				else {
					changeMessagesCount(1);
					$item.addClass('unread');

					$item.find('h4 span').css('display', 'inline-block'); // .show() sets the display property to "inline"; we need "inline-block".

					// Save unread-state.
				}
			}
		});
		$messagesBtnCancelModification.text(t.messages.done);
	});

	// Navigation
	var putMessageOnTopOfList = function($message, underUnreadMessages) {
		if(underUnreadMessages == undefined) {
			underUnreadMessages = true;
		}
		
		$message.remove();
		
		var $messagesListItems = $messagesList.find('ul');
		
		if($message.hasClass('last')) {
			$message.removeClass('last');
			$messagesListItems.find('li:last').addClass('last');
		}
		
		if(!underUnreadMessages) {
			$messagesListItems.prepend($message);
		} else {
			$messagesListItems.find('li.unread:last').after($message);
		}
	};

	$messagesListItem.live('click', function() {
		if(messageLocation == 'modify') {
			// If we are in modification state, click in checkboxes must not show the thread...
			return;
		}

		var $this = $(this);
		
		messageLocation = 'thread';
		messageLocationId = $this.data('id');
		messageType = $this.data('type');
		$divSourceThread = $('#messageSourceThread' + messageLocationId);
		
		if($this.parent().hasClass('unread')) {
			$this.find('h4 .unread').hide();
			changeMessagesCount(-1);
			
			// Updating unread-state on server...
			/*
			$.ajax({
				url: '{% path('webnel.internalMail.ajax.setUnread') %}',
				data: {id: messageLocationId, user: userId, unread: false},
				error: function() {
					// Launch an alert about  (internet connexion failed?)
				}
			});
			*/
			
			putMessageOnTopOfList($this.parent());
		}
		
		$messagesThread.html($divThreadLoading.html());
		$messagesList.hide();
		$messagesThread.show();
		
		if($divSourceThread.html() == null) {
			updateThread();
			updateVisibleThread();
		}
		else {
			updateVisibleThread();
			updateThread();
		}
		
		
		if(messageType == 'global') {
			$messagesFormTextarea.attr('placeholder', t.messages.globalMessage);
		}
		else if(messageType == 'group') {
			$messagesFormTextarea.attr('placeholder', t.messages.groupeMessage);
		}
		else {
			$messagesFormTextarea.attr('placeholder', t.messages.privateMessage);
		}
		$messagesForm.show();
		$messagesBackButton.show();
		$messagesBtnModify.hide();
		$messagesThread.scrollTop(100000);
		
		$messages.find('h3 small').html(' » ' + $this.find('.name').html());
		$messagesObject.find('.object').html($this.find('h4').html());
		$messagesObject.show();
		
		if(messagesAnswersContents['message' + messageLocationId] != undefined) {
			$messagesFormTextarea.val(messagesAnswersContents['message' + messageLocationId]);
		}
	});
	
	$messagesBackButton.click(function() {
		$messagesThread.hide();
		$messagesNew.hide();
		$messages.find('h3 small').html('');
		$messagesObject.hide();
		$messagesBackButton.hide();
		$messagesBtnModify.show();
		$messagesForm.hide();
		$messagesList.show();
		
		messagesAnswersContents['message' + messageLocationId] = $messagesFormTextarea.val();
		$messagesFormTextarea.val('').css('height', messagesAnswerInitialHeight);
		
		messageLocation   = 'list';
		messageLocationId = null;
		$divSourceThread = null;
	});
	
	// Sending message
	var getBulletHTML = function(id, text, date, author) {
		var html;
		
		if(author == undefined) {
			html = '<div class="bulletRight" data-id="' + id + '">';
		}
		else {
			html = '<div class="bulletLeft" data-id="' + id + '">';
		}
		
		html += '<div class="contentBullet">' + text + '</div>';
		html += '<div class="clear"></div>';
		
		if(author == undefined) {
			html += '<time class="infosBullet">' + date + '</time>';
		}
		else {
			html += '<div class="infosBullet">' + t.messages.author.replace('%s', author) + '<time>' + date + '</time></div>';
		}
		html += '</div>';
		
		return html;
	};
	var formatAuthors = function(authors) {
		var authorsFormated = '';
		for(var i = 0; i < authors.length; i++) {
			if(authors[i] != null) {
				authorsFormated += authors[i];
				if(i+1 != authors.length) {
					authorsFormated += ', ';
				}
			}
		}
		return authorsFormated;
	};
	
	$messagesForm.find('input[type="submit"]').click(function() {
		if($messagesFormTextarea.val() != '') {
			if(messageLocation == 'new') {
				var message = $messagesFormTextarea.val().replace(/\n/g, '<br />');
				
				var To = [];
				$('#MessagesContentNew').find('input').each(function() {
					To[To.length] = $(this).val();
				});
				
				var authors = formatAuthors(To);
				
				if(authors == '' || message == '') {
					return false;
				}
				
				cutAndApplyTitle(authors);
				$MessagesDiv.html(getBulletHTML(message, t.messages.now + '&nbsp;<img src="images/loaderMessage.gif" alt="' + t.messages.sending + '" title="' + t.messages.sending + '" />'));
				
				$('#MessagesContentNew').hide();
				$('#MessagesBack').show(); 
				$('#MessagesContent').fadeIn('fast');
				
				MessageContext = 'message';
				MessageContextData = null;
				
				$AnswerText.val('').css('height', messagesAnswerInitialHeight);
				
				// Sending to server...
				// Response: Date & id
				// Request simulator
				setTimeout(function() {
					$MessagesDiv.children().last().find('.infosBullet').html('Le 22 mars à 18:31');
					var id = 76997; // Temp
					MessageContextData = id;
				}, 2000);
			}
			
			else if(messageLocation == 'thread') {
				var newMessageThreadId = $divSourceThread.children().last().data('id') + 1;
				
				var message = $messagesFormTextarea.val().replace('<', '&lt;').replace(/\n/g, '<br />');
				
				$divSourceThread.append(getBulletHTML(newMessageThreadId, message, t.messages.now + '&nbsp;<img src="img/loader_small.gif" alt="' + t.messages.sending + '" title="' + t.messages.sending + '" />'));
				
				
				$messagesFormTextarea.val('').css('height', messagesAnswerInitialHeight);
				
				updateVisibleThread();
				$messagesThread.scrollTop(100000000);
				
				// Sending to server...
				// Response: Date
				
				setTimeout(function() {
					$divSourceThread.find('[data-id="' + newMessageThreadId + '"]').find('.infosBullet').html('Le 22 mars à 18:31');
					updateVisibleThread();
				}, 2000);
			}
		}
		return false;
	});

	// New message
	$messagesBtnNew.click(function() {
		if(messageLocation != 'new') {
			$messagesList.hide();
			$messagesThread.hide();
			$messagesBtnModify.hide();
			$messagesBackButton.show();

			$messagesNew.show();
			$messagesFormTextarea.attr('placeholder', t.messages.globalMessage).focus();
			$messagesForm.show();
			$messages.find('h3 small').html(' » ' + t.messages.newMessage);

			messageLocation = 'new';
		}

	});

	var removeNextBackspace     = false,
		usedFields              = {},
		currentFieldInternalId  = 1,
		newId                   = null,
		numberOfRecipients      = 0;

	$messagesNewInputTo.live('focus', function() {
		currentFieldInternalId = $(this).data('id');
	});
	$messagesNewInputTo.live('keyup', function(h) {
		currentFieldInternalId = $(this).data('id');

		// Externed because we need to execute this two times: one before and one after the deletion/add of a field.
		var executedOnChangeWithNonEmptyField = function() {
			usedFields[currentFieldInternalId] = true;
			numberOfRecipients = objectLength(usedFields, true);
			
			//console.log('*Full*\nNumber of recipients: ' + numberOfRecipients + '\nCurrent field internal id: ' + currentFieldInternalId);
			//console.log(usedFields);

			if(numberOfRecipients > 1) {
				$messagesFormTextarea.attr('placeholder', t.messages.groupeMessage);
			}
			else {
				$messagesFormTextarea.attr('placeholder', t.messages.privateMessage);
			}
		}

		if($(this).val() != '') {
			executedOnChangeWithNonEmptyField();
		}

		if(h.keyCode == 13) { // 13 = "Enter"
			if($(this).next().is(':last-child')) { // .next() because there is a <br /> after.
				newId = $(this).data('id') + 1;
				$(this).clone().appendTo($messagesNewInputsTo)          // We add a new field for a new contact
			           .val('')                                         // Else, the default value of the field is the
			           													// value of the previous field.
			           .data('id', newId);

			    $messagesNewInputsTo.append('<br />');

			    $messagesNewInputTo = $('.messages-new-input-to');      // We need to refresh the jQuery object 
																	    // because the DOM has changed.
				usedFields[newId] = false;
				currentFieldInternalId = newId;
			}
			$(this).next().next().focus();                              // We focus the new field
																		// Why two .next()? Don't forget the <br />... ;)
		}
		else if(h.keyCode == 8) { // 8 = backspace
			console.log('Backspace');
			if($(this).val() == '' && $messagesNewInputTo.length > 1) {
				// We need to remove the field on the second "backspace" on an empty field.
				// The first empty the field, and the second is tiped on a nempty field.
				// But if the field hasn't been used, we remove it immediately.
				if(removeNextBackspace || !usedFields[currentFieldInternalId]) {    
					// If the user tip "backspace" on an empty field, we remove it and we focus the previous field.
					$(this).next().remove(); // Removes the <br />
					$(this).remove();
					$messagesNewInputTo = $('.messages-new-input-to');
					$messagesNewInputTo.last().focus();

					removeNextBackspace = false;
				}
				else {
					removeNextBackspace = true;
				}
			}
			
			if(removeNextBackspace) { // In all cases, including the last field.
				usedFields[currentFieldInternalId] = false;
				console.log('Removed for last field');
			}
		}
		
		if($(this).val() != '') {
			executedOnChangeWithNonEmptyField();
		}
		if($(this).val() == '') {
			usedFields[currentFieldInternalId] = false;
			numberOfRecipients = objectLength(usedFields, true);

			//console.log('*Empty*\nNumber of recipients: ' + numberOfRecipients + '\nCurrent field internal id: ' + currentFieldInternalId);

			if(numberOfRecipients >= 2) {
				$messagesFormTextarea.attr('placeholder', t.messages.groupeMessage);
			}
			else if(numberOfRecipients == 1) {
				$messagesFormTextarea.attr('placeholder', t.messages.privateMessage);
			}
			else {
				$messagesFormTextarea.attr('placeholder', t.messages.globalMessage);
			}
		}
	});
	
	// Updating thread
	$messagesUpdateThread.click(function() {
		var $this = $(this),
		    $messagesUpdateThreadLoader = $('#messagesUpdateThreadLoader');
		
		$this.hide();
		$messagesUpdateThreadLoader.show();
		
		// Updating...
		// Simulator below
		setTimeout(function() {
			$messagesUpdateThreadLoader.hide();
			$this.show();
		}, 2000);
	});
	



	/** Notifications **/
	var $notifications             = $('#notifications'),
		$menuLeftItemNotifications = $('#menuLeftItemNotifications'),
		$notificationsMarkAsRead   = $('.notification-mark-as-read'),
		$notificationsIgnore       = $('.notification-ignore'),
		$notificationsNothing      = $('#notificationsNothing'),
		
		notificationsVisibles      = $notifications.find('.modal-header').length - 1; // -1 because we need to remove the (real) header.

	// Modal
	$notifications.modal({
		show: false
	});
	$('.show-notifications').click(function() {
		$menuLeftItemNotifications.addClass('active');
		$notifications.modal('toggle');
	});
	$notifications.on('hide', function() {
		$menuLeftItemNotifications.removeClass('active');
	});

	// Mark as read
	$notificationsMarkAsRead.click(function() {
		var $item = $(this).parent().parent().parent();

		if($item.hasClass('unread')) {
			$item.find('h4 a span').hide();
			changeNotificationsCount(-1);

			$item.find('.button-notification-mark-as-read').text(t.notifications.markAsUnread);

			$item.removeClass('unread');

			// Save the readed-state
		}
		else if (!$item.hasClass('unread') && !$(this).hasClass('notification-action')) {
			$item.find('h4 a span').css('display', 'inline-block');
			changeNotificationsCount(1);

			$item.find('.button-notification-mark-as-read').text(t.notifications.markAsRead);

			$item.addClass('unread');

			// Save the unread-state
		}
	});

	// Ignore
	$notificationsIgnore.click(function() {
		var $item = $(this).parent().parent().parent().parent().parent();

		if($item.hasClass('unread')) {
			changeNotificationsCount(-1);
		}

		notificationsVisibles--;

		if(notificationsVisibles == 0) {
			$notificationsNothing.slideDown();
		}

		if($item.hasClass('last') && notificationsVisibles != 0) {
			$item.siblings().filter('.modal-header:visible:last').addClass('last');
		}

		$item.slideUp('normal', function() {
			$item.remove();
		});

		// Delete the notification on server...
	});



	/** Background tasks **/
	var $showBackgroundTasks         = $('.show-background-tasks'),
		$backgroundTasks             = $('#backgroundTasks'),
		$backgroundTasksItems        = $backgroundTasks.find('.backgroundTask'),
		$backgroundTasksNothing      = $('#backgroundTasksNothing'),
		$menuLeftItemBackgroundTasks = $('#background-tasks-link');

	// Modal
	$backgroundTasks.modal({
		show: false
	});
	$showBackgroundTasks.click(function() {
		$menuLeftItemBackgroundTasks.addClass('active');
		$backgroundTasks.modal('toggle');
	});
	$backgroundTasks.on('hide', function() {
		$menuLeftItemBackgroundTasks.removeClass('active');
	});

	// Utilities
	/**
	 * Updates a background task.
	 * @param update object The data to update. Format:
	 * {
	 *     id: 'The id of the Bg task (int)',
	 *     title: 'The title of the task',
	 *     now: 'The description what we do actually',
	 *     percent: 'The progress in percents (int; between 0 & 100) (id 100, the task is removed)'
	 * }
	 */
	var updateBackgroundTask = function(update) {
		if(update.id === undefined) return;

		var $updatedTask = $backgroundTasksItems.filter('[data-id="' + update. id + '"]');
		console.log($updatedTask);
		console.log(update.id)
		if(update.title !== undefined) {
			$updatedTask.find('h4 a').text(update.title);
		}
		if(update.now !== undefined) {
			$updatedTask.find('.preview').text(update.now);
		}
		if(update.percent !== undefined) {
			$updatedTask.find('.progress-background-tasks').css('width', update.percent + '%');
			$updatedTask.find('.progress-text-background-tasks').text(update.percent);
			if(update.percent == 100) {
				changeBackgroundTasksCount(-1);
				setTimeout(function() {
					$updatedTask.slideUp('normal', function() {
						$updatedTask.remove();

						// Since the DOM has changed, we need to update this.
						$backgroundTasksItems = $backgroundTasks.find('.backgroundTask');
					});

					if($backgroundTasksItems.length < 2) {
						$backgroundTasksNothing.slideDown();
					}
				}, 2000);
			}
		}
	};



	// Simulator for tests.
	setTimeout(function() {
		updateBackgroundTask({
			id: 1, 
			now: "Téléchargement de « Messages »...",
			percent: 70
		});
	}, 2000);
	setTimeout(function() {
		updateBackgroundTask({
			id: 1, 
			now: "Téléchargement de « Articles »...",
			percent: 80
		});
	}, 2500);
	setTimeout(function() {
		updateBackgroundTask({
			id: 1, 
			now: "Les mises à jour sont prêtes à être installées.",
			percent: 100
		});
	}, 4500);
	setTimeout(function() {
		updateBackgroundTask({
			id: 2, 
			percent: 40
		});
	}, 2000);
	setTimeout(function() {
		updateBackgroundTask({
			id: 2, 
			percent: 60
		});
	}, 3000);
	setTimeout(function() {
		updateBackgroundTask({
			id: 2, 
			percent: 80
		});
	}, 4000);
	setTimeout(function() {
		updateBackgroundTask({
			id: 2, 
			now: 'Reconstruction de l\'index terminée.',
			percent: 100
		});
	}, 6000);

	/** Favorites **/
	var $favoritesEdit           = $('.favorite-edit'),
	    $favoritesNew            = $('#favorite-new'),
	    $favoritesEditButton     = $('#editFavorites'),
		$favoritesEditButtonOnly = $('#editFavorites a:first'),
		$favoritesSaveButton     = $('#saveFavorites'),
		$favoritesIcon           = $('.favorites-icon'),
		$favoritesMoveIcon       = $('.favorites-move-icon');
		
	$favoritesMoveIcon.hide();
	$favoritesSaveButton.hide();
	
	$favoritesEditButton.click(function() {
		$favoritesEdit.toggle();
		$favoritesSaveButton.toggle();
		$favoritesEditButtonOnly.toggle();
		$favoritesNew.slideToggle();
		$favoritesIcon.toggle();
		$favoritesMoveIcon.toggle();
	});
});


/* 
 * TO DO
 * Corriger le bug d'activation/désactivation des boutons de modification. (Non reprodui pour le moment)
 * BUG : Messages > Modifier > Annuler > Premier message : le compteur passe de 3 à 1 directement.
 */