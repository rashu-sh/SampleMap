L.Control.ZoomBar = L.Control.extend({
  zoomToAreaActive: false,
  includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,
  originalView:{},
  options: {
    position: 'topright',
    containerClass: 'zoom-bg',
    zoomInIconClass: 'gis-plus',
    zoomOutIconClass: 'gis-minus',
    zoomToBBoxIconClass: 'gis-search-by-rectangle  searchangle',
    addFullScreen: true,
    fullscreenIconClass: 'gis-fullscreen no-border',
    showHistoryControl: true,
    backViewIconClass: 'fas fa-chevron-left',
    forwardViewIconClass: 'fas fa-chevron-right',
    addOriginalView:true,
    originalViewIconClass: 'gis-fullscreen no-border'
  },
  initialize: function (options) {
    L.setOptions(this, options);
  },
  onAdd: function (map) {
    this.originalView.center = map.getCenter();
    this.originalView.zoom = map.getZoom();
    document.ondragstart = function () {
      return false;
    }
    var container = L.DomUtil.create('div', 'leaflet-control-zoom ' + this.options.containerClass);
    var container_ul = L.DomUtil.create('ul', 'map-control-container',container);
    this._map = map;
    this._zoomInButton = this._createButton(this.options.zoomInIconClass, 'Zoom In', 'leaflet-control-zoom-in', container_ul, this._zoomIn, this);
    this._zoomOutButton = this._createButton(this.options.zoomOutIconClass, 'Zoom Out', 'leaflet-control-zoom-out', container_ul, this._zoomOut, this);
    this._zoomToBBoxButton = this._createButton(this.options.zoomToBBoxIconClass, 'Zoom to Area', 'leaflet-control-zoom-box', container_ul, this._zoomToArea, this);
    if (this.options.showHistoryControl) {
      this.historyControl = new L.control.historyControl({
        useExternalControls: true
      }).addTo(map);
      this._previousExtent = this._createButton(this.options.backViewIconClass, 'Go to Previous Extent', 'leaflet-control-previous-extent', container_ul, this._goBack, this);
      this._nextExtent = this._createButton(this.options.forwardViewIconClass, 'Go to Next Extent', 'leaflet-control-next-extent', container_ul, this._goForward, this);
    }
    // if (this.options.addFullScreen) {
    //  this._fullScreenButton = this._createButton(this.options.fullscreenIconClass, 'Full Screen', 'leaflet-control-full-screen', container_ul, this._toggleFullScreen, this);
    // }
    if (this.options.addOriginalView)
    {
      this._originalViewButton = this._createButton(this.options.originalViewIconClass, 'Zoom to default Extent', 'leaflet-control-original-view', container_ul, this.goToOriginalView, this);
    }
    // Listen for zoom events and call the UI update method..
    this._map.on('zoomend', this._updateDisabled, this);
    this._updateDisabled();
    return container;
  },

  onRemove: function (map) {
    map.off('zoomend', this._updateDisabled, this);
  },
  goToOriginalView:function(){
    this._map.setView(this.originalView.center,this.originalView.zoom);

  },
  _zoomIn: function (e) {
    console.log("Hello")
    this._map.zoomIn();
  },

  _zoomOut: function (e) {
    this._map.zoomOut();
  },

  // Initialize the control: Add the crosshairs cursor and get ready to draw.
  _zoomToArea: function (e) {
    this.zoomToAreaActive = !this.zoomToAreaActive;
    if (this.zoomToAreaActive) {
      this._zoomToAreaEnable();
    } else {
      this._zoomToAreaDisable();
    }

  },
  _zoomToAreaEnable: function () {
    // this.zoomToAreaActive = false;
    this._map.dragging._draggable._freeze=true;
    this._map.boxZoom.addHooks();
    this._map.on('mousedown', this.handleMouseDown, this);
    L.DomUtil.addClass(this._map._container, 'crosshair-cursor-enabled');
  },
  _zoomToAreaDisable: function () {
    // this.zoomToAreaActive = true;
    this._map.dragging._draggable._freeze=false;
    this._map.boxZoom.removeHooks();
    this._map.off('mousedown', this.handleMouseDown, this);
    L.DomUtil.removeClass(this._map._container, 'crosshair-cursor-enabled');
  },
  _toggleFullScreen: function () {
    this._map.toggleFullscreen();
    if (this._map.isFullscreen()) {
      L.DomUtil.removeClass(this._fullScreenButton, 'active');
    } else {
      L.DomUtil.addClass(this._fullScreenButton, 'active');
    }
  },
  _goBack: function () {
    this.historyControl.goBack();
  },
  _goForward: function () {
    this.historyControl.goForward();
  },
  handleMouseDown: function (e) {
    this._map.boxZoom._onMouseDown.call(this._map.boxZoom, {
      clientX: e.originalEvent.clientX,
      clientY: e.originalEvent.clientY,
      which: 1,
      shiftKey: true
    });
  },
  _updateDisabled: function () {
    L.DomUtil.removeClass(this._zoomInButton, 'leaflet-disabled');
    L.DomUtil.removeClass(this._zoomOutButton, 'leaflet-disabled');

    if (this._map._zoom <= this._map.getMinZoom()) {
      L.DomUtil.addClass(this._zoomOutButton, 'leaflet-disabled');
    }
    if (this._map._zoom >= this._map.getMaxZoom()) {
      L.DomUtil.addClass(this._zoomInButton, 'leaflet-disabled');
    }
  },

  _createButton: function (iconClass, title, className, container, fn, context) {
    var link_li = L.DomUtil.create('li', '', container);
    link_li.title = title;
    var link = L.DomUtil.create('a', className, link_li);
    link.href = '#';
    link.title = title;
    var icon = L.DomUtil.create('span', iconClass, link);
    var stop = L.DomEvent.stopPropagation;
    L.DomEvent
      .on(link_li, 'click', stop)
      .on(link_li, 'mousedown', stop)
      .on(link_li, 'dblclick', stop)
      .on(link_li, 'click', L.DomEvent.preventDefault)
      .on(link_li, 'click', fn, context);
    return link_li;
  }
});

