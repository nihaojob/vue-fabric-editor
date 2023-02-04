/*
 * @Author: 秦少卫
 * @Date: 2023-02-03 21:50:10
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-02-05 01:12:55
 * @Description: 工作区初始化
 */

import { fabric } from 'fabric';

class EditorWorkspace {
    constructor(canvas, option){
        this.canvas = canvas
        this.workspaceEl = document.querySelector('#workspace')
        this.workspace = null
        this.option = option
        this._initBackground()
        this._initWorkspace()
        this._initResizeObserve()
        this._initDring()
    }
    // 初始化背景
    _initBackground(){
        this.canvas.setBackgroundColor('#F1F1F1', this.canvas.renderAll.bind(this.canvas))
        this.canvas.backgroundImage = ''
        this.canvas.setWidth(this.workspaceEl.offsetWidth);
        this.canvas.setHeight(this.workspaceEl.offsetHeight);
        // 上一次画布大小
        this.width = this.workspaceEl.offsetWidth
        this.height = this.workspaceEl.offsetHeight
    }
    // 初始化画布
    _initWorkspace(){
        const { width, height} = this.option
        const workspace = new fabric.Rect({
            fill: '#ffffff',
            width: width,
            height: height,
            id: 'workspace',
        });
        workspace.set('selectable',false)
        workspace.set('hasControls',false)
        workspace.hoverCursor = 'selection'
        this.canvas.add(workspace)
        this.canvas.centerObject(workspace)
        this.canvas.renderAll()

        this.workspace = workspace
        this.auto()
    }


    // 初始化监听器
    _initResizeObserve(){
      const resizeObserver = new ResizeObserver((entries) => {
        this.auto()

        const diffWidth = entries[0].contentRect.width / 2 - this.width / 2;
		const diffHeight = entries[0].contentRect.height / 2 - this.height / 2;
        this.width = entries[0].contentRect.width
        this.height = entries[0].contentRect.height
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
        this.canvas.renderAll()
        this.canvas.requestRenderAll()
      });

      resizeObserver.observe(this.workspaceEl);
    }

    setSize(width, height) {
        // this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this._initBackground()
        this.option.width = width
        this.option.height = height
        // 重新设置workspace
        this.workspace = this.canvas.getObjects().find(item => item.id === 'workspace')
        this.workspace.set('width', width);
        this.workspace.set('height', height);
        this.canvas.renderAll()
        this.canvas.requestRenderAll()
        // this.moveEl()
        // const scale = this._getScale()
        // this.setZoomAuto1(scale - 0.08)
        this.auto()
    }

    setZoomAuto(scale){
        const { workspaceEl } = this
        let width = workspaceEl.offsetWidth, height = workspaceEl.offsetHeight
        const center = this.canvas.getCenter()
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.canvas.zoomToPoint(
            new fabric.Point(center.left, center.top),
            scale
        )
        this.canvas.centerObject(this.workspace)
        this.canvas.setWidth(width);
        this.canvas.setHeight(height);
        this.canvas.renderAll()
    }

    // setZoomAuto1(scale){
    //     const { workspaceEl } = this
    //     let width = workspaceEl.offsetWidth, height = workspaceEl.offsetHeight
    //     const center = this.canvas.getCenter()
    //     this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    //     this.canvas.zoomToPoint(
    //         new fabric.Point(center.left, center.top),
    //         scale
    //     )
    //     this.canvas.centerObject(this.workspace)
    //     this.canvas.setWidth(width);
    //     this.canvas.setHeight(height);
    //     this.canvas.renderAll()
    // }

    _getScale(){
        const viewPortWidth = this.workspaceEl.offsetWidth
        const viewPortHeight = this.workspaceEl.offsetHeight
        // 按照宽度
        if (viewPortWidth/viewPortHeight < this.option.width/this.option.height) {
            return viewPortWidth / this.option.width
        }else{ // 按照宽度缩放
            return viewPortHeight / this.option.height
        }
    }

    // 放大
    big(){
        let zoomRatio = this.canvas.getZoom();
        zoomRatio += 0.05;
        const center = this.canvas.getCenter()
        this.canvas.zoomToPoint(
            new fabric.Point(center.left, center.top),
            zoomRatio
        )
    }
    // 缩小
    small(){
        let zoomRatio = this.canvas.getZoom();
        zoomRatio -= 0.05;
        const center = this.canvas.getCenter()
        this.canvas.zoomToPoint(
            new fabric.Point(center.left, center.top),
            zoomRatio
        )
    }

    // 自动缩放
    auto(){
        const scale = this._getScale()
        this.setZoomAuto(scale - 0.08)
    }

    // 1:1 放大
    one(){
        this.setZoomAuto(0.8 - 0.08)
        this.canvas.requestRenderAll()
    }

    // 拖拽模式
    _initDring(){
        const This = this
        this.canvas.on('mouse:down', function(opt) {
            var evt = opt.e;
            if (evt.altKey === true) {
              this.defaultCursor = 'grab';
              This._setDring()
              this.selection = false;
              this.isDragging = true;
              this.lastPosX = evt.clientX;
              this.lastPosY = evt.clientY;
              this.requestRenderAll();
            }
        });

        this.canvas.on('mouse:move', function(opt) {
            if (this.isDragging) {
              this.defaultCursor = 'grabbing';
              var e = opt.e;
              var vpt = this.viewportTransform;
              vpt[4] += e.clientX - this.lastPosX;
              vpt[5] += e.clientY - this.lastPosY;
              this.lastPosX = e.clientX;
              this.lastPosY = e.clientY;
              this.requestRenderAll();
            }
        });

        this.canvas.on('mouse:up', function(opt) {
            this.setViewportTransform(this.viewportTransform);
            this.isDragging = false;
            this.selection = true;
            this.defaultCursor = 'default';
		    This.workspace.hoverCursor = 'default';
            this.getObjects().forEach(obj => {
                if(obj.id !== 'workspace'){
                    obj.selectable = true;
                }
            });
            this.requestRenderAll();
        });


        this.canvas.on('mouse:wheel', function(opt) {
            var delta = opt.e.deltaY;
            var zoom = this.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            const center = this.getCenter()
            this.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
          });

    }

    _setDring(){
		this.canvas.selection = false;
		this.canvas.defaultCursor = 'grab';
		this.workspace.hoverCursor = 'grab';
		this.canvas.getObjects().forEach(obj => {
			obj.selectable = false;
		});
		this.canvas.renderAll();
		this.canvas.requestRenderAll();
    }




}

export default EditorWorkspace