// Confetti animation utility
const confettiCount = 20;
const sequinCount = 10;

const gravityConfetti = 0.3;
const gravitySequins = 0.55;
const dragConfetti = 0.075;
const dragSequins = 0.02;
const terminalVelocity = 3;

let confetti = [];
let sequins = [];

const colors = [
  { front: '#7b5cff', back: '#6245e0' },
  { front: '#b3c7ff', back: '#8fa5e5' },
  { front: '#5c86ff', back: '#345dd1' }
];

const randomRange = (min, max) => Math.random() * (max - min) + min;

const initConfettoVelocity = (xRange, yRange) => {
  const x = randomRange(xRange[0], xRange[1]);
  const range = yRange[1] - yRange[0] + 1;
  let y = yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range);
  if (y >= yRange[1] - 1) {
    y += (Math.random() < 0.25) ? randomRange(1, 3) : 0;
  }
  return { x: x, y: -y };
};

function Confetto(canvas, button) {
  this.randomModifier = randomRange(0, 99);
  this.color = colors[Math.floor(randomRange(0, colors.length))];
  this.dimensions = {
    x: randomRange(5, 9),
    y: randomRange(8, 15),
  };
  this.position = {
    x: randomRange(canvas.width / 2 - button.offsetWidth / 4, canvas.width / 2 + button.offsetWidth / 4),
    y: randomRange(canvas.height / 2 + button.offsetHeight / 2 + 8, canvas.height / 2 + (1.5 * button.offsetHeight) - 8),
  };
  this.rotation = randomRange(0, 2 * Math.PI);
  this.scale = {
    x: 1,
    y: 1,
  };
  this.velocity = initConfettoVelocity([-9, 9], [6, 11]);
}

Confetto.prototype.update = function () {
  this.velocity.x -= this.velocity.x * dragConfetti;
  this.velocity.y = Math.min(this.velocity.y + gravityConfetti, terminalVelocity);
  this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
};

function Sequin(canvas, button) {
  this.color = colors[Math.floor(randomRange(0, colors.length))].back;
  this.radius = randomRange(1, 2);
  this.position = {
    x: randomRange(canvas.width / 2 - button.offsetWidth / 3, canvas.width / 2 + button.offsetWidth / 3),
    y: randomRange(canvas.height / 2 + button.offsetHeight / 2 + 8, canvas.height / 2 + (1.5 * button.offsetHeight) - 8),
  };
  this.velocity = {
    x: randomRange(-6, 6),
    y: randomRange(-8, -12)
  };
}

Sequin.prototype.update = function () {
  this.velocity.x -= this.velocity.x * dragSequins;
  this.velocity.y = this.velocity.y + gravitySequins;

  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
};

export const initBurst = (canvas, button) => {
  for (let i = 0; i < confettiCount; i++) {
    confetti.push(new Confetto(canvas, button));
  }
  for (let i = 0; i < sequinCount; i++) {
    sequins.push(new Sequin(canvas, button));
  }
};

export const render = (canvas, button) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confetti.forEach((confetto, index) => {
    let width = (confetto.dimensions.x * confetto.scale.x);
    let height = (confetto.dimensions.y * confetto.scale.y);

    ctx.translate(confetto.position.x, confetto.position.y);
    ctx.rotate(confetto.rotation);

    confetto.update();

    ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (confetto.velocity.y < 0) {
      ctx.clearRect(canvas.width / 2 - button.offsetWidth / 2, canvas.height / 2 + button.offsetHeight / 2, button.offsetWidth, button.offsetHeight);
    }
  });

  sequins.forEach((sequin, index) => {
    ctx.translate(sequin.position.x, sequin.position.y);

    sequin.update();

    ctx.fillStyle = sequin.color;

    ctx.beginPath();
    ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (sequin.velocity.y < 0) {
      ctx.clearRect(canvas.width / 2 - button.offsetWidth / 2, canvas.height / 2 + button.offsetHeight / 2, button.offsetWidth, button.offsetHeight);
    }
  });

  confetti.forEach((confetto, index) => {
    if (confetto.position.y >= canvas.height) confetti.splice(index, 1);
  });
  sequins.forEach((sequin, index) => {
    if (sequin.position.y >= canvas.height) sequins.splice(index, 1);
  });

  window.requestAnimationFrame(() => render(canvas, button));
};

export const resetConfetti = () => {
  confetti = [];
  sequins = [];
};
