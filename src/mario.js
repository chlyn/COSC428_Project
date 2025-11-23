// ------- VARIABLES ------- //

// Current frame Mario is displaying and a timer when to switch frames
export let marioFrameIndex = 0;
export let marioFrameTick = 0;

// Counts number or frames and speed each frame changes
export const MARIO_FRAMES = 3;
export const MARIO_FRAME_SPEED = 4;
export const JUMP_FRAMES = 2;

// Loading sprite images of Mario running
export const marioSheet = new Image();
marioSheet.src = "./assets/mario-sprite-sheets/mario.png";
export let marioReady = false;
marioSheet.onload = () => marioReady = true;

// Loading sprite images of Mario celebrating/jumping
export const marioJumpSheet = new Image();
marioJumpSheet.src = "./assets/mario-sprite-sheets/mario-fire.png";
export let marioJumpReady = false;
marioJumpSheet.onload = () => marioJumpReady = true;

// RESET function for celebration
export function resetMarioFrames() {
  marioFrameIndex = 0;
  marioFrameTick = 0;
}

// Helper to draw mario on canvas
export function drawMario(ctx, sheet, frame, x, y, size) {
  const frames = (sheet === marioJumpSheet) ? JUMP_FRAMES : MARIO_FRAMES;
  const frameWidth = sheet.width / frames;

  ctx.drawImage(
    sheet,
    frame * frameWidth, 0,
    frameWidth, sheet.height,
    x, y, size, size
  );
}

// Animating Mario running
export function advanceMarioFrames(totalFrames) {
  marioFrameTick++;

  if (marioFrameTick >= MARIO_FRAME_SPEED) {
    marioFrameTick = 0;
    marioFrameIndex = (marioFrameIndex + 1) % totalFrames;
  }

  return marioFrameIndex;
}

// Animating Mario celebrating/jumping
export function advanceMarioFramesOnce(totalFrames) {
  marioFrameTick++;

  if (marioFrameTick >= MARIO_FRAME_SPEED) {
    marioFrameTick = 0;

    if (marioFrameIndex < totalFrames - 1) {
      marioFrameIndex++;
    }
  }

  return marioFrameIndex;
}
