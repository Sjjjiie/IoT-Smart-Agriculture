import { auth } from "./config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ===== TAB CONTROL ===== */
window.showLogin = function () {
  document.getElementById("loginBox").style.display = "block";
  document.getElementById("signupBox").style.display = "none";
  document.getElementById("verifyBox").style.display = "none";
  document.getElementById("loginTab").classList.add("active");
  document.getElementById("signupTab").classList.remove("active");
};

window.showSignup = function () {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
  document.getElementById("verifyBox").style.display = "none";
  document.getElementById("signupTab").classList.add("active");
  document.getElementById("loginTab").classList.remove("active");
};

/* ===== INPUT VALIDATION ===== */
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ===== SIGN UP ===== */
window.signup = function () {
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const msg = document.getElementById("signupMsg");

  // Clear previous message
  msg.innerText = "";

  // Check if fields are empty
  if (!email || !password) {
    msg.innerText = "Please fill in both email and password.";
    return;
  }

  // Validate email format
  if (!validEmail(email)) {
    msg.innerText = "Please enter a valid email address.";
    return;
  }

  // Validate password length
  if (password.length < 8) {
    msg.innerText = "Password must be at least 8 characters.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      sendEmailVerification(cred.user)
        .then(() => {
          document.getElementById("signupBox").style.display = "none";
          document.getElementById("verifyBox").style.display = "block";

          document.getElementById("verifyBox").querySelector(".info").innerHTML =
            `An email verification link has been sent to <b>${cred.user.email}</b>.<br>
             Please verify your email before logging in.`;
        });
    })
    .catch((err) => {
      // Handle specific Firebase signup errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          msg.innerText = "This email is already registered.";
          break;
        case 'auth/invalid-email':
          msg.innerText = "The email address format is incorrect.";
          break;
        case 'auth/weak-password':
          msg.innerText = "The password is too weak.";
          break;
        case 'auth/network-request-failed':
          msg.innerText = "Network error. Please check your connection.";
          break;
        default:
          msg.innerText = "Signup failed. Please try again.";
          break;
      }
      console.error("Signup Error Code:", err.code);
    });
};

/* ===== RESEND VERIFICATION ===== */
window.resendEmail = function () {
  const user = auth.currentUser;
  if (user) {
    sendEmailVerification(user)
      .then(() => {
        document.getElementById("verifyMsg").innerText =
          "Verification email resent.";
      });
  }
};

/* ===== ACCEPT VERIFICATION ===== */
window.acceptVerification = function () {
  auth.currentUser.reload().then(() => {
    if (auth.currentUser.emailVerified) {
      window.location.href = "index.html";
    } else {
      document.getElementById("verifyMsg").innerText =
        "Email not verified yet.";
    }
  });
};

/* ===== LOGIN ===== */
window.login = function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");

  // Clear previous messages
  msg.innerText = "";

  // Basic validation before calling Firebase
  if (!email || !password) {
    msg.innerText = "Please enter both email and password.";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      if (!cred.user.emailVerified) {
        msg.innerText = "Please verify your email first.";
        signOut(auth);
        return;
      }
      window.location.href = "index.html";
    })
    .catch((err) => {
      // Handle specific error codes for a better user experience
      switch (err.code) {
        case 'auth/invalid-email':
          msg.innerText = "The email address is not valid.";
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          msg.innerText = "Incorrect email or password.";
          break;
        case 'auth/too-many-requests':
          msg.innerText = "Too many failed attempts. Please try again later.";
          break;
        default:
          msg.innerText = "Login failed. Please try again.";
          break;
      }
      console.error(err.code); 
    });
};

/* ===== LOGOUT (USED IN index.html) ===== */
window.logout = function () {
  document.getElementById("logoutModal").style.display = "flex";
};

window.confirmLogout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

window.cancelLogout = function () {
  document.getElementById("logoutModal").style.display = "none";
};
