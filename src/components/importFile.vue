<!--
 * @Author: 秦少卫
 * @Date: 2022-09-03 19:16:55
 * @LastEditors: 秦少卫
 * @LastEditTime: 2023-02-25 21:53:19
 * @Description: 插入SVG元素
-->

<template>
  <div style="display: inline-block">
    <Dropdown transfer-class-name="fix" @on-click="insertTypeHand">
      <a href="javascript:void(0)">
        {{ $t('insertFile.insert') }}
        <Icon type="ios-arrow-down"></Icon>
      </a>
      <template #list>
        <DropdownMenu>
          <!-- 图片 -->
          <DropdownItem name="insertImg">{{ $t('insertFile.insert_picture') }}</DropdownItem>
          <!-- SVG -->
          <DropdownItem name="insertSvg">{{ $t('insertFile.insert_SVG') }}</DropdownItem>
          <!-- SVG 字符串 -->
          <DropdownItem name="insertSvgStrModal">{{ $t('insertFile.insert_SVGStr') }}</DropdownItem>
          <!-- 边框 -->
          <DropdownItem name="insertBorderModal">{{ $t('insertFile.insert_Border') }}</DropdownItem>
        </DropdownMenu>
      </template>
    </Dropdown>
    <!-- 插入字符串svg元素 -->
    <Modal
      v-model="showSvgModal"
      :title="$t('insertFile.modal_tittle')"
      @on-ok="insertSvgStr"
      @on-cancel="showSvgModal = false"
    >
      <Input
        v-model="svgStr"
        show-word-limit
        type="textarea"
        :placeholder="$t('insertFile.insert_SVGStr_placeholder')"
      />
    </Modal>
    <!-- 插入边框 -->
    <Modal
      v-model="showBorderModal"
      :title="$t('insertFile.pattern_modal_title')"
      :ok-text="$t('insertFile.pattern_select')"
      @on-ok="selectBorderImage"
      @on-cancel="showBorderModal = false"
    >
      <Form :model="borderOption" :rules="ruleInline" inline>
        <FormItem prop="patternHeight" :label="$t('insertFile.pattern_height')">
          <InputNumber :max="200" :min="1" v-model="borderOption.patternHeight" />
        </FormItem>
        <FormItem prop="patternWidth" :label="$t('insertFile.pattern_width')">
          <InputNumber :max="200" :min="1" v-model="borderOption.patternWidth" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { getImgStr, selectFiles } from '@/utils/utils';
import select from '@/mixins/select';
import { v4 as uuid } from 'uuid';

export default {
  name: 'ToolBar',
  mixins: [select],
  data() {
    return {
      showSvgModal: false,
      showBorderModal: false,
      svgStr: '',
      borderOption: {
        patternHeight: 50,
        patternWidth: 50,
      },
    };
  },
  methods: {
    insertTypeHand(type) {
      this[type]();
    },
    // 插入图片
    insertImg() {
      selectFiles({ accept: 'image/*', multiple: true }).then((fileList) => {
        Array.from(fileList).forEach((item) => {
          getImgStr(item).then((file) => {
            this.insertImgFile(file);
          });
        });
      });
    },
    // 插入Svg
    insertSvg() {
      selectFiles({ accept: '.svg', multiple: true }).then((fileList) => {
        Array.from(fileList).forEach((item) => {
          getImgStr(item).then((file) => {
            this.insertSvgFile(file);
          });
        });
      });
    },
    // 插入SVG元素
    insertSvgStrModal() {
      this.svgStr = '';
      this.showSvgModal = true;
    },
    // 插入图片文件
    insertImgFile(file) {
      const imgEl = document.createElement('img');
      imgEl.src = file || this.imgFile;
      // 插入页面
      document.body.appendChild(imgEl);
      imgEl.onload = () => {
        // 创建图片对象
        const imgInstance = new this.fabric.Image(imgEl, {
          id: uuid(),
          name: '图片1',
          left: 100,
          top: 100,
        });
        // 设置缩放
        this.canvas.c.add(imgInstance);
        this.canvas.c.setActiveObject(imgInstance);
        this.canvas.c.renderAll();
        // 删除页面中的图片元素
        imgEl.remove();
      };
    },
    // 插入文件元素
    insertSvgFile(svgFile) {
      const This = this;
      this.fabric.loadSVGFromURL(svgFile || this.svgFile, (objects, options) => {
        const item = This.fabric.util.groupSVGElements(objects, {
          ...options,
          name: 'defaultSVG',
          id: uuid(),
        });
        This.canvas.c.add(item).centerObject(item).renderAll();
      });
    },
    // 插入字符串元素
    insertSvgStr() {
      const This = this;
      this.fabric.loadSVGFromString(this.svgStr, (objects, options) => {
        const item = This.fabric.util.groupSVGElements(objects, {
          ...options,
          name: 'defaultSVG',
          id: uuid(),
        });
        This.canvas.c.add(item).centerObject(item).renderAll();
      });
    },
    insertBorderModal() {
      this.showBorderModal = true;
    },
    selectBorderImage() {
      // 弹出文件选择框，选择完图片后生成边框
      selectFiles({ accept: 'image/*', multiple: true }).then((fileList) => {
        Array.from(fileList).forEach((item) => {
          getImgStr(item).then((file) => {
            this.insertBorder(file);
          });
        });
      });
    },
    insertBorder(imageUrl) {
      // 获取workspace对象，作为基准来定位边框的位置和大小
      const workspace = this.canvas.c.getObjects().find((item) => item.id === 'workspace');
      const coupletHeight = workspace.height;
      const patternHeight = this.borderOption.patternHeight;
      const patternWidth = this.borderOption.patternWidth;
      const leftPosition = workspace.left;
      const topPosition = workspace.top;

      // 插入左侧的边框
      this.createBorder(
        imageUrl,
        leftPosition,
        topPosition,
        coupletHeight,
        patternHeight,
        patternWidth
      );

      // 插入右侧的边框
      const rightPosition = workspace.width - patternWidth + leftPosition;
      this.createBorder(
        imageUrl,
        rightPosition,
        topPosition,
        coupletHeight,
        patternHeight,
        patternWidth
      );
    },
    createBorder(imageUrl, left, top, height, patternHeight, patternWidth) {
      // 创建一个group，将所有边框元素添加到group中，方便后续管理
      const borderGroup = new this.fabric.Group();

      // 根据imageUrl创建一个fabric的Image对象
      this.fabric.Image.fromURL(imageUrl, (img) => {
        const scaleX = patternWidth / img.width;
        const scaleY = patternHeight / img.height;
        img.set({
          scaleY: scaleY,
          scaleX: scaleX,
        });

        // 计算需要重复添加多少个边框元素，确保边框的长度足够
        const repeatCount = Math.ceil(height / patternHeight);

        for (let i = 0; i < repeatCount; i++) {
          const currentTop = top + i * patternHeight;

          // 克隆一个Image对象，并设置其位置和尺寸
          const clonedImg = this.fabric.util.object.clone(img);
          clonedImg.set({
            left: left,
            top: currentTop,
          });

          // 将克隆的Image对象添加到group中
          borderGroup.addWithUpdate(clonedImg);
        }

        // 将group设置到对应的位置
        borderGroup.set({
          left: left,
          top: top,
        });

        // 将group添加到canvas中
        this.canvas.c.add(borderGroup);
        this.canvas.c.renderAll();
      });
    },
  },
};
</script>

<style scoped lang="less">
:deep(.ivu-select-dropdown) {
  z-index: 999;
}
</style>
