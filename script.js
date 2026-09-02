// --- Default Configuration & Inventory ---
const ADMIN_USER = "admin";
const ADMIN_PASSWORD = "password123"; 
const DEFAULT_IMG = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60";

const defaultProducts = [
  { id: 1, name: "ESP32 Wi-Fi + BT Board", price: "6.50", desc: "Dual-core microcontroller with built-in Wi-Fi and Bluetooth.", section: "components", inStock: true, image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=500&auto=format&fit=crop&q=60" },
  { id: 2, name: "NRF24L01+ Transceiver", price: "2.20", desc: "2.4GHz RF wireless transceiver module for long-range communication.", section: "components", inStock: true, image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=60" },
  { id: 3, name: "Ultrasonic Sensor HC-SR04", price: "1.80", desc: "High-precision distance measurement module for autonomous builds.", section: "components", inStock: false, image: DEFAULT_IMG },
  { id: 4, name: "HackRF One SDR", price: "180.00", desc: "Software Defined Radio receiver/transmitter covering 1 MHz to 6 GHz.", section: "security", inStock: true, image: DEFAULT_IMG },
  { id: 5, name: "ESP8266 Deauther Board", price: "15.00", desc: "Open-source Wi-Fi packet research and pentesting board.", section: "security", inStock: true, image: DEFAULT_IMG }
];

// --- 1. Intersection Observer for Scroll Animations ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));

// --- 2. Store Rendering & LocalStorage Management ---
function getStoredProducts() {
  const stored = localStorage.getItem("store_products");
  if (!stored) {
    localStorage.setItem("store_products", JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(stored);
}

function renderAllProducts() {
  const products = getStoredProducts();
  const compGrid = document.querySelector("#components .product-grid");
  const secGrid = document.querySelector("#security-gear .product-grid");
  const adminTableBody = document.getElementById("admin-product-rows");

  if (compGrid) compGrid.innerHTML = "";
  if (secGrid) secGrid.innerHTML = "";
  if (adminTableBody) adminTableBody.innerHTML = "";

  products.forEach(product => {
    const isSecurity = product.section === "security";
    const imgUrl = product.image && product.image.trim() !== "" ? product.image : DEFAULT_IMG;
    const stockBadge = product.inStock 
      ? `<span class="stock-badge in-stock">In Stock</span>` 
      : `<span class="stock-badge out-stock">Out of Stock</span>`;
    
    const actionBtn = product.inStock
      ? (isSecurity 
          ? `<button class="btn warning-btn" onclick="openDisclaimer('${product.name}')">Buy Tool</button>`
          : `<button class="btn btn-add" onclick="addToCart(this, '${product.name}')">Add to Cart</button>`)
      : `<button class="btn btn-disabled" disabled>Unavailable</button>`;

    // Store Product Card
    const cardHTML = `
      <div class="card ${isSecurity ? 'security-card' : ''}">
        <div class="card-img-wrapper">
          <img src="${imgUrl}" alt="${product.name}" class="product-img" onerror="this.src='${DEFAULT_IMG}'">
        </div>
        <div class="card-header-row">
          <h3>${product.name}</h3>
          ${stockBadge}
        </div>
        <p>${product.desc}</p>
        <span class="price">$${parseFloat(product.price).toFixed(2)}</span>
        ${actionBtn}
      </div>
    `;

    if (product.section === "security" && secGrid) {
      secGrid.innerHTML += cardHTML;
    } else if (compGrid) {
      compGrid.innerHTML += cardHTML;
    }

    // Admin Table Row
    if (adminTableBody) {
      adminTableBody.innerHTML += `
        <tr>
          <td>
            <div class="admin-prod-cell">
              <img src="${imgUrl}" class="admin-thumb" onerror="this.src='${DEFAULT_IMG}'">
              <strong>${product.name}</strong>
            </div>
          </td>
          <td>$${parseFloat(product.price).toFixed(2)}</td>
          <td><span class="tag">${product.section}</span></td>
          <td>
            <button class="btn-sm ${product.inStock ? 'btn-stock-on' : 'btn-stock-off'}" onclick="toggleStock(${product.id})">
              ${product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </button>
          </td>
          <td>
            <button class="btn-sm btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
          </td>
        </tr>
      `;
    }
  });
}

// --- 3. Customer Actions & Form Submissions ---
function addToCart(buttonElement, itemName) {
  const originalText = buttonElement.innerText;
  buttonElement.innerText = "✓ Added!";
  buttonElement.style.backgroundColor = "#64ffda";
  buttonElement.style.color = "#0a192f";
  
  setTimeout(() => {
    buttonElement.innerText = originalText;
    buttonElement.style.backgroundColor = "transparent";
    buttonElement.style.color = "#64ffda";
  }, 1500);
}

function submitCustomOrder(event) {
  event.preventDefault();
  const type = document.getElementById("project-type").value;
  const details = document.getElementById("details").value;
  const budget = document.getElementById("budget").value;

  const newOrder = {
    id: Date.now(),
    type: type,
    details: details,
    budget: budget,
    date: new Date().toLocaleDateString()
  };

  const orders = JSON.parse(localStorage.getItem("custom_orders") || "[]");
  orders.push(newOrder);
  localStorage.setItem("custom_orders", JSON.stringify(orders));

  alert(`Thank you! Your custom ${type} request has been logged.`);
  document.getElementById("project-form").reset();
}

// WhatsApp Integration Logic
function sendWhatsAppProject() {
  // Replace with your active WhatsApp phone number (country code + number, no '+' or spaces)
  const phoneNumber = "910000000000"; 
  
  const type = document.getElementById("project-type").value;
  const details = document.getElementById("details").value.trim();
  const budget = document.getElementById("budget").value;

  let message = `Hello TechCraft Team! I would like to inquire about a project:\n\n` +
                `*Project Type:* ${type}\n` +
                `*Budget Range:* ${budget}\n`;

  if (details) {
    message += `*Details:* ${details}`;
  } else {
    message += `*Details:* I would like to discuss specifications.`;
  }

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}

// Disclaimer Modal
let selectedSecurityItem = "";
function openDisclaimer(itemName) {
  selectedSecurityItem = itemName;
  document.getElementById("agree-checkbox").checked = false;
  document.getElementById("modal").classList.add("active");
}

function closeDisclaimerModal() {
  document.getElementById("modal").classList.remove("active");
}

function confirmSecurityPurchase() {
  if (!document.getElementById("agree-checkbox").checked) {
    alert("Please check the compliance box first.");
    return;
  }
  closeDisclaimerModal();
  alert(`${selectedSecurityItem} added to cart. Compliance accepted.`);
}

// --- 4. Admin Auth & Management Logic ---
function openAdminModal() {
  document.getElementById("admin-login-modal").classList.add("active");
}

function closeAdminModal() {
  document.getElementById("admin-login-modal").classList.remove("active");
  document.getElementById("admin-user").value = "";
  document.getElementById("admin-password").value = "";
}

function loginAdmin() {
  const inputUser = document.getElementById("admin-user").value;
  const inputPass = document.getElementById("admin-password").value;

  if (inputUser === ADMIN_USER && inputPass === ADMIN_PASSWORD) {
    closeAdminModal();
    const adminSection = document.getElementById("admin-panel");
    adminSection.classList.remove("hidden-admin");
    adminSection.scrollIntoView({ behavior: 'smooth' });
    renderOrders();
    alert("Admin login successful!");
  } else {
    alert("Incorrect admin credentials.");
  }
}

function logoutAdmin() {
  document.getElementById("admin-panel").classList.add("hidden-admin");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function adminAddNewProduct(event) {
  event.preventDefault();
  const name = document.getElementById("prod-name").value;
  const price = document.getElementById("prod-price").value;
  const section = document.getElementById("prod-section").value;
  const image = document.getElementById("prod-image").value;
  const desc = document.getElementById("prod-desc").value;
  const inStock = document.getElementById("prod-stock").value === "true";

  const products = getStoredProducts();
  products.push({
    id: Date.now(),
    name: name,
    price: price,
    desc: desc,
    section: section,
    image: image,
    inStock: inStock
  });

  localStorage.setItem("store_products", JSON.stringify(products));
  renderAllProducts();
  document.getElementById("add-product-form").reset();
  alert(`Product "${name}" published successfully!`);
}

function toggleStock(productId) {
  const products = getStoredProducts();
  const updated = products.map(p => {
    if (p.id === productId) p.inStock = !p.inStock;
    return p;
  });
  localStorage.setItem("store_products", JSON.stringify(updated));
  renderAllProducts();
}

function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  let products = getStoredProducts();
  products = products.filter(p => p.id !== productId);
  localStorage.setItem("store_products", JSON.stringify(products));
  renderAllProducts();
}

function renderOrders() {
  const ordersList = document.getElementById("orders-list");
  const orders = JSON.parse(localStorage.getItem("custom_orders") || "[]");

  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="empty-text">No custom project orders received yet.</p>';
    return;
  }

  ordersList.innerHTML = orders.map(order => `
    <div class="order-item">
      <header>
        <span>${order.type}</span>
        <span>Budget: ${order.budget} | Date: ${order.date}</span>
      </header>
      <p><strong>Requirements:</strong> ${order.details}</p>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", renderAllProducts);
