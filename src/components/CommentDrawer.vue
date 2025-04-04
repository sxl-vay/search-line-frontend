<template>
  <a-drawer
    v-model:visible="visible"
    title="文章详情"
    placement="right"
    width="800"
    @after-visible-change="afterVisibleChange"
  >
    <template v-if="post">
      <a-card>
        <template #title>
          <div class="post-title">{{ post.title }}</div>
        </template>
        <div class="post-content">{{ post.content }}</div>
      </a-card>
      <MyDivider />
      <div class="comments-section">
        <h3>评论</h3>
        <div class="comment-form">
          <a-form :model="commentForm" @submit.prevent="submitComment">
            <a-form-item>
              <a-textarea
                v-model:value="commentForm.content"
                :rows="4"
                placeholder="写下你的评论..."
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit">发表评论</a-button>
            </a-form-item>
          </a-form>
        </div>
        <a-list
          class="comment-list"
          :data-source="comments"
          :header="`${commentCounts.objAllCommentCount} 条root评论`"
          item-layout="horizontal"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-comment>
                <template #avatar>
                  <a-avatar :src="item.avatar" :alt="item.author" />
                </template>
                <template #author>
                  <a>{{ item.author }}</a>
                </template>
                <template #content>
                  <div class="comment-content">
                    <p v-if="!item.isExpanded && item.content.length > 200">
                      {{ item.content.slice(0, 200) }}...
                      <a-button type="link" @click="expandComment(item)"
                        >查看全文</a-button
                      >
                    </p>
                    <p v-else class="expanded-content">
                      {{ item.content }}
                      <a-button
                        v-if="item.content.length > 200"
                        type="link"
                        @click="collapseComment(item)"
                        >收起</a-button
                      >
                    </p>
                    <div class="comment-info">
                      <span class="comment-time">{{ item.gmtCreate }}</span>
                      <span class="comment-ip">IP: {{ item.ip }}</span>
                    </div>
                  </div>
                </template>
                <template #datetime>
                  <span>{{ item.datetime }}</span>
                </template>
                <template #actions>
                  <span @click="toggleReply(item)" style="margin-right: 16px"
                    >回复</span
                  >
                  <span @click="toggleChildren(item)">
                    {{ item.showChildren ? "收起" : "展开" }} ({{
                      item.children.length
                    }})
                  </span>
                </template>
                <!-- 回复表单 -->
                <div v-if="item.showReplyForm" class="reply-form">
                  <a-form
                    :model="replyForm"
                    @submit.prevent="submitReply(item)"
                  >
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
                        @click="cancelReply(item)"
                        size="small"
                        style="margin-left: 8px"
                        >取消</a-button
                      >
                    </a-form-item>
                  </a-form>
                </div>
                <CommentReplyList
                  :show-children="item.showChildren"
                  :children="item.children"
                  :has-more="item.hasMore"
                  @expand-comment="expandComment"
                  @collapse-comment="collapseComment"
                  @toggle-reply="toggleReply"
                  @cancel-reply="cancelReply"
                  @submit-reply="({ comment, content }) => submitReply(comment)"
                  @scroll="(event) => handleChildCommentsScroll(event, item)"
                />
              </a-comment>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import MyDivider from "@/components/MyDivider.vue";
import myAxios from "@/plugins/myAxios";
import CommentReplyList from "@/components/CommentReplyList.vue";
import { CommentService, type Comment } from "@/services/CommentService";

interface Post {
  id: number;
  title: string;
  content: string;
  createTime?: string;
  updateTime?: string;
  tags?: string[];
}

