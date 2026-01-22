import { createFaceMesh, extractFaceFeatures } from "./face.js";
import { createHands, detectHandStates } from "./hands.js";
import { inferFaceStates } from "./emotionRules.js";
import { createMemeMatcher } from "./memeMatcher.js";

const videoEl = document.getElementById("video");
const canvasEl = document.getElementById("debug-canvas");
const statusEl = document.getElementById("status");
const emotionEl = document.getElementById("emotion");
const actionEl = document.getElementById("action");
const mouthEl = document.getElementById("mouth");
const eyesEl = document.getElementById("eyes");
const headEl = document.getElementById("head");
const armsEl = document.getElementById("arms");
const handEl = document.getElementById("hand");
const memeEl = document.getElementById("meme");

const canvasCtx = canvasEl.getContext("2d");
const debugEnabled = true;

const stabilityWindowMs = 0;
const eyesClosedDelayMs = 200;

let lastStableTags = ["neutral"];
let candidateTags = ["neutral"];
let candidateSince = performance.now();
let lastChangeTime = 0;

let latestFace = null;
let latestHands = [];
let eyesClosedSince = null;

const memeMatcher = await createMemeMatcher("./pepe.json");
const initialMeme = memeMatcher.pickMeme(["neutral"]);
if (initialMeme) {
  memeEl.src = initialMeme.url;
  memeEl.alt = initialMeme.label || "Pepe meme";
  memeEl.onload = () => memeEl.classList.add("visible");
}

function updateDebugText(faceStates, handStates) {
  emotionEl.textContent = `Face: mouth ${faceStates.mouth}, eyes ${faceStates.eyes}`;
  actionEl.textContent = `Hand: ${handStates.gesture}`;
  mouthEl.textContent = `Mouth: ${faceStates.mouth}`;
  eyesEl.textContent = `Eyes: ${faceStates.eyes}`;
  headEl.textContent = `Head: ${faceStates.head}`;
  armsEl.textContent = `Arms: ${handStates.arms}`;
  handEl.textContent = `Hand: ${handStates.gesture}`;
}

function tagsEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  const aSorted = [...a].sort();
  const bSorted = [...b].sort();
  return aSorted.every((tag, index) => tag === bSorted[index]);
}

function maybeSwitchMeme(now, tags) {
  if (!tagsEqual(tags, candidateTags)) {
    candidateTags = tags;
    candidateSince = now;
  }

  if (tagsEqual(candidateTags, lastStableTags)) {
    return;
  }

  lastStableTags = candidateTags;
  lastChangeTime = now;

  const meme = memeMatcher.pickMeme(lastStableTags);
  if (meme) {
    memeEl.classList.remove("visible");
    memeEl.onload = () => {
      memeEl.classList.add("visible");
    };
    memeEl.src = meme.url;
    memeEl.alt = meme.label || "Pepe meme";
  }
}

function drawDebug(faceLandmarks, handLandmarks) {
  if (!debugEnabled || !faceLandmarks) {
    return;
  }
  const { width, height } = canvasEl;
  canvasCtx.clearRect(0, 0, width, height);
  canvasCtx.save();
  canvasCtx.fillStyle = "rgba(255,255,255,0.7)";

  for (const point of faceLandmarks) {
    canvasCtx.beginPath();
    canvasCtx.arc(point.x * width, point.y * height, 1.2, 0, Math.PI * 2);
    canvasCtx.fill();
  }

  if (handLandmarks) {
    canvasCtx.fillStyle = "rgba(127,211,169,0.9)";
    for (const hand of handLandmarks) {
      for (const point of hand) {
        canvasCtx.beginPath();
        canvasCtx.arc(point.x * width, point.y * height, 2, 0, Math.PI * 2);
        canvasCtx.fill();
      }
    }
  }

  canvasCtx.restore();
}

function onFrameResults() {
  if (!latestFace) {
    return;
  }

  const now = performance.now();
  const faceFeatures = extractFaceFeatures(latestFace);
  const faceStates = inferFaceStates(faceFeatures);
  if (faceStates.eyes === "closed") {
    if (eyesClosedSince === null) {
      eyesClosedSince = now;
    }
  } else {
    eyesClosedSince = null;
  }
  const handStates = detectHandStates(latestHands, latestFace);

  const tags = new Set();

  if (faceStates.mouth === "open") {
    tags.add("mouth_open");
  } else {
    tags.add("mouth_closed");
  }

  const eyesClosedStable = eyesClosedSince !== null && now - eyesClosedSince >= eyesClosedDelayMs;
  if (eyesClosedStable) {
    tags.add("eyes_closed");
  } else {
    tags.add("eyes_open");
  }

  if (faceStates.head === "up") {
    tags.add("head_up");
  } else if (faceStates.head === "down") {
    tags.add("head_down");
  } else {
    tags.add("head_neutral");
  }

  if (handStates.arms === "both") {
    tags.add("arms_up_two");
  } else if (handStates.arms === "one") {
    tags.add("arms_up_one");
  } else {
    tags.add("arms_none");
  }

  if (handStates.gesture === "chin_rest") {
    tags.add("hand_chin");
  } else if (handStates.gesture === "middle_finger") {
    tags.add("hand_middle_finger");
  } else if (handStates.gesture === "double_thumbs") {
    tags.add("hand_double_thumbs");
  } else if (handStates.gesture === "thumbs_up") {
    tags.add("hand_thumbs_up");
  } else if (handStates.gesture === "index_finger") {
    tags.add("hand_index_finger");
  } else if (handStates.gesture === "punch") {
    tags.add("hand_punch");
  } else {
    tags.add("hand_none");
  }

  if (handStates.handNearMouth) {
    tags.add("hand_near_mouth");
  }

  if (handStates.handsClasped) {
    tags.add("hands_clasped");
  }

  if (handStates.handsClaspedIndex) {
    tags.add("hands_clasped_index");
  }

  const isNeutral = faceStates.mouth === "closed" &&
    faceStates.eyes === "open" &&
    faceStates.head === "neutral" &&
    handStates.arms === "none" &&
    handStates.gesture === "none";

  if (isNeutral) {
    tags.add("neutral");
  }

  const tagList = Array.from(tags);
  updateDebugText(faceStates, handStates);
  maybeSwitchMeme(now, tagList);
  drawDebug(latestFace, latestHands);
}

function setupCanvasSize() {
  const width = videoEl.videoWidth || 640;
  const height = videoEl.videoHeight || 480;
  canvasEl.width = width;
  canvasEl.height = height;
}

async function init() {
  statusEl.textContent = "Starting camera...";
  const faceMesh = createFaceMesh({
    onResults: (results) => {
      latestFace = results.multiFaceLandmarks?.[0] || null;
    },
  });

  const hands = createHands({
    onResults: (results) => {
      latestHands = results.multiHandLandmarks || [];
    },
  });

  const camera = new Camera(videoEl, {
    onFrame: async () => {
      if (videoEl.videoWidth && videoEl.videoHeight) {
        setupCanvasSize();
      }
      await faceMesh.send({ image: videoEl });
      await hands.send({ image: videoEl });
      onFrameResults();
    },
    width: 640,
    height: 480,
  });

  await camera.start();
  statusEl.textContent = "Tracking...";
}

init().catch((error) => {
  console.error(error);
  statusEl.textContent = "Failed to start webcam.";
});
