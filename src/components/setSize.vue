<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2024-05-21 15:38:38
 * @Description: 尺寸设置
-->

<template>
  <div v-if="!mixinState.mSelectMode" class="attr-item-box">
    <!-- <h3>{{ $t('bgSeting.size') }}</h3> -->
    <Divider plain orientation="left">
      <h4>{{ $t('bgSeting.size') }}</h4>
    </Divider>
    <Form :label-width="46" inline class="form-wrap">
      <FormItem :label="$t('bgSeting.width')" prop="name">
        <InputNumber
          disabled
          v-model="width"
          readonly
          @on-change="setSize"
          :precision="1"
        ></InputNumber>
      </FormItem>
      <FormItem :label="$t('bgSeting.height')" prop="name">
        <InputNumber
          disabled
          v-model="height"
          readonly
          @on-change="setSize"
          :precision="1"
        ></InputNumber>
      </FormItem>
      <FormItem :label-width="0">
        {{ unit }}
      </FormItem>
    </Form>
    <Button type="text" @click="showSetSize">
      <Icon type="md-create" />
    </Button>

    <!-- <Divider plain></Divider> -->
    <!-- 修改尺寸 -->
    <modalSzie :title="$t('setSizeTip')" ref="modalSizeRef" @set="handleConfirm"></modalSzie>
  </div>
</template>

<script setup name="CanvasSize">
import useSelect from '@/hooks/select';
import modalSzie from '@/components/common/modalSzie';

const { mixinState, canvasEditor } = useSelect();

const DefaultSize = {
  width: 900,
  height: 1200,
};

const modalSizeRef = ref(null);

let width = ref(DefaultSize.width);
let height = ref(DefaultSize.height);
let unit = ref('px');

onMounted(() => {
  canvasEditor.setSize(width.value, height.value);
  canvasEditor.on('sizeChange', (w, h) => {
    width.value = w;
    height.value = h;
  });
});

const setSize = () => {
  canvasEditor.setSize(width.value, height.value);
};

const showSetSize = () => {
  modalSizeRef.value.showSetSize(width.value, height.value, unit.value);
};
const handleConfirm = (w, h, u) => {
  width.value = w;
  height.value = h;
  unit.value = u;
  setSize();
};
</script>

<style scoped lang="less">
:deep(.ivu-form-item) {
  margin-bottom: 0;
}

:deep(.ivu-input-number) {
  width: 70px;
}
.form-wrap {
  display: flex;
}
</style>
