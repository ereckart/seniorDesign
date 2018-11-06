var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var api_key = '0cmBP4SEQHe_MfEeW1fWhQ==';

function send_sms(phone, msg) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https:/\/platform.clickatell.com/messages/http/send?apiKey="+api_key+"&to=1"+phone+"&content="+msg, true);
	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4 && xhr.status == 200) {
		        //console.log('success');
	  }
	};
	xhr.send();
}

exports.send = send_sms;
