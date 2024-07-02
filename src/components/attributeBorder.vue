<!--
 * @Author: 秦少卫
 * @Date: 2024-05-21 10:18:57
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-05-26 22:59:26
 * @Description: 边框
-->
<template>
  <div class="box attr-item-box" v-if="mixinState.mSelectMode === 'one' && !isGroup">
    <!-- <h3>边框</h3> -->
    <Divider plain orientation="left"><h4>边框</h4></Divider>
    <!-- 通用属性 -->
    <div>
      <Row :gutter="12">
        <Col flex="1">
          <div class="ivu-col__box">
            <span class="label">{{ $t('color') }}</span>
            <div class="content">
              <ColorPicker
                v-model="baseAttr.stroke"
                @on-change="(value) => changeCommon('stroke', value)"
                alpha
              />
            </div>
          </div>
        </Col>
        <Col flex="1">
          <InputNumber
            v-model="baseAttr.strokeWidth"
            @on-change="(value) => changeCommon('strokeWidth', value)"
            :append="$t('width')"
            :min="0"
          ></InputNumber>
        </Col>
      </Row>

      <Row :gutter="12">
        <Col flex="1">
          <div class="ivu-col__box">
            <span class="label">{{ $t('attributes.stroke') }}</span>
            <div class="content">
              <Select v-model="baseAttr.strokeDashArray" @on-change="borderSet">
                <Option
                  v-for="item in strokeDashList"
                  :value="item.label"
                  :key="`stroke-${item.label}`"
                >
                  {{ item.label }}
                </Option>
              </Select>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script setup name="AttrBute">
import useSelect from '@/hooks/select';
import InputNumber from '@/components/inputNumber';

const update = getCurrentInstance();
const { mixinState, canvasEditor } = useSelect();

const groupType = ['group'];
// 属性值
const baseAttr = reactive({
  stroke: '#fff',
  strokeWidth: 0,
  strokeDashArray: [],
});

const strokeDashList = [
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [],
      strokeLineCap: 'butt',
    },
    label: 'Stroke',
  },
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [1, 10],
      strokeLineCap: 'butt',
    },
    label: 'Dash-1',
  },
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [1, 10],
      strokeLineCap: 'round',
    },
    label: 'Dash-2',
  },
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [15, 15],
      strokeLineCap: 'square',
    },
    label: 'Dash-3',
  },
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [15, 15],
      strokeLineCap: 'round',
    },
    label: 'Dash-4',
  },
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [25, 25],
      strokeLineCap: 'square',
    },
    label: 'Dash-5',
  },
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [25, 25],
      strokeLineCap: 'round',
    },
    label: 'Dash-6',
  },
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [1, 8, 16, 8, 1, 20],
      strokeLineCap: 'square',
    },
    label: 'Dash-7',
  },
  {
    value: {
      strokeUniform: true,
      strokeDashArray: [1, 8, 16, 8, 1, 20],
      strokeLineCap: 'round',
    },
    label: 'Dash-8',
  },
];

const isGroup = computed(() => groupType.includes(mixinState.mSelectOneType));
// 属性获取
const getObjectAttr = (e) => {
  const activeObject = canvasEditor.canvas.getActiveObject();

  // 不是当前obj，跳过
  if (e && e.target && e.target !== activeObject) return;
  if (activeObject && !groupType.includes(activeObject.type)) {
    baseAttr.stroke = activeObject.get('stroke');
    baseAttr.strokeWidth = activeObject.get('strokeWidth');
    const strokeDashArray = JSON.stringify(activeObject.get('strokeDashArray') || []);
    const target = strokeDashList.find((item) => {
      return (
        JSON.stringify(item.value.strokeDashArray) === strokeDashArray &&
        activeObject.get('strokeLineCap') === item.value.strokeLineCap
      );
    });
    if (target) {
      baseAttr.strokeDashArray = target.label;
    }
  }
};

// 通用属性改变
const changeCommon = (key, value) => {
  const activeObject = canvasEditor.canvas.getActiveObjects()[0];
  if (activeObject) {
    activeObject.set(key, value);
    activeObject.set('strokeUniform', true);
    canvasEditor.canvas.renderAll();
  }
};

// 边框设置
const borderSet = (key) => {
  const activeObject = canvasEditor.canvas.getActiveObjects()[0];
  if (activeObject) {
    const stroke = strokeDashList.find((item) => item.label === key);
    activeObject.set(stroke.value);
    canvasEditor.canvas.renderAll();
  }
};

const selectCancel = () => {
  update?.proxy?.$forceUpdate();
};

onMounted(() => {
  // 获取字体数据
  getObjectAttr();
  canvasEditor.on('selectCancel', selectCancel);
  canvasEditor.on('selectOne', getObjectAttr);
  canvasEditor.canvas.on('object:modified', getObjectAttr);
});

onBeforeUnmount(() => {
  canvasEditor.off('selectCancel', selectCancel);
  canvasEditor.off('selectOne', getObjectAttr);
  canvasEditor.canvas.off('object:modified', getObjectAttr);
});
</script>

<style scoped lang="less">
:deep(.ivu-input-number) {
  display: block;
  width: 100%;
}

:deep(.ivu-color-picker) {
  display: block;
}
.ivu-row {
  margin-bottom: 8px;
  .ivu-col {
    position: inherit;
    &__box {
      display: flex;
      align-items: center;
      background: #f8f8f8;
      border-radius: 4px;
      gap: 8px;
    }
  }

  .label {
    padding-left: 8px;
  }
  .content {
    flex: 1;
    :deep(.--input),
    :deep(.ivu-select-selection) {
      background-color: transparent;
      border: none !important;
      box-shadow: none !important;
    }
  }
}
</style>
