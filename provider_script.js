window.onload = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  // 🔒 Protect dashboard
  if (!user) {
    alert("Please login first ❌");
    window.location.href = "index.html";
    return;
  }

  console.log(user);

  // ✅ Show username safely
  const usernameEl = document.getElementById("username");

  if (usernameEl) {
    usernameEl.innerText = user.name;
  }
    loadServices();
};

const supabaseUrl = "https://xxnrletnimdnyoezdbaw.supabase.co";  
const supabaseKey = "sb_publishable_WFkzTdZXcwsCADIP814onw_EnBAbf5p";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function loadAdd() {
  document.getElementById("contentArea").innerHTML = `
    
    <div class="card">
      <h2>Add Service</h2>

      <input type="text" id="serviceName" placeholder="Service Name">

      <select id="category">
        <option>Plumbing</option>
        <option>Electrical</option>
        <option>Cleaning</option>
        <option>Repair</option>
      </select>

      <input type="text" id="description" placeholder="Description">

      <select id="availability">
        <option>Available</option>
        <option>Busy</option>
        <option>Not Available</option>
      </select>

      <input type="text" id="phone" placeholder="Phone Number">
      <p id="phoneError" style="color:red; font-size:12px;"></p>
      <input type="text" id="area" placeholder="Enter Area (e.g. Andheri)">

      <button onclick="addService()">Save Service</button>
    </div>

  `;

  setTimeout(() => {
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      document.getElementById("phoneError").innerText = "";
      phoneInput.style.border = "1px solid #ccc";
    });
  }
}, 100);

}

async function addService() {
  const serviceName = document.getElementById("serviceName").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const availability = document.getElementById("availability").value;
  const phone = document.getElementById("phone").value;
  const area = document.getElementById("area").value;

  const phoneError = document.getElementById("phoneError");

  // ✅ Validation
  if (!serviceName || !phone || !area) {
    alert("Please fill required fields");
    return;
  }

  if (phone.length < 10) {
    phoneError.innerText = "Enter valid phone number ❌";
    document.getElementById("phone").style.border = "1px solid red";
    return;
  } else {
    phoneError.innerText = "";
    document.getElementById("phone").style.border = "1px solid #ccc";
  }

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ GET LOCATION HERE
  navigator.geolocation.getCurrentPosition(async (pos) => {

    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    console.log("Saving location:", lat, lng);

    const { error } = await supabaseClient
      .from("services")
      .insert([{
        service_name: serviceName,
        category,
        description,
        availability,
        phone,
        area,
        lat,       // ✅ NEW
        lng,       // ✅ NEW
        provider_id: user.id
      }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Service added ✅");
      loadServices();
    }

  }, () => {
    alert("Please allow location access ❌");
  });
}


function loadServices() {
  document.getElementById("contentArea").innerHTML = `
    <h2>All Services</h2>
    <div id="serviceList"></div>
  `;

  fetchServices();
}

async function fetchServices() {
  const user = JSON.parse(localStorage.getItem("user"));

  const { data, error } = await supabaseClient
    .from("services")
    .select("*")
    .eq("provider_id", user.id);

  if (error) {
    alert("Error loading services");
    return;
  }

   if (data.length === 0) {
    document.getElementById("serviceList").innerHTML = `
      <p>No services added yet 🚫</p>
    `;
    return;
   }
  let html = `<div class="service-container">`;

  data.forEach(service => {

    // 🎨 availability color
    let statusColor =
      service.availability === "Available" ? "green" :
      service.availability === "Busy" ? "orange" : "red";

    html += `
      <div class="service-card">

        <h3>${service.service_name}</h3>

        <p><b>Category:</b> ${service.category}</p>
        <p><b>Area:</b> ${service.area}</p>

        <span class="status" style="background:${statusColor}">
          ${service.availability}
        </span>

        <div class="card-actions">
  <button onclick="openWhatsApp('${service.phone}')">WhatsApp</button>

  <button onclick="editService(
    '${service.id}',
    '${service.service_name}',
    '${service.category}',
    '${service.description}',
    '${service.availability}',
    '${service.phone}',
    '${service.area}'
  )">Edit</button>

  <button onclick="deleteService('${service.id}')">Delete</button>
</div>

      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("serviceList").innerHTML = html;


}

function openWhatsApp(phone) {
  window.open(`https://wa.me/${phone}`, "_blank");
}

function editService(id, name, category, description, availability, phone, area) {
  document.getElementById("contentArea").innerHTML = `
    <div class="card">
      <h2>Edit Service</h2>

      <input type="text" id="serviceName" value="${name}">
      <input type="text" id="category" value="${category}">
      <input type="text" id="description" value="${description}">
      <input type="text" id="availability" value="${availability}">
      <input type="text" id="phone" value="${phone}">
      <input type="text" id="area" value="${area}">

      <button onclick="updateService('${id}')">Update</button>
    </div>
  `;
}

async function updateService(id) {
  const serviceName = document.getElementById("serviceName").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const availability = document.getElementById("availability").value;
  const phone = document.getElementById("phone").value;
  const area = document.getElementById("area").value;

  const { error } = await supabaseClient
    .from("services")
    .update({
      service_name: serviceName,
      category: category,
      description: description,
      availability: availability,
      phone: phone,
      area: area
    })
    .eq("id", id);

  if (error) {
    alert("Error updating");
  } else {
    alert("Updated ✅");
    loadServices();
  }
}

async function deleteService(id) {
  if (!confirm("Are you sure?")) return;

  const { error } = await supabaseClient
    .from("services")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error deleting");
  } else {
    alert("Deleted ✅");
    loadServices();
  }
}



async function loadBookings() {

const user = JSON.parse(localStorage.getItem("user"));
const providerId = user?.id;

  const { data, error } = await supabaseClient
    .from("bookings")
    .select(`
      id,
      status,
      address,
      users(name, phone),
      services(service_name)
    `)
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  displayBookings(data);
}


function displayBookings(bookings) {

  const content = document.getElementById("contentArea");
  content.innerHTML = "<h2>📥 Booking Requests</h2>";

  if (bookings.length === 0) {
    content.innerHTML += "<p>No bookings yet</p>";
    return;
  }

  bookings.forEach(b => {

    const div = document.createElement("div");
    div.classList.add("service-card");

    // 🔥 CONTROL BUTTONS BASED ON STATUS
    let actions = "";

    if (b.status === "pending") {
      actions = `
        <button onclick="updateBooking(${b.id}, 'accepted', this)">✅ Accept</button>
        <button onclick="updateBooking(${b.id}, 'rejected', this)">❌ Reject</button>
      `;
    } else {
      actions = `<p><strong>Status:</strong> ${b.status}</p>`;
    }

    div.innerHTML = `
      <h3>${b.services?.service_name || "Service"}</h3>

      <p><strong>User:</strong> ${b.users?.name}</p>
      <p><strong>Phone:</strong> ${b.users?.phone}</p>
      <p><strong>Address:</strong> ${b.address}</p>

      <div class="card-actions">
        ${actions}
      </div>
    `;

    content.appendChild(div);
  });
}


async function updateBooking(id, status, btn) {

  const parent = btn.parentElement;

  // 🚫 instantly block UI
  parent.innerHTML = `<p>Updating...</p>`;

  const { error } = await supabaseClient
    .from("bookings")
    .update({ status: status })
    .eq("id", id)
    .eq("status", "pending"); // 🔥 prevents double click

  if (error) {
    alert("Error updating");
    loadBookings();
  } else {
    loadBookings(); // refresh UI
  }
}