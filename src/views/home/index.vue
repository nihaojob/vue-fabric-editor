<template>
  <div class="home">
    <Layout>
      <!-- 头部区域 -->
      <Header v-if="state.show">
        <!-- logo -->
        <span class="logo">
          <a href="https://github.com/nihaojob/vue-fabric-editor" target="_blank">
            <Icon type="logo-github" :size="30" />
          </a>
        </span>

        <!-- 导入 -->
        <import-Json></import-Json>
        <Divider type="vertical" />
        <import-file></import-file>
        <Divider type="vertical" />
        <!-- 标尺开关 -->
        <Tooltip :content="$t('grid')">
          <iSwitch
            v-model="state.ruler"
            @on-change="rulerSwitch"
            size="small"
            class="switch"
          ></iSwitch>
        </Tooltip>
        <Divider type="vertical" />
        <history></history>

        <div style="float: right">
          <!-- 预览 -->
          <previewCurrent />
          <waterMark />
          <save></save>
          <lang></lang>
        </div>
      </Header>
      <Content style="display: flex; height: calc(100vh - 64px)">
        <!-- 左侧区域 -->
        <div v-if="state.show" :class="`left-bar ${state.toolsBarShow && 'show-tools-bar'}`">
          <Menu :active-name="state.menuActive" accordion @on-select="showToolsBar" width="65px">
            <MenuItem :name="1" class="menu-item">
              <Icon type="md-book" size="24" />
              <div>{{ $t('templates') }}</div>
            </MenuItem>
            <MenuItem :name="2" class="menu-item">
              <Icon type="md-images" size="24" />
              <div>{{ $t('elements') }}</div>
            </MenuItem>
            <MenuItem :name="3" class="menu-item">
              <Icon type="ios-leaf-outline" size="24" />
              <div>{{ $t('material.cartoon') }}</div>
            </MenuItem>
            <MenuItem :name="4" class="menu-item">
              <Icon type="md-reorder" size="24" />
              <div>{{ $t('layers') }}</div>
            </MenuItem>
          </Menu>

          <div class="content" v-show="state.toolsBarShow">
            <!-- 生成模板 -->
            <div v-show="state.menuActive === 1" class="left-panel">
              <import-tmpl></import-tmpl>
            </div>
            <!-- 常用元素 -->
            <div v-show="state.menuActive === 2" class="left-panel">
              <tools></tools>
              <fontTmpl></fontTmpl>
            </div>
            <!-- 卡通素材 -->
            <div v-show="state.menuActive === 3" class="left-panel">
              <importSvgEl></importSvgEl>
            </div>
            <!-- 图层设置 -->
            <div v-show="state.menuActive === 4" class="left-panel">
              <layer></layer>
            </div>
          </div>

          <!-- 关闭按钮 -->
          <div
            :class="`close-btn left-btn ${state.toolsBarShow && 'left-btn-open'}`"
            @click="hideToolsBar"
          ></div>
        </div>

        <!-- 画布区域 -->
        <div id="workspace">
          <div class="canvas-box">
            <div class="inside-shadow"></div>
            <canvas id="canvas" :class="state.ruler ? 'design-stage-grid' : ''"></canvas>
            <dragMode v-if="state.show"></dragMode>
            <zoom></zoom>
            <!-- <mouseMenu></mouseMenu> -->
          </div>
        </div>

        <!-- 属性区域 380-->
        <div class="right-bar" v-show="state.attrBarShow">
          <div v-if="state.show" style="padding-top: 10px">
            <!-- 新增字体样式使用 -->
            <!-- <Button @click="getFontJson" size="small">获取字体数据</Button> -->
            <set-size></set-size>
            <bg-bar></bg-bar>
            <group></group>
            <replaceImg></replaceImg>
            <filters></filters>
            <div class="attr-item">
              <lock></lock>
              <dele></dele>
              <clone></clone>
            </div>
            <!-- 组对齐方式 -->
            <align></align>
            <!-- 居中对齐 -->
            <center-align></center-align>
            <!-- 翻转 -->
            <flip></flip>
          </div>
          <attribute v-if="state.show"></attribute>
        </div>
        <!-- 右侧关闭按钮 -->
        <div
          :class="`close-btn right-btn ${state.attrBarShow && 'right-btn-open'}`"
          @click="switchAttrBar"
        ></div>
      </Content>
    </Layout>
  </div>
</template>

<script name="Home" setup>
// 导入元素
import importJson from '@/components/importJSON.vue';
import importFile from '@/components/importFile.vue';
import fontTmpl from '@/components/fontTmpl.vue';

