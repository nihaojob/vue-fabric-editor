import { fabric } from 'fabric';

function fixFabricMouseEvent(canvas) {
  // 备份原型
  const mouseupPrototype = canvas.__onMouseUp.bind(canvas);
  const mousedownPrototype = canvas.__onMouseDown.bind(canvas);

  // 修复鼠标中键事件
  fabric.util.object.extend(canvas, {
    __onMouseDown: function (e) {
      if (e.which === 2) {
        canvas._cacheTransformEventData(e);
        canvas._handleEvent(e, 'down:before');
        canvas._handleEvent(e, 'down', 2);
        return;
      }
      mousedownPrototype(e);
    },
    __onMouseUp: function (e) {
      if (e.which === 2) {
        canvas._cacheTransformEventData(e);
        canvas._handleEvent(e, 'up:before');
        canvas._handleEvent(e, 'up', 2);
        return;
      }
      mouseupPrototype(e);
    },
  });
}

export { fixFabricMouseEvent };
