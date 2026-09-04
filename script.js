// Admin Configuration Credentials
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

// Scroll Animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));

// LocalStorage Helper
function getStoredProducts() {
  const stored = localStorage.getItem("store_products");
  if (!stored) {
    localStorage.setItem("store_products", JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  return JSON.parse(stored);
}

// Render Products & Admin Data
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

    // Front-end Card Template
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

    // Admin Panel Table Row
    if (adminTableBody) {
      adminTableBody.innerHTML += `
        <tr>
          <td>
            <div class="admin-prod-cell">
              <img src="${imgUrl}" class="admin-thumb" onerror="this.src='${DEFAULT_IMG}'">
              <strong>${product.name}</strong>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              $<input type="number" step="0.01" value="${parseFloat(product.price).toFixed(2)}" id="price-input-${product.id}" class="price-edit-input">
              <button class="btn-sm btn-stock-on" onclick="updateProductPrice(${product.id})">Save</button>
            </div>
          </td>
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

// Helper Function: Read File as Base64 Data URL
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Updated Add Product Handler supporting local file picker selection
async function adminAddNewProduct(event) {
  event.preventDefault();

  const name = document.getElementById("prod-name").value;
  const price = document.getElementById("prod-price").value;
  const section = document.getElementById("prod-section").value;
  const desc = document.getElementById("prod-desc").value;
  const inStock = document.getElementById("prod-stock").value === "true";
  const fileInput = document.getElementById("prod-image-file");

  let imageUrl = DEFAULT_IMG;

  // Convert uploaded image file to Base64 string if selected
  if (fileInput && fileInput.files.length > 0) {
    try {
      imageUrl = await readFileAsDataURL(fileInput.files[0]);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to read image file. Default placeholder image will be used.");
    }
  }

  const products = getStoredProducts();
  products.push({
    id: Date.now(),
    name: name,
    price: parseFloat(price).toFixed(2),
    desc: desc,
    section: section,
    image: imageUrl,
    inStock: inStock
  });

  localStorage.setItem("store_products", JSON.stringify(products));
  renderAllProducts();
  document.getElementById("add-product-form").reset();
  alert(`Product "${name}" published successfully!`);
}

// Inline Price Modifier Function
function updateProductPrice(productId) {
  const priceInput = document.getElementById(`price-input-${productId}`);
  if (!priceInput) return;

  const newPrice = parseFloat(priceInput.value);
  if (isNaN(newPrice) || newPrice < 0) {
    alert("Please enter a valid positive price.");
    return;
  }

  const products = getStoredProducts();
  const updatedProducts = products.map(p => {
    if (p.id === productId) {
      p.price = newPrice.toFixed(2);
    }
    return p;
  });

  localStorage.setItem("store_products", JSON.stringify(updatedProducts));
  renderAllProducts();
  alert("Price updated successfully!");
}

// Shopping Cart Simulation
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

// WhatsApp Routing
function sendWhatsAppProject() {
  const phoneNumber = "910000000000"; // Replace with your target phone number
  const type = document.getElementById("project-type").value;
  const details = document.getElementById("details").value.trim();
  const budget = document.getElementById("budget").value;

  let message = `Hello TechDevs Team! I would like to inquire about a project:\n\n` +
                `*Project Type:* ${type}\n` +
                `*Budget Range:* ${budget}\n`;

  if (details) {
    message += `*Details:* ${details}`;
  } else {
    message += `*Details:* I would like to discuss specifications.`;
  }

  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

// Pentest Disclaimer Modal Logic
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

// Admin Authentication Handler
function loginAdminPage() {
  const userInput = document.getElementById("admin-user");
  const passInput = document.getElementById("admin-password");

  if (!userInput || !passInput) return;

  const inputUser = userInput.value.trim().toLowerCase();
  const inputPass = passInput.value.trim().toLowerCase();

  if (inputUser === ADMIN_USER.toLowerCase() && inputPass === ADMIN_PASSWORD.toLowerCase()) {
    document.getElementById("admin-login-screen").style.display = "none";
    const panel = document.getElementById("admin-panel");
    panel.classList.remove("hidden-admin");
    renderAllProducts();
    renderOrders();
  } else {
    alert("Incorrect admin credentials. Use Username: admin | Password: password123");
  }
}

function logoutAdminPage() {
  document.getElementById("admin-login-screen").style.display = "block";
  document.getElementById("admin-panel").classList.add("hidden-admin");
  document.getElementById("admin-user").value = "";
  document.getElementById("admin-password").value = "";
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
  if (!ordersList) return;
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

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  renderAllProducts();
  if (document.getElementById("orders-list")) {
    renderOrders();
  }
});
