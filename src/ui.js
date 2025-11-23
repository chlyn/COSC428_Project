// ------- RUN/REPLAY BUTTON ------- //
export function wireRunButton(runBtn, pauseBtn, algoSelect, runAlgorithm, animator, onStatsReady) {
  
  const runImg = runBtn.querySelector("img");
  const RUN_SRC = "assets/buttons/run.png";
  
  // Track the Run button state, initially set it to run
  if (!runBtn.dataset.mode) {
    if (onStatsReady) onStatsReady(null);
    runBtn.dataset.mode = "run";
    runImg.src = RUN_SRC;
    runImg.alt = "Run";
  }
  
  // Click handler entry for run 
  runBtn.addEventListener("click", () => {

    // Grab the algorithm and current Run/Replay button state
    const algorithm = algoSelect.value;
    const mode = runBtn.dataset.mode || "run";

    // When no algorithm selected then do nothing
    if (!algorithm) {
      alert("Please select an algorithm first.");
      return;
    }

    // When animation is paused then resume
    if (animator.isRunning && animator.isPaused) {

      // Resume the animation using toggle
      const nowPaused = animator.togglePause();   

      // If animation is unpaused then enable Pause button again
      if (!nowPaused) {
        pauseBtn.disabled = false;              
      }
      return;

    }

    // When animation is not paused but still selected run then start a NEW run
    if (animator.isRunning && !animator.isPaused) {
      
      // Start over stats
      if (onStatsReady) onStatsReady(null);

      const result = runAlgorithm(algorithm);

      // If no path exists then send an alert
      if (!result || !result.path) {
        alert("No path found.");
        return;
      }

      // Store the stats and start a new run
      animator.pendingStats = result.stats;
      animator.startAnimation(result.explored, result.path);

      // Enable Pause button again since were running again
      pauseBtn.disabled = false;
      return;
    }

    // When animation is completed then replay
    if (mode === "replay") {

      // Start over stats
      if (onStatsReady) onStatsReady(null);

      // Grab the algorithm and current Run/Replay button state
      const algorithm = algoSelect.value;
      const result = runAlgorithm(algorithm);

      // If no path exists then send an alert
      if (!result.path) {
        alert("No path found.");
        return;
      }

      // Store the stats and start a new run
      animator.pendingStats = result.stats;
      animator.startAnimation(result.explored, result.path);

      // Switch back to normal run mode
      runBtn.dataset.mode = "run";
      runImg.src = RUN_SRC;
      runImg.alt = "Run";

      // Enable Pause button again since were running again
      pauseBtn.disabled = false;
      return;
    }

    // Fresh run (not running, not pause, not replay)
    // Start stats
    if (onStatsReady) onStatsReady(null);

    const result = runAlgorithm(algorithm);

    // If no path exists then send an alert
    if (!result || !result.path) {
      alert("No path found.");
      return;
    }

    // Store the stats and start a new run
    animator.pendingStats = result.stats;
    animator.startAnimation(result.explored, result.path);

    // Enable Pause button during run
    pauseBtn.disabled = false;

  });
}


// ------- PAUSE BUTTON ------- //
export function wirePauseButton(pauseBtn, animator) {

  // Click handler entry for run
  pauseBtn.addEventListener("click", () => {
    
    // Ignore clicks when Pause button is disabled
    if (pauseBtn.disabled) return;
    
    const nowPaused = animator.togglePause();

    // When animation becomes paused then disable the Pause button
    if (nowPaused) {
      pauseBtn.disabled = true;
    }

  });
}


// ------- DESKTOP CLOCK (TIME & DATE) ------- //
export function startDesktopClock(dateEl, timeEl) {
  
  // Update date and time
  function updateDateTime() {

    // Get the current systme date & time 
    const now = new Date();

    // Format date and time 
    const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
    const month = now.toLocaleDateString("en-US", { month: "short" });
    const day = now.getDate();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Write date and time values into desktop
    dateEl.textContent = `${weekday} ${month} ${day}`;
    timeEl.textContent = time;
  }

  // Update date and time on page every second
  updateDateTime();
  setInterval(updateDateTime, 1000);

}


// ------- UPDATE DROPDOWN IMAGE ------- //
export function updateAlgoSelectImg(algoIconEl, algoValue) {

  // By default show "select an algorithm" image
  if (!algoValue) {
    algoIconEl.src = "assets/buttons/select.png";
    algoIconEl.alt = "Select algorithm";
    return;
  }

  // Mapping the algorithms with images and alt
  const IMAGES = {
    dijkstra: {
      src: "assets/buttons/dijkstra.png",
      alt: "Dijkstra algorithm selected"
    },
    bellmanford: {
      src: "assets/buttons/bellmanford.png",
      alt: "Bellman-Ford algorithm selected"
    }
  };

  // Store image and alt
  const image = IMAGES[algoValue];

  // Apply image once found, if not then stick with default
  if (image) {
    algoIconEl.src = image.src;
    algoIconEl.alt = image.alt;
  } 
  else {
    algoIconEl.src = "assets/buttons/select.png";
    algoIconEl.alt = "Select algorithm";
  }

}


// ------- UPDATE COMPLEXITY STATS (TIME & SPACE) ------- //
export function updateComplexityUI(timeValEl, spaceValEl, algo) {
  
  // Mapping the algorithms with time and space complexities
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

  // Store time and space complexity
  const c = COMPLEXITIES[algo];
  
  // If not algorithm is chosen then show default placeholders
  if (!c) {
    timeValEl.textContent = "—";
    spaceValEl.textContent = "—";
    return;
  }

  // Update complexity stats
  timeValEl.textContent = c.time;
  spaceValEl.textContent = c.space;
  
}