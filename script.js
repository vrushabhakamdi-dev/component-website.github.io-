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
function initScrollObserver() {
  const elements = document.querySelectorAll('.hidden');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.15 });

  elements.forEach((el) => observer.observe(el));
}

// LocalStorage Helper
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
          : `<button class="btn btn-primary" onclick="addToCart(this, '${product.name}')">Add to Cart</button>`)
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
  const phoneNumber = "910000000000";
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

// Interactive Particle Network Background Engine
function initParticleCanvas() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(100, 255, 218, 0.8)";
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          let opacity = 1 - dist / 120;
          ctx.strokeStyle = `rgba(100, 255, 218, ${opacity * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }

      if (mouse.x !== null && mouse.y !== null) {
        let mdx = particles[a].x - mouse.x;
        let mdy = particles[a].y - mouse.y;
        let mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.radius) {
          let opacity = 1 - mdist / mouse.radius;
          ctx.strokeStyle = `rgba(100, 255, 218, ${opacity * 0.6})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  animate();
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  initScrollObserver();
  renderAllProducts();
  initParticleCanvas();
});