L.Draggable.prototype._freeze=false;
L.Draggable.prototype._updatePosition= function () {
    if(this._freeze) {
        return;
    }

    this.fire('predrag');
    L.DomUtil.setPosition(this._element, this._newPos);
    this.fire('drag');
};

L.Map.mergeOptions({
  zoomBarControl: false
});

L.Map.addInitHook(function () {
  if (this.options.zoomBarControl) {
    this.zoomBarControl = new L.Control.ZoomBar(this.options.zoomBarControl);
    this.addControl(this.zoomBarControl);
  }
});

L.control.zoomBar = function (options) {
  return new L.Control.ZoomBar(options);
};
L.ZoomCenter = L.Class.extend({
  initialize: function (zoom, centerPoint) {
    this.zoom = zoom;
    this.centerPoint = centerPoint;
  }
});
L.Control.HistoryControl = L.Control.extend({
  _map: null,
  _backButton: null,
  _forwardButton: null,
  _state: {
    backDisabled: null,
    forwardDisabled: null,
    ignoringEvents: false,
    maxMovesToSave: 0,
    history: {
      items: []
    },
    future: {
      items: []
    }
  },
  options: {
    position: 'topright',
    maxMovesToSave: 10, //set to 0 for unlimited
    useExternalControls: false, //set to true to hide buttons on map and use your own. Can still use goBack, goForward, and allow this to take care of storing history.
    backImage: 'fa fa-caret-left',
    backText: '',
    backTooltip: 'Go to Previous Extent',
    backImageBeforeText: true,
    forwardImage: 'fa fa-caret-right',
    forwardText: '',
    forwardTooltip: 'Go to Next Extent',
    forwardImageBeforeText: false,
    orientation: 'horizontal',
    shouldSaveMoveInHistory: function (zoomCenter) {
      return true;
    } //by default save everything
  },
  initialize: function (options) {
    L.Util.setOptions(this, options);
    this._state.maxMovesToSave = this.options.maxMovesToSave;
    this._backButton = null;
    this._forwardButton = null;
  },
  onAdd: function (map) {
    this._map = map;
    var container = L.DomUtil.create('div', 'history-control leaflet-bar leaflet-control ' + this.options.orientation);
    if (!this.options.useExternalControls) {
      this._backButton = this._createButton('back', container, this.goBack, this);
      this._forwardButton = this._createButton('forward', container, this.goForward, this);
    }
    this._updateDisabled();
    this._addMapListeners();
    return container;
  },
  onRemove: function (map) {
    map.off('movestart');
  },
  performActionWithoutTriggeringEvent: function (action) {
    this._state.ignoringEvents = true;
    if (typeof (action) === 'function') {
      action();
    }
  },
  moveWithoutTriggeringEvent: function (zoomCenter) {
    var _this = this;
    this.performActionWithoutTriggeringEvent(function () {
      _this._map.setView(zoomCenter.centerPoint, zoomCenter.zoom);
    });
  },
  goBack: function () {
    var _this = this;
    return this._invokeBackOrForward('historyback', _this._state.history, _this._state.future);
  },
  goForward: function () {
    var _this = this;
    return this._invokeBackOrForward('historyforward', _this._state.future, _this._state.history);
  },
  clearHistory: function () {
    this._state.history.items = [];
    this._updateDisabled();
  },
  clearFuture: function () {
    this._state.future.items = [];
    this._updateDisabled();
  },
  _createButton: function (name, container, action, _this) {
    var text = this.options[name + 'Text'] || '';
    var imageClass = this.options[name + 'Image'] || '';
    var tooltip = this.options[name + 'Tooltip'] || '';
    var button = L.DomUtil.create('a', 'history-' + name + '-button', container);
    if (imageClass) {
      var imageElement = '<i class="' + imageClass + '"></i>';
      if (this.options[name + 'ImageBeforeText']) {
        text = imageElement + ' ' + text;
      } else {
        text += ' ' + imageElement;
      }
    }
    button.innerHTML = text;
    button.href = '#';
    button.title = tooltip;

    var stop = L.DomEvent.stopPropagation;

    L.DomEvent
      .on(button, 'click', stop)
      .on(button, 'mousedown', stop)
      .on(button, 'dblclick', stop)
      .on(button, 'click', L.DomEvent.preventDefault)
      .on(button, 'click', action, _this)
      .on(button, 'click', this._refocusOnMap, _this);

    return button;
  },
  _updateDisabled: function () {
    var backDisabled = (this._state.history.items.length === 0);
    var forwardDisabled = (this._state.future.items.length === 0);
    if (backDisabled !== this._state.backDisabled) {
      this._state.backDisabled = backDisabled;
      this._map.fire('historyback' + (backDisabled ? 'disabled' : 'enabled'));
    }
    if (forwardDisabled !== this._state.forwardDisabled) {
      this._state.forwardDisabled = forwardDisabled;
      this._map.fire('historyforward' + (forwardDisabled ? 'disabled' : 'enabled'));
    }
    if (!this.options.useExternalControls) {
      this._setButtonDisabled(this._backButton, backDisabled);
      this._setButtonDisabled(this._forwardButton, forwardDisabled);
    }
  },
  _setButtonDisabled: function (button, condition) {
    var className = 'leaflet-disabled';
    if (condition) {
      L.DomUtil.addClass(button, className);
    } else {
      L.DomUtil.removeClass(button, className);
    }
  },
  _pop: function (stack) {
    stack = stack.items;
    if (L.Util.isArray(stack) && stack.length > 0) {
      return stack.splice(stack.length - 1, 1)[0];
    }
    return undefined;
  },
  _push: function (stack, value) {
    var maxLength = this._state.maxMovesToSave;
    stack = stack.items;
    if (L.Util.isArray(stack)) {
      stack.push(value);
      if (maxLength > 0 && stack.length > maxLength) {
        stack.splice(0, 1);
      }
    }
  },
  _invokeBackOrForward: function (eventName, stackToPop, stackToPushCurrent) {
    var response = this._popStackAndUseLocation(stackToPop, stackToPushCurrent);
    if (response) {
      this._map.fire(eventName, response);
      return true;
    }
    return false;
  },
  _popStackAndUseLocation: function (stackToPop, stackToPushCurrent) {
    //check if we can pop
    if (L.Util.isArray(stackToPop.items) && stackToPop.items.length > 0) {
      var current = this._buildZoomCenterObjectFromCurrent(this._map);
      //get most recent
      var previous = this._pop(stackToPop);
      //save where we currently are in the 'other' stack
      this._push(stackToPushCurrent, current);
      this.moveWithoutTriggeringEvent(previous);

      return {
        previousLocation: previous,
        currentLocation: current
      };
    }
  },
  _buildZoomCenterObjectFromCurrent: function (map) {
    return new L.ZoomCenter(map.getZoom(), map.getCenter());
  },
  _addMapListeners: function () {
    var _this = this;
    this._map.on('movestart', function (e) {
      if (!_this._state.ignoringEvents) {
        var current = _this._buildZoomCenterObjectFromCurrent(e.target);
        if (_this.options.shouldSaveMoveInHistory(current)) {
          _this._state.future.items = [];
          _this._push(_this._state.history, current);
        }
      } else {
        _this._state.ignoringEvents = false;
      }

      _this._updateDisabled();
    });
  }
});

L.control.historyControl = function (options) {
  return new L.Control.HistoryControl(options);
};
