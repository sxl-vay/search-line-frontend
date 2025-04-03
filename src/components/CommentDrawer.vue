<template>
  <a-drawer
    v-model:visible="visible"
    title="文章详情"
    placement="right"
    width="600"
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
          :header="`${comments.length} 条评论`"
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
                      >
                        收起
                      </a-button>
                    </p>
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
                <a-list
                  v-if="item.showChildren && item.children.length"
                  class="comment-reply-list"
                  :data-source="item.children"
                  @scroll="handleChildCommentsScroll($event, item)"
                >
                  <template #renderItem="{ item: childItem }">
                    <a-list-item>
                      <a-comment>
                        <!--
                        <template #avatar>
                          <a-avatar
                            :src="childItem.avatar"
                            :alt="childItem.author"
                          />
                        </template>
                        -->
                        <template #author>
                          <a>{{ childItem.author }}</a>
                        </template>
                        <template #content>
                          <p>{{ childItem.content }}</p>
                        </template>
                        <template #datetime>
                          <span>{{ childItem.datetime }}</span>
                        </template>
                      </a-comment>
                    </a-list-item>
                  </template>
                </a-list>
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

const afterVisibleChange = (val: boolean) => {
  if (val && props.post) {
    loadComments();
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
  try {
    const res = await myAxios.get("/comment/list", {
      params: {
        objId: String(props.post.id),
        rootId: "0",
        pageSize: 10,
        pageNum: 1,
      },
    });
    comments.value = (res.data || []).map((comment) => ({
      ...comment,
      showChildren: false,
      children: [],
      isExpanded: false, // 添加这行
    }));
  } catch (error) {
    console.error("Failed to load comments:", error);
  }
};

const loadChildComments = async (parentComment) => {
  try {
    if (!parentComment.currentPage) {
      parentComment.currentPage = 1;
      parentComment.hasMore = true;
    }
    if (!parentComment.hasMore) return;

    const res = await myAxios.get("/comment/list", {
      params: {
        objId: String(props.post.id),
        rootId: parentComment.id,
        pageSize: 10,
        pageNum: parentComment.currentPage,
      },
    });
    const newComments = res.data || [];
    if (newComments.length < 10) {
      parentComment.hasMore = false;
    }
    if (parentComment.currentPage === 1) {
      parentComment.children = newComments;
    } else {
      parentComment.children = [...parentComment.children, ...newComments];
    }
    parentComment.currentPage++;
  } catch (error) {
    console.error("Failed to load child comments:", error);
  }
};

const handleChildCommentsScroll = async (event, comment) => {
  const { scrollHeight, scrollTop, clientHeight } = event.target;
  if (scrollHeight - scrollTop - clientHeight < 50 && comment.hasMore) {
    await loadChildComments(comment);
  }
};

const toggleChildren = async (comment) => {
  comment.showChildren = !comment.showChildren;
  if (comment.showChildren && comment.children.length === 0) {
    comment.currentPage = 1;
    comment.hasMore = true;
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
    console.log("parentComment::", parentComment);
    console.log(
      "parentComment.rootId::",
      parentComment.rootId === "0" ? parentComment.id : parentComment.rootId
    );
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

.comment-list :deep(.ant-list-item) {
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.comment-list :deep(.ant-list-item:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-list :deep(.ant-comment-content-author) {
  margin-bottom: 8px;
}

.comment-list :deep(.ant-comment-content-author-name) {
  color: #1890ff;
  font-weight: 500;
}

.comment-list :deep(.ant-comment-content-detail) {
  color: #4a5568;
}

.comment-reply-list {
  margin: 16px 0 8px 48px;
  border-left: 3px solid #1890ff;
  padding-left: 16px;
  background-color: #f8fafc;
  border-radius: 0 8px 8px 0;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #1890ff #f0f0f0;
}

.comment-reply-list::-webkit-scrollbar {
  width: 6px;
}

.comment-reply-list::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.comment-reply-list::-webkit-scrollbar-thumb {
  background-color: #1890ff;
  border-radius: 3px;
}

.comment-form {
  margin-bottom: 2.5em;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.reply-form {
  margin: 16px 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
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
</style>
