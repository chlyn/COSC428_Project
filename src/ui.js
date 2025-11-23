export function wireRunButton(runBtn, pauseBtn, algoSelect, runAlgorithm, animator, onStatsReady) {
  const runImg = runBtn.querySelector("img");
  const RUN_SRC = "assets/buttons/run.png";
  const REPLAY_SRC = "assets/buttons/replay.png";
  
  if (!runBtn.dataset.mode) {
    if (onStatsReady) onStatsReady(null);
    runBtn.dataset.mode = "run";
    runImg.src = RUN_SRC;
    runImg.alt = "Run";
  }
  
  runBtn.addEventListener("click", () => {

    const mode = runBtn.dataset.mode || "run";

    // animation is paused then resume
    if (animator.isRunning && animator.isPaused) {
      const nowPaused = animator.togglePause();   
      if (!nowPaused) {
        pauseBtn.disabled = false;              
      }
      return;
    }

    // animation is not paused then start a NEW run
    const algo = algoSelect.value;
    const result = runAlgorithm(algo);

    if (!result.path) {
      alert("No path found.");
      return;
    }

    // animation is completed then replay
    if (mode === "replay") {

      if (onStatsReady) onStatsReady(null);

      const algo = algoSelect.value;
      const result = runAlgorithm(algo);

      if (!result.path) {
        alert("No path found.");
        return;
      }

      animator.startAnimation(result.explored, result.path);

      // switch back to normal run mode
      runBtn.dataset.mode = "run";
      runImg.src = RUN_SRC;
      runImg.alt = "Run";

      pauseBtn.disabled = false;
      return;
    }

    animator.pendingStats = result.stats;
    animator.startAnimation(result.explored, result.path);

    // enable pause now during run
    pauseBtn.disabled = false;

  });
}

export function wirePauseButton(pauseBtn, animator) {
  pauseBtn.addEventListener("click", () => {
    
    if (pauseBtn.disabled) return;
    
    const nowPaused = animator.togglePause();

    // animation is paused then disable pause
    if (nowPaused) {
      pauseBtn.disabled = true;
    }

  });
}

export function startDesktopClock(dateEl, timeEl) {
  function updateDateTime() {
    const now = new Date();
    const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
    const month = now.toLocaleDateString("en-US", { month: "short" });
    const day = now.getDate();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    dateEl.textContent = `${weekday} ${month} ${day}`;
    timeEl.textContent = time;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
}

export function updateComplexityUI(timeValEl, spaceValEl, algo) {
  const COMPLEXITIES = {
    dijkstra: {
      time: "O(E log V)",
      space: "O(V)"
    },
    bellmanford: {
      time: "O(VE)",
      space: "O(V)"
    }
  };

  const c = COMPLEXITIES[algo];
  if (!c) return;

  timeValEl.textContent = c.time;
  spaceValEl.textContent = c.space;
}