interface Props {
  visible: boolean;
  post: Post | null;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:visible"]);

const visible = ref(props.visible);
const comments = ref([]);
const commentCounts = ref({
  objAllCommentCount: 0,
  rootCommentCount: 0,
});
const commentForm = ref({
  content: "",
});
const replyForm = ref({
  content: "",
});

watch(
  () => props.visible,
  (newVal) => {
    visible.value = newVal;
  }
);

watch(visible, (newVal) => {
  emit("update:visible", newVal);
});

const afterVisibleChange = async (val: boolean) => {
  if (val && props.post) {
    loadComments();
    const counts = await CommentService.getCommentCount(props.post.id);
    commentCounts.value = counts;
  }
};

const expandComment = (comment) => {
  comment.isExpanded = true;
};

const collapseComment = (comment) => {
  comment.isExpanded = false;
};

const loadComments = async () => {
  if (!props.post) return;
  const [commentsData, counts] = await Promise.all([
    CommentService.loadComments(props.post.id),
    CommentService.getCommentCount(props.post.id),
  ]);
  comments.value = commentsData;
  commentCounts.value = counts;
};

const toggleChildren = async (comment) => {
  comment.showChildren = !comment.showChildren;
  if (comment.showChildren && comment.children.length === 0) {
    comment.currentPage = 1;
    comment.hasMore = true;
    console.log("loadChildComments::", comment);
    const [childComments, repliesCount] = await Promise.all([
      loadChildComments(comment),
      CommentService.getRootCommentRepliesCount(props.post.id, comment.id),
    ]);
    comment.repliesCount = repliesCount;
  }
};

const loadChildComments = async (parentComment) => {
  if (!props.post) return;
  if (!parentComment.currentPage) {
    parentComment.currentPage = 1;
    parentComment.hasMore = true;
  }
  if (!parentComment.hasMore || parentComment.loading) return;

  try {
    parentComment.loading = true;
    const newComments = await CommentService.loadChildComments(
      props.post.id,
      parentComment.id,
      10,
      parentComment.currentPage
    );

    if (newComments.length < 10) {
      parentComment.hasMore = false;
    }

    if (parentComment.currentPage === 1) {
      parentComment.children = newComments;
    } else {
      parentComment.children = [
        ...(parentComment.children || []),
        ...newComments,
      ];
    }
    parentComment.currentPage++;
  } finally {
    parentComment.loading = false;
  }
};

const handleChildCommentsScroll = async (event, comment) => {
  const { scrollHeight, scrollTop, clientHeight } = event.target;
  if (scrollHeight - scrollTop - clientHeight < 50 && comment.hasMore) {
    await loadChildComments(comment);
  }
};

const submitComment = async () => {
  if (!props.post || !commentForm.value.content.trim()) return;
  try {
    await myAxios.post("/comment/publish", {
      objId: String(props.post.id),
      content: commentForm.value.content,
    });
    commentForm.value.content = "";
    await loadComments();
  } catch (error) {
    console.error("Failed to submit comment:", error);
  }
};

const toggleReply = (comment) => {
  comment.showReplyForm = !comment.showReplyForm;
  if (!comment.showReplyForm) {
    replyForm.value.content = "";
  }
};

const cancelReply = (comment) => {
  comment.showReplyForm = false;
  replyForm.value.content = "";
};

const submitReply = async (parentComment) => {
  if (!props.post || !replyForm.value.content.trim()) return;
  try {
    await myAxios.post("/comment/reply", {
      objId: String(props.post.id),
      userId: 1,
      content: replyForm.value.content,
      rootId:
        parentComment.rootId === "0" ? parentComment.id : parentComment.rootId,
      parentId: parentComment.id,
    });
    replyForm.value.content = "";
    parentComment.showReplyForm = false;
    await loadComments();
  } catch (error) {
    console.error("Failed to submit reply:", error);
  }
};
</script>

<style scoped>
.post-title {
  font-size: 1.8em;
  font-weight: 600;
  margin-bottom: 1.2em;
  color: #2c3e50;
}

.post-content {
  margin-bottom: 2.5em;
  line-height: 1.8;
  color: #34495e;
}

.comments-section {
  margin-top: 2.5em;
}

.comment-list {
  margin-top: 1.5em;
}

.comment-list .ant-list-item {
  position: relative;
  display: flex;
  flex-direction: column;
}

.comment-list .ant-comment {
  width: 100%;
}

.comment-content {
  position: relative;
  background: #fafafa;
  padding: 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.reply-form {
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
}

:deep(.ant-form-item-control-input-content) .ant-btn {
  border-radius: 4px;
  height: 32px;
  padding: 0 16px;
  font-weight: 500;
}

:deep(.ant-form-item-control-input-content) .ant-btn-primary {
  background: #1890ff;
  border-color: #1890ff;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
}

:deep(.ant-form-item-control-input-content) .ant-btn-primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

:deep(.ant-textarea) {
  border-radius: 4px;
  resize: none;
  transition: all 0.3s ease;
}

:deep(.ant-textarea:hover),
:deep(.ant-textarea:focus) {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.comment-content {
  width: 100%;
  word-break: break-word;
}

.expanded-content {
  white-space: pre-wrap;
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
