<!--
 * @Author: 余震
 * @Date: 2024-06-05 15:03:55
 * @LastEditors: 余震
 * @LastEditTime: 2024-06-05 15:03:55
 * @Description: 单位选择
-->

<template>
  <div class="unit-menu-list">
    <div
      class="unit-menu-item"
      :class="{ active: item.value === modelValue }"
      v-for="item in options"
      :key="item.value"
      @click="handleClick(item.value)"
    >
      <div>{{ item.label }}</div>
      <i v-if="item.value === modelValue" class="ivu-icon ivu-icon-ios-checkmark"></i>
    </div>
  </div>
</template>

<script name="UnitMenu" setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(['update:modelValue']);
const handleClick = (val) => {
  emits('update:modelValue', val);
};
</script>
<style scoped lang="less">
.unit-menu-list {
  display: flex;
  flex-direction: column;
  font-size: 16px;
  .unit-menu-item {
    cursor: pointer;
    padding: 10px 6px;
    width: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #222529;
    font-weight: 400;
    line-height: 20px;
    white-space: nowrap;
    position: relative;
    cursor: pointer;
    border-radius: 8px;
  }
  .active {
    font-weight: 600;
  }
  .ivu-icon-ios-checkmark {
    font-weight: 600;
  }
}
</style>
