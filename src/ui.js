
export function wirePauseButton(pauseBtn, animator) {
  pauseBtn.addEventListener("click", () => {
    const paused = animator.togglePause();
    pauseBtn.textContent = paused ? "Resume" : "Pause";
  });
}

export function wireRunButton(runBtn, algoSelect, runAlgorithm, animator, onStatsReady) {
  runBtn.addEventListener("click", () => {
    const algo = algoSelect.value;
    const result = runAlgorithm(algo);

    if (!result.path) {
      alert("No path found.");
      return;
    }

    // hide stats while exploring
    if (onStatsReady) onStatsReady(null);

    animator.pendingStats = result.stats;

    animator.startAnimation(result.explored, result.path);
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
