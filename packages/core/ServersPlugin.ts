/*
 * @Author: 秦少卫
 * @Date: 2023-06-20 12:52:09
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-06-07 22:25:44
 * @Description: 内部插件
 */
import { v4 as uuid } from 'uuid';
import { selectFiles, clipboardText, downFile } from './utils/utils';
import { fabric } from 'fabric';
import Editor from './Editor';
type IEditor = Editor;
import { SelectEvent, SelectMode } from './eventType';
import { off } from 'process';
import { forIn } from 'lodash-es';

function transformText(objects: any) {
  if (!objects) return;
  objects.forEach((item: any) => {
    if (item.objects) {
      transformText(item.objects);
    } else {
      item.type === 'text' && (item.type = 'textbox');
    }
  });
}

class ServersPlugin {
  public canvas: fabric.Canvas;
  public editor: IEditor;
  public selectedMode: SelectMode;
  static pluginName = 'ServersPlugin';
  static apis = [
    'insert',
    'loadJSON',
    'getJson',
    'dragAddItem',
    'clipboard',
    'clipboardBase64',
    'saveJson',
    'saveSvg',
    'saveImg',
    'clear',
    'preview',
    'addImgByElement',
    'getImageExtension',
    'getSelectMode',
    'getExtensionKey',
  ];
  static events = [SelectMode.ONE, SelectMode.MULTI, SelectEvent.CANCEL];
  // public hotkeys: string[] = ['left', 'right', 'down', 'up'];
  constructor(canvas: fabric.Canvas, editor: IEditor) {
    this.canvas = canvas;
    this.editor = editor;
    this.selectedMode = SelectMode.EMPTY;
    this._initSelectEvent();
  }

  private _initSelectEvent() {
    this.canvas.on('selection:created', () => this._emitSelectEvent());
    this.canvas.on('selection:updated', () => this._emitSelectEvent());
    this.canvas.on('selection:cleared', () => this._emitSelectEvent());
  }

  private _emitSelectEvent() {
    if (!this.canvas) {
      throw TypeError('还未初始化');
    }

    const actives = this.canvas
      .getActiveObjects()
      .filter((item) => !(item instanceof fabric.GuideLine)); // 过滤掉辅助线
    if (actives && actives.length === 1) {
      this.selectedMode = SelectMode.ONE;
      this.editor.emit(SelectEvent.ONE, actives);
    } else if (actives && actives.length > 1) {
      this.selectedMode = SelectMode.MULTI;
      this.editor.emit(SelectEvent.MULTI, actives);
    } else {
      this.editor.emit(SelectEvent.CANCEL);
    }
  }

  getSelectMode() {
    return String(this.selectedMode);
  }

