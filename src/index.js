document.getElementById("spin_the_wheel").style.display = "none";

let sectors = [];
const minSectors = 2; // Minimum sectors required to start

// Add these variables at the top
let ctx;
let dia;
let rad;
let arc;

// Add state management variables at the top
let isSpinning = false;
let currentRotation = 0;

// Add this function to generate random colors using HSL
function getRandomColor() {
  const hue = Math.floor(Math.random() * 360); // Random hue between 0 and 360
  const saturation = Math.floor(Math.random() * 30) + 70; // Saturation between 70% and 100%
  const lightness = Math.floor(Math.random() * 20) + 40; // Lightness between 40% and 60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Add this function to validate the input
function isValidNumber(input) {
  const regex = /^[0-9]+$/;
  return regex.test(input);
}

function updateSectorsList() {
  const list = document.getElementById("sectors-list");
  const startButton = document.getElementById("startGame");

  list.innerHTML = sectors
    .map(
      (sector, index) => `
    <div class="sector-item">
      <div class="sector-color" style="background-color: ${sector.color}"></div>
      <span>${sector.label}</span>
      <button class="delete-sector" onclick="removeSector(${index})">×</button>
    </div>
  `
    )
    .join("");

  startButton.disabled = sectors.length < minSectors;
}

function removeSector(index) {
  sectors.splice(index, 1);
  updateSectorsList();
}

// Modify addSectorForm event listener
document.getElementById("addSectorForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const label = document.getElementById("prizeInput").value;

  if (!isValidNumber(label)) {
    alert("Please enter a valid number.");
    return;
  }

  sectors.push({
    color: getRandomColor(),
    text: "#333333",
    label: label,
  });

  document.getElementById("prizeInput").value = "";
  updateSectorsList();
});

// Handle start game
document.getElementById("startGame").addEventListener("click", () => {
  document.querySelector(".input-section").style.display = "none";
  const wheelEl = document.getElementById("spin_the_wheel");
  wheelEl.style.display = "block";

  // Initialize canvas context and dimensions
  const canvas = document.getElementById("wheel");
  ctx = canvas.getContext("2d");
  dia = ctx.canvas.width;
  rad = dia / 2;
  arc = TAU / sectors.length;

  // Clear and draw initial wheel
  ctx.clearRect(0, 0, dia, dia);
  sectors.forEach((sector, i) => drawSector(sector, i));
  rotate();
  engine();
});

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = () => sectors.length;

const spinEl = document.querySelector("#spin");
const PI = Math.PI;
const TAU = 2 * PI;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;

const getIndex = () => Math.floor(tot() - (ang / TAU) * tot()) % tot();

// Update drawSector function to include decorative elements
function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // Draw sector
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // Draw text
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = "#333333";
  ctx.font = "bold 30px 'Lato', sans-serif";
  ctx.fillText(sector.label, rad - 50, 10);

  // Draw decorative elements
  ctx.rotate(-arc / 2);
  ctx.textAlign = "center";
  ctx.font = "20px 'Lato', sans-serif";
  ctx.fillStyle = "#ff69b4"; // Pink color for romantic symbols
  ctx.fillText("❤", rad - 100, 10); // Heart symbol
  ctx.fillText("🌹", rad - 150, 10); // Rose symbol

  ctx.restore();
}

// Update rotate function to rotate the drawing context
function rotate() {
  ctx.clearRect(0, 0, dia, dia);
  ctx.save();
  ctx.translate(rad, rad);
  ctx.rotate(ang);
  ctx.translate(-rad, -rad);
  sectors.forEach((sector, i) => drawSector(sector, i));
  ctx.restore();
}

// Update the frame function to reset spinning state
function frame() {
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false;
    isSpinning = false;

    // Store final rotation
    currentRotation = ang - PI / 2;

    // Reset for next spin
    resetWheel();
    return;
  }

  angVel *= friction;
  if (angVel < 0.002) {
    angVel = 0;
  }

  ang += angVel;
  ang %= TAU;
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

// Update the init function to handle spin state
function init() {
  spinEl.addEventListener("click", () => {
    if (!isSpinning && sectors.length >= minSectors) {
      // Reset for new spin
      angVel = rand(0.25, 0.45);
      spinButtonClicked = true;
      isSpinning = true;

      // Disable spin button during spin
      spinEl.style.pointerEvents = "none";
    }
  });
}

// Add cleanup function
function resetWheel() {
  angVel = 0;
  isSpinning = false;
  spinButtonClicked = false;
  spinEl.style.pointerEvents = "auto";
  spinEl.textContent = "SPIN";
}

init();

// Get the modal
const modal = document.getElementById("resultModal");
const resultText = document.getElementById("resultText");
const closeModal = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
closeModal.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// events.addListener("spinEnd", (sector) => {
//   console.log(`Woop! You won ${sector.label}`);
//   resultText.textContent = `Ghê chưa bé húp được ${sector.label}`;
//   modal.style.display = "block";
// });
