export function createAnimator({
  ctx,
  drawMaze,
  cellSizeRef,
  marioAssets,
  onShortestPathStart,
}) {
  let animationState = null;
  let isPaused = false;
  let isRunning = false;

  function startAnimation(exploredCells, pathCells) {
    isPaused = false;
    isRunning = true;

    marioAssets.resetMarioFrames();

    animationState = {
      phase: "exploringMaze",
      exploredCells,
      pathCells,
      currentExploreIndex: 0,
      currentPathIndex: 0,
      lastFrameTime: 0,
      exploreDelay: 15,
      pathDelay: 120,
      celebrationStartTime: null,
      celebrationDuration: 1200,
      statsRevealed: false,
    };

    requestAnimationFrame(animationLoop);
  }

  function animationLoop(timestamp) {
    if (!animationState || isPaused) return;

    const state = animationState;
    const timeSinceLastFrame = timestamp - state.lastFrameTime;
    const cellSize = cellSizeRef();

    if (state.phase === "exploringMaze") {
      if (timeSinceLastFrame >= state.exploreDelay) {
        state.lastFrameTime = timestamp;
        drawMaze();

        for (let i = 0; i <= state.currentExploreIndex && i < state.exploredCells.length; i++) {
          const { r, c } = state.exploredCells[i];
          ctx.fillStyle = "rgba(152, 118, 254, 0.88)";
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }

        state.currentExploreIndex++;

        if (state.currentExploreIndex >= state.exploredCells.length) {
          state.phase = "drawingShortestPath";
          state.lastFrameTime = timestamp;

          // console.log("SHORT PATH START");
          if (!state.statsRevealed && typeof onShortestPathStart === "function") {
            state.statsRevealed = true;
            onShortestPathStart();
          }
        }
      }
    }

    else if (state.phase === "drawingShortestPath") {
      if (timeSinceLastFrame >= state.pathDelay) {
        state.lastFrameTime = timestamp;
        drawMaze();

        // keep faint explored shading
        for (const { r, c } of state.exploredCells) {
          ctx.fillStyle = "rgba(140, 100, 255, 0.20)";
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }

        // console.log("READY?", marioAssets.marioReady);
        // console.log("ADV?", typeof marioAssets.advanceMarioFrames);
        // console.log("DRAW?", typeof marioAssets.drawMario);

        const current = state.pathCells[state.currentPathIndex];
        if (current && marioAssets.marioReady) {
          const pixelX = current.c * cellSize;
          const pixelY = current.r * cellSize;
          const drawSize = cellSize * 0.9;
          const drawX = pixelX + (cellSize - drawSize)/2;
          const drawY = pixelY + (cellSize - drawSize)/2;

          const frame = marioAssets.advanceMarioFrames(marioAssets.MARIO_FRAMES);
          marioAssets.drawMario(ctx, marioAssets.marioSheet, frame, drawX, drawY, drawSize);
        }

        state.currentPathIndex++;

        if (state.currentPathIndex >= state.pathCells.length) {
          state.phase = "goalCelebration";
          state.celebrationStartTime = timestamp;
          marioAssets.resetMarioFrames();
          return requestAnimationFrame(animationLoop);
        }
      }
    }

    else if (state.phase === "goalCelebration") {
      drawMaze();

      for (const { r, c } of state.exploredCells) {
        ctx.fillStyle = "rgba(140, 100, 255, 0.20)";
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }

      const goalCell = state.pathCells[state.pathCells.length - 1];
      if (goalCell && marioAssets.marioJumpReady) {
        const pixelX = goalCell.c * cellSize;
        const pixelY = goalCell.r * cellSize;
        const drawSize = cellSize * 0.9;
        const drawX = pixelX + (cellSize - drawSize)/2;
        const drawY = pixelY + (cellSize - drawSize)/2;

        const frame = marioAssets.advanceMarioFramesOnce(marioAssets.JUMP_FRAMES);
        marioAssets.drawMario(ctx, marioAssets.marioJumpSheet, frame, drawX, drawY, drawSize);
      }

      if (timestamp - state.celebrationStartTime >= state.celebrationDuration) {
        isRunning = false;
        animationState = null;
        return;
      }
    }

    requestAnimationFrame(animationLoop);
  }

  function togglePause() {
    if (!isRunning) return isPaused;
    isPaused = !isPaused;
    if (!isPaused && animationState) requestAnimationFrame(animationLoop);
    return isPaused;
  }

  function reset() {
    isPaused = false;
    isRunning = false;
    animationState = null;
  }

  return { startAnimation, togglePause, reset, get isRunning() { return isRunning; } };
}