  insert(callback?: () => void) {
    selectFiles({ accept: '.json' }).then((files) => {
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = () => {
          this.loadJSON(reader.result as string, callback);
        };
      }
    });
  }

  // 设置path属性
  renderITextPath(textPaths: Record<'id' | 'path', any>[]) {
    textPaths.forEach((item) => {
      const object = this.canvas.getObjects().find((o) => o.id === item.id);
      if (object) {
        fabric.Path.fromObject(item.path, (e) => {
          object.set('path', e);
        });
      }
    });
  }

  async loadJSON(jsonFile: string | object, callback?: () => void) {
    // 确保元素存在id
    const temp = typeof jsonFile === 'string' ? JSON.parse(jsonFile) : jsonFile;
    const textPaths: Record<'id' | 'path', any>[] = [];
    temp.objects.forEach((item: any) => {
      !item.id && (item.id = uuid());
      // 收集所有路径文本元素i-text，并设置path为null
      if (item.type === 'i-text' && item.path) {
        textPaths.push({ id: item.id, path: item.path });
        item.path = null;
      }
    });

    // hookTransform遍历
    const tempTransform = await this._transform(temp);

    jsonFile = JSON.stringify(tempTransform);
    // 加载前钩子
    this.editor.hooksEntity.hookImportBefore.callAsync(jsonFile, () => {
      this.canvas.loadFromJSON(jsonFile, () => {
        // 把i-text对应的path加上
        this.renderITextPath(textPaths);
        this.canvas.renderAll();
        // 加载后钩子
        this.editor.hooksEntity.hookImportAfter.callAsync(jsonFile, () => {
          // 修复导入带水印的json无法清除问题 #359
          this.editor?.updateDrawStatus(!!temp['overlayImage']);
          this.canvas.renderAll();
          callback && callback();
          this.editor.emit('loadJson');
        });
      });
    });
  }

  async _transform(json: any) {
    await this.promiseCallAsync(json);
    if (json.objects) {
      const all = json.objects.map((item: any) => {
        return this._transform(item);
      });
      await Promise.all(all);
    }
    return json;
  }

  promiseCallAsync(item: any) {
    return new Promise((resolve) => {
      this.editor.hooksEntity.hookTransform.callAsync(item, () => {
        resolve(item);
      });
    });
  }

  getJson() {
    const keys = this.getExtensionKey();
    return this.canvas.toJSON(keys);
  }

  getExtensionKey() {
    return [
      'id',
      'gradientAngle',
      'selectable',
      'hasControls',
      'linkData',
      'editable',
      'extensionType',
      'extension',
    ];
  }

  /**
   * @description: 拖拽添加到画布
   * @param {Event} event
   * @param {Object} item
   */
  dragAddItem(item: fabric.Object, event?: DragEvent) {
    if (event) {
      const { left, top } = this.canvas.getSelectionElement().getBoundingClientRect();
      if (event.x < left || event.y < top || item.width === undefined) return;

      const point = {
        x: event.x - left,
        y: event.y - top,
      };
      const pointerVpt = this.canvas.restorePointerVpt(point);
      item.left = pointerVpt.x - item.width / 2;
      item.top = pointerVpt.y;
    }
    const { width } = this._getSaveOption();
    width && item.scaleToWidth(width / 2);
    this.canvas.add(item);
    this.canvas.setActiveObject(item);

    !event && this.editor.position('center');
    this.canvas.requestRenderAll();
  }

  clipboard() {
    const jsonStr = this.getJson();
    clipboardText(JSON.stringify(jsonStr, null, '\t'));
  }

  clipboardBase64() {
    this.preview().then((dataUrl: any) => {
      clipboardText(dataUrl);
    });
  }

  async saveJson() {
    const dataUrl = this.getJson();
    // 把文本text转为textgroup，让导入可以编辑
    await transformText(dataUrl.objects);
    const fileStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataUrl, null, '\t')
    )}`;
    downFile(fileStr, 'json');
  }

  saveSvg() {
    this.editor.hooksEntity.hookSaveBefore.callAsync('', () => {
      const { fontOption, svgOption } = this._getSaveSvgOption();
      fabric.fontPaths = {
        ...fontOption,
      };
      const dataUrl = this.canvas.toSVG(svgOption);
      const fileStr = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dataUrl)}`;
      this.editor.hooksEntity.hookSaveAfter.callAsync(fileStr, () => {
        downFile(fileStr, 'svg');
      });
    });
  }

  saveImg() {
    this.editor.hooksEntity.hookSaveBefore.callAsync('', () => {
      const option = this._getSaveOption();
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const dataUrl = this.canvas.toDataURL(option);
      this.editor.hooksEntity.hookSaveAfter.callAsync(dataUrl, () => {
        downFile(dataUrl, 'png');
      });
    });
  }

  preview() {
    return new Promise((resolve) => {
      this.editor.hooksEntity.hookSaveBefore.callAsync('', () => {
        const option = this._getSaveOption();
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.canvas.renderAll();
        const dataUrl = this.canvas.toDataURL(option);
        this.editor.hooksEntity.hookSaveAfter.callAsync(dataUrl, () => {
          resolve(dataUrl);
        });
      });
    });
  }

  _getSaveSvgOption() {
    const workspace = this.canvas.getObjects().find((item) => item.id === 'workspace');
    let fontFamilyArry = this.canvas
      .getObjects()
      .filter((item) => item.type == 'textbox')
      .map((item) => item.fontFamily);
    fontFamilyArry = Array.from(new Set(fontFamilyArry));

    const fontList = this.editor.getPlugin('FontPlugin').cacheList;

    const fontEntry = {};
    for (const font of fontFamilyArry) {
      const item = fontList.find((item) => item.name === font);
      fontEntry[font] = item.file;
    }

    console.log('_getSaveSvgOption', fontEntry);
    const { left, top, width, height } = workspace as fabric.Object;
    return {
      fontOption: fontEntry,
      svgOption: {
        width,
        height,
        viewBox: {
          x: left,
          y: top,
          width,
          height,
        },
      },
    };
  }

  _getSaveOption() {
    const workspace = this.canvas
      .getObjects()
      .find((item: fabric.Object) => item.id === 'workspace');
    console.log('getObjects', this.canvas.getObjects());
    const { left, top, width, height } = workspace as fabric.Object;
    const option = {
      name: 'New Image',
      format: 'png',
      quality: 1,
      width,
      height,
      left,
      top,
    };
    return option;
  }

  addImgByElement(target: HTMLImageElement) {
    // const target = e.target as HTMLImageElement;
    const imgType = this.getImageExtension(target.src);
    if (imgType === 'svg') {
      fabric.loadSVGFromURL(target.src, (objects) => {
        const item = fabric.util.groupSVGElements(objects, {
          shadow: '',
          fontFamily: 'arial',
          id: uuid(),
          name: 'svg元素',
        });
        this.dragAddItem(item);
      });
    } else {
      fabric.Image.fromURL(
        target.src,
        (imgEl) => {
          imgEl.set({
            left: 100,
            top: 100,
          });
          this.dragAddItem(imgEl);
        },
        { crossOrigin: 'anonymous' }
      );
    }
  }

  getImageExtension(imageUrl: string) {
    const pathParts = imageUrl.split('/');
    const filename = pathParts[pathParts.length - 1];
    const fileParts = filename.split('.');
    return fileParts[fileParts.length - 1];
  }

  clear() {
    this.canvas.getObjects().forEach((obj) => {
      if (obj.id !== 'workspace') {
        this.canvas.remove(obj);
      }
    });
    this.editor?.setWorkspaseBg('#fff');
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  destroy() {
    console.log('pluginDestroy');
  }
}

export default ServersPlugin;
