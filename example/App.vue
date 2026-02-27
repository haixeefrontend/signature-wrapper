<script setup lang="ts">
defineOptions({
  name: 'App',
})

const show = ref(false)
const toggleFull = () => {
  show.value = !show.value
}
const imgUrl = ref('')
const signatureRef = ref()
const save = async () => {
  if (!signatureRef.value) return
  const { blob, url } = await signatureRef.value.exportImage()
  imgUrl.value = url
  console.log('save', blob, url)
  toggleFull()
}
</script>

<template>
  <div class="">
    <hr class="my-8" />
    <div class="mb-4">test</div>
    <div>
      <el-image v-if="imgUrl" :src="imgUrl" fit="contain" class="max-w-full max-h-38vh" />
      <el-button type="primary" @click="toggleFull">点击签名</el-button>
      <signature-wrapper v-if="show" ref="signatureRef" class="fixed top-0 left-0 size-screen" @close="toggleFull" @save="save" />
      <el-button class="fixed bottom-2 right-2 z-1" type="primary" @click="save">保存</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
