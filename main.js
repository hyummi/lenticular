const enableMotionBtn = document.getElementById("enableMotion");
const card = document.getElementById("card");
const swapBtn = document.getElementById("swap");
const toastEl = document.getElementById("toast");

let usingPointerFallback = false;
let listenerAttached = false;
let swapped = false;
let currentSide = "front";

const config = {
  maxTilt: 20, // degrees mapped to px offset
  depthFront: 14,
  depthBack: 8,
  toggleThreshold: 6, // degrees left/right required to flip image
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  toastEl.classList.remove("hidden");
  setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function setSide(side) {
  if (!card || side === currentSide) return;
  currentSide = side;
  card.dataset.side = side;
}

function applyTilt(x, y) {
  if (!card) return;
  const clampedX = clamp(x, -config.maxTilt, config.maxTilt);
  const clampedY = clamp(y, -config.maxTilt, config.maxTilt);
  const normX = clampedX / config.maxTilt;
  const normY = clampedY / config.maxTilt;

  if (Math.abs(clampedX) > config.toggleThreshold) {
    setSide(clampedX > 0 ? "front" : "back");
  }

  card.style.setProperty("--tilt-x", `${normX}`);
  card.style.setProperty("--tilt-y", `${normY}`);

  const front = card.querySelector(".layer-front");
  const back = card.querySelector(".layer-back");

  if (front) {
    front.style.transform = `translate3d(${normX * config.depthFront}px, ${normY * config.depthFront}px, 0)`;
  }

  if (back) {
    back.style.transform = `translate3d(${normX * -config.depthBack}px, ${normY * -config.depthBack}px, 0)`;
  }
}

function handleDeviceMotion(event) {
  const { beta, gamma } = event; // beta: x (front-back tilt), gamma: y (left-right)
  if (beta == null || gamma == null) return;
  applyTilt(gamma, beta);
}

function attachDeviceMotion() {
  if (listenerAttached) return;
  listenerAttached = true;
  window.addEventListener("deviceorientation", handleDeviceMotion, true);
  showToast("Motion active");
}

function detachDeviceMotion() {
  if (!listenerAttached) return;
  window.removeEventListener("deviceorientation", handleDeviceMotion, true);
  listenerAttached = false;
}

async function requestIOSPermission() {
  const perm = DeviceMotionEvent?.requestPermission;
  if (typeof perm !== "function") {
    attachDeviceMotion();
    return;
  }

  try {
    const response = await perm();
    if (response === "granted") {
      attachDeviceMotion();
    } else {
      usingPointerFallback = true;
      showToast("Motion denied. Using pointer.");
      attachPointerFallback();
    }
  } catch (err) {
    console.error("Permission error", err);
    usingPointerFallback = true;
    showToast("Motion error. Using pointer.");
    attachPointerFallback();
  }
}

function attachPointerFallback() {
  if (!card) return;
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const offsetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    applyTilt(offsetX * config.maxTilt, offsetY * config.maxTilt);
  });
  card.addEventListener("pointerleave", () => applyTilt(0, 0));
}

function swapLayers() {
  if (!card) return;
  swapped = !swapped;
  const front = card.querySelector(".layer-front");
  const back = card.querySelector(".layer-back");
  if (front && back) {
    const frontImg = front.style.backgroundImage;
    front.style.backgroundImage = back.style.backgroundImage;
    back.style.backgroundImage = frontImg;
  }
  showToast(swapped ? "Layers swapped" : "Layers reset");
}

function init() {
  enableMotionBtn?.addEventListener("click", requestIOSPermission);
  swapBtn?.addEventListener("click", swapLayers);
  if (card) {
    card.dataset.side = currentSide;
  }

  // If not on iOS Safari, start pointer immediately for desktop preview.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (!isIOS && !("DeviceOrientationEvent" in window)) {
    usingPointerFallback = true;
    attachPointerFallback();
  }

  // Subtle idle motion
  let t = 0;
  const idle = () => {
    if (!listenerAttached && !usingPointerFallback) {
      const wobbleX = Math.sin(t) * 2;
      const wobbleY = Math.cos(t * 0.8) * 2;
      applyTilt(wobbleX, wobbleY);
      t += 0.05;
    }
    requestAnimationFrame(idle);
  };
  idle();
}

init();

