export function inferFaceStates(features) {
  const { mouthOpenRatio, eyeOpenRatio, head } = features;
  const pitchOffset = -0.2;
  const adjustedPitch = head.pitch + pitchOffset;

  const mouth = mouthOpenRatio > 0.3 ? "open" : "closed";
  const eyes = eyeOpenRatio < 0.18 ? "closed" : "open";

  let headState = "neutral";
  if (adjustedPitch < -0.03) {
    headState = "up";
  } else if (adjustedPitch > 0.1) {
    headState = "down";
  }

  return {
    mouth,
    eyes,
    head: headState,
  };
}
