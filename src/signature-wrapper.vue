<script setup lang="ts">
import { ElMessage, ElSlider } from 'element-plus'
import SignaturePad from 'signature_pad'
import { h, reactive, ref, watch } from 'vue'

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
  teleport: {
    type: [String, Object],
    default: 'body',
  },
})
const emit = defineEmits({
  beginStroke: (event: MouseEvent) => true,
  endStroke: (event: MouseEvent) => true,
  beforeUpdateStroke: (event: MouseEvent) => true,
  afterUpdateStroke: (event: MouseEvent) => true,
  close: () => true,
})
let state = reactive<{
  uid: string
  disabled?: boolean
}>({
  uid: 'canvas-' + Math.floor(Math.random() * 1000000),
})
const canvasWrapperRef = ref<HTMLCanvasElement | null>(null)
const signaturePad = ref<SignaturePad | null>(null)
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
  return { blob, url: imageUrl.value }
}

watch(
  () => canvasWrapperRef.value,
  () => draw(),
)

defineExpose({
  clear,
  save,
  isEmpty,
  undo,
  exportImage,
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
  <div class=":uno: bg-white">
    <div class=":uno: relative flex-center z-1 select-none">
      <div class=":uno: btn-text" @click="emit('close')">关闭手写板</div>
      <div class=":uno: btn-text" @click="() => (showSlider = !showSlider)"> 笔触大小 </div>
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
      <div class=":uno: btn-text" @click="undo">回退</div>
      <div class=":uno: btn-text" @click="clear">清除</div>
    </div>

    <canvas-wrapper />
  </div>
</template>

<style lang="scss" scoped></style>
