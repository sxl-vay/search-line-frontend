<template>
  <div class="file-list">
    <a-upload
      :file-list="fileList"
      :custom-request="customRequest"
      :multiple="true"
      :show-upload-list="true"
    >
      <a-button type="primary">
        <upload-outlined />
        点击上传文件
      </a-button>
    </a-upload>
    <a-list
      class="file-items"
      :data-source="uploadedFiles"
      item-layout="horizontal"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a :href="item.url" target="_blank">{{ item.fileName }}</a>
            </template>
            <template #description>
              <span>
                {{ formatFileSize(item.fileSize) }} |
                {{ item.uploadTime }}
              </span>
            </template>
            <template #avatar>
              <file-outlined />
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { message } from "ant-design-vue";
import { UploadOutlined, FileOutlined } from "@ant-design/icons-vue";
import myAxios from "@/plugins/myAxios";

const fileList = ref([]);
const uploadedFiles = ref([]);

const customRequest = async (options: any) => {
  const { file, onSuccess, onError, onProgress } = options;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await myAxios.post("file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent: any) => {
        const percent = Math.floor(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        onProgress({ percent });
      },
    });

    onSuccess(response);
    message.success("文件上传成功");
    // 更新文件列表状态
    fileList.value = [
      ...fileList.value,
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        url: response.data?.url || "",
      },
    ];
    loadFileList(); // 重新加载文件列表
  } catch (error) {
    onError();
    message.error("文件上传失败");
    // 更新失败状态
    fileList.value = fileList.value.map((item) =>
      item.uid === file.uid ? { ...item, status: "error" } : item
    );
  }
};

const loadFileList = async () => {
  try {
    const response = await myAxios.get("file/list");
    uploadedFiles.value = response.data || [];
  } catch (error) {
    message.error("获取文件列表失败");
  }
};

const formatFileSize = (size: number) => {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

// 初始加载文件列表
loadFileList();
</script>

<style scoped>
.file-list {
  padding: 20px;
}

.file-items {
  margin-top: 20px;
}
</style>
