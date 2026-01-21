const THUMB_TIP = 4;
const THUMB_IP = 3;
const INDEX_TIP = 8;
const INDEX_PIP = 6;
const INDEX_MCP = 5;
const MIDDLE_TIP = 12;
const MIDDLE_PIP = 10;
const MIDDLE_MCP = 9;
const RING_MCP = 13;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_TIP = 20;
const PINKY_PIP = 18;
const WRIST = 0;
const PINKY_MCP = 17;
const CHIN = 152;
const MOUTH_TOP = 13;
const MOUTH_BOTTOM = 14;

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function handScale(hand) {
  return distance(hand[INDEX_MCP], hand[PINKY_MCP]) || 0.1;
}

function fingerExtended(hand, tipIndex, pipIndex, scale, distanceFactor) {
  const tipAbovePip = hand[tipIndex].y < hand[pipIndex].y;
  const tipFarFromWrist = distance(hand[tipIndex], hand[WRIST]) > scale * distanceFactor;
  return tipAbovePip && tipFarFromWrist;
}

function fingerFolded(hand, tipIndex, scale, distanceFactor) {
  return distance(hand[tipIndex], hand[WRIST]) < scale * distanceFactor;
}

function fingerAngle(hand, mcpIndex, pipIndex, tipIndex) {
  const mcp = hand[mcpIndex];
  const pip = hand[pipIndex];
  const tip = hand[tipIndex];
  const v1x = mcp.x - pip.x;
  const v1y = mcp.y - pip.y;
  const v2x = tip.x - pip.x;
  const v2y = tip.y - pip.y;
  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.hypot(v1x, v1y);
  const mag2 = Math.hypot(v2x, v2y);
  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }
  const cosine = Math.min(Math.max(dot / (mag1 * mag2), -1), 1);
  return Math.acos(cosine) * (180 / Math.PI);
}

function isThumbsUp(hand) {
  const scale = handScale(hand);
  const thumbExtended = fingerExtended(hand, THUMB_TIP, THUMB_IP, scale, 0.75);

  const foldedThreshold = scale * 0.9;
  const indexFolded = fingerFolded(hand, INDEX_TIP, scale, 0.9);
  const middleFolded = fingerFolded(hand, MIDDLE_TIP, scale, 0.9);
  const ringFolded = fingerFolded(hand, RING_TIP, scale, 0.9);
  const pinkyFolded = fingerFolded(hand, PINKY_TIP, scale, 0.9);

  return thumbExtended && indexFolded && middleFolded && ringFolded && pinkyFolded;
}

function isIndexFinger(hand) {
  const scale = handScale(hand);
  const indexAngle = fingerAngle(hand, INDEX_MCP, INDEX_PIP, INDEX_TIP);
  const indexExtended = fingerExtended(hand, INDEX_TIP, INDEX_PIP, scale, 0.55) &&
    indexAngle > 160;

  const middleAngle = fingerAngle(hand, MIDDLE_MCP, MIDDLE_PIP, MIDDLE_TIP);
  const ringAngle = fingerAngle(hand, RING_MCP, RING_PIP, RING_TIP);
  const pinkyAngle = fingerAngle(hand, PINKY_MCP, PINKY_PIP, PINKY_TIP);

  const middleFolded = middleAngle < 135 || fingerFolded(hand, MIDDLE_TIP, scale, 1.1);
  const ringFolded = ringAngle < 135 || fingerFolded(hand, RING_TIP, scale, 1.1);
  const pinkyFolded = pinkyAngle < 135 || fingerFolded(hand, PINKY_TIP, scale, 1.1);

  return indexExtended && middleFolded && ringFolded && pinkyFolded;
}

function isPunch(hand) {
  const scale = handScale(hand);
  const indexFolded = fingerFolded(hand, INDEX_TIP, scale, 0.85);
  const middleFolded = fingerFolded(hand, MIDDLE_TIP, scale, 0.85);
  const ringFolded = fingerFolded(hand, RING_TIP, scale, 0.85);
  const pinkyFolded = fingerFolded(hand, PINKY_TIP, scale, 0.85);
  return indexFolded && middleFolded && ringFolded && pinkyFolded;
}

function isMiddleFinger(hand) {
  const scale = handScale(hand);
  const middleAngle = fingerAngle(hand, MIDDLE_MCP, MIDDLE_PIP, MIDDLE_TIP);
  const middleExtended = fingerExtended(hand, MIDDLE_TIP, MIDDLE_PIP, scale, 0.55) &&
    middleAngle > 160;

  const indexAngle = fingerAngle(hand, INDEX_MCP, INDEX_PIP, INDEX_TIP);
  const ringAngle = fingerAngle(hand, RING_MCP, RING_PIP, RING_TIP);
  const pinkyAngle = fingerAngle(hand, PINKY_MCP, PINKY_PIP, PINKY_TIP);

  const indexFolded = indexAngle < 135 || fingerFolded(hand, INDEX_TIP, scale, 1.1);
  const ringFolded = ringAngle < 135 || fingerFolded(hand, RING_TIP, scale, 1.1);
  const pinkyFolded = pinkyAngle < 135 || fingerFolded(hand, PINKY_TIP, scale, 1.1);

  return middleExtended && indexFolded && ringFolded && pinkyFolded;
}

