<template>
  <a-layout>
    <a-layout-sider width="200" style="background: #fff">
      <a-menu
        mode="inline"
        v-model:selectedKeys="selectedKeys"
        style="height: 100%"
      >
        <a-menu-item key="home" @click="goToHome">
          <template #icon>
            <home-outlined />
          </template>
          首页
        </a-menu-item>
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
    <a-layout>
      <a-layout-header
        style="background: #fff; padding: 0 24px; text-align: right"
      >
        <template v-if="isLoggedIn">
          <a-dropdown>
            <a class="user-dropdown-link" @click.prevent>
              <span class="username">{{ currentUser?.nickName }}</span>
              <down-outlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout">
                  <logout-outlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <template v-else>
          <a-button type="link" @click="goToLogin">登录</a-button>
        </template>
      </a-layout-header>
      <a-layout-content style="padding: 24px">
        <slot />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  SearchOutlined,
  FileOutlined,
  DownOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const router = useRouter();
const route = useRoute();

// 根据当前路径设置选中的菜单项
const getSelectedKey = () => {
  if (route.path === "/") return "home";
  if (route.path === "/search" || route.path.startsWith("/search/"))
    return "search";
  if (route.path === "/file") return "file";
  return "";
};

const selectedKeys = ref([getSelectedKey()]);

const isLoggedIn = computed(() => {
  return localStorage.getItem("token") !== null;
});

const currentUser = computed(() => {
  const userStr = localStorage.getItem("user");
  const user = JSON.parse(userStr);
  console.log(" JSON.parse(userStr):", user);
  return userStr ? JSON.parse(userStr) : null;
});

const goToHome = () => {
  router.push("/");
  selectedKeys.value = ["home"];
};

const goToSearch = () => {
  router.push("/search");
  selectedKeys.value = ["search"];
};

const goToFile = () => {
  router.push("/file");
  selectedKeys.value = ["file"];
};

// 监听路由变化，更新选中的菜单项
router.afterEach((to) => {
  selectedKeys.value = [getSelectedKey()];
});

const goToLogin = () => {
  router.push("/login");
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  message.success("退出登录成功");
  router.push("/login");
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

.user-dropdown-link {
  color: rgba(0, 0, 0, 0.85);
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-right: 4px;
}
</style>
