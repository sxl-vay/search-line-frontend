<template>
  <div class="welcome-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="title">知识库综合搜索平台</h1>
        <p class="subtitle">一站式知识检索与管理解决方案</p>
        <a-button
          type="primary"
          size="large"
          @click="goToSearch"
          class="cta-button"
        >
          立即体验
        </a-button>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">平台特色</h2>
      <div class="features-container">
        <div class="feature-card">
          <div class="feature-icon">
            <search-outlined />
          </div>
          <h3>智能搜索</h3>
          <p>强大的搜索引擎，支持多维度检索，快速定位所需信息</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <file-outlined />
          </div>
          <h3>文件管理</h3>
          <p>便捷的文件上传、分类与管理功能，高效组织知识资源</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <team-outlined />
          </div>
          <h3>用户协作</h3>
          <p>支持团队协作，实现知识共享与交流，提升团队效率</p>
        </div>
      </div>
    </div>

    <div class="about-section">
      <h2 class="section-title">关于平台</h2>
      <div class="about-content">
        <p>
          知识库综合搜索平台是一个专为企业和团队打造的知识管理系统，旨在解决信息碎片化、检索困难等问题。平台整合了文档、图片、用户等多种资源，提供统一的搜索入口，让知识管理更加高效便捷。
        </p>
        <p>通过我们的平台，您可以轻松实现：</p>
        <ul>
          <li>集中管理各类知识资源</li>
          <li>快速检索所需信息</li>
          <li>便捷分享和协作</li>
          <li>数据安全与权限控制</li>
        </ul>
      </div>
    </div>

    <div class="guide-section">
      <h2 class="section-title">使用指南</h2>
      <a-steps>
        <a-step title="注册登录" description="创建您的账户或登录系统" />
        <a-step title="上传资源" description="添加文档、图片等知识资源" />
        <a-step title="搜索浏览" description="使用搜索功能快速找到所需信息" />
        <a-step title="管理分享" description="整理资源并与团队成员分享" />
      </a-steps>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  SearchOutlined,
  FileOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();

const goToSearch = () => {
  router.push("/search");
};
</script>

<style scoped>
.welcome-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  height: 400px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  border-radius: 8px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 20px;
}

.hero-content {
  max-width: 600px;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 16px;
  font-weight: bold;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 24px;
  opacity: 0.9;
}

.cta-button {
  font-size: 1.1rem;
  height: 48px;
  padding: 0 32px;
}

.section-title {
  text-align: center;
  margin-bottom: 40px;
  font-size: 1.8rem;
  font-weight: bold;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background-color: #1890ff;
  border-radius: 2px;
}

.features-section {
  margin-bottom: 60px;
}

.features-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.feature-card {
  flex: 1;
  min-width: 250px;
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  color: #1890ff;
  margin-bottom: 20px;
}

.about-section {
  margin-bottom: 60px;
}

.about-content {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 30px;
}

.about-content p {
  margin-bottom: 16px;
  line-height: 1.6;
}

.about-content ul {
  padding-left: 20px;
}

.about-content li {
  margin-bottom: 8px;
}

.guide-section {
  margin-bottom: 60px;
}

@media (max-width: 768px) {
  .hero-section {
    height: 300px;
  }

  .title {
    font-size: 2rem;
  }

  .features-container {
    flex-direction: column;
  }

  .feature-card {
    margin-bottom: 20px;
  }
}
</style>
