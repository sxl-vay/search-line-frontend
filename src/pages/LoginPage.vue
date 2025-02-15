<template>
  <div class="login-container">
    <a-card title="用户登录" class="login-card">
      <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="onFinish"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名!' }]"
        >
          <a-input v-model:value="formState.username" />
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码!' }]"
        >
          <a-input-password v-model:value="formState.password" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit">登录</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
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
      message.success("登录成功");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
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
  height: 100%;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
}
</style>
