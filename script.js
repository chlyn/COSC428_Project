const canvas = document.getElementById("graphCanvas");
const container = document.getElementById("graph-container");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Placeholder background (you will replace this with your maze)
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "18px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("Graph renders here", canvas.width / 2, canvas.height / 2);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
