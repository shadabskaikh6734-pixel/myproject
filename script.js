function goSeeker() {
  window.location.href = "seeker_dashboard.html";
  // later we will show seeker screen
}


function hideAll() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("seeker").classList.add("hidden");
  document.getElementById("provider").classList.add("hidden");
}


function goProvider() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("provider").classList.remove("hidden");
  document.body.style.background = "linear-gradient(135deg, #00c6ff, #291be5ff)";

}

function openLogin() {
  // hide everything first
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("provider").classList.add("hidden");

  // show login only
  document.getElementById("loginPage").classList.remove("hidden");

  // change background
  document.body.style.background = "linear-gradient(135deg, #1758d1ff, #ee2281ff)";
}

function goBack() {
  document.getElementById("provider").classList.add("hidden");
  document.getElementById("loginPage").classList.add("hidden");

  document.getElementById("welcome").classList.remove("hidden");

  document.body.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
}



const supabaseUrl = "https://xxnrletnimdnyoezdbaw.supabase.co";  
const supabaseKey = "sb_publishable_WFkzTdZXcwsCADIP814onw_EnBAbf5p";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        document.getElementById("lat").value = lat;
        document.getElementById("lng").value = lng;

        const status = document.getElementById("locationStatus");

        status.innerText = "Location captured ✅";

// ⏳ Remove after 1 second
        setTimeout(() => {
        status.innerText = "";
        }, 1000);
        
      },
      () => {
        alert("Location access denied ❌");
      }
    );
  } else {
    alert("Geolocation not supported");
  }
}

async function registerProvider(btn) {

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Registering...";
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);

  // 🔁 helper to reset button
  function resetBtn() {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Register";
    }
  }

  // 🔴 EMPTY CHECK
  if (!name || !email || !password || !phone) {
    alert("Please fill all fields");
    resetBtn();
    return;
  }

  // 🔴 NAME VALIDATION
  if (name.length < 3) {
    alert("Name must be at least 3 characters");
    resetBtn();
    return;
  }

  // 🔴 EMAIL VALIDATION
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Enter valid email");
    resetBtn();
    return;
  }

  // 🔴 PASSWORD VALIDATION
  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    resetBtn();
    return;
  }

  // 🔴 PHONE VALIDATION (India)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    alert("Enter valid 10-digit phone number");
    resetBtn();
    return;
  }

  // 🔴 LOCATION CHECK
  if (isNaN(lat) || isNaN(lng)) {
    alert("Please click 'Use My Location' 📍");
    resetBtn();
    return;
  }

  // 🔍 CHECK IF EMAIL OR PHONE EXISTS
  const { data: existingUser, error: checkError } = await supabaseClient
    .from("providers")
    .select("*")
    .or(`email.eq.${email},phone.eq.${phone}`);

  if (checkError) {
    alert("Error checking user");
    resetBtn();
    return;
  }

  if (existingUser && existingUser.length > 0) {
    alert("Email or Phone already registered ❌");
    resetBtn();
    return;
  }

  // ✅ INSERT DATA
  const { error } = await supabaseClient
    .from("providers")
    .insert([{ name, email, phone, password, lat, lng }]);

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Registered successfully ✅");

    // 🧹 Clear inputs
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("phone").value = "";
  }

  resetBtn();
}

window.onload = () => {
  const emailInput = document.getElementById("loginEmail");
  const passInput = document.getElementById("loginPassword");

  if (emailInput && passInput) {
    emailInput.value = "";
    passInput.value = "";
  }
};

async function loginProvider() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Enter email & password");
    return;
  }

  const { data, error } = await supabaseClient
    .from("providers")
    .select("*")
    .eq("email", email)
    .eq("password", password);

  if (error) {
    alert("Error: " + error.message);
    return;
  }

  if (data.length === 0) {
    alert("Invalid credentials ❌");
  } else {
    
     localStorage.setItem("user", JSON.stringify(data[0]));

  // ✅ REDIRECT TO DASHBOARD
  window.location.href = "provider_dashboard.html";
    console.log(data);
  }
}


function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}