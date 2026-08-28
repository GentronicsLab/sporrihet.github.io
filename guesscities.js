// ─── City data ───────────────────────────────────────────────────────────────
// Coordinates are expressed as fractions of the BASE canvas size (800 × 600).
// At runtime they are multiplied by the canvas's actual pixel size so text
// always lands in the right place regardless of screen size.

const BASE_W = 800;
const BASE_H = 600;

var cities = [
  { name: "Peja",               x: 70,  y: 220 },
  { name: "Prishtina",          x: 350, y: 210 },
  { name: "Gjakova",            x: 80, y: 310 },
  { name: "Deqan",              x: 50,  y: 250 },
  { name: "Istog",              x: 130, y: 180 },
  { name: "Ferizaj",            x: 320, y: 320 },
  { name: "Gjilan",             x: 420, y: 290 },
  { name: "Viti",               x: 400, y: 350 },
  { name: "Mitrovica",          x: 260, y: 105 },
  { name: "Drenas",             x: 230, y: 230 },
  { name: "Skenderaj",          x: 195, y: 190 },
  { name: "Dragash",            x: 180, y: 445 },
  { name: "Hani i elezit",      x: 350, y: 400 },
  { name: "Prizren",            x: 190, y: 370 },
  { name: "Junik",              x: 50,  y: 280 },
  { name: "Kaqanik",            x: 350, y: 370 },
  { name: "Kamenica",           x: 468, y: 225 },
  { name: "Klina",              x: 160, y: 233 },
  { name: "Kllokot",            x: 400, y: 330 },
  { name: "Fushe kosova",       x: 295, y: 230 },
  { name: "Lipjan",             x: 295, y: 270 },
  { name: "Leposaviq",          x: 210, y: 65  },
  { name: "Graqanica",          x: 305, y: 250 },
  { name: "Malisheva",          x: 195, y: 270 },
  { name: "Mamusha",            x: 185, y: 340 },
  { name: "Novoberda",          x: 400, y: 250 },
  { name: "Obiliq",             x: 290, y: 210 },
  { name: "Partesh",            x: 430, y: 310 },
  { name: "Rahovec",            x: 160, y: 310 },
  { name: "Podujeva",           x: 350, y: 150 },
  { name: "Ranillug",           x: 470, y: 275 },
  { name: "Zveqan",             x: 225, y: 120 },
  { name: "Zubin potok",        x: 150, y: 130 },
  { name: "Vushtrri",           x: 265, y: 170 },
  { name: "Suhareka",           x: 220, y: 325 },
  { name: "Shtime",             x: 290, y: 295 },
  { name: "Shterpca",           x: 275, y: 370 },
  // 37 total
];

// ─── Canvas setup ─────────────────────────────────────────────────────────────

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// The canvas internal resolution always matches BASE size.
// CSS makes it visually fill its container, and we scale coordinates at draw time.
canvas.width  = BASE_W;
canvas.height = BASE_H;

// ─── Scale helper ─────────────────────────────────────────────────────────────
// Returns {scaleX, scaleY} — ratio of canvas's CSS display size to its internal resolution.
// When the canvas is displayed at full 800 px wide both values are 1.
// On a 375 px phone the container is ~375 px wide, so scaleX ≈ 0.47.

function getScale() {
  var rect = canvas.getBoundingClientRect();
  return {
    x: rect.width  / BASE_W,
    y: rect.height / BASE_H,
  };
}

// ─── Font size ────────────────────────────────────────────────────────────────
// Pick a font size that stays legible at any scale: base 13 px in internal coords,
// clamped so it doesn't go tiny on phones or huge on large monitors.

function setFont() {
  var scale = getScale();
  // 13 internal px → CSS px
  var cssPx = Math.round(13 * scale.x);
  // clamp between 9 and 20 CSS px
  cssPx = Math.min(20, Math.max(9, cssPx));
  // Convert back to internal-resolution px for ctx.font
  var internalPx = Math.round(cssPx / scale.x);
  ctx.font = "bold " + internalPx + "px Montserrat, sans-serif";
}

// ─── State ────────────────────────────────────────────────────────────────────

const correctCities = [];
const cityInput = document.querySelector("#city-input");
const cityList  = document.querySelector("#city-list");
const counter   = document.querySelector("#counter");

// ─── Draw ─────────────────────────────────────────────────────────────────────

