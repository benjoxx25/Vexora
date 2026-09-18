const authOverlay = document.getElementById("authOverlay");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const closeAuth = document.getElementById("closeAuth");
const loginButton = document.querySelector(".login-btn");
const signupButton = document.querySelector(".signup-btn");
const getStarted = document.querySelector(".primary-btn");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");


// ==========================
// OPEN LOGIN
// ==========================

loginButton.addEventListener("click", () => {
    authOverlay.classList.add("active");

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
});


// ==========================
// OPEN SIGN UP
// ==========================

signupButton.addEventListener("click", () => {
    authOverlay.classList.add("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
});


// ==========================
// GET STARTED
// ==========================

getStarted.addEventListener("click", () => {
    authOverlay.classList.add("active");

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
});


// ==========================
// SWITCH LOGIN / SIGN UP
// ==========================

showRegister.addEventListener("click", () => {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
});

showLogin.addEventListener("click", () => {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});


// ==========================
// CLOSE
// ==========================

closeAuth.addEventListener("click", () => {
    authOverlay.classList.remove("active");
});

authOverlay.addEventListener("click", (event) => {
    if (event.target === authOverlay) {
        authOverlay.classList.remove("active");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        authOverlay.classList.remove("active");
    }
});


// ==========================
// SHOW / HIDE PASSWORD
// ==========================

document.querySelectorAll(".show-password").forEach((button) => {

    button.addEventListener("click", () => {

        const targetId = button.dataset.target;
        const passwordInput = document.getElementById(targetId);

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            button.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            button.textContent = "Show";
        }

    });

});


// ==========================
// REAL SIGN UP
// ==========================

const registerButton =
    document.querySelector("#registerForm .auth-submit");

registerButton.addEventListener("click", async () => {

    const username =
        document.getElementById("registerUsername").value.trim();

    const email =
        document.getElementById("registerEmail").value.trim();

    const password =
        document.getElementById("registerPassword").value;


    if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }


    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }


    registerButton.disabled = true;
    registerButton.textContent = "Creating account...";


    try {

        const response = await fetch("/api/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                email,
                password
            })

        });


        const data = await response.json();


        if (!response.ok) {

            alert(data.message);

            registerButton.disabled = false;
            registerButton.textContent = "Create account";

            return;
        }


        alert("Account created successfully!");


        // Save only basic user information
        localStorage.setItem(
            "vexoraUser",
            JSON.stringify({
                id: data.userId,
                username: data.username
            })
        );


        // Go to dashboard
        window.location.href = "dashboard.html";


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to the Vexora server."
        );

        registerButton.disabled = false;
        registerButton.textContent = "Create account";

    }

});


// ==========================
// REAL LOGIN
// ==========================

const loginSubmitButton =
    document.querySelector("#loginForm .auth-submit");

loginSubmitButton.addEventListener("click", async () => {

    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }


    loginSubmitButton.disabled = true;
    loginSubmitButton.textContent = "Logging in...";


    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });


        const data = await response.json();


        if (!response.ok) {

            alert(data.message);

            loginSubmitButton.disabled = false;
            loginSubmitButton.textContent = "Log in";

            return;
        }


        // Save logged-in user

        localStorage.setItem(
            "vexoraUser",
            JSON.stringify(data.user)
        );


        // Open dashboard

        window.location.href = "dashboard.html";


    } catch (error) {

        console.error(error);

        alert("Could not connect to the Vexora server.");

        loginSubmitButton.disabled = false;
        loginSubmitButton.textContent = "Log in";

    }

});