<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-05-11 19:09:45
 * @Description: 公共尺寸
-->

<template>
  <Modal v-model="modal" :title="props.title" footer-hide :before-close="resetUnit">
    <h3>
      {{ $t('importFiles.createDesign.customSize') }}
    </h3>
    <Form ref="formInline" inline :label-width="46">
      <FormItem :label="$t('importFiles.createDesign.width')">
        <InputNumber v-model="width" :min="1" placeholder="请输入" :precision="1"></InputNumber>
      </FormItem>
      <FormItem :label="$t('importFiles.createDesign.height')">
        <InputNumber v-model="height" :min="1" placeholder="请输入" :precision="1"></InputNumber>
        <Tooltip theme="light">
          <template #content>
            <UnitMenu v-model="unit" :options="unitList" />
          </template>
          <div class="unit-select">
            <p class="label">
              {{ unit }}
            </p>
            <i class="ivu-icon ivu-icon-ios-arrow-down"></i>
          </div>
        </Tooltip>
      </FormItem>
      <FormItem :label-width="0">
        <Button type="primary" @click="customSizeCreate">
          {{ $t('importFiles.createDesign.create') }}
        </Button>
      </FormItem>
    </Form>
    <Divider class="divider" />
    <h3>
      {{ $t('importFiles.createDesign.systemSize') }}
    </h3>
    <CellGroup @on-click="setSize">
      <Cell
        :title="item.name"
        :label="`${item._width[unit]}x${item._height[unit]}${unit}`"
        :arrow="false"
        :key="item.name"
        :name="`${item._width[unit]}x${item._height[unit]}x${unit}`"
        v-for="item in sizeList"
      >
        <template #extra>
          <Icon type="md-add" />
        </template>
      </Cell>
    </CellGroup>
  </Modal>
</template>

<script name="ImportJson" setup>
import useSelect from '@/hooks/select';
import { Message } from 'view-ui-plus';
import { useI18n } from 'vue-i18n';
import UnitMenu from '../unitMenu.vue';
import { fabric } from 'fabric';
const { t } = useI18n();
const { canvasEditor } = useSelect();
const emit = defineEmits(['set', 'setUnit']);

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});

const modal = ref(false);
const width = ref(null);
const height = ref(null);
const sizeList = ref([]);
const unit = ref('px');

const unitList = [
  { value: 'px', label: 'px' },
  { value: 'cm', label: 'cm' },
  { value: 'mm', label: 'mm' },
];

/**
 * @param value 传入的像素值，{xxx}px
 * @param unit 需要转化的单位，默认为mm
 * @param fontSize 画布的文字大小，默认fabric.DPI为16
 * @returns 返回转化后的值，如果没有匹配到单位则直接去掉原像素的px单位，变成数字
 */
const convertPxToUnit = (value, unit = 'mm', fontSize) => {
  const pixels = parseFloat(value);
  if (!fontSize) {
    fontSize = fabric.Text.DEFAULT_SVG_FONT_SIZE;
  }
  let convertedValue;
  switch (unit) {
    case 'mm':
      convertedValue = (pixels / fabric.DPI) * 25.4;
      break;
    case 'cm':
      convertedValue = (pixels / fabric.DPI) * 2.54;
      break;
    case 'in':
      convertedValue = pixels / fabric.DPI;
      break;
    case 'pt':
      convertedValue = (pixels / fabric.DPI) * 72;
      break;
    case 'pc':
      convertedValue = ((pixels / fabric.DPI) * 72) / 12;
      break;
    case 'em':
      convertedValue = pixels / fontSize;
      break;
    default:
      convertedValue = pixels;
  }
  return convertedValue;
};

watch(
  () => unit.value,
  (newUnit, oldUnit) => {
    if (resetTrigger) {
      resetTrigger = false;
      return;
    }
    let w = width.value,
      h = height.value;
    // 先统一转化成px
    if (oldUnit !== 'px') {
      w = fabric.util.parseUnit(width.value + oldUnit);
      h = fabric.util.parseUnit(height.value + oldUnit);
    }
    width.value = convertPxToUnit(w, newUnit);
    height.value = convertPxToUnit(h, newUnit);
  }
);

let resetTrigger = false;
const resetUnit = () => {
  resetTrigger = true;
  unit.value = 'px';
};
const showSetSize = (w, h, u) => {
  width.value = w || null;
  height.value = h || null;
  unit.value = u || 'px';
  // 获取素材
  canvasEditor.getSizeList().then((res) => {
    sizeList.value = res.map((item) => {
      item.unit = unit.value;
      item._width = {
        px: item.width,
        mm: parseInt(convertPxToUnit(item.width, 'mm')),
        cm: parseInt(convertPxToUnit(item.width, 'cm')),
      };
      item._height = {
        px: item.height,
        mm: parseInt(convertPxToUnit(item.height, 'mm')),
        cm: parseInt(convertPxToUnit(item.height, 'cm')),
      };
      return item;
    });
  });
  modal.value = true;
};
const setSize = (itemString) => {
  const [w, h] = itemString.split('x');
  width.value = Number(w);
  height.value = Number(h);
};

const customSizeCreate = async () => {
  if (width.value && height.value) {
    emit('set', width.value, height.value, unit.value);
    modal.value = false;
  } else {
    Message.warning(t('importFiles.createDesign.checkMsg'));
  }
};

defineExpose({
  showSetSize,
});
</script>
<style scoped lang="less">
h3 {
  margin-bottom: 10px;
}
.divider {
  margin-top: 0;
}
.unit-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  margin-left: 6px;
  border-radius: 6px;
  border-color: transparent;
  background-color: rgba(0, 0, 0, 0);
  .label {
    min-width: 26px;
    text-align: center;
  }
  &:hover {
    background: #0000000a;
  }
}
</style>
