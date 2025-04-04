<template>
  <a-list
    v-if="showChildren && children.length"
    class="comment-reply-list"
    :data-source="children"
    @scroll="handleChildCommentsScroll"
  >
    <template #renderItem="{ item: childItem }">
      <a-list-item>
        <a-comment>
          <template #avatar>
            <a-avatar :src="childItem.avatar" :alt="childItem.author" />
          </template>
          <template #author>
            <div class="reply-to" v-if="childItem.parentAuthor">
              <span class="reply-author">
                {{ childItem.author }} <a>回复</a>{{ childItem.parentAuthor }}
              </span>
            </div>
          </template>
          <template #content>
            <div class="comment-content">
              <p v-if="!childItem.isExpanded && childItem.content.length > 200">
                {{ childItem.content.slice(0, 200) }}...
                <a-button type="link" @click="expandComment(childItem)"
                  >查看全文</a-button
                >
              </p>
              <p v-else class="expanded-content">
                {{ childItem.content }}
                <a-button
                  v-if="childItem.content.length > 200"
                  type="link"
                  @click="collapseComment(childItem)"
                  >收起</a-button
                >
              </p>
              <div class="comment-info">
                <span class="comment-time">{{ childItem.gmtCreate }}</span>
                <span class="comment-ip">IP: {{ childItem.ip }}</span>
              </div>
            </div>
          </template>
          <template #datetime>
            <span>{{ childItem.datetime }}</span>
          </template>
          <template #actions>
            <span @click="toggleReply(childItem)" style="margin-right: 16px"
              >回复</span
            >
          </template>
          <!-- 回复表单 -->
          <div v-if="childItem.showReplyForm" class="reply-form">
            <a-form :model="replyForm" @submit.prevent="handleReply(childItem)">
              <a-form-item>
                <a-textarea
                  v-model:value="replyForm.content"
                  :rows="2"
                  placeholder="回复评论..."
                />
              </a-form-item>
              <a-form-item>
                <a-button type="primary" html-type="submit" size="small"
                  >提交回复</a-button
                >
                <a-button
                  @click="cancelReply(childItem)"
                  size="small"
                  style="margin-left: 8px"
                  >取消</a-button
                >
              </a-form-item>
            </a-form>
          </div>
        </a-comment>
      </a-list-item>
    </template>
  </a-list>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import { CommentService } from "@/services/CommentService";

interface Props {
  showChildren: boolean;
  children: any[];
  hasMore: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits([
  "expand-comment",
  "collapse-comment",
  "toggle-reply",
  "cancel-reply",
  "submit-reply",
  "scroll",
]);

const replyForm = ref({
  content: "",
});

const expandComment = (comment: any) => {
  emit("expand-comment", comment);
};

const collapseComment = (comment: any) => {
  emit("collapse-comment", comment);
};

const toggleReply = (comment: any) => {
  emit("toggle-reply", comment);
};

const cancelReply = (comment: any) => {
  emit("cancel-reply", comment);
  replyForm.value.content = "";
};

const loading = ref(false);

const handleReply = async (comment: any) => {
  if (!replyForm.value.content.trim()) return;
  loading.value = true;
  try {
    const result = await CommentService.createReply({
      objId: comment.objId,
      content: replyForm.value.content,
      parentId: comment.id,
      rootId: comment.rootId || comment.id,
    });
    if (result) {
      emit("submit-reply", { comment, content: replyForm.value.content });
      replyForm.value.content = "";
    }
  } catch (error) {
    console.error("Failed to reply comment:", error);
  } finally {
    loading.value = false;
  }
};

const handleChildCommentsScroll = (event: any) => {
  emit("scroll", event);
};
</script>

<style scoped>
.comment-reply-list {
  width: 100%;
  margin-left: 44px;
  border-left: 2px solid #f0f0f0;
  padding-left: 16px;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 #f5f5f5;
}

.comment-reply-list::-webkit-scrollbar {
  width: 6px;
}

.comment-reply-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.comment-reply-list::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 3px;
}

.comment-content {
  position: relative;
  background: #fafafa;
  padding: 12px;
  border-radius: 4px;
  margin-top: 8px;
  width: 100%;
  word-break: break-word;
}

.expanded-content {
  white-space: pre-wrap;
}

.reply-form {
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

.reply-to {
  color: #8c8c8c;
  margin-bottom: 4px;
  font-size: 14px;
}

.reply-author {
  color: #8c8c8c;
  font-weight: 500;
}

.comment-info {
  margin-bottom: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.comment-time {
  margin-right: 16px;
}

.comment-ip {
  color: #a6a6a6;
}
</style>
