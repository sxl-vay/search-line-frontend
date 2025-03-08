<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <div class="logo-container">
          <img src="../assets/logo.png" alt="Logo" class="logo" />
        </div>
        <h1 class="system-title">知识库综合搜索平台</h1>
      </div>

      <a-card class="login-card" :bordered="false">
        <template #title>
          <div class="card-title">用户登录</div>
        </template>

        <a-form
          :model="formState"
          name="basic"
          layout="vertical"
          autocomplete="off"
          @finish="onFinish"
        >
          <a-form-item
            label="用户名"
            name="username"
            :rules="[{ required: true, message: '请输入用户名!' }]"
          >
            <a-input
              v-model:value="formState.username"
              placeholder="请输入用户名"
              size="large"
              :prefix="() => h(UserOutlined)"
            />
          </a-form-item>

          <a-form-item
            label="密码"
            name="password"
            :rules="[{ required: true, message: '请输入密码!' }]"
          >
            <a-input-password
              v-model:value="formState.password"
              placeholder="请输入密码"
              size="large"
              :prefix="() => h(LockOutlined)"
            />
          </a-form-item>

          <a-form-item class="remember-forgot">
            <a-checkbox>记住我</a-checkbox>
            <a class="forgot-link">忘记密码?</a>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              class="login-button"
              size="large"
              block
            >
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>

      <div class="login-footer">
        <p>© 2023 知识库综合搜索平台 - 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, h } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import myAxios from "@/plugins/myAxios";

interface FormState {
  username: string;
  password: string;
}

const router = useRouter();

const formState = reactive<FormState>({
  username: "",
  password: "",
});

const onFinish = async (values: FormState) => {
  try {
    const res = await myAxios.post("/user/login", values);
    if (res.data.success !== false) {
      console.log("登录成功", res.data);
      message.success("登录成功");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      router.push("/");
    } else {
      message.error(res.data.responseMessage || "登录失败");
    }
  } catch (error) {
    message.error("登录失败");
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 460px;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-container {
  margin-bottom: 16px;
}

.logo {
  height: 64px;
  width: auto;
}

.system-title {
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.login-card {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 8px;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.forgot-link {
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
}

.forgot-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.login-button {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  margin-top: 8px;
  transition: all 0.3s;
}

.login-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.2);
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .login-card {
    box-shadow: none;
  }

  .system-title {
    font-size: 20px;
  }

  .logo {
    height: 48px;
  }
}
</style>
