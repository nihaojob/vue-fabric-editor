import { fabric } from 'fabric';
import Editor from '../Editor';
import { v4 as uuid } from 'uuid';

type IEditor = Editor;

type LineCoords = [fabric.Point, fabric.Point];

class DrawPolygonPlugin {
  isDrawingPolygon = false;
  points: fabric.Point[] = [];
  lines: fabric.Line[] = [];
  anchors: fabric.Circle[] = [];
  tempPoint: fabric.Point | undefined;
  tempLine: fabric.Line | undefined;
  lastPoint: fabric.Point | undefined;
  // 最后一点和第一点的距离为<=delta即闭合
  delta = 5;
  static pluginName = 'DrawPolygonPlugin';
  static apis = ['beginDrawPolygon', 'endDrawPolygon', 'discardPolygon'];
  constructor(public canvas: fabric.Canvas, public editor: IEditor) {}
  _bindEvent() {
    window.addEventListener('keydown', this._escListener);
    this.canvas.on('mouse:down', this._downHandler);
    this.canvas.on('mouse:move', this._moveHandler);
  }
  _escListener = (evt: KeyboardEvent) => {
    if (evt.key === 'Escape' || evt['keyCode'] === 27) {
      this._confirmBuildPolygon();
    }
  };
  _downHandler = (ev: fabric.IEvent<Event>) => {
    if (!this.isDrawingPolygon) return;
    const absPointer = ev.absolutePointer!;
    const confirmPoint = new fabric.Point(absPointer.x, absPointer.y);
    const anchor = this._mackAnchor(absPointer);
    this.anchors.push(anchor);
    if (this.tempLine == null) {
      const tempPoint = new fabric.Point(absPointer.x, absPointer.y);
      this.tempLine = this._makeLine([tempPoint, tempPoint]);
      this.canvas.add(this.tempLine);
    } else {
      this.tempLine.set({
        x1: absPointer.x,
        y1: absPointer.y,
        x2: absPointer.x,
        y2: absPointer.y,
      });
    }
    if (this.lastPoint) {
      const line = this._makeLine([this.lastPoint, confirmPoint]);
      this.lines.push(line);
      this.canvas.add(line);
      if (this.points[0].distanceFrom(confirmPoint) / this.canvas.getZoom() <= this.delta) {
        this._confirmBuildPolygon();
        return;
      }
    }
    this.canvas.add(anchor);
    this.lastPoint = confirmPoint;
    this.points.push(confirmPoint);
    this._ensureAnchorsForward();
  };
  _moveHandler = (ev: fabric.IEvent<Event>) => {
    if (!this.isDrawingPolygon || !this.tempLine) return;
    const absPoint = ev.absolutePointer!;
    this.tempLine.set({
      x2: absPoint.x,
      y2: absPoint.y,
    });
    this.canvas.renderAll();
  };
  _ensureAnchorsForward() {
    this.anchors.forEach((item) => {
      item.bringForward();
    });
  }
  _unbindEvent() {
    window.removeEventListener('keydown', this._escListener);
    this.canvas.off('mouse:down', this._downHandler);
    this.canvas.off('mouse:move', this._moveHandler);
  }
  _createPolygon() {
    return new fabric.Polygon([...this.points], {
      fill: '#ccc',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      id: uuid(),
    });
  }
  _makeLine(coors: LineCoords) {
    const [p1, p2] = coors;
    return new fabric.Line([p1.x, p1.y, p2.x, p2.y], {
      fill: '#000',
      stroke: '#000',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
  }
  _mackAnchor(position: fabric.Point) {
    return new fabric.Circle({
      radius: 5,
      left: position.x,
      top: position.y,
      fill: 'rgb(178, 53, 84)',
      scaleX: 1 / this.canvas.getZoom(),
      scaleY: 1 / this.canvas.getZoom(),
      strokeWidth: 1 / this.canvas.getZoom(),
      originX: 'center',
      originY: 'center',
      evented: false,
      selectable: false,
    });
  }
  _confirmBuildPolygon() {
    if (this.points.length >= 3) {
      const poly = this._createPolygon();
      this.canvas.add(poly);
    }
    this.discardPolygon();
  }
  beginDrawPolygon() {
    this.canvas.discardActiveObject();
    this.canvas.getObjects().forEach((obj) => {
      obj.selectable = false;
      obj.hasControls = false;
    });
    this.canvas.requestRenderAll();
    this.isDrawingPolygon = true;
    this._bindEvent();
  }
  endDrawPolygon() {
    this.canvas.discardActiveObject();
    this.isDrawingPolygon = false;
    this.lastPoint = undefined;
    this.tempPoint = undefined;
    this._unbindEvent();
  }
  discardPolygon() {
    this.lines.forEach((item) => {
      this.canvas.remove(item);
    });
    this.anchors.forEach((item) => {
      this.canvas.remove(item);
    });
    this.tempLine && this.canvas.remove(this.tempLine);
    this.tempLine = undefined;
    this.anchors = [];
    this.lines = [];
    this.points = [];
    this.endDrawPolygon();
  }
}

export default DrawPolygonPlugin;
