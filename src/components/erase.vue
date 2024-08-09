<!--
 * @Author: AliceLanniste
 * @Date: 2024-06-26 10：05
 * @Description: 橡皮檫功能呢
-->

<template>
  <Tooltip :content="$t('erase')">
    <Button long @click="doErase" type="text">
      <svg
        t="1719383882631"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="1448"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="14"
        height="14"
      >
        <path
          d="M667.257905 139.873524l3.85219 3.632762 252.903619 254.537143a73.142857 73.142857 0 0 1 0 103.107047L604.501333 822.686476H828.952381v73.142857H266.532571l-172.129523-173.226666a73.142857 73.142857 0 0 1 0-103.131429L567.344762 143.530667a73.142857 73.142857 0 0 1 99.913143-3.632762zM227.181714 589.604571L146.285714 671.036952l150.674286 151.649524h163.303619l-233.081905-233.081905zM619.227429 195.047619L278.747429 537.721905l253.70819 253.70819 339.675429-341.820952L619.227429 195.047619z"
          p-id="1449"
        ></path>
      </svg>
    </Button>
  </Tooltip>
</template>

<script setup name="Erase">
import useSelect from '@/hooks/select';
import { fabric } from 'fabric';
import 'fabric-eraser-brush';

const { mixinState, canvasEditor } = useSelect();
const isErase = ref(false);

const doErase = () => {
  isErase.value = !isErase.value;
  let canvas = canvasEditor.canvas;
  if (isErase.value) {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
    canvas.freeDrawingBrush.width = 15;
  } else {
    canvas.isDrawingMode = false;
  }
};
</script>
