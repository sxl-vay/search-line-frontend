import axios from "axios";
import { message } from "ant-design-vue";
import router from "@/router";

const instance = axios.create({
  baseURL: "http://192.168.40.95:8089/api",
  timeout: 10000,
  headers: {},
});

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `haha ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    const data = response.data;
    if (data.code === 0) {
      return data.data;
    }
    // 处理未认证的情况
    if (data.code === 40100 || data.code === 40101) {
      // 清除本地存储的认证信息
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      message.error("请先登录");
      // 跳转到登录页
      router.push("/login");
      return Promise.reject(data);
    }
    return response.data;
  },
  function (error) {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      message.error("请先登录");
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default instance;
