// ✅ Cleaned CanvasEngine.js (rotation and resize removed)

import InstanceManager from './instanceManager';
import selectionLibrary from '../libraries/SelectionLibrary';
import hierarchyManager from '../libraries/HierarchyManager';
import labelLibrary from '../libraries/LabelLibrary';
import InstanceLibrary from '../libraries/RectangleLibrary';
import layerLibrary from './LayerLibrary';
import layoutEngine from '../libraries/layoutEngine';
import ProjectManager from './ProjectManager';
import RectangleToolHandler from './RectangleToolHandler';
import ToolManager from '../libraries/ToolManager';
import LabelToolHandler from '../tools/LabelToolHandler';
import InstancePlacementHandler from '../tools/InstancePlacementHandler';
import usePlacementStore from '../store/placementStore'; // ✅ Add if not already
import placementStore from "../store/placementStore"; 




let currentEngineInstance = null;

export function registerCanvasEngine(engineInstance) {
  currentEngineInstance = engineInstance;
  window.removeEventListener("keydown", handleGlobalKeyEvent);
  window.addEventListener("keydown", handleGlobalKeyEvent);
}

function handleGlobalKeyEvent(e) {
  if (currentEngineInstance) {
    currentEngineInstance.handleGlobalKeyDown(e);
  }
}

export default class CanvasEngine {
  constructor(canvas) {

    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.showGrid = true;
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.isPanning = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.dragTarget = null;
    this.gridSpacing = 20;
    this.gridType = 'line';   // Default grid type
    this.labelHandler = new LabelToolHandler(this);
   
    this.useUploadedCells = true; // 🔁 false = manual, true = GDS uploaded
    this.drawFilteredInstances = this.drawFilteredInstances.bind(this);

    this.canvasRef = document.getElementById("canvas-id");
this.dotGridMap = {};
    this.selectedObjects = [];   // ✅ NEW: Common selected objects
  this.previewRect = null;
  this.previewInstance = null;
  this.previewLabel =null;

    this.gridColor = "#444";
    window.layerLibrary = layerLibrary;
    this.startPan = { x: 0, y: 0 };
    this.setupCanvas();
    this.instanceManager = InstanceManager;
   
    this.previewInstance = null;
    this.selectedRects = [];
    this.currentTool = "select";
    this.isDrawing = false;
    window.canvasEngine = this;
    registerCanvasEngine(this);
    this.history = [];
this.future = [];
this.isPlacingInstance = false;




this.instancePlacementHandler = new InstancePlacementHandler(this);


this.instanceHandler = new InstancePlacementHandler(this);
    this.drawStart = null;
    this.pasteCooldown = false;
    this.lastPasteTime = 0;
    this.handleGlobalKeyDownBound = this.handleGlobalKeyDown.bind(this);
    this._lastHoverPoint = { x: 0, y: 0 };

    this.dashOffset = 0;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
    window.addEventListener('rotate-left', () => {
      this.rotateSelectedObjects(-90);              // ✅ Rectangle rotation
        // ✅ Label rotation
    });
    
    window.addEventListener('rotate-right', () => {
      this.rotateSelectedObjects(90);               // ✅ Rectangle rotation
         // ✅ Label rotation
    });
    

    this.rectangleHandler = new RectangleToolHandler(this);
    this.currentTool = ProjectManager.getTool();
    console.log("🎯 CanvasEngine currentTool:", this.currentTool);
    this.bindEvents();
    this.draw();
  }


  

  setupCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.offsetX = this.canvas.width / (2 * this.dpr);
    this.offsetY = this.canvas.height / (2 * this.dpr);
    this.canvas.style.cursor = "default";
  }

 bindEvents() {
  this.canvas.addEventListener("wheel", this.handleZoom.bind(this));
  this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
  this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
  this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
  window.addEventListener("tool-changed", this.handleToolChange.bind(this)); // Custom tool change event is fine
}


  handleCopy() {
    if (this.selectedRects.length > 0) {
      this.copiedRects = this.selectedRects.map(rect => ({
        ...JSON.parse(JSON.stringify(rect))
      }));
      console.log("📋 Copied via icon:", this.copiedRects);
    }
  }


  setUseUploadedCells(flag) {
    this.useUploadedCells = flag;
  }
  

  handlePaste() {
    if (!this.lastClickForPaste || !this.copiedRects?.length) return;
    const base = this.copiedRects[0];
    const offsetX = this.lastClickForPaste.x - base.x;
    const offsetY = this.lastClickForPaste.y - base.y;
  
    const pastedRects = this.copiedRects.map(rect => {
      const newRect = {
        ...JSON.parse(JSON.stringify(rect)),
        x: this.rectangleHandler.snapToGrid(rect.x + offsetX),
        y: this.rectangleHandler.snapToGrid(rect.y + offsetY),
        id: Date.now() + Math.random(),
        selected: false
      };
      InstanceLibrary.addRectangle(newRect.layerId, newRect.x, newRect.y, newRect.width, newRect.height, newRect);
      return newRect;
    });
  
    this.selectedRects = [...pastedRects];
    this.draw();
    console.log("📥 Pasted at last click:", this.lastClickForPaste);
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

  handleMouseDown(e) {
    this.lastClickForPaste = {
      x: (e.offsetX - this.offsetX) / this.scale,
      y: (e.offsetY - this.offsetY) / this.scale
    };
  
    const activeTool = window.ToolManager.getCurrentTool(); // ✅ Get clean tool name
  
    if (activeTool === "rectangle") {
      console.log("🖐️ Rectangle tool mouseDown");
      this.isDrawing = true;
      this.isDragging = false;
      this.rectangleHandler.handleMouseDown(e);
      return;
    }

    if (this.currentTool === "label") {
      
      this.isDragging = false;
      this.labelHandler.handleMouseDown(e);
      return;
    }

    if (activeTool === "instance") {
      this.instanceHandler.finalizePlacement();
      return;
    }
    
    
  
    if (activeTool === "select") {
      console.log("🖐️ Select tool mouseDown");
      this.isDrawing = false;
      this.handleSelectObject(e);
      this.startDrag(e);
      if (!this.startResize(e)) {
        // Only if not resizing, handle selection and drag
        this.isDrawing = false;
        this.startDrag(e);
        
      }
    }
  }
  

  handleMouseMove(e) {
    const pointerX = (e.offsetX - this.offsetX) / this.scale;
    const pointerY = (e.offsetY - this.offsetY) / this.scale;
    this.lastPointer = { x: pointerX, y: pointerY };

    if (this.isMultiMoveMode) {
      this.updateMultiMoveFollow(e);
      return;
    }

    if (this.currentTool === "rectangle" && this.isDrawing) {
      this.rectangleHandler.handleMouseMove(e);
    } else  if (this.currentTool === "instance") {
      this.instancePlacementHandler.updatePreview(e);
    }
    
    
    
     else if (this.currentTool === "select") {
      if (this.isResizing) {
        this.performResize(e);
      } else {
        this.checkResizeCursor(e);
        this.performDrag(e);
      }
    }
    
  }

  handleMouseUp(e) {
    const activeTool = ToolManager.getCurrentTool();

    if (this.isMultiMoveMode) {
         this.startMultiMoveFromClick(e);
         return;
       }
    if (this.rectangleHandler.moveMode) {
      this.rectangleHandler.exitMultiMoveMode();
      return;
    }
  
    if (this.currentTool === "rectangle" && this.isDrawing) {
      this.rectangleHandler.handleMouseUp();
      this.isDrawing = false;      // ✅ Immediately stop drawing after mouseUp
      this.drawStart = null;        // ✅ Clear drawStart
      return;
    }
  
    if (activeTool === "instance") {
      this.instanceHandler.finalizePlacement(); // ✅ Instance placed ONLY here
      return;
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
  
    if (this.currentTool === "select") {
      this.isPanning = false;
      this.stopDrag();
      this.endResize();
    }
  }
  

  handleToolChange(e) {
    this.currentTool = e.detail;
  }

  animate() {
    this.dashOffset += 1;
    if (this.dashOffset > 1000) this.dashOffset = 0;
    this.draw();
    requestAnimationFrame(this.animate);
  }

  handleGlobalKeyDown(e) {
    if (document.activeElement.tagName === 'INPUT') return;
    if (this.currentTool === "label") {
      this.labelHandler.handleKeyPress(e);
    }
    if (e.key === "Escape") {
      this.exitMultiMoveMode();
      this.currentTool = "select";                    // ✅ CanvasEngine ka internal tool
      ToolManager.setTool("select");                // ✅ ProjectManager ka global tool
      window.dispatchEvent(new CustomEvent("tool-changed", { detail: "select" })); // ✅ UI bhi sync
      this.isDrawing = false;
      this.isDragging = false;
      this.drawStart = null;
      this.selectedRects = [];
      this.selectedLabels = [];
      this.previewInstance = null;
      this.draw();
    }
    if (e.key.toLowerCase() === "m") {
      this.enterMultiMoveMode();
    }
    if (e.key === 'Delete') {
      window.canvasEngine.deleteSelectedObjects();
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      window.canvasEngine.copySelectedObjects();
      e.preventDefault();
    }
  
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      window.canvasEngine.pasteCopiedObjects();
      e.preventDefault();
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      this.undo();
      e.preventDefault();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      this.redo();
      e.preventDefault();
    }
    
  }

  drawGrid() {
    const ctx = this.ctx;
    const spacing = this.gridSpacing;
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
  
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
    ctx.lineWidth = 1 / this.scale;
    ctx.strokeStyle = this.gridColor;
  
    if (this.gridType === "line") {
      for (let x = firstX; x <= endX; x += spacing) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = firstY; y <= endY; y += spacing) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();
    } else if (this.gridType === "dots") {
      ctx.fillStyle = this.gridColor;
      const dotSize = 1 / this.scale;   // Small dot size (adjustable)
      for (let x = firstX; x <= endX; x += spacing) {
        for (let y = firstY; y <= endY; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  
    ctx.restore();
  }
  

  setGridSpacing(spacing) {
    this.gridSpacing = spacing;
    this.draw();
  }

  drawLabels() {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);
    const labels = labelLibrary.getAll();
    for (let label of labels) {
      if (!labelLibrary.isVisible(label)) continue;
      ctx.fillStyle = 'yellow';
      ctx.font = '12px monospace';
      ctx.fillText(label.text, label.x, label.y);
    }
    ctx.restore();
  }


  // rotateSelected(degrees) {
  //   for (let rect of this.selectedRects) {
  //     const cx = rect.x + rect.width / 2;
  //     const cy = rect.y + rect.height / 2;
  
  //     // update rotation
  //     let newRotation = (rect.rotation || 0) + degrees;
  //     newRotation = ((newRotation % 360) + 360) % 360;
  //     rect.rotation = newRotation;
  
  //     // swap width/height if 90 or 270
  //     if (newRotation === 90 || newRotation === 270) {
  //       const temp = rect.width;
  //       rect.width = rect.height;
  //       rect.height = temp;
  //     }
  
  //     // reposition to keep centered
  //     rect.x = cx - rect.width / 2;
  //     rect.y = cy - rect.height / 2;
  //   }
  
  //   this.draw();
  // }
  

  resetToolStates() {
    this.isDrawing = false;
    this.isDragging = false;
    this.previewInstance = null;
  
    if (this.rectangleHandler?.cancelDrawing) {
      this.rectangleHandler.cancelDrawing();
    }
    if (this.labelHandler?.cancelLabeling) {
      this.labelHandler.cancelLabeling();
    }
  }
  

//============================================================================================================================================
// 📋 Common Reusable Operation Functions



snapToGrid(value) {
  const spacing = this.gridSpacing || 20;
  return Math.round(value / spacing) * spacing;
}







  handleSelectObject(e) {
    if (this.isMultiMoveMode) return;

    const x = (e.offsetX - this.offsetX) / this.scale;
    const y = (e.offsetY - this.offsetY) / this.scale;
  
    const ctrlKey = e.ctrlKey || e.metaKey;
  
    const cellName = ProjectManager.getSelectedCell();
const cellData = InstanceLibrary.getAllInstances()[cellName] || {};
const allRects = Object.values(cellData).flat();  // 🔁 Flatten all layers in this cell only

const allLabels = labelLibrary.getAllLabels(cellName);

    console.log(allLabels)
  
    let clickedObject = null;
  
   // First, check rectangles (✅ check topmost first by reverse looping)
for (let i = allRects.length - 1; i >= 0; i--) {
  const rect = allRects[i];
  if (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  ) {
    clickedObject = { id: rect.id, type: 'rectangle', ref: rect };
    break;
  }
}

  
    // If not rectangle, check labels
    if (!clickedObject) {
      for (let label of allLabels) {
        
        this.ctx.font = `${label.fontSize}px monospace`; // 🛠 Very important
        const width = Math.max(this.ctx.measureText(label.text).width, 20);
        const height = label.fontSize;
      
        if (
          x >= label.x &&
          x <= label.x + width &&
          y <= label.y &&
          y >= label.y - height
        ) {
          if (label.locked) {
            console.log('🔒 Locked label clicked → skipping selection');
            continue; // skip this locked label
          }
          clickedObject = { id: label.id, type: 'label', ref: label };
          console.log("when i click on label", clickedObject);
          break;
        }
       
      }
      
    }

    // ✅ Check placed instances
if (!clickedObject) {
  const cellName = ProjectManager.getSelectedCell();
  const currentCell = layoutEngine.getCellByName(cellName);
  const instances = currentCell?.instances || [];

  for (let i = instances.length - 1; i >= 0; i--) {
    const inst = instances[i];
    const refCell = layoutEngine.getCellByName(inst.ref);
    if (!refCell) continue;

    const { offsetX: childOffsetX, offsetY: childOffsetY } = this.getChildBoundingBoxCenterOffset(refCell);

    for (let el of refCell.elements) {
      if (el.type !== "rectangle") continue;

      const elX = inst.x + childOffsetX + el.x;
      const elY = inst.y + childOffsetY + el.y;
      const width = el.width;
      const height = el.height;

      if (x >= elX && x <= elX + width && y >= elY && y <= elY + height) {
        clickedObject = { id: inst.id, type: 'instance', ref: inst };
        break;
      }
    }

    if (clickedObject) break;
  }
}

    
  
    if (clickedObject) {
      const alreadySelected = this.selectedObjects.find(
        obj => obj.type === clickedObject.type && obj.id === clickedObject.id
      );
  
      if (ctrlKey) {
        if (alreadySelected) {
          // If already selected and ctrl pressed => unselect
          this.selectedObjects = this.selectedObjects.filter(
            obj => !(obj.type === clickedObject.type && obj.id === clickedObject.id)
          );
        } else {
          // Else add to selection
          this.selectedObjects.push(clickedObject);
        }
      } else {
        // Normal click (no ctrl) => select only this
        this.selectedObjects = [clickedObject];
      }
      selectionLibrary.setSelection(this.selectedObjects.map(obj => obj.ref));
      console.log(this.selectedObjects)
    } else if (!ctrlKey) {
      // Blank click (no ctrl) => clear all
      this.selectedObjects = [];
    }
  
    this.draw();
  }
  
  copySelectedObjects() {
    if (!this.selectedObjects?.length) return;
  
    this.copiedObjects = this.selectedObjects.map(obj => ({
      id: obj.id,
      type: obj.type,
      ref: JSON.parse(JSON.stringify(obj.ref)) // Deep copy to avoid live link
    }));
  
    console.log("📋 Copied selected objects");
  }
  

  pasteCopiedObjects() {
    this.recordState();
    if (!this.copiedObjects?.length || !this.lastClickForPaste) return;
  
    const base = this.copiedObjects[0];
    const offsetX = this.lastClickForPaste.x - base.ref.x;
    const offsetY = this.lastClickForPaste.y - base.ref.y;
  
    const newObjects = [];
    const cellName = ProjectManager.getSelectedCell();
  
    for (let obj of this.copiedObjects) {
      if (obj.type === 'rectangle') {
        const newRect = {
          ...obj.ref,
          id: Date.now() + Math.random(),
          x: this.snapToGrid(obj.ref.x + offsetX),
          y: this.snapToGrid(obj.ref.y + offsetY),
          selected: false
        };
        
InstanceLibrary.addRectangle(cellName, newRect.layerId, newRect.x, newRect.y, newRect.width, newRect.height, newRect);

        newObjects.push({ id: newRect.id, type: 'rectangle', ref: newRect });
      }
      else if (obj.type === 'label') {
        const activeLayerId = obj.ref.layerId;
        const color = obj.ref.color;
        const newLabel = labelLibrary.addLabel(
          cellName,
          obj.ref.layerId,
          this.snapToGrid(obj.ref.x + offsetX),
          this.snapToGrid(obj.ref.y + offsetY),
          obj.ref.text,
          obj.ref.color
        );
        
        newObjects.push({ id: newLabel.id, type: 'label', ref: newLabel });
      }
      else if (obj.type === 'instance') {
        const newInst = {
          ...obj.ref,
          id: Date.now() + Math.random(),
          x: this.snapToGrid(obj.ref.x + offsetX),
          y: this.snapToGrid(obj.ref.y + offsetY),
        };
      
        layoutEngine.addInstance(cellName, newInst.ref, newInst.x, newInst.y);
      
        newObjects.push({ id: newInst.id, type: 'instance', ref: newInst });
      }
      
    }
  
    this.selectedObjects = newObjects;
    this.draw();
    console.log("📥 Pasted copied objects");
  }

  
  deleteSelectedObjects() {
    this.recordState();
    if (!this.selectedObjects?.length) return;
    const cellName = ProjectManager.getSelectedCell();
    for (let obj of this.selectedObjects) {
      if (obj.type === 'rectangle') {
        
InstanceLibrary.deleteRectangle(cellName, obj.ref.layerId, obj.ref.id);

      } 
      else if (obj.type === 'label') {
        labelLibrary.deleteLabel(cellName, obj.ref.layerId, obj.ref.id);

      }
      else if (obj.type === 'instance') {
        const currentCell = layoutEngine.getCellByName(cellName);
        if (!currentCell) continue;
        currentCell.instances = currentCell.instances.filter(inst => inst.id !== obj.ref.id);
      }
      
    }
  
    this.selectedObjects = [];
    this.draw();
    console.log("🗑️ Deleted selected objects");
  }
  



  rotateSelectedObjects(degrees) {
    this.recordState();
    if (!this.selectedObjects?.length) return;
  
    for (let obj of this.selectedObjects) {
      if (obj.type === 'rectangle') {
        const rect = obj.ref;
        const cx = rect.x + rect.width / 2;
        const cy = rect.y + rect.height / 2;
  
        let newRotation = (rect.rotation || 0) + degrees;
        newRotation = ((newRotation % 360) + 360) % 360;
        rect.rotation = newRotation;
  
        if (newRotation === 90 || newRotation === 270) {
          const temp = rect.width;
          rect.width = rect.height;
          rect.height = temp;
        }
  
        rect.x = cx - rect.width / 2;
        rect.y = cy - rect.height / 2;
      }
  
      else if (obj.type === 'label') {
        const label = obj.ref;
        label.rotation = ((label.rotation || 0) + degrees) % 360;
      }
      else if (obj.type === 'instance') {
        const inst = obj.ref;
        let newRotation = (inst.rotation || 0) + degrees;
        newRotation = ((newRotation % 360) + 360) % 360;
        inst.rotation = newRotation;
      }
      
    }
  
    this.draw();
    console.log(`🔄 Rotated selected objects by ${degrees}°`);
  }
  
  startDrag(e) {
    this.recordState();
    if (!this.selectedObjects?.length) return;
  
    const x = (e.offsetX - this.offsetX) / this.scale;
    const y = (e.offsetY - this.offsetY) / this.scale;
  
    // Check if clicked inside any selected object
    for (let obj of this.selectedObjects) {
      const item = obj.ref;
      if (obj.type === 'rectangle') {
        if (x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height) {
          this.dragStart = { x, y };
          this.initialPositions = this.selectedObjects.map(obj => ({
            id: obj.id,
            type: obj.type,
            startX: obj.ref.x,
            startY: obj.ref.y
          }));
          this.isDragging = true;
          return;
        }
      }
      else if (obj.type === 'label') {
        const width = this.ctx.measureText(item.text).width;
        const height = item.fontSize;
        if (x >= item.x && x <= item.x + width && y <= item.y && y >= item.y - height) {
          if (item.locked) {
            console.log('🔒 Cannot drag locked label');
            return;
          }
          this.dragStart = { x, y };
          this.initialPositions = this.selectedObjects.map(obj => ({
            id: obj.id,
            type: obj.type,
            startX: obj.ref.x,
            startY: obj.ref.y
          }));
          this.isDragging = true;
          return;
        }
      }
      else if (obj.type === 'instance') {
        const inst = obj.ref;
        const refCell = layoutEngine.getCellByName(inst.ref);
        if (!refCell) return;
      
        const { offsetX: offsetXInside, offsetY: offsetYInside } = this.getChildBoundingBoxCenterOffset(refCell);
      
        for (let el of refCell.elements) {
          if (el.type !== "rectangle") continue;
      
          const elX = inst.x + offsetXInside + el.x;
          const elY = inst.y + offsetYInside + el.y;
          const width = el.width;
          const height = el.height;
      
          if (x >= elX && x <= elX + width && y >= elY && y <= elY + height) {
            this.dragStart = { x, y };
            this.initialPositions = this.selectedObjects.map(obj => ({
              id: obj.id,
              type: obj.type,
              startX: obj.ref.x,
              startY: obj.ref.y
            }));
            this.isDragging = true;
            return;
          }
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
    const init = this.initialPositions.find(init => init.id === obj.id && init.type === obj.type);
    if (!init) continue;

    const item = obj.ref;

    if ((item.locked ?? false) === true) continue;

    // 🔹 Created Rectangle
    if (obj.type === 'rectangle' && 'x' in item) {
      item.x = init.startX + dx;
      item.y = init.startY + dy;
    }

    // 🔹 Uploaded Rectangle
    else if (obj.type === 'rectangle' && 'x1' in item && 'x2' in item) {
      const width = Math.abs(item.x2 - item.x1);
      const height = Math.abs(item.y2 - item.y1);
      const xDir = item.x2 > item.x1 ? 1 : -1;
      const yDir = item.y2 > item.y1 ? 1 : -1;

      item.x1 = init.startX + dx;
      item.y1 = init.startY + dy;
      item.x2 = item.x1 + (width * xDir);
      item.y2 = item.y1 + (height * yDir);

      if (obj.isUploaded) {
        const cellName = ProjectManager.getSelectedCell();
        const uploadedCell = layoutEngine.getUploadedCell(cellName);
        if (uploadedCell) {
          const el = uploadedCell.elements.find(el => el.id === obj.id);
          if (el) {
            el.x1 = item.x1;
            el.y1 = item.y1;
            el.x2 = item.x2;
            el.y2 = item.y2;
          }
        }
      }
    }

    // 🔹 Label
    else if (obj.type === 'label') {
      item.x = init.startX + dx;
      item.y = init.startY + dy;
    }

    // 🔹 Instance
    else if (obj.type === 'instance') {
      item.x = init.startX + dx;
      item.y = init.startY + dy;

      const cellName = ProjectManager.getSelectedCell();
      const cell = layoutEngine.getCellByName(cellName);
      if (cell) {
        const instance = cell.instances.find(inst => inst.id === obj.id);
        if (instance) {
          instance.x = item.x;
          instance.y = item.y;
        }
      }
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
    this.initialPositions = this.selectedObjects.map(obj => ({
      id: obj.id,
      type: obj.type,
      startX: obj.ref.x,
      startY: obj.ref.y
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
      const init = this.initialPositions.find(init => init.id === obj.id && init.type === obj.type);
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
  

  
  
  recordState() {
    const state = {
      rectangles: JSON.parse(JSON.stringify(InstanceLibrary.getAllInstances())),
      labels: JSON.parse(JSON.stringify(labelLibrary.getAllLabels()))
    };
    this.history.push(state);
    this.future = []; // Clear redo stack
  }
  restoreState(state) {
    InstanceLibrary.setAllInstances(state.rectangles);
    labelLibrary.setAllLabels(state.labels);
    this.draw();
  }
  
  
  undo() {
    if (this.history.length === 0) return;
    const currentState = {
      rectangles: JSON.parse(JSON.stringify(InstanceLibrary.getAllInstances())),
      labels: JSON.parse(JSON.stringify(labelLibrary.getAllLabels()))
    };
    this.future.push(currentState);
  
    const prevState = this.history.pop();
    this.restoreState(prevState);
    console.log("↩️ Undo");
  }
  
  redo() {
    if (this.future.length === 0) return;
    const currentState = {
      rectangles: JSON.parse(JSON.stringify(InstanceLibrary.getAllInstances())),
      labels: JSON.parse(JSON.stringify(labelLibrary.getAllLabels()))
    };
    this.history.push(currentState);
  
    const nextState = this.future.pop();
    this.restoreState(nextState);
    console.log("↪️ Redo");
  }





  checkResizeCursor(e) {
    const x = (e.offsetX - this.offsetX) / this.scale;
    const y = (e.offsetY - this.offsetY) / this.scale;
  
    this.resizeTarget = null;
    this.resizeEdge = null;
    

  const margin = 5 / this.scale;

  
    const selectedRects = this.selectedObjects.filter(obj => obj.type === 'rectangle').map(obj => obj.ref);
  
    for (let rect of selectedRects) {
      
      const left = rect.x;
      const right = rect.x + rect.width;
      const top = rect.y;
      const bottom = rect.y + rect.height;
  
      if (this.isNear(x, left, margin) && this.isNear(y, top, margin)) {
        this.canvas.style.cursor = "nwse-resize";
        this.resizeTarget = rect;
        this.resizeEdge = "top-left";
        return;
      }
      if (this.isNear(x, right, margin) && this.isNear(y, top, margin)) {
        this.canvas.style.cursor = "nesw-resize";
        this.resizeTarget = rect;
        this.resizeEdge = "top-right";
        return;
      }
      if (this.isNear(x, left, margin) && this.isNear(y, bottom, margin)) {
        this.canvas.style.cursor = "nesw-resize";
        this.resizeTarget = rect;
        this.resizeEdge = "bottom-left";
        return;
      }
      if (this.isNear(x, right, margin) && this.isNear(y, bottom, margin)) {
        this.canvas.style.cursor = "nwse-resize";
        this.resizeTarget = rect;
        this.resizeEdge = "bottom-right";
        return;
      }
      if (this.isNear(x, left, margin) && y >= top && y <= bottom) {
        this.canvas.style.cursor = "ew-resize";
        this.resizeTarget = rect;
        this.resizeEdge = "left";
        return;
      }
      if (this.isNear(x, right, margin) && y >= top && y <= bottom) {
        this.canvas.style.cursor = "ew-resize";
        this.resizeTarget = rect;
        this.resizeEdge = "right";
        return;
      }
      if (this.isNear(y, top, margin) && x >= left && x <= right) {
        this.canvas.style.cursor = "ns-resize";
        this.resizeTarget = rect;
        this.resizeEdge = "top";
        return;
      }
      if (this.isNear(y, bottom, margin) && x >= left && x <= right) {
        this.canvas.style.cursor = "ns-resize";
        this.resizeTarget = rect;
        this.resizeEdge = "bottom";
        return;
      }
    }
    for (let obj of this.selectedObjects) {
      if (obj.type !== 'instance') continue;
  
      const inst = obj.ref;
      const refCell = layoutEngine.getCellByName(inst.ref);
      if (!refCell) continue;
  
      const { offsetX: ox, offsetY: oy } = this.getChildBoundingBoxCenterOffset(refCell);
  
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let el of refCell.elements) {
        if (el.type !== "rectangle") continue;
  
        const elX = inst.x + ox + el.x;
        const elY = inst.y + oy + el.y;
        const width = el.width;
        const height = el.height;
  
        minX = Math.min(minX, elX);
        minY = Math.min(minY, elY);
        maxX = Math.max(maxX, elX + width);
        maxY = Math.max(maxY, elY + height);
      }
  
      if (this.isNear(x, minX, margin) && this.isNear(y, minY, margin)) {
        this.canvas.style.cursor = "nwse-resize";
        this.resizeTarget = inst;
        this.resizeEdge = "top-left";
        return;
      }
      if (this.isNear(x, maxX, margin) && this.isNear(y, minY, margin)) {
        this.canvas.style.cursor = "nesw-resize";
        this.resizeTarget = inst;
        this.resizeEdge = "top-right";
        return;
      }
      if (this.isNear(x, minX, margin) && this.isNear(y, maxY, margin)) {
        this.canvas.style.cursor = "nesw-resize";
        this.resizeTarget = inst;
        this.resizeEdge = "bottom-left";
        return;
      }
      if (this.isNear(x, maxX, margin) && this.isNear(y, maxY, margin)) {
        this.canvas.style.cursor = "nwse-resize";
        this.resizeTarget = inst;
        this.resizeEdge = "bottom-right";
        return;
      }
      if (this.isNear(x, minX, margin) && y >= minY && y <= maxY) {
        this.canvas.style.cursor = "ew-resize";
        this.resizeTarget = inst;
        this.resizeEdge = "left";
        return;
      }
      if (this.isNear(x, maxX, margin) && y >= minY && y <= maxY) {
        this.canvas.style.cursor = "ew-resize";
        this.resizeTarget = inst;
        this.resizeEdge = "right";
        return;
      }
      if (this.isNear(y, minY, margin) && x >= minX && x <= maxX) {
        this.canvas.style.cursor = "ns-resize";
        this.resizeTarget = inst;
        this.resizeEdge = "top";
        return;
      }
      if (this.isNear(y, maxY, margin) && x >= minX && x <= maxX) {
        this.canvas.style.cursor = "ns-resize";
        this.resizeTarget = inst;
        this.resizeEdge = "bottom";
        return;
      }
    }
  
    this.canvas.style.cursor = "default";
  }
  
   
  

  

  isNear(p1, p2, margin = 5) {
    return Math.abs(p1 - p2) <= margin;
  }

  




  startResize(e) {
    if (!this.resizeTarget || !this.resizeEdge) return false;
  
    const x = (e.offsetX - this.offsetX) / this.scale;
    const y = (e.offsetY - this.offsetY) / this.scale;
    this.startResizePos = { x, y };
    this.startResizeRect = { ...this.resizeTarget };
  
    this.isResizing = true;
    return true;
  }

  



  performResize(e) {
    if (!this.isResizing || !this.resizeTarget) return;
  
    const x = (e.offsetX - this.offsetX) / this.scale;
    const y = (e.offsetY - this.offsetY) / this.scale;
    const deltaX = this.snapToGrid(x - this.startResizePos.x);
    const deltaY = this.snapToGrid(y - this.startResizePos.y);
  
    // 🧱 Rectangle Resize
    if (this.resizeTarget?.width !== undefined) {
      if (this.resizeEdge === "left") {
        this.resizeTarget.x = this.startResizeRect.x + deltaX;
        this.resizeTarget.width = this.startResizeRect.width - deltaX;
      } else if (this.resizeEdge === "right") {
        this.resizeTarget.width = this.startResizeRect.width + deltaX;
      } else if (this.resizeEdge === "top") {
        this.resizeTarget.y = this.startResizeRect.y + deltaY;
        this.resizeTarget.height = this.startResizeRect.height - deltaY;
      } else if (this.resizeEdge === "bottom") {
        this.resizeTarget.height = this.startResizeRect.height + deltaY;
      } else if (this.resizeEdge === "top-left") {
        this.resizeTarget.x = this.startResizeRect.x + deltaX;
        this.resizeTarget.width = this.startResizeRect.width - deltaX;
        this.resizeTarget.y = this.startResizeRect.y + deltaY;
        this.resizeTarget.height = this.startResizeRect.height - deltaY;
      } else if (this.resizeEdge === "top-right") {
        this.resizeTarget.width = this.startResizeRect.width + deltaX;
        this.resizeTarget.y = this.startResizeRect.y + deltaY;
        this.resizeTarget.height = this.startResizeRect.height - deltaY;
      } else if (this.resizeEdge === "bottom-left") {
        this.resizeTarget.x = this.startResizeRect.x + deltaX;
        this.resizeTarget.width = this.startResizeRect.width - deltaX;
        this.resizeTarget.height = this.startResizeRect.height + deltaY;
      } else if (this.resizeEdge === "bottom-right") {
        this.resizeTarget.width = this.startResizeRect.width + deltaX;
        this.resizeTarget.height = this.startResizeRect.height + deltaY;
      }
    }
  
    else if (this.resizeTarget?.ref && this.resizeTarget.type === 'instance') {
      const inst = this.resizeTarget;
      const refCell = layoutEngine.getCellByName(inst.ref);
      if (!refCell) return;
    
      const { offsetX, offsetY } = this.getChildBoundingBoxCenterOffset(refCell);
    
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let el of refCell.elements) {
        if (el.type !== "rectangle") continue;
        const elX = offsetX + el.x;
        const elY = offsetY + el.y;
        const width = el.width;
        const height = el.height;
        minX = Math.min(minX, elX);
        minY = Math.min(minY, elY);
        maxX = Math.max(maxX, elX + width);
        maxY = Math.max(maxY, elY + height);
      }
    
      const boxWidth = maxX - minX;
      const boxHeight = maxY - minY;
    
      const pointerX = (e.offsetX - this.offsetX) / this.scale;
      const pointerY = (e.offsetY - this.offsetY) / this.scale;
    
      const rawScaleX = (pointerX - inst.x) / boxWidth;
      const rawScaleY = (pointerY - inst.y) / boxHeight;
    
      const snappedWidth = this.snapToGrid(rawScaleX * boxWidth);
      const snappedHeight = this.snapToGrid(rawScaleY * boxHeight);
    
      const scaleX = snappedWidth / boxWidth;
      const scaleY = snappedHeight / boxHeight;
    
      const newScale = Math.max(0.05, Math.min(scaleX, scaleY)); // uniform scale
      inst.scale = newScale;
    }
    
  
    this.draw();
  }
  

  



  endResize() {
    this.isResizing = false;
    this.resizeTarget = null;
    this.resizeEdge = null;
  }
  










  
  updateSelectedProperty(propertyName, value) {
    if (!this.selectedObjects.length) return;
  
    for (let obj of this.selectedObjects) {
      if (propertyName === 'layerId') {
        // ✅ Move object to another layer
        if (obj.type === 'rectangle') {
          // Remove from old layer
          InstanceLibrary.deleteRectangle(obj.ref.layerId, obj.ref.id);
          // Update layerId
          obj.ref.layerId = value;
          // Re-add to new layer
          InstanceLibrary.addRectangle(obj.ref.layerId, obj.ref.x, obj.ref.y, obj.ref.width, obj.ref.height, obj.ref);
        } else if (obj.type === 'label') {
          // Remove from old layer
          labelLibrary.deleteLabel(obj.ref.layerId, obj.ref.id);
          // Update layerId
          obj.ref.layerId = value;
          // Re-add to new layer
          labelLibrary.addLabel(obj.ref.layerId, obj.ref.x, obj.ref.y, obj.ref.text, obj.ref.color);
        }
      } else if (obj.ref.hasOwnProperty(propertyName)) {
        obj.ref[propertyName] = value;
      }
    }
  
    this.draw();
    console.log(`✅ Updated ${propertyName} to ${value}`);
  }
  
  // CanvasEngine.js

  updateSelectedPropertyById(id, type, key, value) {
    const target = this.selectedObjects.find(obj => obj.id === id && obj.type === type);
    if (target && target.ref) {
      target.ref[key] = value;
      this.draw();
      console.log(`✅ Updated ${key} for ${type} ID ${id} to ${value}`);
    }
  }
  

getSelectedProperties() {
  if (!this.selectedObjects || !this.selectedObjects.length) return [];

  return this.selectedObjects.map(obj => ({
    id: obj.id,
    type: obj.type,
    properties: { ...obj.ref } // deep copy of properties
  }));
}


  
  





focusOnLabel(labelId) {
  const label = labelLibrary.getLabelById(labelId);
  if (label) {
    const labelX = label.x;
    const labelY = label.y;

    // 1️⃣ zoom in karo (maan lo default zoom 1 hai):
    this.scale = 2; // ya jo bhi zoom factor chahiye

    // 2️⃣ center ko adjust karo
    this.offsetX = -labelX * this.scale + this.canvas.width / 2;
    this.offsetY = -labelY * this.scale + this.canvas.height / 2;

    this.draw(); // redraw canvas
  }
}









  
  //=======================================================================================================================================================




  //=======================================================================================================================================================
  
// instance section





// drawInstanceTree(cell, ctx, parentTransform = { x: 0, y: 0, scale: 1, rotation: 0 }, visited = new Set()) {
//   if (!cell || visited.has(cell.name)) return;
//   visited.add(cell.name);

//   for (let element of cell.elements) {
//     if (element.type === "rectangle") {
//       let x = element.x ?? element.x1;
//       let y = element.y ?? element.y1;
//       let width = element.width ?? (element.x2 - element.x1);
//       let height = element.height ?? (element.y2 - element.y1);
  
//       const rect = {
//         ...element,
//         x1: x,
//         y1: y,
//         x2: x + width,
//         y2: y + height,
//       };
  
//       const rectOffsetX = parentTransform.x ?? 0;
// const rectOffsetY = parentTransform.y ?? 0;

// ctx.save();
// ctx.translate(rectOffsetX, rectOffsetY); // ✅ Apply center offset
// ctx.scale(parentTransform.scale, parentTransform.scale);
// ctx.rotate((parentTransform.rotation || 0) * Math.PI / 180);
// ctx.translate(parentTransform.xShift ?? 0, parentTransform.yShift ?? 0); // ✅ If defined

// InstanceLibrary.drawSingle(ctx, rect, parentTransform.scale);
// ctx.restore();

//     }
//   }
  
  

//   for (let instance of cell.instances) {
//     const childCell = layoutEngine.getCellByName(instance.ref);
//     if (childCell) {
//       const combinedTransform = {
//         x: parentTransform.x + instance.x * parentTransform.scale,
//         y: parentTransform.y + instance.y * parentTransform.scale,
//         scale: parentTransform.scale * (instance.scale || 1),
//         rotation: parentTransform.rotation + (instance.rotation || 0)
//       };
//       this.drawInstanceTree(childCell, ctx, combinedTransform, new Set(visited));
//     }
//   }
// }












//=====================================================================================================================================================================================



getChildBoundingBox(cell) {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (let el of cell.elements || []) {
    if (el.type !== "rectangle") continue;
    const x = el.x ?? el.x1 ?? 0;
    const y = el.y ?? el.y1 ?? 0;
    const width = el.width ?? (el.x2 - el.x1) ?? 0;
    const height = el.height ?? (el.y2 - el.y1) ?? 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}




getChildBoundingBoxCenterOffset(cell) {
  if (!cell || !cell.elements) return { offsetX: 0, offsetY: 0 };

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (let el of cell.elements) {
    if (el.type !== "rectangle") continue;
    const x = el.x ?? el.x1 ?? 0;
    const y = el.y ?? el.y1 ?? 0;
    const width = el.width ?? (el.x2 - el.x1) ?? 0;
    const height = el.height ?? (el.y2 - el.y1) ?? 0;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return { offsetX: 0, offsetY: 0 };
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    offsetX: -centerX,
    offsetY: -centerY
  };
}




drawRecursiveInstances(cell, ctx, parentTransform = { x: 0, y: 0, scale: 1, rotation: 0 }, path = []) {
  if (!cell || path.includes(cell.name)) return;

  const newPath = [...path, cell.name];
  const instances = cell.instances || [];

  for (const inst of instances) {
    if (inst.visible === false) continue;
    const instCell = layoutEngine.getCellByName(inst.ref);
    if (!instCell) continue;
   


    const globalX = parentTransform.x + inst.x;
    const globalY = parentTransform.y + inst.y;
    const globalScale = parentTransform.scale * (inst.scale || 1);
    const globalRotation = parentTransform.rotation + (inst.rotation || 0);
    const rotationRad = globalRotation * Math.PI / 180;

    const { offsetX, offsetY } = this.getChildBoundingBoxCenterOffset(instCell);

    ctx.save();
    ctx.translate(globalX, globalY);
    ctx.rotate(rotationRad);
    ctx.translate(offsetX * globalScale, offsetY * globalScale);
    ctx.scale(globalScale, globalScale);

    for (let el of instCell.elements || []) {
      if (el.type === 'rectangle') {
        InstanceLibrary.drawSingle(ctx, el, 1);
      } else if (el.type === 'label') {
        labelLibrary.drawSingle(ctx, el);
      }
    }

    // ctx.beginPath();
    // ctx.moveTo(-5, 0);
    // ctx.lineTo(5, 0);
    // ctx.moveTo(0, -5);
    // ctx.lineTo(0, 5);
    // ctx.strokeStyle = 'red';
    // ctx.lineWidth = 1 / this.scale;
    // ctx.stroke();

    ctx.restore();

    this.drawRecursiveInstances(instCell, ctx, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
    }, newPath);
  }
}




drawTransformedLabel(ctx, label, instX, instY, scale, rotation) {
  const cx = label.x + instX;
  const cy = label.y + instY;

  ctx.save();
  ctx.translate(this.offsetX, this.offsetY);
  ctx.scale(this.scale, this.scale);
  ctx.translate(cx, cy);
  ctx.rotate((rotation || 0) * Math.PI / 180);
  ctx.font = `${label.fontSize || 12}px sans-serif`;
  ctx.fillStyle = label.color || "#fff";
  ctx.fillText(label.text, 0, 0); // draw at 0,0 since already translated
  ctx.restore();
}

drawRecursiveUploaded(ctx, cellName) {
  const cell = layoutEngine.getUploadedCell(cellName);
  if (!cell) return;

  ctx.save();

  // Draw current cell elements
  for (const element of cell.elements || []) {
    InstanceLibrary.drawUploadedRectangle(ctx, element);
  }

  // Draw all child instances
  for (const instance of cell.instances || []) {
    ctx.save();

    // Move to instance position and rotate
    ctx.translate(instance.x, instance.y);
    ctx.rotate((instance.rotation || 0) * Math.PI / 180);

    // Recurse into child
    this.drawRecursiveUploaded(ctx, instance.ref);

    ctx.restore();
  }

  ctx.restore();
}








drawFilteredInstances() {
  const { showOnlySelected } = require('../store/placementStore').default.getState();
  const selectedDesign = window.getCurrentSelectedPattern?.(); // <-- we'll define this global in next step

  const ctx = this.ctx;
  const activeCell = require('./ProjectManager').default.getSelectedCell();
  const layoutEngine = require('../libraries/layoutEngine').default;

  if (!activeCell) return;

  const cell = layoutEngine.getCellByName(activeCell);
  if (!cell) return;

  ctx.save();
  ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
  ctx.restore();

  this.drawGrid();

  // 🔁 Only show selected pattern instance
  const instances = cell.instances || [];
  const filteredInstances = showOnlySelected
    ? instances.filter(inst => inst.ref === selectedDesign)
    : instances;

  const labelLibrary = require('../libraries/LabelLibrary').default;
  const labelData = labelLibrary.getAllLabels(activeCell) || [];

  // ✅ Draw filtered instances
  for (let inst of filteredInstances) {
    this.drawInstance(inst); // assumes `drawInstance` is already defined
  }

  // ✅ Also draw labels (unchanged)
  for (let label of labelData) {
    if (labelLibrary.isVisible(label)) {
      ctx.save();
      ctx.translate(this.offsetX, this.offsetY);
      ctx.scale(this.scale, this.scale);
      ctx.fillStyle = 'yellow';
      ctx.font = '12px monospace';
      ctx.fillText(label.text, label.x, label.y);
      ctx.restore();
    }
  }
}

draw3x3DotsOnSelected(patternName) {
  const selected =
    patternName ||
    placementStore.getState().selectedPatterns?.[0]; // ✅ placementStore se le
  if (!selected) return alert("❌ No pattern selected");
  this.drawDotGridOverPattern(selected, 3);
}

draw4x4DotsOnSelected(patternName) {
  const selected =
    patternName ||
    placementStore.getState().selectedPatterns?.[0];
  if (!selected) return alert("❌ No pattern selected");
  this.drawDotGridOverPattern(selected, 4);
}

draw5x5DotsOnSelected(patternName) {
  const selected =
    patternName ||
    placementStore.getState().selectedPatterns?.[0];
  if (!selected) return alert("❌ No pattern selected");
  this.drawDotGridOverPattern(selected, 5);
}


drawDotGridOverPattern(patternName, gridSize) {
  const normalize = (str) => str.trim().toLowerCase().replace(/[\s_]+/g, "");

  console.log("📌 Requested pattern:", patternName, "Grid Size:", gridSize);

  const topCell = layoutEngine.getTopCell();
  if (!topCell) {
    console.log("❌ No top cell found");
    return alert("❌ No top cell found");
  }

  console.log("📦 Top Cell:", topCell.name || "unnamed", topCell);

  const instance = topCell.instances?.find(
    (inst) => normalize(inst.ref) === normalize(patternName)
  );

  if (!instance) {
    console.log(`❌ No matching instance found for "${patternName}"`);
    return alert(`❌ No instance found for pattern "${patternName}"`);
  }

  console.log("🔍 Matched instance:", instance);

  const bbox = layoutEngine.getBoundingBox(instance.ref);  // ✅ use actual ref
  if (!bbox) {
    console.log(`❌ No bounding box for "${instance.ref}"`);
    return alert(`❌ Bounding box not found for "${instance.ref}"`);
  }

  console.log("📏 Bounding Box:", bbox);
  console.log("📍 Instance Position (x, y):", instance.x, instance.y);

  this.dotGridMap[instance.ref] = {
    gridSize,
    bbox,
    offsetX: instance.x,
    offsetY: instance.y,
  };

  console.log("✅ Dot grid stored for:", instance.ref, {
    gridSize,
    bbox,
    offsetX: instance.x,
    offsetY: instance.y,
  });

  this.draw();
}




drawPCellInstanceTree(instance) {
  const ctx = this.ctx;
  const refCell = layoutEngine.getCellByName(instance.ref);
  if (!refCell) return;

  // Draw rectangles in the refCell
  for (const el of refCell.elements || []) {
    if (el.type === "rectangle") {
      const x = (instance.x + el.x + this.offsetX) * this.scale;
      const y = (instance.y + el.y + this.offsetY) * this.scale;
      const w = el.width * this.scale;
      const h = el.height * this.scale;

      ctx.fillStyle = el.fill || "rgba(0,255,0,0.4)";
      ctx.strokeStyle = el.stroke || "green";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Draw sub-instances if they exist
  for (const subInst of refCell.instances || []) {
    const newInstance = {
      x: instance.x + subInst.x,
      y: instance.y + subInst.y,
      ref: subInst.ref
    };
    this.drawPCellInstanceTree(newInstance);
  }
}











  draw() {
    const ctx = this.ctx;
    if (this.showGrid) {
      this.drawGrid();
    } else {
      ctx.save();
      ctx.clearRect(0, 0, this.canvas.width / this.dpr, this.canvas.height / this.dpr);
      ctx.restore();
    }
    const { showOnlySelected } = require("../store/placementStore").default.getState();
const selectedPattern = window.getCurrentSelectedPattern?.();

    const activeLayerId = layerLibrary.getSelectedLayerId();
    InstanceLibrary.drawAll(ctx, this.offsetX, this.offsetY, this.scale, ProjectManager.getSelectedCell(), this.previewRect);

    

ctx.save();
ctx.translate(this.offsetX, this.offsetY);
ctx.scale(this.scale, this.scale);



Object.entries(this.dotGridMap).forEach(([patternName, { gridSize, bbox, offsetX, offsetY }]) => {
  if (!bbox) {
    console.log(`⚠️ Skipped ${patternName}: No bounding box`);
    return;
  }

  const { x, y, width, height } = bbox;
  const spacingX = width / (gridSize - 1 || 1);
  const spacingY = height / (gridSize - 1 || 1);

 
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const dotX = offsetX + x + i * spacingX;
      const dotY = offsetY + y + j * spacingY;

      

      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, 2 * Math.PI);
      ctx.fillStyle = "#00ffff";
      ctx.fill();
    }
  }
});

ctx.restore();





const topCell = layoutEngine.getTopCell();
for (const inst of topCell?.instances || []) {
  this.drawPCellInstanceTree(inst);
}





    labelLibrary.drawAllLabels(ctx, this.offsetX, this.offsetY, this.scale, activeLayerId, ProjectManager.getSelectedCell(), this.previewLabel);
    
   // REMOVE or COMMENT this block 👇
   if (this.currentTool === "instance" && this.previewInstance) {
    const { ref, x, y } = this.previewInstance;
    const cell = layoutEngine.getCellByName(ref);
  
    if (cell && cell.elements?.length) {
      const { offsetX, offsetY } = this.getChildBoundingBoxCenterOffset(cell);
  
      const globalX = x;
      const globalY = y;
      const globalScale = this.scale; // 🔥 real fix
  
      ctx.save();
      ctx.translate(this.offsetX, this.offsetY); // canvas origin
      ctx.translate(globalX * globalScale, globalY * globalScale); // scaled position
      ctx.translate(offsetX * globalScale, offsetY * globalScale); // scaled center offset
  
      for (let el of cell.elements) {
        if (el.type === "rectangle") {
          InstanceLibrary.drawSingle(ctx, el, 1);
        } else if (el.type === "label") {
          labelLibrary.drawSingle(ctx, el, 1);
        }
      }
  
      ctx.restore();
    }
  }
  
  

    
// // ✅ Preview Label
// if (this.previewLabel) {
//   labelLibrary.drawSingle(
//     ctx,
//     this.previewLabel,
//     this.offsetX + this.previewLabel.x * this.scale,
//     this.offsetY + this.previewLabel.y * this.scale,
//     this.scale
//   );
// }

    //console.log("🎯 Current Cell:", ProjectManager.getSelectedCell());

//     const currentCell = layoutEngine.getCellByName(ProjectManager.getSelectedCell());
// if (currentCell) {
 
//   this.drawInstanceTree(currentCell, ctx);
// }
if (this.previewInstance) {
  const { ref, x, y } = this.previewInstance;
  const cell = layoutEngine.getCellByName(ref);
  
}

if (this.previewLabel) {
  ctx.save();
  ctx.translate(this.offsetX, this.offsetY);
  ctx.scale(this.scale, this.scale);
  labelLibrary.drawSingle(ctx, this.previewLabel);  // ✅ use raw x/y
  ctx.restore();
}


const selectedCell = ProjectManager.getSelectedCell();
if (this.useUploadedCells) {
  const uploadedCells = layoutEngine.getUploadedCells();
  const cell = uploadedCells.find(c => c.name === selectedCell);

  if (cell) {
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);
    this.drawRecursiveUploaded(ctx, cell.name, { x: 0, y: 0, rotation: 0 });
    ctx.restore();
  }
}

// 🔷 For manually created cells
const createdCell = layoutEngine.getCellByName(selectedCell);
if (createdCell) {
  const showOnlySelected = ProjectManager.getShowOnlySelected?.();
  const selectedPattern = ProjectManager.getSelectedPattern?.()?.trim();

  const normalize = str => str?.replace(/[\s_-]/g, "").toLowerCase();

  for (let inst of createdCell.instances || []) {
    const instanceRef = inst.ref?.trim();
    inst.visible = !showOnlySelected || normalize(instanceRef).includes(normalize(selectedPattern));
   
  }

  ctx.save();
  ctx.translate(this.offsetX, this.offsetY);
  ctx.scale(this.scale, this.scale);
  this.drawRecursiveInstances(createdCell, ctx);
  ctx.restore();
}









// ✅ Draw preview label (like previewInstance)
// if (this.currentTool === "label" && this.labelHandler.previewLabel) {
//   const preview = this.labelHandler.previewLabel;

//   ctx.save();
//   ctx.translate(this.offsetX, this.offsetY);
//   ctx.scale(this.scale, this.scale);

//   ctx.fillStyle = preview.color || 'yellow';
//   ctx.font = `${preview.fontSize || 12}px monospace`;
//   ctx.fillText(preview.text || '', preview.x, preview.y);

//   ctx.restore();
// }



// 🔁 Draw placed instances
// if (this.useUploadedCells) {
//   const uploadedCells = layoutEngine.getUploadedCells(); // ✅ define kar

//   ctx.save();
//   ctx.translate(this.offsetX, this.offsetY);
//   ctx.scale(this.scale, this.scale);

//   const selectedCell = ProjectManager.getSelectedCell();
//   const cell = uploadedCells.find(c => c.name === selectedCell);

//   if (cell) {
   
//     this.drawRecursiveUploaded(ctx, cell.name, { x: 0, y: 0, rotation: 0 });




//       ctx.restore();
    
//   }

//   ctx.restore();
// } else {
//   // ✅ Draw manually created cells
//   const currentCell = layoutEngine.getCellByName(ProjectManager.getSelectedCell());
//   if (currentCell) {
//     ctx.save();
//     ctx.translate(this.offsetX, this.offsetY);
//     ctx.scale(this.scale, this.scale);
//     this.drawRecursiveInstances(currentCell, ctx);
//     ctx.restore();
//   }
// }


    

    if (this.selectedObjects?.length) {
      ctx.save();
      ctx.translate(this.offsetX, this.offsetY);
      ctx.scale(this.scale, this.scale);
      ctx.strokeStyle = "#ffffff"; // White dashed line
      ctx.lineWidth = 2 / this.scale;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -this.dashOffset;
    
      for (let obj of this.selectedObjects) {
        if (obj.type === "rectangle") {
          const rect = obj.ref;
          const angle = (rect.rotation || 0) * Math.PI / 180;
          const cx = rect.x + rect.width / 2;
          const cy = rect.y + rect.height / 2;
    
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.translate(-cx, -cy);
          ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
          ctx.restore();
        }
        else if (obj.type === "label") {
          const label = obj.ref;
          const width = this.ctx.measureText(label.text).width;
          const height = label.fontSize;
          ctx.strokeRect(label.x - 4, label.y - height - 2, width + 8, height + 8);
        }
        else if (obj.type === "instance") {
          const inst = obj.ref;
          const refCell = layoutEngine.getCellByName(inst.ref);
          if (!refCell) continue;
        
          const { offsetX: childOffsetX, offsetY: childOffsetY } = this.getChildBoundingBoxCenterOffset(refCell);
        
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (let el of refCell.elements) {
            if (el.type !== "rectangle") continue;
        
            const elX = inst.x + childOffsetX + el.x;
            const elY = inst.y + childOffsetY + el.y;
            const width = el.width;
            const height = el.height;
        
            minX = Math.min(minX, elX);
            minY = Math.min(minY, elY);
            maxX = Math.max(maxX, elX + width);
            maxY = Math.max(maxY, elY + height);
          }
        
          ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        }
        
      }
    
      ctx.setLineDash([]);
      ctx.restore();
    }
    
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

  loadFromJSON(data) {
    const instances = data.instances || [];
    this.instanceManager.clearAll();
    instances.forEach((inst) => this.instanceManager.addInstance(inst));
    hierarchyManager.setInstances(instances);
    this.draw();
  }
}