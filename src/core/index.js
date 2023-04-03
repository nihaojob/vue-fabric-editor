/*
 * @Author: 秦少卫
 * @Date: 2023-02-03 23:29:34
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-03-08 22:55:29
 * @Description: 核心入口文件
 */
import EventEmitter from 'events';
// import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';

// 对齐辅助线
import initAligningGuidelines from '@/core/initAligningGuidelines';
import initControlsRotate from '@/core/initControlsRotate';
import InitCenterAlign from '@/core/initCenterAlign';
import initHotkeys from '@/core/initHotKeys';
import initControls from '@/core/initControls';
import { fixFabricMouseEvent } from '@/core/fixFabric';

class Editor extends EventEmitter {
  constructor(canvas) {
    super();

    this.canvas = canvas;
    this.editorWorkspace = null;

    initAligningGuidelines(canvas);
    initHotkeys(canvas);
    initControls(canvas);
    initControlsRotate(canvas);
    this.centerAlign = new InitCenterAlign(canvas);

    fixFabricMouseEvent(canvas);
  }

  clone() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject.length === 0) return;
    activeObject.clone((cloned) => {
      this.canvas.discardActiveObject();
      // 间距设置
      const grid = 10;
      cloned.set({
        left: cloned.left + grid,
        top: cloned.top + grid,
        id: uuid(),
      });
      this.canvas.add(cloned);
      this.canvas.setActiveObject(cloned);
      this.canvas.requestRenderAll();
    });
  }

  // 拆分组
  unGroup() {
    // 先获取当前选中的对象，然后打散
    this.canvas.getActiveObject().toActiveSelection();
    this.canvas
      .getActiveObject()
      .getObjects()
      .forEach((item) => {
        item.set('id', uuid());
      });
    this.canvas.discardActiveObject().renderAll();
  }

  group() {
    // 组合元素
    const activeObj = this.canvas.getActiveObject();
    const activegroup = activeObj.toGroup();
    const objectsInGroup = activegroup.getObjects();
    activegroup.clone((newgroup) => {
      newgroup.set('id', uuid());
      this.canvas.remove(activegroup);
      objectsInGroup.forEach((object) => {
        this.canvas.remove(object);
      });
      this.canvas.add(newgroup);
      this.canvas.setActiveObject(newgroup);
    });
  }

  up() {
    const actives = this.canvas.getActiveObjects();
    if (actives && actives.length === 1) {
      const activeObject = this.canvas.getActiveObjects()[0];
      activeObject && activeObject.bringForward();
      this.canvas.renderAll();
      this._workspaceSendToBack();
    }
  }

  upTop() {
    const actives = this.canvas.getActiveObjects();
    if (actives && actives.length === 1) {
      const activeObject = this.canvas.getActiveObjects()[0];
      activeObject && activeObject.bringToFront();
      this.canvas.renderAll();
      this._workspaceSendToBack();
    }
  }

  down() {
    const actives = this.canvas.getActiveObjects();
    if (actives && actives.length === 1) {
      const activeObject = this.canvas.getActiveObjects()[0];
      activeObject && activeObject.sendBackwards();
      this.canvas.renderAll();
      this._workspaceSendToBack();
    }
  }

  downTop() {
    const actives = this.canvas.getActiveObjects();
    if (actives && actives.length === 1) {
      const activeObject = this.canvas.getActiveObjects()[0];
      activeObject && activeObject.sendToBack();
      this.canvas.renderAll();
      this._workspaceSendToBack();
    }
  }

  getWorkspace() {
    const workspace = this.canvas.getObjects().find((item) => item.id === 'workspace');
    return workspace;
  }

  _workspaceSendToBack() {
    const workspace = this.getWorkspace();
    workspace && workspace.sendToBack();
  }

  getJson() {
    return this.canvas.toJSON(['id', 'gradientAngle', 'selectable', 'hasControls']);
  }

  /**
   * @description: 拖拽添加到画布
   * @param {Event} event
   * @param {Object} item
   */
  dragAddItem(event, item) {
    const { left, top } = this.canvas.getSelectionElement().getBoundingClientRect();
    if (event.x < left || event.y < top) return;

    const point = {
      x: event.x - left,
      y: event.y - top,
    };
    const pointerVpt = this.canvas.restorePointerVpt(point);
    item.left = pointerVpt.x - item.width / 2;
    item.top = pointerVpt.y;
    this.canvas.add(item);
    this.canvas.requestRenderAll();
  }
}

export default Editor;
