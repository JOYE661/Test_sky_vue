<template>
  <div class="upload-item">
    <el-upload
      ref="uploadRef"
      class="avatar-uploader"
      :show-file-list="false"
      :before-upload="beforeAvatarUpload"
      :http-request="customUpload"
    >
      <div v-if="imageUrl" class="uploaded-image-wrapper">
        <img :src="imageUrl" class="avatar" />
        <div class="actions">
          <span class="action-btn" @click.stop="handleRemove">删除图片</span>
        </div>
      </div>
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </el-upload>
    <div class="upload-tips">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { commonUpload } from '@/api/common'

const props = defineProps<{
  modelValue: string
  size?: number // MB
}>()

const emit = defineEmits(['update:modelValue'])

const imageUrl = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  imageUrl.value = val
})

const beforeAvatarUpload = (rawFile: any) => {
  const types = ['image/jpeg', 'image/png', 'image/jpg']
  if (!types.includes(rawFile.type)) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
    return false
  }
  const maxSize = props.size || 2
  if (rawFile.size / 1024 / 1024 > maxSize) {
    ElMessage.error(`上传图片大小不能超过 ${maxSize}MB!`)
    return false
  }
  return true
}

const customUpload = async (options: any) => {
  const formData = new FormData()
  formData.append('file', options.file)

  try {
    const res: any = await commonUpload(formData)
    // 根据 request.ts，成功会直接返回 data (即图片地址)
    // 如果返回的是完整对象，请自行调整，例如 res.data
    imageUrl.value = res
    emit('update:modelValue', res)
  } catch (error) {
    console.error('Upload failed:', error)
    ElMessage.error('上传失败')
  }
}

const handleRemove = () => {
  imageUrl.value = ''
  emit('update:modelValue', '')
}
</script>

<style scoped>
.upload-item {
  display: flex;
  align-items: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 160px;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 160px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.avatar {
  width: 160px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.uploaded-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.uploaded-image-wrapper:hover .actions {
  opacity: 1;
}

.action-btn {
  color: #fff;
  cursor: pointer;
  border: 1px solid #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.upload-tips {
  margin-left: 20px;
  font-size: 12px;
  color: #666;
}
</style>