// 顶部组件
import align from '@/components/align.vue';
import centerAlign from '@/components/centerAlign.vue';
import flip from '@/components/flip.vue';
import previewCurrent from '@/components/previewCurrent';
import save from '@/components/save.vue';
import lang from '@/components/lang.vue';
import clone from '@/components/clone.vue';
import group from '@/components/group.vue';
import zoom from '@/components/zoom.vue';
import dragMode from '@/components/dragMode.vue';
import lock from '@/components/lock.vue';
import dele from '@/components/del.vue';
import waterMark from '@/components/waterMark';
// 左侧组件
import importTmpl from '@/components/importTmpl.vue';
import tools from '@/components/tools.vue';
import importSvgEl from '@/components/importSvgEl.vue';
import bgBar from '@/components/bgBar.vue';
import setSize from '@/components/setSize.vue';
import replaceImg from '@/components/replaceImg.vue';
import filters from '@/components/filters.vue';

// 右侧组件
import history from '@/components/history.vue';
import layer from '@/components/layer.vue';
import attribute from '@/components/attribute.vue';

// 功能组件
import { CanvasEventEmitter } from '@/utils/event/notifier';
// import { downFile } from '@/utils/utils';
import { fabric } from 'fabric';

// import test from '@kuaitu/core';

// console.log(test(), '1111');

const repoSrc = import.meta.env.APP_REPO;

import Editor, {
  DringPlugin,
  AlignGuidLinePlugin,
  ControlsPlugin,
  ControlsRotatePlugin,
  CenterAlignPlugin,
  LayerPlugin,
  CopyPlugin,
  MoveHotKeyPlugin,
  DeleteHotKeyPlugin,
  GroupPlugin,
  DrawLinePlugin,
  GroupTextEditorPlugin,
  GroupAlignPlugin,
  WorkspacePlugin,
  DownFontPlugin,
  HistoryPlugin,
  FlipPlugin,
  RulerPlugin,
  MaterialPlugin,
} from '@kuaitu/core';

// 创建编辑器
const canvasEditor = new Editor();

window.canvasEditor = canvasEditor;

const event = new CanvasEventEmitter();

const state = reactive({
  menuActive: 1,
  show: false,
  toolsBarShow: true,
  attrBarShow: true,
  select: null,
  ruler: false,
});

onMounted(() => {
  // 初始化fabric
  const canvas = new fabric.Canvas('canvas', {
    fireRightClick: true, // 启用右键，button的数字为3
    stopContextMenu: true, // 禁止默认右键菜单
    controlsAboveOverlay: true, // 超出clipPath后仍然展示控制条
    imageSmoothingEnabled: false, // 解决文字导出后不清晰问题
  });

  // 初始化编辑器
  canvasEditor.init(canvas);
  canvasEditor.use(DringPlugin);
  canvasEditor.use(AlignGuidLinePlugin);
  canvasEditor.use(ControlsPlugin);
  canvasEditor.use(ControlsRotatePlugin);
  canvasEditor.use(CenterAlignPlugin);
  canvasEditor.use(LayerPlugin);
  canvasEditor.use(CopyPlugin);
  canvasEditor.use(MoveHotKeyPlugin);
  canvasEditor.use(DeleteHotKeyPlugin);
  canvasEditor.use(GroupPlugin);
  canvasEditor.use(DrawLinePlugin);
  canvasEditor.use(GroupTextEditorPlugin);
  canvasEditor.use(GroupAlignPlugin);
  canvasEditor.use(WorkspacePlugin);
  canvasEditor.use(DownFontPlugin);
  canvasEditor.use(HistoryPlugin);
  canvasEditor.use(FlipPlugin);
  canvasEditor.use(RulerPlugin);
  canvasEditor.use(MaterialPlugin, {
    repoSrc,
  });

  event.init(canvas);
  state.show = true;
});

// 获取字体数据 新增字体样式使用
// getFontJson() {
//   const activeObject = this.canvas.getActiveObject();
//   if (activeObject) {
//     const json = activeObject.toJSON(['id', 'gradientAngle', 'selectable', 'hasControls']);
//     console.log(json);
//     const fileStr = `data:text/json;charset=utf-8,${encodeURIComponent(
//       JSON.stringify(json, null, '\t')
//     )}`;
//     downFile(fileStr, 'font.json');
//     const dataUrl = activeObject.toDataURL();
//     downFile(dataUrl, 'font.png');
//   }
// },

const rulerSwitch = (val) => {
  if (val) {
    canvasEditor.rulerEnable();
  } else {
    canvasEditor.rulerDisable();
  }
};

