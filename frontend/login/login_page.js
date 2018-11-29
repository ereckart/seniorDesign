
function send_login() {
  login_error('');
  data = {
    phone: document.getElementById('login_phone').value,
    password: document.getElementById('login_password').value
  }
  $.post('https://api.waitrtech.com/login', data, function(reply, status) {
    if (reply.error == 'error_phone') {
      login_error('Phone is not registered to an account');
    } else if (reply.error == 'error_password') {
      login_error('Password is incorrect');
    } else if (reply.error != null) {
      login_error('Error: system error');
    } else {
		    var date = new Date();
		    date.setTime(date.getTime()+(365*24*60*60*1000));
		    var expires = "; expires="+date.toGMTString();
        document.cookie = "token="+reply.pat+ "; " + expires +";path=/";
        window.location.href = '/analytics';
    }
  })
}

function login_error(msg) {
  document.getElementById('error_message').innerHTML = msg;
}
