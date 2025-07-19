// ✅ Modular and readable CanvasEngine.js with original logic preserved

// ⬇️ Outside class export default CanvasEngine

export default class CanvasEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.showGrid = true;

    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.isPanning = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.dragTarget = null;
    this.onCanvasClick = null; // Callback for canvas clicks
    this.gridSpacing = 20; // ✅ Default spacing
    window.canvasEngine = this; // 👈 expose globally

    this.gridColor = "#444"; // default grid color

    this.startPan = { x: 0, y: 0 };
    this.setupCanvas();

    this.dashOffset = 0; // animation ke liye offset

    this.bindEvents();
    this.draw();
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // ✅ Center origin
    this.offsetX = this.canvas.width / (2 * this.dpr);
    this.offsetY = this.canvas.height / (2 * this.dpr);
  }

  bindEvents() {
    this.canvas.addEventListener("wheel", this.handleZoom.bind(this));
    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
  }

  //add dot for bug improvement and query
  drawDot(x, y, radius, color= "red") {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
    // console.log(color);
  }

  // function to draw a rectangle

  drawRectangle(x1, y1, x2, y2, color) {
    const ctx = this.ctx;
    if (!ctx) return;

    const width = x2 - x1;
    const height = y2 - y1;
    console.log(color);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, width, height);
  }

  setRectangleDrawHandler(onComplete) {
    let isDrawing = false;
    let startX = 0,
      startY = 0;

    this.canvas.onmousedown = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      isDrawing = true;
    };

    this.canvas.onmouseup = (e) => {
      if (!isDrawing) return;
      isDrawing = false;

      const rect = this.canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;

      const xll = Math.min(startX, endX);
      const yll = Math.min(startY, endY);
      const xur = Math.max(startX, endX);
      const yur = Math.max(startY, endY);

      const width = xur - xll;
      const height = yur - yll;

      if (width === 0 || height === 0) {
        // console.warn("Ignored empty rectangle");
        return;
      }

      this.drawRectangle(startX, startY, endX, endY);
      onComplete({ xll, yll, xur, yur });
    };
  }

  // function to clear canvas

  clearCanvas() {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    this.ctx.save();
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.restore();
    this.draw(); // redraw grid and axis
  }

  handleCanvasClick(e) {
    if (this.onCanvasClick) {
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // Transform screen coordinates to world coordinates
      const worldX = (canvasX - this.offsetX) / this.scale;
      const worldY = (canvasY - this.offsetY) / this.scale;

      this.onCanvasClick(worldX, worldY, e);
    }
  }

  setCanvasClickHandler(handler) {
    this.onCanvasClick = handler;
  }

  handleZoom(e) {
    e.preventDefault();
    const zoomFactor = 1.1;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - this.offsetX) / this.scale;
    const worldY = (mouseY - this.offsetY) / this.scale;
    const zoomIn = e.deltaY < 0;
    const scaleChange = zoomIn ? zoomFactor : 1 / zoomFactor;
    const newScale = Math.max(0.001, Math.min(100, this.scale * scaleChange));
    this.offsetX = mouseX - worldX * newScale;
    this.offsetY = mouseY - worldY * newScale;
    this.scale = newScale;
    this.draw();
  }

  drawGrid() {
    const ctx = this.ctx;
    const spacing = this.gridSpacing; // 👈 dynamic value
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    ctx.strokeStyle = this.gridColor || "#444";

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    const startX = -this.offsetX / this.scale;
    const startY = -this.offsetY / this.scale;
    const endX = startX + width / this.scale;
    const endY = startY + height / this.scale;

    const firstX = Math.floor(startX / spacing) * spacing;
    const firstY = Math.floor(startY / spacing) * spacing;

    ctx.beginPath();
    for (let x = firstX; x <= endX; x += spacing) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = firstY; y <= endY; y += spacing) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }

    ctx.lineWidth = 1 / this.scale;
    ctx.stroke();
    ctx.restore();
  }
  setGridSpacing(spacing) {
    this.gridSpacing = spacing;
    this.draw();
  }

  startDrag(e) {
    this.recordState();
    if (!this.selectedObjects?.length) return;

    const x = (e.offsetX - this.offsetX) / this.scale;
    const y = (e.offsetY - this.offsetY) / this.scale;

    // Check if clicked inside any selected object
    for (let obj of this.selectedObjects) {
      const item = obj.ref;
      if (obj.type === "rectangle") {
        if (
          x >= item.x &&
          x <= item.x + item.width &&
          y >= item.y &&
          y <= item.y + item.height
        ) {
          this.dragStart = { x, y };
          this.initialPositions = this.selectedObjects.map((obj) => ({
            id: obj.id,
            type: obj.type,
            startX: obj.ref.x,
            startY: obj.ref.y,
          }));
          this.isDragging = true;
          return;
        }
      } else if (obj.type === "label") {
        const width = this.ctx.measureText(item.text).width;
        const height = item.fontSize;
        if (
          x >= item.x &&
          x <= item.x + width &&
          y <= item.y &&
          y >= item.y - height
        ) {
          if (item.locked) {
            console.log("🔒 Cannot drag locked label");
            return;
          }
          this.dragStart = { x, y };
          this.initialPositions = this.selectedObjects.map((obj) => ({
            id: obj.id,
            type: obj.type,
            startX: obj.ref.x,
            startY: obj.ref.y,
          }));
          this.isDragging = true;
          return;
        }
      }
    }
  }

  performDrag(e) {
    if (!this.isDragging || !this.dragStart || !this.initialPositions) return;

    const x = (e.offsetX - this.offsetX) / this.scale;
    const y = (e.offsetY - this.offsetY) / this.scale;

    const dx = this.snapToGrid(x - this.dragStart.x);
    const dy = this.snapToGrid(y - this.dragStart.y);

    for (let obj of this.selectedObjects) {
      if (obj.type === "label" && obj.ref.locked) {
        console.log("🔒 Skip dragging locked label");
        continue;
      }
      const init = this.initialPositions.find(
        (init) => init.id === obj.id && init.type === obj.type
      );
      if (init) {
        obj.ref.x = init.startX + dx;
        obj.ref.y = init.startY + dy;
      }
    }

    this.draw();
  }

  stopDrag() {
    this.isDragging = false;
    this.dragStart = null;
    this.initialPositions = null;
  }

  enterMultiMoveMode() {
    if (!this.selectedObjects.length) return;
    this.isMultiMoveMode = true;
    this.isDragging = false; // ❌ Not dragging immediately
    console.log("🚀 Multi-Move Mode READY (waiting for click)");
  }

  startMultiMoveFromClick(e) {
    this.recordState();
    if (!this.isMultiMoveMode) return;

    const pointerX = (e.offsetX - this.offsetX) / this.scale;
    const pointerY = (e.offsetY - this.offsetY) / this.scale;

    this.dragStart = { x: pointerX, y: pointerY };
    this.initialPositions = this.selectedObjects.map((obj) => ({
      id: obj.id,
      type: obj.type,
      startX: obj.ref.x,
      startY: obj.ref.y,
    }));

    this.isDragging = true;
    this.isMultiMoveMode = false; // ✅ Click ke baad mode off
    console.log("🎯 Multi-Move STARTED from click:", this.dragStart);
  }

  updateMultiMoveFollow(e) {
    if (!this.isDragging || !this.initialPositions) return;

    const x = (e.offsetX - this.offsetX) / this.scale;
    const y = (e.offsetY - this.offsetY) / this.scale;

    const dx = this.snapToGrid(x - this.dragStart.x);
    const dy = this.snapToGrid(y - this.dragStart.y);

    for (let obj of this.selectedObjects) {
      const init = this.initialPositions.find(
        (init) => init.id === obj.id && init.type === obj.type
      );
      if (init) {
        obj.ref.x = init.startX + dx;
        obj.ref.y = init.startY + dy;
      }
    }

    this.draw();
  }

  exitMultiMoveMode() {
    this.isMultiMoveMode = false;
    this.isDragging = false;
    this.dragStart = null;
    this.initialPositions = null;
    console.log("🛑 Multi-Move Mode OFF");
  }

  draw() {
    const ctx = this.ctx;

    if (this.showGrid) {
      this.drawGrid();
    } else {
      ctx.save();
      ctx.clearRect(
        0,
        0,
        this.canvas.width / this.dpr,
        this.canvas.height / this.dpr
      );
      ctx.restore();
    }

    // ✅ DRAW CROSS ORIGIN AXIS (always visible and 1px thin)
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    ctx.beginPath();
    ctx.moveTo(-100000, 0);
    ctx.lineTo(100000, 0);
    ctx.moveTo(0, -100000);
    ctx.lineTo(0, 100000);

    ctx.lineWidth = 1 / this.scale;
    ctx.strokeStyle = "#ff0000";
    ctx.stroke();
    ctx.restore();
  }
}
