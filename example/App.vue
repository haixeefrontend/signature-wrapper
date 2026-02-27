<script setup lang="ts">
defineOptions({
  name: 'App',
})

const imgUrl = ref('')
const save = (dataUrl: Blob, url: string) => {
  imgUrl.value = url
  console.log('save', dataUrl, url)
}
</script>

<template>
  <div class="">
    <hr class="my-8" />
    <div class="mb-4">test</div>
    <div>
      <el-image v-if="imgUrl" :src="imgUrl" fit="contain" class="max-w-full max-h-38vh" />
      <signature-wrapper @save="save" v-slot="{ toggleFull }">
        <el-button type="primary" @click="toggleFull">点击签名</el-button>
      </signature-wrapper>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
