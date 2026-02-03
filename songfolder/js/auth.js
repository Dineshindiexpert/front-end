// js/auth.js
import { auth, db } from "./firebase.js";  // <-- connect Firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ----- SIGNUP ----- */
window.signupUser = async () => {
  const first = document.getElementById("signupFirst").value.trim();
  const last = document.getElementById("signupLast").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;
  const errorDiv = document.getElementById("signupError");
  errorDiv.innerText = "";

  if (!first || !last || !email || !pass || !confirm) {
    errorDiv.innerText = "All fields required!";
    return;
  }
  if (pass.length < 6) {
    errorDiv.innerText = "Password must be at least 6 characters!";
    return;
  }
  if (pass !== confirm) {
    errorDiv.innerText = "Passwords do not match!";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Set display name
    await updateProfile(user, { displayName: `${first} ${last}` });

    // Save extra data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      firstName: first,
      lastName: last,
      email: email,
      createdAt: new Date()
    });

    // Send email verification
    await sendEmailVerification(user);

    alert(`Hi ${first}, verify your email to activate your account.`);
    document.getElementById("signupForm").reset();
    showLogin();

  } catch (err) {
    errorDiv.innerText = err.message;
  }
};

/* ----- LOGIN ----- */
window.loginUser = async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value;
  const errorDiv = document.getElementById("loginError");
  errorDiv.innerText = "";

  if (!email || !pass) {
    errorDiv.innerText = "All fields required!";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    if (!user.emailVerified) {
      errorDiv.innerText = "Verify your email first!";
      return;
    }

    window.location.href = "profile.html"; // Protected page

  } catch (err) {
    errorDiv.innerText = err.message;
  }
};

/* ----- TAB SWITCH ----- */
window.showLogin = () => {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("signupForm").classList.remove("active");
  document.querySelectorAll(".tabs button")[0].classList.add("active");
  document.querySelectorAll(".tabs button")[1].classList.remove("active");
};

window.showSignup = () => {
  document.getElementById("signupForm").classList.add("active");
  document.getElementById("loginForm").classList.remove("active");
  document.querySelectorAll(".tabs button")[1].classList.add("active");
  document.querySelectorAll(".tabs button")[0].classList.remove("active");
};

/* ----- PASSWORD TOGGLE ----- */
window.togglePassword = (id) => {
  const input = document.getElementById(id);
  if (input.type === "password") input.type = "text";
  else input.type = "password";
};

/* ----- PAGE PROTECTION ----- */
onAuthStateChanged(auth, user => {
  if (user && location.pathname.includes("profile.html")) {
    if (!user.emailVerified) {
      alert("Please verify your email first!");
      auth.signOut();
      location.href = "index.html";
    }
  }
});
