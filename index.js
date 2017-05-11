'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()


const token=process.env.FB_VERIFY_TOKEN
const access=process.env.FB_ACCESS_TOKEN



app.set('port', (process.env.PORT|| 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.get('/',function (req,res) {
  res.send('hello youtube')
})



// for Facebook verification
app.get('/webhook/', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === token) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/webhook/', function (req, res) {

  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    getStarted()
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {


           receivedMessage(event);


				}else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// First Time User
getStarted()
function getStarted() {

	request.post({
		method: 'POST',
		uri: 'https://graph.facebook.com/v2.8/me/thread_settings?access_token=' + token,
		qs: {
			setting_type: 'call_to_actions',
			thread_state: 'new_thread',
			call_to_actions: [{
                payload: 'GET_STARTED'
            }]
        },
		json: true
	}, (err, res, body) => {
		console.log(err)
	});
}





function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'explore':
        sendexploreMessage(senderID);
        break;
      case 'generic':
        sendGenericMessage(senderID);
        break;
      case 'button':
        sendButtonMessage(senderID);
        break;
      case 'typing on':
        sendTypingOn(senderID);
        break;
      case 'image':
        sendImageMessage(senderID)
        break;
      case 'gif':
        sendGifMessage(senderID);
        break;

      case 'audio':
        sendAudioMessage(senderID);
        break;

      case 'video':
        sendVideoMessage(senderID);
        break;

      case 'file':
        sendFileMessage(senderID);
        break;

      case 'read receipt':
        sendReadReceipt(senderID);
        break;

      case 'typing off':
        sendTypingOff(senderID);
        break;

      case 'quick reply':
        sendQuickReply(senderID);
        break;

      default:
      sendTextMessage(senderID,messageText);

    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendexploreMessage(recipientId) {
	var messageData={
    recipient:{
      id:recipientId
    },
    message:{
      text:"Try to type\r\naudio\r\nvideo\r\nimage\r\ngif\r\nquick reply\r\ntyping on\r\ntyping off\r\nread receipt\r\nfile\r\ngeneric\r\nbutton\r\n"
    }
  }

	callSendAPI(messageData);
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "Hello Welcome to this Bot,Please type [explore] to know more",
      metadata:"DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}



function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */

 function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  console.log("Received message read event for watermark %d and sequence " +
    "number %d", watermark, sequenceNumber);
}

function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  console.log("Received account link event with for user %d with status %s " +
    "and auth code %s ", senderID, status, authCode);
}

function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "https://github.com/KrishnaChittodia21/Facebook-chatbot-myfeatures/blob/master/assets/gitg.png?raw=true"
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "https://github.com/KrishnaChittodia21/Facebook-chatbot-myfeatures/blob/master/assets/thats.gif?raw=true"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: "https://github.com/KrishnaChittodia21/Facebook-chatbot-myfeatures/blob/master/assets/sample.mp3?raw=true"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: "https://github.com/KrishnaChittodia21/Facebook-chatbot-myfeatures/blob/master/assets/allofus480.mov?raw=true"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: "https://github.com/KrishnaChittodia21/Facebook-chatbot-myfeatures/blob/master/assets/test.txt?raw=true"
        }
      }
    }
  };

  callSendAPI(messageData);
}


function sendGenericMessage(recipientId, messageText) {
  var messageData = {
   recipient: {
     id: recipientId
   },
   message: {
     attachment: {
       type: "template",
       payload: {
         template_type: "generic",
         elements: [{
           title: "rift",
           subtitle: "Next-generation virtual reality",
           item_url: "https://www.oculus.com/en-us/rift/",
           image_url: "http://messengerdemo.parseapp.com/img/rift.png",
           buttons: [{
             type: "web_url",
             url: "https://www.oculus.com/en-us/rift/",
             title: "Open Web URL"
           }, {
             type: "postback",
             title: "Call Postback",
             payload: "Payload for first bubble",
           }],
         }, {
           title: "touch",
           subtitle: "Your Hands, Now in VR",
           item_url: "https://www.oculus.com/en-us/touch/",
           image_url: "http://messengerdemo.parseapp.com/img/touch.png",
           buttons: [{
             type: "web_url",
             url: "https://www.oculus.com/en-us/touch/",
             title: "Open Web URL"
           }, {
             type: "postback",
             title: "Call Postback",
             payload: "Payload for second bubble",
           }]
         }]
       }
     }
   }
 };

 callSendAPI(messageData);
}


function sendButtonMessage(recipientId) {
   var messageData = {
     recipient: {
       id: recipientId
     },
     message: {
       attachment: {
         type: "template",
         payload: {
           template_type: "button",
           text: "This is test text",
           buttons:[{
             type: "web_url",
             url: "https://www.oculus.com/en-us/rift/",
             title: "Open Web URL"
           }, {
             type: "postback",
             title: "Trigger Postback",
             payload: "DEVELOPER_DEFINED_PAYLOAD"
           }, {
             type: "phone_number",
             title: "Call Phone Number",
             payload: "+16505551234"
           }]
         }
       }
     }
   };

   callSendAPI(messageData);
 }





 function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };

  callSendAPI(messageData);
}

function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}





function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}


function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: access },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

app.listen(app.get('port'),function(){
  console.log('running on port',app.get('port'))
})
