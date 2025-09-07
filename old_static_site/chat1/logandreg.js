const switchbutton = document.getElementById("switch")
const login = document.getElementById("login")
const register = document.getElementById("register")
const allowed_user = "abcdefghijklmnopqrstuvwxyzěščřžýáíéóůúťďň-_/*-+0123456789.,!?"
const allowed_name = "abcdefghijklmnopqrstuvwxyzěščřžýáíéóůúťďň"

window.setTimeout(console.log(document.querySelectorAll("div")), 10000)//.style.display = "none"


switchbutton.onclick = () => {
	if (register.style.visibility != "visible") {
		register.style.visibility = "visible"
		login.style.visibility = "hidden"
		switchbutton.innerHTML = "Have have an account already?"
	}
	else {
		register.style.visibility = "hidden"
		login.style.visibility = "visible"
		switchbutton.innerHTML = "Don't have an account yet?"
	}
}

const sendHttpRequest = (method, url, data) => {
  const promise = new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.responseType = 'json';
	
    if (data) {
		xhr.setRequestHeader('Content-Type', 'application/json');
    }

    xhr.onload = () => {
		if (xhr.status >= 400) {
			reject(xhr.response);
		} else {
			resolve(xhr.response);
		}
    };

    xhr.onerror = () => {
		reject('Something went wrong!');
    };

    xhr.send(JSON.stringify(data));
  });
  return promise;
};

const loginbutton = document.getElementById("loginbutton")
const logname = document.getElementById("loginusername")
const logpass = document.getElementById("loginpassword")
const loginproblem = document.getElementById("loginproblem")

loginbutton.onclick = () => {
	var username = logname.value
	var pass = logpass.value
	var done = false
	var failed = 0;
	const send = () => {
		loginproblem.style.width = "50%"
		sendHttpRequest('POST', 'http://lovec741.pythonanywhere.com/authlog', {
			name: username,
			password: pass
		})
			.then(responseData => {
				if (responseData["done"] != false) {
					window.location = "/chat1";
					document.cookie = "name=" + username + ";path=/";
					document.cookie = "access-key=" + responseData["done"] + ";path=/";
				}
				else {
					loginproblem.innerHTML = "Username doesn't exist or password is incorrect."
					loginproblem.style.width = "50.1%"
				}
			})
			.catch(err => {
				failed += 1
				if (failed != 10) {
					send()
				}
				else {
					loginproblem.innerHTML = "Unable to reach server."
					loginproblem.style.width = "50.1%"
				}
				console.log(err);
			});
	}
	send()
};
	

const registerbutton = document.getElementById("registerbutton")
const regname = document.getElementById("regname")
const regsurname = document.getElementById("regsurname")
const regusername = document.getElementById("regusername")
const regpassword = document.getElementById("regpassword")
const regpassword2 = document.getElementById("regpassword2")
const regproblem = document.getElementById("regproblem")

function valid_name(name, type="") {
	if (type == "name") {var allowed = allowed_name}
	else {var allowed = allowed_user}
	for (var i = 0; i < name.length; i++) {
		if (allowed.indexOf(name[i].toLowerCase()) == -1) {
			console.log(name[i])
			return false
		}
	}
	return true
}
registerbutton.onclick = () => {
	console.log("1234")
	regproblem.innerHTML = ""
	if (!valid_name(regusername.value)) {
		regproblem.innerHTML = "Invalid username, use of forbidden characters."
	}
	else if (!valid_name(regname.value, "name")) {
		regproblem.innerHTML = "Invalid name, use of forbidden characters."
	}
	else if (!valid_name(regsurname.value, "name")) {
		regproblem.innerHTML = "Invalid surname, use of forbidden characters."
	}
	else if (regusername.value.length < 6) {
		regproblem.innerHTML = "Invalid username, too short, min. 6 characters."
	}
	else if (regname.value.length < 2) {
		regproblem.innerHTML = "Invalid name, too short, min. 2 characters."
	}
	else if (regsurname.value.length < 2) {
		regproblem.innerHTML = "Invalid surname, too short, min. 2 characters."
	}
	else if (regusername.value.length >= 15) {
		regproblem.innerHTML = "Invalid username, too long, max. 15 characters."
	}
	else if (regname.value.length >= 15) {
		regproblem.innerHTML = "Invalid name, too long, max. 15 characters."
	}
	else if (regsurname.value.length >= 15) {
		regproblem.innerHTML = "Invalid surname, too long, max. 15 characters."
	}
	else if (regpassword.value != regpassword2.value) {
		regproblem.innerHTML = "Passwords not matching."
	}
	else if (regpassword.value.length < 6) {
		regproblem.innerHTML = "Invalid password, too short, min. 6 characters."
	}
	else if (regpassword.value.length >= 30) {
		console.log(regpassword.value.length)
		regproblem.innerHTML = "Invalid password, too long, max. 30 characters."
	}
	else if (!valid_name(regpassword.value)) {
		regproblem.innerHTML = "Invalid password, use of forbidden characters."
	}
	else {
		var done = false
		var failed = 0;
		const send = () => {
			console.log("123")
			sendHttpRequest('POST', 'http://lovec741.pythonanywhere.com/authreg', {
				username: regusername.value,
				name: regname.value.charAt(0).toUpperCase() + regname.value.slice(1),
				surname: regsurname.value.charAt(0).toUpperCase() + regsurname.value.slice(1),
				password: regpassword.value
			})
				.then(responseData => {
					done = true
					if (responseData["done"] != false) {
						window.location = "/chat1";
						document.cookie = "name=" + regusername.value + ";path=/";
						document.cookie = "access-key=" + responseData["done"] + ";path=/";
					}
					else {
						regproblem.innerHTML = "Username already taken."
					}
				})
				.catch(err => {
				  failed += 1
				if (failed != 10) {
					send()
				}
				else {
					regproblem.innerHTML = "Unable to reach server."
				}
				console.log(err);
				});
		}
		send()
	}
};