/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/*
 * @Author: 秦少卫
 * @Date: 2023-02-03 21:50:10
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-02-18 20:01:41
 * @Description: 工作区初始化
 */

import { fabric } from 'fabric';

class EditorWorkspace {
  constructor(canvas, option) {
    this.canvas = canvas;
    this.workspaceEl = document.querySelector('#workspace');
    this.workspace = null;
    this.option = option;
    this._initBackground();
    this._initWorkspace();
    this._initResizeObserve();
    this._initDring();
  }

  // 初始化背景
  _initBackground() {
    this.canvas.setBackgroundColor('#F1F1F1', this.canvas.renderAll.bind(this.canvas));
    this.canvas.backgroundImage = '';
    this.canvas.setWidth(this.workspaceEl.offsetWidth);
    this.canvas.setHeight(this.workspaceEl.offsetHeight);
    // 上一次画布大小
    this.width = this.workspaceEl.offsetWidth;
    this.height = this.workspaceEl.offsetHeight;
  }

  // 初始化画布
  _initWorkspace() {
    const { width, height } = this.option;
    const workspace = new fabric.Rect({
      fill: '#ffffff',
      width,
      height,
      id: 'workspace',
    });
    workspace.set('selectable', false);
    workspace.set('hasControls', false);
    workspace.hoverCursor = 'selection';
    this.canvas.add(workspace);
    this.canvas.centerObject(workspace);
    this.canvas.renderAll();

    this.workspace = workspace;
    this.auto();
  }

  // 初始化监听器
  _initResizeObserve() {
    const resizeObserver = new ResizeObserver((entries) => {
      this.auto();
      const diffWidth = entries[0].contentRect.width / 2 - this.width / 2;
      const diffHeight = entries[0].contentRect.height / 2 - this.height / 2;
      this.width = entries[0].contentRect.width;
      this.height = entries[0].contentRect.height;
      this.canvas.getObjects().forEach((obj) => {
        if (obj.id !== 'workspace') {
          const left = obj.left + diffWidth;
          const top = obj.top + diffHeight;
          obj.set({
            left,
            top,
          });
          obj.setCoords();
        }
      });
      this.canvas.renderAll.bind(this.canvas);
      this.canvas.renderAll();
      this.canvas.requestRenderAll();
    });

    resizeObserver.observe(this.workspaceEl);
  }

  setSize(width, height) {
    this._initBackground();
    this.option.width = width;
    this.option.height = height;
    // 重新设置workspace
    this.workspace = this.canvas.getObjects().find((item) => item.id === 'workspace');
    this.workspace.set('width', width);
    this.workspace.set('height', height);
    // 获取偏移
    const l1 = Number(this.workspace.left);
    const t1 = Number(this.workspace.top);
    this.canvas.centerObject(this.workspace);
    this.moveEl(this.workspace.left - l1, this.workspace.top - t1);
    this.auto();
  }

  moveEl(diffWidth, diffHeight) {
    this.canvas.getObjects().forEach((obj) => {
      if (obj.id !== 'workspace') {
        const left = obj.left + diffWidth;
        const top = obj.top + diffHeight;
        obj.set({
          left,
          top,
        });
        obj.setCoords();
      }
    });
    this.canvas.renderAll();
    this.canvas.requestRenderAll();
  }

  setZoomAuto(scale, cb) {
    const { workspaceEl } = this;
    const width = workspaceEl.offsetWidth;
    const height = workspaceEl.offsetHeight;
    this.canvas.setWidth(width);
    this.canvas.setHeight(height);
    const center = this.canvas.getCenter();
    this.canvas.setViewportTransform(fabric.iMatrix.concat());
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), scale);
    this.canvas.centerObject(this.workspace);
    this.canvas.renderAll();

    // 超出画布不展示
    this.workspace.clone((cloned) => {
      this.canvas.clipPath = cloned;
      this.canvas.requestRenderAll();
    });
    if (cb) cb(this.workspace.left, this.workspace.top);
  }

  _getScale() {
    const viewPortWidth = this.workspaceEl.offsetWidth;
    const viewPortHeight = this.workspaceEl.offsetHeight;
    // 按照宽度
    if (viewPortWidth / viewPortHeight < this.option.width / this.option.height) {
      return viewPortWidth / this.option.width;
    } // 按照宽度缩放
    return viewPortHeight / this.option.height;
  }

  // 放大
  big() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio += 0.05;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
  }

  // 缩小
  small() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio -= 0.05;
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
  }

  // 自动缩放
  auto() {
    const scale = this._getScale();
    this.setZoomAuto(scale - 0.08);
  }

  // 1:1 放大
  one() {
    this.setZoomAuto(0.8 - 0.08);
    this.canvas.requestRenderAll();
  }

  // 拖拽模式
  _initDring() {
    let vpt = undefined;
    // const This = this;
    let lastPosX = undefined;
    let lastPosY = undefined;
    this.canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (evt.altKey === true || opt.button === 2) {
        this._setDring();
        this.isDragging = true;
        // 浅拷贝
        vpt = { ...this.canvas.viewportTransform };
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:move', (opt) => {
      if (this.isDragging && vpt && lastPosX && lastPosY) {
        this.canvas.defaultCursor = 'grabbing';
        const { e } = opt;
        const deltaX = e.clientX - lastPosX;
        const deltaY = e.clientY - lastPosY;
        // ignoreZoom
        vpt[0] = 1;
        vpt[3] = 1;
        const deltaPoint = new fabric.Point(deltaX, deltaY);
        const newPoint = fabric.util.transformPoint(deltaPoint, vpt).multiplyEquals(-1);
        this.canvas.absolutePan(newPoint);
      }
    });

    this.canvas.on('mouse:up', () => {
      this.canvas.setViewportTransform(this.canvas.viewportTransform);
      this.isDragging = false;
      vpt = undefined;
      lastPosX = undefined;
      lastPosY = undefined;
      this.canvas.selection = true;
      this.canvas.defaultCursor = 'default';
      this.workspace.hoverCursor = 'default';
      this.canvas.getObjects().forEach((obj) => {
        if (obj.id !== 'workspace' && obj.hasControls) {
          obj.selectable = true;
        }
      });
      this.canvas.requestRenderAll();
    });

    this.canvas.on('mouse:wheel', function (opt) {
      const delta = opt.e.deltaY;
      let zoom = this.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      const center = this.getCenter();
      this.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  }

  _setDring() {
    this.canvas.selection = false;
    this.canvas.defaultCursor = 'grab';
    this.workspace.hoverCursor = 'grab';
    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = false;
    });
    this.canvas.renderAll();
    this.canvas.requestRenderAll();
  }
}

export default EditorWorkspace;