// 隐藏工具条
const hideToolsBar = () => {
  state.toolsBarShow = !state.toolsBarShow;
};
// 展示工具条
const showToolsBar = (val) => {
  state.menuActive = val;
  state.toolsBarShow = true;
};
// 属性面板开关
const switchAttrBar = () => {
  state.attrBarShow = !state.attrBarShow;
};

provide('fabric', fabric);
provide('event', event);
provide('canvasEditor', canvasEditor);
</script>
<style lang="less" scoped>
.logo {
  width: 30px;
  height: 30px;
  display: inline-block;
  margin-right: 10px;
  text-align: center;
  vertical-align: middle;
  .ivu-icon {
    vertical-align: super;
  }
}
// 左侧容器
.left-bar {
  width: 65px;
  height: 100%;
  background: #fff;
  display: flex;
  position: relative;

  &.show-tools-bar {
    width: 380px;
  }
}
// 右侧容器
.right-bar {
  width: 304px; height: 100%; padding: 10px; overflow-y: auto; background: #fff
  // width: 240px;
  // height: 100%;
  // padding: 10px;
  // overflow-y: auto;
  // background: #fff;
}

// 关闭按钮
.close-btn {
  width: 20px;
  height: 64px;
  cursor: pointer;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAACACAMAAABOb9vcAAAAhFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAADHx8cODg50dHTx8fF2dnZ1dXWWlpZHR0c4ODhQpkZ5AAAAIXRSTlMA9t+/upkRAnPq5NXDfDEsKQjMeGlRThkMsquljTwzIWhBHpjgAAABJElEQVRYw+3YyW7CQBCEYbxig8ELGJyQkJRJyPb+75dj3zy/lD7kMH3+ZEuzSFO1mlZwhjOE2uwhVHJYMygNVwilhz2EUvNaMigledUFoE1anKYAtA9nVRuANpviOQBt0t2ZQSnZ9QxK6Qih9LSGUHkJobYlhGp6CPW4hlAVhckLhMop1InCjEK1FBYU1hSqo/BI4YXCjMIthTWFijDCCB3g7fuO4O1t/rkvQXPz/LUIzX0oAM0tQHOfCkBzC9DcuwLQXACao9Dv1yb9lsek2xaaxMcMH1x6Ff79dY0wwgj/DGv3p2tG4cX9wd55h4rCO/hk3uEs9w6QlXPIbXrfIJ6XrmVBOtJCA1YkXqVLkh1aUgyNk1fV1BxLxzpsuNLKzrME/AWr0ywwvyj83AAAAABJRU5ErkJggg==);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50%;
  position: absolute;
  right: -20px;
  z-index: 1;
  top: 50%;
  margin-top: -10px;

  &.left-btn {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAACACAYAAAB5sSvuAAAAAXNSR0IArs4c6QAAAFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAKKADAAQAAAABAAAAgAAAAAAobJzlAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoZXuEHAAADf0lEQVR4Ae2cvYsTQRjGE7FQkICFB1pZRyzEJkUKmzOpBEHwX9DCQkmChf4JahewsLpWFOQUzwMRPEgEy0PLpPADvEISDrVyfZ6cK0tIZrI7u7MPMi+8mb35uPnlmXczyeXmrURRdKyibAB8Dz8pywg42if4OUnIGd7Bww8Ut+GHpEATgPEll/y8DGRMtaB8hrryl30B2HzVW1Rcgx8vQ9UqaVac+Cf67cC34C+q1erHFcc5dUsDOD/RGBWv4M/hrwG8jzJ3cwFMwlDdd/BN+BZgd5ONLtd5Ac4zfEYFld0ALMMisxUFmAQa44dHdMB+TTasdM2bxJNxI7gDP7ISWNzJE1xymhF+uBzPbyvL2NZOA+oJIO/BrfP7iEGTSNtovIrY/L6sU9mA5PoAby6DtEq87JnlWF/H7+K+v/DmUQDkc23CNxbFpAogIa/Ab/IiaQoxmOThlnkG8TiKK5UUJNNR+MMYjqUaIJnWEYuXeEFTBCTXv1hUi0HCxXYWsbirqiAhb/BBWcE9KLimDEgB68pLTMAL6oBNdcBT6oBr6oAn1O9i2a2Od/DM1Jc4KBivVOYyLHFm6f4ODAoGBV0VcB0fYjAo6KqA6/gQg0FBVwVcx4cYDAq6KuA6/v+Mwel0Wmm325XhcOgqkH08/h6cyiaTSdRoNPhvBFGtVosGg0Gq8Wk7V9IO6Pf7MzgC+oBMDcgn1Ov1vEFmAvQJmRmQkN1ut3AlnQB9QDoDErLT6RSmZC6ARULmBlgUpPxWl5uCRcVhLoBFwTFsnAGLfi10AiwazklBX/txJgV9wWVSUP7tlvwbVspOyFarVfi7ac4Vvquzfyoy95DfiwOgeQHtrUFBu0bmHkFBsz721qCgXSNzj6CgWR97a1DQrpG5R1DQrI+9NSho18jcIyho1sfauqeuoDzgN3UFv6gD7qh/cK8rA84OGygv8VO+CCkrKH3g5Q1P41BB1SV+QDia4hJvQ72LB3h6gPIH/+5CvVGsntoSPwYQzxr/VgRkJoF1wP1KwvFa4SaRPgDNI+RLT2dTwTJfB+9j/jaWden5dgIe5oNnG2O+WwCb7bXWuflliSfLlAjCh4JULHMqjaIAc0tGkhdgnM6FyXI2EV+5pXNxAeTSMSHOSzg3+H2UuVsaQKq0A/eaUmiVb9yZlOk6vJSkTCZA2bRWsonBpFOrySan+wNoJmOM0LyBGwAAAABJRU5ErkJggg==);
  }

  &.left-btn-open {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAACACAMAAABOb9vcAAAAhFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAADHx8cODg50dHTx8fF2dnZ1dXWWlpZHR0c4ODhQpkZ5AAAAIXRSTlMA9t+/upkRAnPq5NXDfDEsKQjMeGlRThkMsquljTwzIWhBHpjgAAABJElEQVRYw+3YyW7CQBCEYbxig8ELGJyQkJRJyPb+75dj3zy/lD7kMH3+ZEuzSFO1mlZwhjOE2uwhVHJYMygNVwilhz2EUvNaMigledUFoE1anKYAtA9nVRuANpviOQBt0t2ZQSnZ9QxK6Qih9LSGUHkJobYlhGp6CPW4hlAVhckLhMop1InCjEK1FBYU1hSqo/BI4YXCjMIthTWFijDCCB3g7fuO4O1t/rkvQXPz/LUIzX0oAM0tQHOfCkBzC9DcuwLQXACao9Dv1yb9lsek2xaaxMcMH1x6Ff79dY0wwgj/DGv3p2tG4cX9wd55h4rCO/hk3uEs9w6QlXPIbXrfIJ6XrmVBOtJCA1YkXqVLkh1aUgyNk1fV1BxLxzpsuNLKzrME/AWr0ywwvyj83AAAAABJRU5ErkJggg==);
    transform: rotateY(360deg);
  }

  &.right-btn {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAACACAYAAAB5sSvuAAAAAXNSR0IArs4c6QAAAFBlWElmTU0AKgAAAAgAAgESAAMAAAABAAEAAIdpAAQAAAABAAAAJgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAKKADAAQAAAABAAAAgAAAAAAobJzlAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoZXuEHAAADf0lEQVR4Ae2cvYsTQRjGE7FQkICFB1pZRyzEJkUKmzOpBEHwX9DCQkmChf4JahewsLpWFOQUzwMRPEgEy0PLpPADvEISDrVyfZ6cK0tIZrI7u7MPMi+8mb35uPnlmXczyeXmrURRdKyibAB8Dz8pywg42if4OUnIGd7Bww8Ut+GHpEATgPEll/y8DGRMtaB8hrryl30B2HzVW1Rcgx8vQ9UqaVac+Cf67cC34C+q1erHFcc5dUsDOD/RGBWv4M/hrwG8jzJ3cwFMwlDdd/BN+BZgd5ONLtd5Ac4zfEYFld0ALMMisxUFmAQa44dHdMB+TTasdM2bxJNxI7gDP7ISWNzJE1xymhF+uBzPbyvL2NZOA+oJIO/BrfP7iEGTSNtovIrY/L6sU9mA5PoAby6DtEq87JnlWF/H7+K+v/DmUQDkc23CNxbFpAogIa/Ab/IiaQoxmOThlnkG8TiKK5UUJNNR+MMYjqUaIJnWEYuXeEFTBCTXv1hUi0HCxXYWsbirqiAhb/BBWcE9KLimDEgB68pLTMAL6oBNdcBT6oBr6oAn1O9i2a2Od/DM1Jc4KBivVOYyLHFm6f4ODAoGBV0VcB0fYjAo6KqA6/gQg0FBVwVcx4cYDAq6KuA6/v+Mwel0Wmm325XhcOgqkH08/h6cyiaTSdRoNPhvBFGtVosGg0Gq8Wk7V9IO6Pf7MzgC+oBMDcgn1Ov1vEFmAvQJmRmQkN1ut3AlnQB9QDoDErLT6RSmZC6ARULmBlgUpPxWl5uCRcVhLoBFwTFsnAGLfi10AiwazklBX/txJgV9wWVSUP7tlvwbVspOyFarVfi7ac4Vvquzfyoy95DfiwOgeQHtrUFBu0bmHkFBsz721qCgXSNzj6CgWR97a1DQrpG5R1DQrI+9NSho18jcIyho1sfauqeuoDzgN3UFv6gD7qh/cK8rA84OGygv8VO+CCkrKH3g5Q1P41BB1SV+QDia4hJvQ72LB3h6gPIH/+5CvVGsntoSPwYQzxr/VgRkJoF1wP1KwvFa4SaRPgDNI+RLT2dTwTJfB+9j/jaWden5dgIe5oNnG2O+WwCb7bXWuflliSfLlAjCh4JULHMqjaIAc0tGkhdgnM6FyXI2EV+5pXNxAeTSMSHOSzg3+H2UuVsaQKq0A/eaUmiVb9yZlOk6vJSkTCZA2bRWsonBpFOrySan+wNoJmOM0LyBGwAAAABJRU5ErkJggg==);
    transform: rotateY(180deg);
    right: 0px;
  }

  &.right-btn-open {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAACACAMAAABOb9vcAAAAhFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAADHx8cODg50dHTx8fF2dnZ1dXWWlpZHR0c4ODhQpkZ5AAAAIXRSTlMA9t+/upkRAnPq5NXDfDEsKQjMeGlRThkMsquljTwzIWhBHpjgAAABJElEQVRYw+3YyW7CQBCEYbxig8ELGJyQkJRJyPb+75dj3zy/lD7kMH3+ZEuzSFO1mlZwhjOE2uwhVHJYMygNVwilhz2EUvNaMigledUFoE1anKYAtA9nVRuANpviOQBt0t2ZQSnZ9QxK6Qih9LSGUHkJobYlhGp6CPW4hlAVhckLhMop1InCjEK1FBYU1hSqo/BI4YXCjMIthTWFijDCCB3g7fuO4O1t/rkvQXPz/LUIzX0oAM0tQHOfCkBzC9DcuwLQXACao9Dv1yb9lsek2xaaxMcMH1x6Ff79dY0wwgj/DGv3p2tG4cX9wd55h4rCO/hk3uEs9w6QlXPIbXrfIJ6XrmVBOtJCA1YkXqVLkh1aUgyNk1fV1BxLxzpsuNLKzrME/AWr0ywwvyj83AAAAABJRU5ErkJggg==);
    right: 304px;
  }
}

