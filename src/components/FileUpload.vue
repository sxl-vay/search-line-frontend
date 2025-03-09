<template>
  <div class="file-list">
    <!-- 文件列表表格 -->
    <div class="file-table">
      <a-table
        :columns="columns"
        :data-source="uploadedFiles"
        rowKey="id"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'fileSize'">
            {{ formatFileSize(record.fileSize) }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="action-buttons">
              <!--
              <a-button type="link" size="small" @click="previewFile(record)">
                <eye-outlined />
                预览
              </a-button>
              -->
              <a-button type="link" size="small" @click="downloadFile(record)">
                <download-outlined />
                下载
              </a-button>
              <a-button
                type="link"
                size="small"
                danger
                @click="deleteFile(record)"
              >
                <delete-outlined />
                删除
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <a-upload
      :file-list="fileList"
      :custom-request="customUpload"
      :multiple="true"
      :show-upload-list="true"
      :on-preview="() => {}"
      :on-remove="customDelete"
    >
      <a-button type="primary">
        <upload-outlined />
        点击上传文件
      </a-button>
    </a-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { message } from "ant-design-vue";
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import myAxios from "@/plugins/myAxios";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface FileItem {
  uid: string;
  name: string;
  status: string;
  fileId: number;
}

interface UploadedFile {
  id: number;
  name: string;
  fileSize: number;
  url: string;
  createTime: string;
}

interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  showTotal: (total: number) => string;
}

const fileList = ref<FileItem[]>([]);
const uploadedFiles = ref<UploadedFile[]>([]);

// 分页配置
const pagination = reactive<Pagination>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条记录`,
});

// 定义表格列
const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "文件名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "文件大小",
    dataIndex: "fileSize",
    key: "fileSize",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    key: "createTime",
  },
  {
    title: "操作",
    key: "action",
    width: 200,
  },
];

// 处理表格变化事件（分页、排序、筛选）
const handleTableChange = (pag: any) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchFileList();
};

// 获取文件列表
const fetchFileList = async () => {
  try {
    const params = {
      current: pagination.current,
      pageSize: pagination.pageSize,
    };
    const response = await myAxios.get("file/list", { params });
    const data = response.data;
    // 处理接口返回的数据，确保字段名匹配
    console.log("获取文件列表成功 response:", response);
    const fileData = data.files;
    // 更新总记录数
    pagination.total = data?.total || fileData.length;

    // 将接口返回的数据映射到组件需要的格式
    uploadedFiles.value = fileData.map((file: any) => ({
      id: file.id,
      name: file.name,
      fileSize: file.fileSize,
      url: file.url,
      createTime: file.createTime,
    }));
  } catch (error) {
    message.error("获取文件列表失败s");
  }
};

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
      // 上传成功后重新获取文件列表
      fetchFileList();
    } else {
      onError();
      message.error(data.responseMessage || "文件上传失败");
    }
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
    if (response.data.success !== false) {
      message.success("文件删除成功");
      // 从文件列表中移除文件
      fileList.value = fileList.value.filter(
        (item: any) => item.uid !== file.uid
      );
      // 从已上传文件列表中移除文件
      uploadedFiles.value = uploadedFiles.value.filter(
        (item: any) => item.id !== file.fileId
      );
    } else {
      message.error(response.data.responseMessage || "文件删除失败");
    }
  } catch (error) {
    message.error("文件删除失败");
  }
};

// 预览文件
const previewFile = (record: UploadedFile) => {
  if (record.url) {
    window.open(record.url, "_blank");
  } else {
    message.warning("文件链接不可用");
  }
};

// 下载文件
const downloadFile = (record: UploadedFile) => {
  if (record.url) {
    const a = document.createElement("a");
    a.href = record.url;
    a.download = record.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    message.warning("文件链接不可用");
  }
};

// 删除文件
const deleteFile = async (record: UploadedFile) => {
  try {
    const response = await myAxios.delete(`file/delete/${record.id}`);
    if (response.data.success !== false) {
      message.success("文件删除成功");
      // 从已上传文件列表中移除文件
      uploadedFiles.value = uploadedFiles.value.filter(
        (item) => item.id !== record.id
      );
      fetchFileList();
    } else {
      message.error(response.data.responseMessage || "文件删除失败");
    }
  } catch (error) {
    message.error("文件删除失败");
  }
};

const formatFileSize = (size: number) => {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

// 组件挂载时获取文件列表
onMounted(() => {
  fetchFileList();
});
</script>

<style scoped>
.file-list {
  padding: 20px;
}

.file-table {
  margin-top: -80px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.file-items {
  margin-top: 20px;
}
</style>
