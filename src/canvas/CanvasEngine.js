export default class CanvasEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.showGrid = true;
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;

    // Dragging / drawing
    this.isPanning = false;
    this.isDragging = false;
    this.onCanvasClick = null;
    this.onCanvasRectangleClick = null;
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;

    // Data scene (React sync)
    this.scene = {
      commentDetails: null,
      activeTab: null,
      selectedQuery: null,
      seeAllDots: false,
      color: null,
      isDotMode: false,
      rectangleMode: false,
    };

    window.canvasEngine = this;

    this.setupCanvas();
    this.bindEvents();
  }

  setData(data) {
    this.scene = data;
    this.draw(); // redraw whenever scene updates
    console.log(this.scene)
  }

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // center origin
    this.offsetX = this.canvas.width / (2 * this.dpr);
    this.offsetY = this.canvas.height / (2 * this.dpr);
  }

  bindEvents() {
    this.canvas.addEventListener("wheel", this.handleZoom.bind(this));
    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
    this.canvas.addEventListener("mousedown", this.customStartDrag.bind(this));
    this.canvas.addEventListener("mousemove", this.customPerformDrag.bind(this));
    this.canvas.addEventListener("mouseup", this.customStopDrag.bind(this));
  }

  customStartDrag(e) {
    if (this.onCanvasRectangleClick) {
      const rect = this.canvas.getBoundingClientRect();
      this.startX = e.clientX - rect.left;
      this.startY = e.clientY - rect.top;
      this.isDrawing = true;
    }
  }

  customPerformDrag(e) {
   
  }

  customStopDrag(e) {
    if (!this.isDrawing || !this.onCanvasRectangleClick) return;
    this.isDrawing = false;

    const rect = this.canvas.getBoundingClientRect();

    const endCanvasX = e.clientX - rect.left;
    const endCanvasY = e.clientY - rect.top;

    // convert to world coords
    const startWorldX = (this.startX - this.offsetX) / this.scale;
    const startWorldY = (this.startY - this.offsetY) / this.scale;
    const endWorldX = (endCanvasX - this.offsetX) / this.scale;
    const endWorldY = (endCanvasY - this.offsetY) / this.scale;

    const xll = Math.min(startWorldX, endWorldX);
    const yll = Math.min(startWorldY, endWorldY);
    const xur = Math.max(startWorldX, endWorldX);
    const yur = Math.max(startWorldY, endWorldY);

    if (xur - xll === 0 || yur - yll === 0) return;

    const bbox = { xll, yll, xur, yur };

    // update scene via callback
    this.onCanvasRectangleClick(bbox);

    // redraw with new rectangle
    this.draw();
  }

  // Drawing primitives 
  drawDot(x, y, radius, color = "red") {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }

  //Drawing rectangle fn
  drawRectangle(x1, y1, x2, y2, color = "red") {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 / this.scale;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }

  //clear canvas fn
  clearCanvas() {
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    this.ctx.clearRect(0, 0, w, h);
  }

  //handle click fn
  handleCanvasClick(e) {
    if (this.onCanvasClick) {
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      const worldX = (canvasX - this.offsetX) / this.scale;
      const worldY = (canvasY - this.offsetY) / this.scale;
      this.onCanvasClick(worldX, worldY, e);
    }
  }

  //click handler to pass the callback for click
  setCanvasClickHandler(handler) {
    this.onCanvasClick = handler;
  }

  // handler to pass the fn to draw rectangle
  setCanvasRectangleClickHandler(handler) {
    this.onCanvasRectangleClick = handler;
  }

  // handle Zoom fn
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

  // grid fn
  drawGrid() {
    const ctx = this.ctx;
    const spacing = 20;
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    ctx.strokeStyle = "#444";

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
// re written draw function
  draw() {
    const ctx = this.ctx;
    const { commentDetails, activeTab, selectedQuery, seeAllDots, color } =
      this.scene || {};

    this.clearCanvas();

    // grid and axis
    if (this.showGrid) this.drawGrid();

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    // axis
    ctx.beginPath();
    ctx.moveTo(-100000, 0);
    ctx.lineTo(100000, 0);
    ctx.moveTo(0, -100000);
    ctx.lineTo(0, 100000);
    ctx.lineWidth = 1 / this.scale;
    ctx.strokeStyle = "#ff0000";
    ctx.stroke();

    // nothing to draw if no data
    if (!commentDetails || !activeTab) {
      ctx.restore();
      return;
    }

    // seeAllDots mode
    if (seeAllDots) {
      const queries = commentDetails[activeTab] || [];
      queries.forEach((q) => {
        if (q.points) this.drawDot(q.points.x, -q.points.y, 4, color);
      });
      ctx.restore();
      return;
    }

    // selectedQuery mode
    if (selectedQuery) {
      if (selectedQuery.points) {
        this.drawDot(
          selectedQuery.points.x,
          -selectedQuery.points.y,
          4,
          color
        );
      }
      if (selectedQuery.rectangle?.length) {
        selectedQuery.rectangle.forEach((r) => {
          const { xll, yll, xur, yur } = r.bbox;
          this.drawRectangle(xll, yll, xur, yur, color);
        });
      }
    }

    ctx.restore();
  }
}

