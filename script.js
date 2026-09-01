// 1. Intersection Observer for Smooth Scroll Reveal Animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));

// 2. Add to Cart Feedback Animation
function addToCart(buttonElement, itemName) {
  const originalText = buttonElement.innerText;
  
  // Quick Success Animation Frame
  buttonElement.innerText = "✓ Added!";
  buttonElement.style.backgroundColor = "#64ffda";
  buttonElement.style.color = "#0a192f";
  
  setTimeout(() => {
    buttonElement.innerText = originalText;
    buttonElement.style.backgroundColor = "transparent";
    buttonElement.style.color = "#64ffda";
  }, 1500);
}

// 3. Custom Form Submission Animation
function submitCustomOrder(event) {
  event.preventDefault();
  const form = document.getElementById("project-form");
  const submitBtn = form.querySelector('button[type="submit"]');
  
  submitBtn.innerText = "Sending Request...";
  submitBtn.style.opacity = "0.7";

  setTimeout(() => {
    alert("Thank you! Your custom project specifications have been logged. We will send an estimate shortly.");
    form.reset();
    submitBtn.innerText = "Submit Project Request";
    submitBtn.style.opacity = "1";
  }, 1000);
}

// 4. Modal Dialog Open/Close with Smooth Scaling
let selectedSecurityItem = "";

function openDisclaimer(itemName) {
  selectedSecurityItem = itemName;
  document.getElementById("agree-checkbox").checked = false;
  const modal = document.getElementById("modal");
  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("active");
}

function confirmSecurityPurchase() {
  const isAgreed = document.getElementById("agree-checkbox").checked;
  if (!isAgreed) {
    alert("Please check the agreement box confirming compliance before purchasing hardware research tools.");
    return;
  }
  closeModal();
  alert(`${selectedSecurityItem} added to cart. Legal disclaimer acknowledged.`);
}