const drawCities = () => {
  ctx.clearRect(0, 0, BASE_W, BASE_H);
  setFont();
  for (const city of cities) {
    if (correctCities.includes(city.name)) {
      ctx.fillStyle = "#111";
      ctx.fillText(city.name, city.x, city.y);
    } else if (timeRemaining <= 0) {
      ctx.fillStyle = "red";
      ctx.fillText(city.name, city.x, city.y);
    }
  }
};

function displayNotGuessedCities() {
  // On canvas: draw in red
  setFont();
  ctx.fillStyle = "red";
  for (const city of cities) {
    if (!correctCities.includes(city.name)) {
      ctx.fillText(city.name, city.x, city.y);
    }
  }
  // In the side list: list missed cities as text
  for (const city of cities) {
    if (!correctCities.includes(city.name)) {
      const cityItem = document.createElement("p");
      cityItem.style.color = "red";
      cityItem.textContent = city.name;
      cityList.appendChild(cityItem);
    }
  }
}

// Redraw when the window resizes (canvas CSS size changes but internal res stays)
window.addEventListener("resize", () => {
  drawCities();
});

// ─── Clock ────────────────────────────────────────────────────────────────────

let timeRemaining = 300;
const clock = document.querySelector("#clock");

const updateClock = () => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  clock.textContent = `Koha e mbetur: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  clock.style.color = timeRemaining <= 20 ? "red" : "";
};

updateClock();

let countdown;

// ─── Alert / end-game ─────────────────────────────────────────────────────────

function showAlertBox() {
  const alertBox = document.querySelector("#alert-box");
  alertBox.classList.add("visible");   // use class instead of inline style
  clearInterval(countdown);
  cityInput.disabled = true;
  drawCities();
  displayNotGuessedCities();
}

document.querySelector("#play-again-btn").addEventListener("click", () => {
  location.reload();
});

// ─── City checking ────────────────────────────────────────────────────────────

const checkCity = () => {
  const raw = cityInput.value;
  const cityName = raw.charAt(0).toUpperCase() + raw.slice(1);
  for (const city of cities) {
    if (city.name === cityName && !correctCities.includes(cityName)) {
      correctCities.push(cityName);
      cityInput.value = "";
      counter.textContent = `${correctCities.length}/37`;
      drawCities();
      break;
    }
  }
};

function checkWinCondition() {
  if (correctCities.length === cities.length) {
    clearInterval(countdown);
    showWinningMessage();
  }
}

cityInput.addEventListener("input", () => {
  checkCity();
  checkWinCondition();
});

// Start countdown on first keystroke
cityInput.addEventListener("keydown", () => {
  if (!countdown) {
    countdown = setInterval(() => {
      timeRemaining--;
      updateClock();
      if (timeRemaining === 0) {
        clearInterval(countdown);
        showAlertBox();
      }
    }, 1000);
  }
});

// ─── Win message ──────────────────────────────────────────────────────────────

function showWinningMessage() {
  const messageBox = document.createElement("div");
  messageBox.classList.add("message-box");

  const inner = document.createElement("div");
  inner.classList.add("message-text-container");

  const congrats = document.createElement("p");
  congrats.textContent = "Urime!";

  const wonText = document.createElement("p");
  wonText.textContent = "Fitove!";

  const playAgain = document.createElement("button");
  playAgain.textContent = "Luaj perseri";
  playAgain.addEventListener("click", () => location.reload());

  inner.appendChild(congrats);
  inner.appendChild(wonText);
  inner.appendChild(playAgain);
  messageBox.appendChild(inner);
  document.body.appendChild(messageBox);
}

// ─── Intro dialog ─────────────────────────────────────────────────────────────

const dialogBox      = document.getElementById("dialog-box");
const continueButton = document.getElementById("continue-btn");

// Disable all pointer events until user clicks Continue
const elements = document.body.getElementsByTagName("*");
for (let i = 0; i < elements.length; i++) {
  elements[i].style.pointerEvents = "none";
}
continueButton.style.pointerEvents = "auto";

continueButton.addEventListener("click", () => {
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.pointerEvents = "auto";
  }
  dialogBox.style.display = "none";
  cityInput.focus();

  // Start countdown immediately on Continue (so the timer is fair)
  // — or keep the original behaviour of starting on first keypress;
  // either way, remove the duplicate countdown start from here if you prefer.
});

window.addEventListener("DOMContentLoaded", () => {
  cityInput.focus();
});
