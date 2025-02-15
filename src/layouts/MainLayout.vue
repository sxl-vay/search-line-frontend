<template>
  <a-layout>
    <a-layout-sider width="200" style="background: #fff">
      <a-menu
        mode="inline"
        v-model:selectedKeys="selectedKeys"
        style="height: 100%"
      >
        <a-menu-item key="search" @click="goToSearch">
          <template #icon>
            <search-outlined />
          </template>
          搜索
        </a-menu-item>
        <a-menu-item key="file" @click="goToFile">
          <template #icon>
            <file-outlined />
          </template>
          文件管理
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content style="padding: 24px">
      <slot />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { SearchOutlined, FileOutlined } from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();
const selectedKeys = ref([route.path === "/" ? "search" : "file"]);

const goToSearch = () => {
  router.push("/");
  selectedKeys.value = ["search"];
};

const goToFile = () => {
  router.push("/file");
  selectedKeys.value = ["file"];
};
</script>

<style scoped>
.ant-layout {
  min-height: 100vh;
}

.ant-layout-sider {
  border-right: 1px solid #f0f0f0;
}

.ant-layout-content {
  background: #fff;
}
</style>
