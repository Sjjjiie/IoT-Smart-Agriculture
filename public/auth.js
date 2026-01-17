import { auth } from "./config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ===== TAB CONTROL ===== */
window.showLogin = function () {
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("signupBox").style.display = "none";
  document.getElementById("verifyBox").style.display = "none";
};

window.showSignup = function () {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
  document.getElementById("verifyBox").style.display = "none";
};

/* ===== LOGIN ===== */
window.login = function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");

  msg.innerText = "";

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      if (!cred.user.emailVerified) {
        msg.innerText = "Please verify your email first.";
        signOut(auth);
        return;
      }
      window.location.href = "index.html";
    })
    .catch(() => {
      msg.innerText = "Invalid email or password.";
    });
};

/* ===== SIGN UP ===== */
window.signup = function () {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const msg = document.getElementById("signupMsg");

  msg.innerText = "";

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      sendEmailVerification(cred.user).then(() => {
        document.getElementById("signupBox").style.display = "none";
        document.getElementById("verifyBox").style.display = "block";
      });
    })
    .catch(() => {
      msg.innerText = "Signup failed.";
    });
};

window.resendEmail = function () {
  if (auth.currentUser) {
    sendEmailVerification(auth.currentUser);
  }
};

window.acceptVerification = function () {
  auth.currentUser.reload().then(() => {
    if (auth.currentUser.emailVerified) {
      window.location.href = "index.html";
    }
  });
};
