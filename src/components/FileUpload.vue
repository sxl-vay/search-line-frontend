<template>
  <div class="file-list">
    <a-upload
      :file-list="fileList"
      :custom-request="customUpload"
      :multiple="true"
      :show-upload-list="true"
      :remove-icon="false"
      :on-preview="() => {}"
      :on-remove="customDelete"
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FileItem {
  uid: string;
  name: string;
  status: string;
  fileId: number;
}

const fileList = ref<FileItem[]>([]);
const uploadedFiles = ref([]);

const customUpload = async (options: any) => {
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

    const { data } = response;
    if (data.success !== false) {
      onSuccess(response);
      message.success("文件上传成功");
      // 更新文件列表状态
      fileList.value = [
        ...fileList.value,
        {
          uid: file.uid,
          name: data.name || file.name,
          status: "done",
          fileId: data.id,
        },
      ];
    } else {
      onError();
      message.error(data.responseMessage || "文件上传失败");
    }
    console.log("文件上传成功", fileList.value);
  } catch (error) {
    onError();
    message.error("文件上传失败");
    // 更新失败状态
    fileList.value = fileList.value.map((item) =>
      item.uid === file.uid ? { ...item, status: "error" } : item
    );
  }
};
const customDelete = async (file: any) => {
  try {
    // 调用删除接口
    const response = await myAxios.delete(`file/delete/${file.fileId}`);
    console.log("shxl:::", response.data);
    if (response.data.success !== false) {
      message.success("文件删除成功");
      // 从文件列表中移除文件
      fileList.value = fileList.value.filter(
        (item: any) => item.uid !== file.uid
      );
      // 从已上传文件列表中移除文件
      uploadedFiles.value = uploadedFiles.value.filter(
        (item: any) => item.uid !== file.uid
      );
    } else {
      console.log("shxl:::", response.data);
      message.error(response.data.responseMessage || "文件删除失败");
    }
  } catch (error) {
    message.error("文件删除失败111");
  }
};

const formatFileSize = (size: number) => {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};
</script>

<style scoped>
.file-list {
  padding: 20px;
}

.file-items {
  margin-top: 20px;
}
</style>
