function send_registration() {
  registration_error('');
  data = {
    first: document.getElementById('registration_first').value,
    last: document.getElementById('registration_last').value,
    phone: document.getElementById('registration_phone').value,
    password: document.getElementById('registration_password').value
  }
  $.post('https://api.waitrtech.com/login/register', data, function(reply, status) {
    if (reply.error == 'error_phone_registered') {
      registration_error('Phone is already registered to an account');
    } else if (reply.error == 'error_first') {
      registration_error('First name cannot be blank');
    } else if (reply.error == 'error_last') {
      registration_error('Last name cannot be blank');
    } else if (reply.error == 'error_phone') {
      registration_error('Phone number is invalid');
    } else if (reply.error == 'error_password') {
      registration_error('Password must be at least 8 characters');
    } else if (reply.error != null) {
      registration_error('Error: system error');
    } else {
        console.log(reply);
		    var date = new Date();
		    date.setTime(date.getTime()+(1*24*60*60*1000));
		    var expires = "; expires="+date.toGMTString();
        document.cookie = "private_key="+reply.private_key+ "; " + expires +";path=/";
        window.location.href = '/verify';
    }
  })
}

function registration_error(msg) {
  document.getElementById('error_message').innerHTML = msg;
}