// 属性面板样式
:deep(.attr-item) {
  position: relative;
  margin-bottom: 12px;
  height: 40px;
  padding: 0 10px;
  background: #f6f7f9;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  .ivu-tooltip {
    text-align: center;
    flex: 1;
  }
}

.ivu-menu-vertical .menu-item {
  text-align: center;
  padding: 10px 2px;
  box-sizing: border-box;
  font-size: 12px;

  & > i {
    margin: 0;
  }
}

:deep(.ivu-layout-header) {
  --height: 45px;
  padding: 0 10px;
  border-bottom: 1px solid #eef2f8;
  background: #fff;
  height: var(--height);
  line-height: var(--height);
}

.home,
.ivu-layout {
  height: 100vh;
}

.icon {
  display: block;
}

.canvas-box {
  position: relative;
}
// 画布内阴影
.inside-shadow {
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 9px 2px #0000001f;
  z-index: 2;
  pointer-events: none;
}

#canvas {
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

#workspace {
  flex: 1;
  width: 100%; position: relative; background: #f1f1f1;
  overflow: hidden;
}

.content {
  flex: 1;
  width: 220px;
  padding: 10px;
  padding-top: 0;
  height: 100%;
  overflow-y: auto;
}

.ivu-menu-light.ivu-menu-vertical .ivu-menu-item-active:not(.ivu-menu-submenu) {
  background: none;
}
// 标尺
.switch {
  margin-right: 10px;
}
// 网格背景
.design-stage-grid {
  --offsetX: 0px;
  --offsetY: 0px;
  --size: 16px;
  --color: #dedcdc;
  background-image: linear-gradient(
      45deg,
      var(--color) 25%,
      transparent 0,
      transparent 75%,
      var(--color) 0
    ),
    linear-gradient(45deg, var(--color) 25%, transparent 0, transparent 75%, var(--color) 0);
  background-position: var(--offsetX) var(--offsetY),
    calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
  background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}
</style>
