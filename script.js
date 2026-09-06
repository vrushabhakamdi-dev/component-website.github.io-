const DEFAULT_IMG = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60";

const defaultProducts = [
  { id: 1, name: "ESP32 Wi-Fi + BT Board", price: "6.50", desc: "Dual-core microcontroller with built-in Wi-Fi and Bluetooth.", section: "components", inStock: true, image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=500&auto=format&fit=crop&q=60" },
  { id: 2, name: "NRF24L01+ Transceiver", price: "2.20", desc: "2.4GHz RF wireless transceiver module for long-range communication.", section: "components", inStock: true, image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&auto=format&fit=crop&q=60" },
  { id: 3, name: "Ultrasonic Sensor HC-SR04", price: "1.80", desc: "High-precision distance measurement module for autonomous builds.", section: "components", inStock: false, image: DEFAULT_IMG },
  { id: 4, name: "HackRF One SDR", price: "180.00", desc: "Software Defined Radio receiver/transmitter covering 1 MHz to 6 GHz.", section: "security", inStock: true, image: DEFAULT_IMG },
  { id: 5, name: "ESP8266 Deauther Board", price: "15.00", desc: "Open-source Wi-Fi packet research and pentesting board.", section: "security", inStock: true, image: DEFAULT_IMG }
];

let cart = [];

// Triple Click Logo Handler
let logoClickCount = 0;
let logoClickTimer = null;

function handleLogoClick() {
  logoClickCount++;
  
  if (logoClickCount === 3) {
    logoClickCount = 0;
    clearTimeout(logoClickTimer);
    openAdminLoginModal();
    return;
  }

  clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(() => {
    logoClickCount = 0;
  }, 1500);
}

function openAdminLoginModal() {
  document.getElementById("admin-user-input").value = "";
  document.getElementById("admin-pass-input").value = "";
  document.getElementById("admin-login-modal").classList.add("active");
}

function closeAdminLoginModal() {
  document.getElementById("admin-login-modal").classList.remove("active");
}

function authenticateAdmin() {
  const username = document.getElementById("admin-user-input").value.trim();
  const password = document.getElementById("admin-pass-input").value.trim();

  if (username === "admin" && password === "av12345") {
    closeAdminLoginModal();
    window.location.href = "admin.html";
  } else {
    alert("Invalid Credentials. Access Denied.");
  }
}

// LocalStorage Persistence
function getStoredProducts() {
  const stored = localStorage.getItem("store_products");
  if (!stored) {
    localStorage.setItem("store_products", JSON.stringify(defaultProducts));
    return defaultProducts;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultProducts;
  }
}

function saveProductsToStorage(products) {
  localStorage.setItem("store_products", JSON.stringify(products));
}

// Render Main Storefront Products (index.html)
function renderProducts(filterQuery = "", sectionFilter = "all") {
  const compGrid = document.getElementById("components-grid");
  const secGrid = document.getElementById("security-grid");

  if (!compGrid && !secGrid) return; // Not on index.html

  const products = getStoredProducts();
  if (compGrid) compGrid.innerHTML = "";
  if (secGrid) secGrid.innerHTML = "";

  products.forEach(product => {
    const matchesSearch = product.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
                          product.desc.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesCategory = sectionFilter === "all" || product.section === sectionFilter;

    if (!matchesSearch || !matchesCategory) return;

    const imgUrl = product.image && product.image.trim() !== "" ? product.image : DEFAULT_IMG;
    const isSecurity = product.section === "security";

    const actionBtn = product.inStock
      ? (isSecurity 
          ? `<button class="btn-add-cart" onclick="openDisclaimer('${product.name}', ${product.price})">Buy Tool</button>`
          : `<button class="btn-add-cart" onclick="addToCart('${product.name}', ${product.price})">Add to Cart</button>`)
      : `<button class="btn-add-cart btn-disabled" disabled>Out of Stock</button>`;

    const cardHTML = `
      <div class="fk-card">
        <div class="card-img-container">
          <img src="${imgUrl}" alt="${product.name}" onerror="this.src='${DEFAULT_IMG}'">
        </div>
        <h3>${product.name}</h3>
        <p class="desc">${product.desc}</p>
        <div class="price-box">
          <span class="curr-price">$${parseFloat(product.price).toFixed(2)}</span>
        </div>
        ${actionBtn}
      </div>
    `;

    if (product.section === "security" && secGrid) {
      secGrid.innerHTML += cardHTML;
    } else if (compGrid) {
      compGrid.innerHTML += cardHTML;
    }
  });
}

// Render Admin Management Panel (admin.html)
function renderAdminTable() {
  const tableBody = document.getElementById("admin-product-rows");
  if (!tableBody) return; // Not on admin.html

  const products = getStoredProducts();
  tableBody.innerHTML = "";

  products.forEach(product => {
    tableBody.innerHTML += `
      <tr>
        <td><strong>${product.name}</strong></td>
        <td><span style="text-transform: capitalize;">${product.section}</span></td>
        <td>$${parseFloat(product.price).toFixed(2)}</td>
        <td>
          $<input type="number" step="0.01" id="admin-price-${product.id}" class="price-input" value="${parseFloat(product.price).toFixed(2)}">
        </td>
        <td>
          <button class="btn-save" onclick="updatePriceFromAdmin(${product.id})">Save Price</button>
        </td>
      </tr>
    `;
  });
}

function addNewProductFromAdmin() {
  const nameInput = document.getElementById("new-prod-name").value.trim();
  const priceInput = parseFloat(document.getElementById("new-prod-price").value);
  const sectionInput = document.getElementById("new-prod-section").value;
  const imageInput = document.getElementById("new-prod-image").value.trim();
  const descInput = document.getElementById("new-prod-desc").value.trim();

  if (!nameInput || isNaN(priceInput) || priceInput < 0 || !descInput) {
    alert("Please fill in all required fields with valid values.");
    return;
  }

  const products = getStoredProducts();

  const newProduct = {
    id: Date.now(),
    name: nameInput,
    price: priceInput.toFixed(2),
    desc: descInput,
    section: sectionInput,
    inStock: true,
    image: imageInput !== "" ? imageInput : DEFAULT_IMG
  };

  products.push(newProduct);
  saveProductsToStorage(products);

  document.getElementById("new-prod-name").value = "";
  document.getElementById("new-prod-price").value = "";
  document.getElementById("new-prod-image").value = "";
  document.getElementById("new-prod-desc").value = "";

  renderAdminTable();
  alert(`"${newProduct.name}" has been added to the store!`);
}

function updatePriceFromAdmin(productId) {
  const priceInput = document.getElementById(`admin-price-${productId}`);
  const newPrice = parseFloat(priceInput.value);

  if (isNaN(newPrice) || newPrice < 0) {
    alert("Please enter a valid price.");
    return;
  }

  const products = getStoredProducts();
  const product = products.find(p => p.id === productId);

  if (product) {
    product.price = newPrice.toFixed(2);
    saveProductsToStorage(products);
    renderAdminTable();
    alert(`Price for ${product.name} updated to $${product.price}`);
  }
}

// Search & Filter Functions
function filterProducts() {
  const query = document.getElementById("fk-search-input").value;
  renderProducts(query, "all");
}

function filterCategory(category) {
  renderProducts("", category);
}

function scrollToCustomBuilds() {
  document.getElementById("custom-projects").scrollIntoView({ behavior: 'smooth' });
}

// Cart Management
function addToCart(name, price) {
  cart.push({ name, price });
  updateCartUI();
}

function updateCartUI() {
  document.getElementById("cart-count-badge").innerText = cart.length;
  document.getElementById("drawer-cart-count").innerText = cart.length;

  const container = document.getElementById("cart-items-container");
  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-msg">Your cart is currently empty.</p>`;
    document.getElementById("cart-total-price").innerText = "$0.00";
    return;
  }

  let html = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += parseFloat(item.price);
    html += `
      <div class="cart-item-row">
        <div>
          <strong>${item.name}</strong>
          <div style="font-size:12px; color:#878787;">$${parseFloat(item.price).toFixed(2)}</div>
        </div>
        <button style="border:none; background:none; color:red; cursor:pointer;" onclick="removeFromCart(${index})">&times;</button>
      </div>
    `;
  });

  container.innerHTML = html;
  document.getElementById("cart-total-price").innerText = `$${total.toFixed(2)}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function toggleCartDrawer() {
  document.getElementById("cart-drawer").classList.toggle("open");
  document.getElementById("cart-overlay").classList.toggle("active");
}

function checkoutCart() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }
  alert("Order placed successfully!");
  cart = [];
  updateCartUI();
  toggleCartDrawer();
}

function sendWhatsAppProject() {
  const phoneNumber = "918380041254";
  const message = "hi techdevs team i want a customized model";
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

let pendingSecurityItem = null;

function openDisclaimer(name, price) {
  pendingSecurityItem = { name, price };
  document.getElementById("agree-checkbox").checked = false;
  document.getElementById("modal").classList.add("active");
}

function closeDisclaimerModal() {
  document.getElementById("modal").classList.remove("active");
  pendingSecurityItem = null;
}

function confirmSecurityPurchase() {
  if (!document.getElementById("agree-checkbox").checked) {
    alert("Please check the compliance box first.");
    return;
  }
  if (pendingSecurityItem) {
    addToCart(pendingSecurityItem.name, pendingSecurityItem.price);
  }
  closeDisclaimerModal();
}

// App Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderAdminTable();
});
