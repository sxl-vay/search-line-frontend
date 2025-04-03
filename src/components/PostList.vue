<template>
  <a-list item-layout="horizontal" :data-source="props.postList">
    <template #renderItem="{ item }">
      <a-list-item>
        <a-list-item-meta :description="item.content">
          <template #title>
            <a @click="showComments(item)">{{ item.title }}</a>
          </template>
          <template #avatar>
            <a-avatar :src="gege" />
          </template>
        </a-list-item-meta>
      </a-list-item>
    </template>
  </a-list>

  <CommentDrawer v-model:visible="drawerVisible" :post="currentPost" />
</template>

<script setup lang="ts">
import gege from "../assets/gege.jpg";
import { withDefaults, defineProps, ref } from "vue";
import CommentDrawer from "@/components/CommentDrawer.vue";

interface Post {
  id: number;
  title: string;
  content: string;
  createTime?: string;
  updateTime?: string;
  tags?: string[];
}

interface Props {
  postList: Post[];
}

const props = withDefaults(defineProps<Props>(), {
  postList: () => [],
});

const drawerVisible = ref(false);
const currentPost = ref<Post | null>(null);

const showComments = (post: Post) => {
  currentPost.value = post;
  drawerVisible.value = true;
};
</script>
