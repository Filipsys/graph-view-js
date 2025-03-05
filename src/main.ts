interface Element {
  x: number;
  y: number;
  radius: number;
  tags?: Set<string>;
}

const canvas = document.querySelector<HTMLCanvasElement>("#app");
if (!canvas) throw new Error("Canvas element not found.");

const context = canvas.getContext("2d");
if (!context) throw new Error("Context not found.");

const FRAMERATE = 5;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const canvasColor = "#fff";
const elementColor = "#000";
const pathColor = "#000";

let previousTimestamp = 0;
let timeElapsed = 0;
let canvasElements = new Set<Element>();
let pathConnections = new Set<{ x1: number; y1: number; x2: number; y2: number }>();

const drawPath = (x1: number, y1: number, x2: number, y2: number) => {
  context.strokeStyle = pathColor;

  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.closePath();
  context.stroke();
};

const draw = () => {
  context.fillStyle = canvasColor;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  console.log("Cleared canvas");

  // Draw the elements
  context.fillStyle = elementColor;
  canvasElements.forEach((element) => {
    context.beginPath();
    context.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
    context.closePath();
    context.fill();
  });

  // pathConnections.forEach((path) => drawPath);
};

const update = () => {
  canvasElements.forEach((element) => {
    canvasElements.forEach((loopedElement) => {
      if (element === loopedElement) return;
      if (!element.tags || !loopedElement.tags) return;

      if (element.tags.intersection(loopedElement.tags)) {
        pathConnections.add({ x1: element.x, y1: element.y, x2: loopedElement.x, y2: loopedElement.y });
      }
    });
  });
};

const animationLoop = (timestamp: number) => {
  const difference = timestamp - previousTimestamp;
  timeElapsed += difference;

  if (difference >= 1000 / FRAMERATE) {
    previousTimestamp = timestamp;

    update();
    draw();
  }

  window.requestAnimationFrame(animationLoop);
};

window.requestAnimationFrame(animationLoop);

canvas.addEventListener("click", (event) => {
  canvasElements.add({ x: event.clientX, y: event.clientY, radius: 5, tags: new Set(["tag1"]) });
});
