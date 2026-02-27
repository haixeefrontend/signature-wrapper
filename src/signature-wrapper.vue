<script setup lang="ts">
import { ElButton, ElMessage, ElSlider } from 'element-plus'
import SignaturePad from 'signature_pad'
import { h, onMounted, reactive, ref } from 'vue'

const props = defineProps({
  w: {
    type: [String, Number],
    default: '100%',
  },
  h: {
    type: [String, Number],
    default: '100vh',
  },
  clearOnResize: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  dotSize: {
    type: [String, Number, Function],
    default: 0.5,
  },
  penSize: {
    type: [String, Number],
    default: 4.5,
  },
  throttle: {
    type: [String, Number],
    default: 16,
  },
  minDistance: {
    type: [String, Number],
    default: 5,
  },
  backgroundColor: {
    type: String,
    default: 'white',
  },
  penColor: {
    type: String,
    default: 'black',
  },
  velocityFilterWeight: {
    type: [String, Number],
    default: 0.7,
  },
})
const emit = defineEmits({
  beginStroke: (event: MouseEvent) => true,
  endStroke: (event: MouseEvent) => true,
  beforeUpdateStroke: (event: MouseEvent) => true,
  afterUpdateStroke: (event: MouseEvent) => true,
  save: (dataUrl: Blob, url: string) => dataUrl instanceof Blob && typeof url === 'string',
})
let state = reactive<{
  uid: string
  disabled?: boolean
}>({
  uid: 'canvas-' + Math.floor(Math.random() * 1000000),
})
const canvasWrapperRef = ref<HTMLCanvasElement | null>(null)
const signaturePad = ref<SignaturePad | null>(null)
const display = ref<boolean>(false)
const penSize = ref<number>(Number(props.penSize))
const showSlider = ref<boolean>(false)
const imageUrl = ref<string>('')

const draw = () => {
  if (!canvasWrapperRef.value) return
  signaturePad.value = new SignaturePad(canvasWrapperRef.value, {
    minWidth: Number(props.penSize) - 1,
    maxWidth: Number(props.penSize) + 1,
    dotSize: Number(props.dotSize),
    throttle: Number(props.throttle),
    minDistance: Number(props.minDistance),
    backgroundColor: props.backgroundColor,
    penColor: props.penColor,
    velocityFilterWeight: Number(props.velocityFilterWeight),
  })
  signaturePad.value.addEventListener('beginStroke', (event: MouseEvent) => {
    emit('beginStroke', event)
  })
  signaturePad.value.addEventListener('endStroke', (event: MouseEvent) => {
    emit('endStroke', event)
  })
  signaturePad.value.addEventListener('beforeUpdateStroke', (event: MouseEvent) => {
    emit('beforeUpdateStroke', event)
  })
  signaturePad.value.addEventListener('afterUpdateStroke', (event: MouseEvent) => {
    emit('afterUpdateStroke', event)
  })
  function resizeCanvas(c: HTMLCanvasElement) {
    let ratio = Math.max(window.devicePixelRatio || 1, 1)
    const reg = RegExp(/px/)
    c.width = reg.test(props.w) ? Number(props.w.replace(/px/g, '')) * ratio : c.offsetWidth * ratio
    c.height = reg.test(props.h) ? Number(props.h.replace(/px/g, '')) * ratio : c.offsetHeight * ratio
    const ctx = c.getContext('2d')
    ctx?.scale(ratio, ratio)
    clear()
  }
  window.addEventListener('resize', () => resizeCanvas(canvasWrapperRef.value!))
  resizeCanvas(canvasWrapperRef.value)

  if (props.disabled) {
    signaturePad.value.off()
  } else {
    signaturePad.value.on()
  }
}
const clear = () => {
  signaturePad.value?.clear()
}
const save = (format?: 'image/jpeg' | 'image/svg+xml' | 'png') => {
  if (!format || format === 'png') {
    signaturePad.value?.cropSignatureCanvas()
  }
  return signaturePad.value?.toDataURL(format)
}
const isEmpty = () => {
  return signaturePad.value?.isEmpty()
}
const undo = () => {
  let data = signaturePad.value?.toData()
  if (data) {
    data.pop()
    signaturePad.value?.fromData(data)
  }
}
const toggleFull = () => {
  display.value = !display.value
}

const exportImage = async () => {
  if (signaturePad.value?.isEmpty()) {
    ElMessage.warning('请先签名')
    return
  }

  function b64toBlob(dataURI: string) {
    // dataURI should be a format like `data:image/png;base64,iVBORw0KGgoAA...`
    const type = dataURI.split(',')[0].split(':')[1].split(';')[0] // get the mime-type like `image/png`
    const byteString = window.atob(dataURI.split(',')[1]) // get the base64 string
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)

    // write the bytes of the string to an ArrayBuffer
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type })
  }

  let base64str = signaturePad.value?.cropSignatureCanvas()

  if (!base64str) {
    ElMessage.error('签名数据异常，请重试')
    return
  }
  const blob = b64toBlob(base64str)
  imageUrl.value = URL.createObjectURL(blob)
  emit('save', blob, imageUrl.value)
  toggleFull()
}

onMounted(() => {
  draw()
})

defineExpose({
  clear,
  save,
  isEmpty,
  undo,
  exportImage,
  toggleFull,
  penSize,
})

function CanvasWrapper() {
  return h('canvas', {
    id: state.uid,
    ref: canvasWrapperRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: props.w,
      height: props.h,
      border: '1px solid #ccc',
      borderRadius: '5px',
      backgroundColor: props.backgroundColor,
    },
  })
}
</script>

<template>
  <div>
    <slot :toggle-full="toggleFull">
      <div class="w-full">
        <img v-if="imageUrl" :src="imageUrl" class="max-w-full max-h-38vh" />
        <el-button @click="toggleFull">点击签名</el-button>
      </div>
    </slot>
    <div
      class="bg-white fixed top-0 left-0 size-screen"
      :style="{
        left: display ? 0 : '-300vw',
        /**
         * if a canvas was initialized with an invisible element (e.g: `display: none`);
         * then its width and height would be stick to 0, which means that you would
         * never see it again, unless you re-render it. So here is the workaround:
         * to initialize the canvas at first, but put it under any element (set z-index to 0),
         * when we need it show up, then change the z-index higher number to make it pop up.
         */
        zIndex: display ? 999 : -1,
      }"
    >
      <div class="relative flex-center z-1 select-none">
        <div class="btn-text" @click="toggleFull">关闭手写板</div>
        <div class="btn-text" @click="() => (showSlider = !showSlider)"> 笔触大小 </div>
        <el-slider
          :min="1"
          :max="15"
          :step="0.5"
          :model-value="penSize"
          @update:model-value="
            (values) => {
              if (!signaturePad) return
              signaturePad.minWidth = penSize = Number(values) - 1
              signaturePad.maxWidth = penSize = Number(values) + 1
            }
          "
          :style="{
            width: '50vw',
            display: showSlider ? 'block' : 'none',
            position: 'absolute',
            top: '50px',
            padding: '10px',
          }"
        />
        <div class="btn-text" @click="undo">回退</div>
        <div class="btn-text" @click="clear">清除</div>
      </div>

      <canvas-wrapper />

      <el-button class=":uno: absolute bottom-2 right-2 px-8 py-4 br-2" type="primary" @click="exportImage">
        保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
