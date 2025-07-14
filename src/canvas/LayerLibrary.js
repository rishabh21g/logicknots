import layermapData from '../data/layermap.json';

class LayerLibrary {
  constructor() {
    this.layers = layermapData.layers || [];

    this.visibilityMap = {};
    this.lockMap = {};
    this.editingMap = {};
    this.sortMode = 'none';
    
    this.selectedLayers = []; // ⬅ multiple selected layers store karne ke liye


    this.layers.forEach((layer) => {
      const key = this._getKey(layer.layer_number, layer.datatype_number);
      this.visibilityMap[key] = true;
      this.lockMap[key] = false;
      this.editingMap[key] = false;
    });
    if (this.layers.length > 0) {
        this.selectedLayers = [this.layers[0]]; // ✅ Set default selected layer
      }
      
  }

  // 🔐 Unique key
  _getKey(layerNumber, datatypeNumber) {
    return `${layerNumber}:${datatypeNumber}`;
  }

  // 🔁 Sort Handling
  setSortMode(mode) {
    this.sortMode = mode;
  }

  getSortMode() {
    return this.sortMode;
  }

  _sortLayers(layers) {
    if (this.sortMode === 'name') {
      return [...layers].sort((a, b) =>
        (a.layer_name + a.datatype_name).localeCompare(b.layer_name + b.datatype_name)
      );
    } else if (this.sortMode === 'number') {
      return [...layers].sort((a, b) =>
        a.layer_number - b.layer_number || a.datatype_number - b.datatype_number
      );
    }
    return layers;
  }

  // 📥 All layers
  getAllLayers() {
    return this._sortLayers(this.layers);
  }

  getGroupedLayers() {
    const grouped = {};
    this.getAllLayers().forEach((layer) => {
      const groupKey = `${layer.layer_name} (L${layer.layer_number})`;
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(layer);
    });
    return grouped;
  }

  getLayerByNumber(layerNumber, datatypeNumber = 0) {
    return this.layers.find(
      (l) =>
        parseInt(l.layer_number) === parseInt(layerNumber) &&
        parseInt(l.datatype_number) === parseInt(datatypeNumber)
    );
  }

  toggleVisibility(layer) {
    const key = this._getKey(layer.layer_number, layer.datatype_number);
    this.visibilityMap[key] = !this.visibilityMap[key];
  }

  isLayerVisible(layerNumber, datatypeNumber) {
    const key = this._getKey(layerNumber, datatypeNumber);
    return this.visibilityMap[key] ?? true;
  }

  toggleLock(layer) {
    const key = this._getKey(layer.layer_number, layer.datatype_number);
    this.lockMap[key] = !this.lockMap[key];
  }

  isLayerLocked(layerNumber, datatypeNumber) {
    const key = this._getKey(layerNumber, datatypeNumber);
    return this.lockMap[key] ?? false;
  }

  // ✏️ Edit Mode
  toggleEdit(layer) {
    const key = this._getKey(layer.layer_number, layer.datatype_number);
    this.editingMap[key] = !this.editingMap[key];
  }

  isEditing(layer) {
    const key = this._getKey(layer.layer_number, layer.datatype_number);
    return this.editingMap[key] ?? false;
  }

  updateLayer(layer, updates) {
    Object.assign(layer, updates);
  }

  moveLayerUp(layer) {
    const index = this.layers.indexOf(layer);
    if (index > 0) {
      [this.layers[index - 1], this.layers[index]] = [this.layers[index], this.layers[index - 1]];
    }
  }
  
  moveLayerDown(layer) {
    const index = this.layers.indexOf(layer);
    if (index < this.layers.length - 1) {
      [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
    }
  }


  // LayerLibrary class ke andar:


  selectLayer(layer, ctrlKey = false) {
    if (ctrlKey) {
      const exists = this.selectedLayers.includes(layer);
      if (exists) {
        this.selectedLayers = this.selectedLayers.filter(l => l !== layer);
      } else {
        this.selectedLayers.push(layer);
      }
    } else {
      this.selectedLayers = [layer]; // single select
    }
  }
  
  getSelectedLayers() {
    return this.selectedLayers;
  }
  
  clearSelection() {
    this.selectedLayers = [];
  }
  
  isLayerSelected(layer) {
    return this.selectedLayers.includes(layer);
  }

  updateColor(layer, color) {
    layer.color = color;
  }
  
  updateOpacity(layer, opacity) {
    layer.opacity = opacity;
  }

  getSelectedLayerId() {
    const selected = this.getSelectedLayers();
    if (selected.length === 0) return null;
    const l = selected[0];
    return `${l.layer_number}:${l.datatype_number}`;
  }
  getLayerById(layerId) {
    const [layerNum, dataTypeNum] = layerId.split(":").map(Number);
    return this.layers.find(
      l =>
        Number(l.layer_number) === layerNum &&
        Number(l.datatype_number) === dataTypeNum
    );
  }
  
  
  
  

  reorder(fromIndex, toIndex) {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= this.layers.length ||
      toIndex >= this.layers.length ||
      fromIndex === toIndex
    ) return;
  
    const moved = this.layers.splice(fromIndex, 1)[0];
    this.layers.splice(toIndex, 0, moved);
  }
  
  
}



const layerLibrary = new LayerLibrary();
export default layerLibrary;
