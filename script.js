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

// 1. Scroll Reveal Observer
function initScrollObserver() {
  const elements = document.querySelectorAll('.hidden');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1 });

  elements.forEach((el) => observer.observe(el));
}

// 2. Mouse-Following 3D Card Tilt & Glow Effect Engine
function init3DTiltCards() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.setProperty('--glow-x', `${x}px`);
      card.style.setProperty('--glow-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// LocalStorage Helpers
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

// Inline Price Edit Toggle Functions
function togglePriceEdit(id) {
  const displayContainer = document.getElementById(`price-display-${id}`);
  const editContainer = document.getElementById(`price-edit-${id}`);
  if (displayContainer && editContainer) {
    displayContainer.style.display = "none";
    editContainer.style.display = "flex";
  }
}

function cancelPriceEdit(id) {
  const displayContainer = document.getElementById(`price-display-${id}`);
  const editContainer = document.getElementById(`price-edit-${id}`);
  if (displayContainer && editContainer) {
    displayContainer.style.display = "flex";
    editContainer.style.display = "none";
  }
}

function saveCardPrice(id) {
  const inputEl = document.getElementById(`card-price-input-${id}`);
  const newPrice = parseFloat(inputEl.value);

  if (isNaN(newPrice) || newPrice < 0) {
    alert("Please enter a valid price.");
    return;
  }

  const products = getStoredProducts();
  const product = products.find(p => p.id === id);
  if (product) {
    product.price = newPrice.toFixed(2);
    saveProductsToStorage(products);
    renderAllProducts();
  }
}

// Render Products
function renderAllProducts() {
  const products = getStoredProducts();
  const compGrid = document.querySelector("#components .product-grid");
  const secGrid = document.querySelector("#security-gear .product-grid");
  const adminTableBody = document.getElementById("admin-product-rows");

  if (compGrid) compGrid.innerHTML = "";
  if (secGrid) secGrid.innerHTML = "";
  if (adminTableBody) adminTableBody.innerHTML = "";

  products.forEach((product, idx) => {
    const isSecurity = product.section === "security";
    const imgUrl = product.image && product.image.trim() !== "" ? product.image : DEFAULT_IMG;
    const stockBadge = product.inStock 
      ? `<span class="stock-badge in-stock">In Stock</span>` 
      : `<span class="stock-badge out-stock">Out of Stock</span>`;
    
    const actionBtn = product.inStock
      ? (isSecurity 
          ? `<button class="btn warning-btn" onclick="openDisclaimer('${product.name}')">Buy Tool</button>`
          : `<button class="btn btn-primary" onclick="addToCart(this, '${product.name}')">Add to Cart</button>`)
      : `<button class="btn btn-disabled" disabled>Unavailable</button>`;

    // Front-end Card Template with Inline Price Editor
    const cardHTML = `
      <div class="card hidden ${isSecurity ? 'security-card' : ''}" style="transition-delay: ${idx * 0.1}s;">
        <div class="card-img-wrapper">
          <img src="${imgUrl}" alt="${product.name}" class="product-img" onerror="this.src='${DEFAULT_IMG}'">
        </div>
        <div class="card-header-row">
          <h3>${product.name}</h3>
          ${stockBadge}
        </div>
        <p>${product.desc}</p>
        
        <div class="price-row">
          <div id="price-display-${product.id}" class="price-edit-box" style="display: flex;">
            <span class="price">$${parseFloat(product.price).toFixed(2)}</span>
            <button class="btn-icon" onclick="togglePriceEdit(${product.id})" title="Edit Price">✏️</button>
          </div>
          <div id="price-edit-${product.id}" class="price-edit-box" style="display: none;">
            $<input type="number" step="0.01" value="${parseFloat(product.price).toFixed(2)}" id="card-price-input-${product.id}" class="price-input">
            <button class="btn-sm btn-primary" onclick="saveCardPrice(${product.id})">Save</button>
            <button class="btn-sm btn-secondary" onclick="cancelPriceEdit(${product.id})">✕</button>
          </div>
        </div>

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

  init3DTiltCards();
  initScrollObserver();
}

// Shopping Cart Simulation
function addToCart(buttonElement, itemName) {
  const originalText = buttonElement.innerText;
  buttonElement.innerText = "✓ Added!";
  buttonElement.style.backgroundColor = "#64ffda";
  buttonElement.style.color = "#0a192f";
  
  setTimeout(() => {
    buttonElement.innerText = originalText;
    buttonElement.style.backgroundColor = "";
    buttonElement.style.color = "";
  }, 1500);
}

// Direct WhatsApp Routing
function sendWhatsAppProject() {
  const phoneNumber = "918380041254";
  const message = "hi techdevs team i want a customized model";

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

// Standard Upward Floating Particles (Non-interactive)
function initParticleCanvas() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  });

  let particles = [];
  const particleCount = 75;

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 20;
      this.radius = Math.random() * 2.5 + 0.8;
      this.speedY = Math.random() * 1.2 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.2;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;

      if (this.y < -this.radius) {
        this.reset(false);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 255, 218, ${this.opacity})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(100, 255, 218, 0.4)";
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  createParticles();
  animate();
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  renderAllProducts();
  initParticleCanvas();
});
