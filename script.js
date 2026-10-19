const authOverlay = document.getElementById("authOverlay");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const closeAuth = document.getElementById("closeAuth");
const loginButton = document.querySelector(".login-btn");
const signupButton = document.querySelector(".signup-btn");
const getStarted = document.querySelector(".primary-btn");
const exploreButton = document.querySelector(".secondary-btn");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

function openAuth(formToShow) {
    if (!authOverlay || !loginForm || !registerForm) {
        return;
    }

    authOverlay.classList.add("active");
    loginForm.classList.toggle("hidden", formToShow !== loginForm);
    registerForm.classList.toggle("hidden", formToShow !== registerForm);
}


// ==========================
// OPEN LOGIN
// ==========================

if (loginButton) {
    loginButton.addEventListener("click", () => openAuth(loginForm));
}


// ==========================
// OPEN SIGN UP
// ==========================

if (signupButton) {
    signupButton.addEventListener("click", () => openAuth(registerForm));
}


// ==========================
// GET STARTED
// ==========================

if (getStarted) {
    getStarted.addEventListener("click", () => openAuth(registerForm));
}

if (exploreButton) {
    exploreButton.addEventListener("click", () => {
        document.getElementById("preview")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
}


// ==========================
// SWITCH LOGIN / SIGN UP
// ==========================

if (showRegister) {
    showRegister.addEventListener("click", () => openAuth(registerForm));
}

if (showLogin) {
    showLogin.addEventListener("click", () => openAuth(loginForm));
}


// ==========================
// CLOSE
// ==========================

if (closeAuth) {
    closeAuth.addEventListener("click", () => authOverlay.classList.remove("active"));
}

if (authOverlay) {
    authOverlay.addEventListener("click", (event) => {
        if (event.target === authOverlay) {
            authOverlay.classList.remove("active");
        }
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (authOverlay) {
            authOverlay.classList.remove("active");
        }
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

if (registerButton) registerButton.addEventListener("click", async () => {

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

if (loginSubmitButton) loginSubmitButton.addEventListener("click", async () => {

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
