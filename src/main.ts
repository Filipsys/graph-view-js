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

const FRAMERATE = 10;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const canvasColor = "#fff";
const elementColor = "#000";
const pathColor = "#000";

let previousTimestamp = 0;
let timeElapsed = 0;
let canvasElements = new Set<Element>();
let pathConnections = new Set<{ x1: number; y1: number; x2: number; y2: number }>();
let tagData = new Set<{ name: string; color: string }>();
let elementsChanged = false;

const createRandomHSL = () => {
  return `hsl(${Math.round(Math.random() * 360 + 1)}, ${(Math.random() * 100).toFixed(2)}%, ${(
    Math.random() * 100
  ).toFixed(2)}%)`;
};

/**
 * @description Returns the HSL value for the highest
 * tag value in tagData from the element, else returns `#000`.
 */
const getColorFromTags = (tags: Set<string>) => {
  const tagColors = Array.from(tagData).map((tag) => {
    return { [tag.name]: tag.color };
  });

  let highestColor = "";
  tags.forEach((tag: string) => {
    const matchingTag = tagColors.find((tagItem) => Object.keys(tagItem)[0] === tag);

    if (matchingTag) highestColor = matchingTag[tag];
  });

  return highestColor ? highestColor : "#000";
};

const draw = () => {
  const startTime = performance.now();

  // Clear the canvas
  context.fillStyle = canvasColor;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw the elements
  context.fillStyle = elementColor;
  canvasElements.forEach((element) => {
    if (element.tags) context.fillStyle = getColorFromTags(element.tags);

    context.beginPath();
    context.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
    context.closePath();
    context.fill();
  });

  // Draw the paths
  context.strokeStyle = pathColor;
  pathConnections.forEach((path) => {
    context.beginPath();
    context.moveTo(path.x1, path.y1);
    context.lineTo(path.x2, path.y2);
    context.closePath();
    context.stroke();
  });

  console.debug("Draw function took ", (performance.now() - startTime).toFixed(2), "ms");
};

const update = () => {
  if (!elementsChanged) return;
  const startTime = performance.now();

  canvasElements.forEach((element) => {
    canvasElements.forEach((loopedElement) => {
      if (element === loopedElement) return;
      if (!element.tags || !loopedElement.tags) return;
      if (!element.tags.intersection(loopedElement.tags)) return;

      // I'm not sure why this code generates more paths than necessary,
      // I think it may be because it's adding paths that are reversed.
      pathConnections.add({ x1: element.x, y1: element.y, x2: loopedElement.x, y2: loopedElement.y });
      console.log(pathConnections);
    });
  });

  elementsChanged = false;
  console.debug("Update function took ", (performance.now() - startTime).toFixed(2), "ms");
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

// ---

tagData.add({ name: "tag1", color: createRandomHSL() });
tagData.add({ name: "tag2", color: createRandomHSL() });
console.log(getColorFromTags(new Set(["tag1", "tag2"])));

canvas.addEventListener("click", (event) => {
  canvasElements.add({ x: event.clientX, y: event.clientY, radius: 5, tags: new Set(["tag1", "tag2"]) });

  elementsChanged = true;
});