function isHandsClasped(handA, handB) {
  const centerA = { x: (handA[WRIST].x + handA[MIDDLE_MCP].x) / 2, y: (handA[WRIST].y + handA[MIDDLE_MCP].y) / 2 };
  const centerB = { x: (handB[WRIST].x + handB[MIDDLE_MCP].x) / 2, y: (handB[WRIST].y + handB[MIDDLE_MCP].y) / 2 };
  return distance(centerA, centerB) < 0.12;
}

function isIndexClasped(handA, handB) {
  return distance(handA[INDEX_TIP], handB[INDEX_TIP]) < 0.08;
}

function isChinRest(hand, faceLandmarks) {
  if (!faceLandmarks) {
    return false;
  }
  const chin = faceLandmarks[CHIN];
  const handCenter = {
    x: (hand[WRIST].x + hand[MIDDLE_MCP].x) / 2,
    y: (hand[WRIST].y + hand[MIDDLE_MCP].y) / 2,
  };
  return distance(handCenter, chin) < 0.08;
}

function isRaisedArm(hand, faceLandmarks) {
  if (!faceLandmarks) {
    return false;
  }
  const chin = faceLandmarks[CHIN];
  const shoulderLineY = Math.min(chin.y + 0.12, 0.95);
  return hand[WRIST].y < shoulderLineY && hand[MIDDLE_MCP].y < shoulderLineY;
}

function isHandNearMouth(hand, faceLandmarks) {
  if (!faceLandmarks) {
    return false;
  }
  const mouthCenter = {
    x: (faceLandmarks[MOUTH_TOP].x + faceLandmarks[MOUTH_BOTTOM].x) / 2,
    y: (faceLandmarks[MOUTH_TOP].y + faceLandmarks[MOUTH_BOTTOM].y) / 2,
  };
  const candidates = [
    hand[WRIST],
    hand[THUMB_TIP],
    hand[INDEX_TIP],
    hand[MIDDLE_TIP],
    hand[RING_TIP],
    hand[PINKY_TIP],
  ];
  const minDistance = Math.min(...candidates.map((point) => distance(point, mouthCenter)));
  return minDistance < 0.14;
}

export function createHands({ onResults }) {
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  hands.onResults(onResults);
  return hands;
}

export function detectHandStates(handLandmarks, faceLandmarks) {
  const hands = handLandmarks || [];
  const hasHands = hands.length > 0;

  let gesture = "none";
  let arms = "none";
  let handNearMouth = false;
  let handsClasped = false;
  let handsClaspedIndex = false;

  if (hands.length >= 2) {
    handsClasped = isHandsClasped(hands[0], hands[1]);
    handsClaspedIndex = isIndexClasped(hands[0], hands[1]);
  }

  if (hasHands) {
    for (const hand of hands) {
      if (isChinRest(hand, faceLandmarks)) {
        gesture = "chin_rest";
        break;
      }
    }

    if (gesture === "none") {
      for (const hand of hands) {
        if (isMiddleFinger(hand)) {
          gesture = "middle_finger";
          break;
        }
      }
    }

    if (gesture === "none") {
      const thumbsUpCount = hands.filter((hand) => isThumbsUp(hand)).length;
      if (thumbsUpCount >= 2) {
        gesture = "double_thumbs";
      } else if (thumbsUpCount === 1) {
        gesture = "thumbs_up";
      }
    }

    if (gesture === "none") {
      for (const hand of hands) {
        if (isIndexFinger(hand)) {
          gesture = "index_finger";
          break;
        }
      }
    }

    if (gesture === "none") {
      for (const hand of hands) {
        if (isPunch(hand)) {
          gesture = "punch";
          break;
        }
      }
    }

    for (const hand of hands) {
      if (isHandNearMouth(hand, faceLandmarks)) {
        handNearMouth = true;
        break;
      }
    }

    const raisedCount = hands.filter((hand) => isRaisedArm(hand, faceLandmarks)).length;
    if (raisedCount >= 2) {
      arms = "both";
    } else if (raisedCount === 1) {
      arms = "one";
    }
  }

  return {
    gesture,
    arms,
    handNearMouth,
    handsClasped,
    handsClaspedIndex,
  };
}
