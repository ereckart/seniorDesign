function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function send_verification() {
  verification_error('');
  var sms_key = document.getElementById('verification_code').value;
  var private_key = getCookie('private_key');
  console.log(private_key);
  console.log(sms_key);
  $.ajax({
    url: 'https://api.waitrtech.com/login/register',
    type: 'PUT',
    data: "sms_key="+sms_key+"&private_key="+private_key,
    success: function(data) {
      if (data.error == 'error_code') {
        verification_error('Invalid SMS verification code');
      } else if (data.error != null) {
        verification_error('Error with verification');
      } else {
  		  var date = new Date();
  		  date.setTime(date.getTime()+(365*24*60*60*1000));
  		  var expires = "; expires="+date.toGMTString();
        document.cookie = "token="+data.token+ "; " + expires +";path=/";
        window.location.href = '/analytics';
      }
    }
  });
}

function verification_error(msg) {
  document.getElementById('error_message').innerHTML = msg;
}
