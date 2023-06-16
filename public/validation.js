

//signup 




const password = document.getElementById("pass1");
const nameInput = document.getElementById("name");
const password2 = document.getElementById('pass2')
const email = document.getElementById("email")
const mobile = document.getElementById("mobile")
const errorMessage = document.querySelector('#errorMessage')
const errorMessage1 = document.querySelector('#errorMessage1')
const errorMessage2 = document.querySelector('#errorMessage2')
const errorMessage3 = document.querySelector('#errorMessage3')
const errorMessage4 = document.querySelector('#errorMessage4')
const errorMessage5 = document.querySelector('#errorMessage5')
let form = document.querySelector('form')
let testElement = document.querySelector(".testElement")

// Regular expression for basic email validation
let regexName = /^[a-zA-Z\s]+$/;
// let regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
let regexPassword = /^[a-zA-Z\s]+$/

let regex = /^\S+@\S+\.\S+$/; //email--

const nameFunction = () => {
  if (nameInput.value.length < 6) {
    errorMessage5.textContent = 'Atleast six Letter'
    return false
  } else if (!regexName.test(nameInput.value)) {
    errorMessage5.textContent = 'Please enter a valid name'
    return false
  } else {
    errorMessage5.textContent = ''
    return true

  }
}

const passwordFunction = () => {
  if (password.value == "") {
    errorMessage1.textContent = "please enter your password"
    return false
  } else if (!regexPassword.test(password.value)) {
    errorMessage1.textContent = "Password not strong"
    return false
  } else if (password.value != password2.value) {
    errorMessage1.textContent = "Password did not match"
    return false
  } else {
    errorMessage1.textContent = ''
    return true
  }
}

const password2Fuction = () => {
  if (password.value == "") {
    errorMessage2.textContent = "please enter your password"
    return false
  } else if (!regexPassword.test(password2.value)) {
    errorMessage2.textContent = "Password not strong"
    return false
  } else if (password.value != password2.value) {
    errorMessage2.textContent = "Password did not match"
    return false
  } else {
    errorMessage2.textContent = ''
    return true
  }
}

const emailFunction = () => {
  if (email.value == "") {
    errorMessage4.textContent = "Please enter your email address"
    return false
  } else {
    if (regex.test(email.value) === false) {
      errorMessage4.textContent = "Please enter a valid email address"
      return false
    } else {
      errorMessage4.textContent = ""
      return true
    }
  }
}

const phoneFunction = () => {
  if (mobile.value == "") {
    errorMessage3.textContent = "Please enter your mobile number"
    return false
  } else {
    var regex = /^[1-9]\d{9}$/;
    if (regex.test(mobile.value) === false) {
      errorMessage3.textContent = "Please enter a valid 10 digit mobile number"
      return false
    } else {
      errorMessage3.textContent = ""
      return true
    }
  }
}

const formFunction = [nameFunction, passwordFunction, password2Fuction, emailFunction, phoneFunction]
let formIsValid = false
console.log(formIsValid, "false ano103");

nameInput.addEventListener('input', nameFunction)
password.addEventListener('input', passwordFunction)
password2.addEventListener('input', password2Fuction)
email.addEventListener('input', emailFunction)
mobile.addEventListener('input', phoneFunction)

form.addEventListener('submit', (e) => {
  e.preventDefault()

  if (formFunction.every(fn => fn())) {
    formIsValid = true
  }
  if (formIsValid) {
    form.submit()
  } else {
    errorMessage.textContent = 'Please enter valid details'
  }
})
// if (password == "") {
//   printError("passErr", "please enter your password");
// } else {
//   printError("passErr", "");
// }

// if (email == "") {
//   printError("emailErr", "Please enter your email address");
// } else {
//   // Regular expression for basic email validation
//   var regex = /^\S+@\S+\.\S+$/;
//   if (regex.test(email) === false) {
//     printError("emailErr", "Please enter a valid email address");
//   } else {
//     printError("emailErr", "");
//   }
// }
// if (mobile == "") {
//   printError("mobileErr", "Please enter your mobile number");
// } else {
//   var regex = /^[1-9]\d{9}$/;
//   if (regex.test(mobile) === false) {
//     printError("mobileErr", "Please enter a valid 10 digit mobile number");
//   } else {
//     printError("mobileErr", "");
//   }
// }



//login

function loginValidate() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  if (email == "") {
    printError("lEmailErr", "Please enter your email address");
  } else {
    // Regular expression for basic email validation
    var regex = /^\S+@\S+\.\S+$/;
    if (regex.test(email) === false) {
      printError("lEmailErr", "Please enter a valid email address");
    } else {
      printError("lEmailErr", "");
    }
  }

  if (password == "") {
    printError("lPassErr", "please enter your password");
  } else {
    printError("lPassErr", "");
  }
}

