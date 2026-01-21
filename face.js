const LEFT_EYE = {
  inner: 133,
  outer: 33,
  top: 159,
  bottom: 145,
};

const RIGHT_EYE = {
  inner: 362,
  outer: 263,
  top: 386,
  bottom: 374,
};

const MOUTH = {
  left: 78,
  right: 308,
  top: 13,
  bottom: 14,
};

const EYEBROW = {
  left: 105,
  right: 334,
};

const NOSE_TIP = 1;
const CHIN = 152;
const FOREHEAD = 10;

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function createFaceMesh({ onResults }) {
  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  faceMesh.onResults(onResults);
  return faceMesh;
}

export function extractFaceFeatures(landmarks) {
  const leftEyeOpen = distance(landmarks[LEFT_EYE.top], landmarks[LEFT_EYE.bottom]);
  const leftEyeWidth = distance(landmarks[LEFT_EYE.inner], landmarks[LEFT_EYE.outer]);
  const rightEyeOpen = distance(landmarks[RIGHT_EYE.top], landmarks[RIGHT_EYE.bottom]);
  const rightEyeWidth = distance(landmarks[RIGHT_EYE.inner], landmarks[RIGHT_EYE.outer]);

  const eyeOpenRatio = (leftEyeOpen / leftEyeWidth + rightEyeOpen / rightEyeWidth) / 2;

  const mouthOpen = distance(landmarks[MOUTH.top], landmarks[MOUTH.bottom]);
  const mouthWidth = distance(landmarks[MOUTH.left], landmarks[MOUTH.right]);
  const mouthOpenRatio = mouthOpen / mouthWidth;

  const leftBrowRaise = distance(landmarks[EYEBROW.left], landmarks[LEFT_EYE.top]);
  const rightBrowRaise = distance(landmarks[EYEBROW.right], landmarks[RIGHT_EYE.top]);
  const eyebrowRaise = (leftBrowRaise + rightBrowRaise) / 2;

  const leftEyeCenter = {
    x: (landmarks[LEFT_EYE.inner].x + landmarks[LEFT_EYE.outer].x) / 2,
    y: (landmarks[LEFT_EYE.inner].y + landmarks[LEFT_EYE.outer].y) / 2,
  };
  const rightEyeCenter = {
    x: (landmarks[RIGHT_EYE.inner].x + landmarks[RIGHT_EYE.outer].x) / 2,
    y: (landmarks[RIGHT_EYE.inner].y + landmarks[RIGHT_EYE.outer].y) / 2,
  };

  const eyeLineDx = rightEyeCenter.x - leftEyeCenter.x;
  const eyeLineDy = rightEyeCenter.y - leftEyeCenter.y;
  const roll = Math.atan2(eyeLineDy, eyeLineDx);

  const eyeMid = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
  };

  const nose = landmarks[NOSE_TIP];
  const yaw = (nose.x - eyeMid.x) / Math.abs(eyeLineDx || 1);
  const pitch = (nose.y - eyeMid.y) / (landmarks[CHIN].y - landmarks[FOREHEAD].y || 1);

  return {
    mouthOpenRatio,
    eyeOpenRatio,
    eyebrowRaise,
    head: {
      yaw,
      pitch,
      roll,
    },
  };
}
