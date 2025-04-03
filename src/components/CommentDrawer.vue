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
                  <p>{{ item.content }}</p>
                </template>
                <template #datetime>
                  <span>{{ item.datetime }}</span>
                </template>
                <template #actions>
                  <span @click="toggleReply(item)">回复</span>
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
                  v-if="item.children && item.children.length"
                  class="comment-reply-list"
                  :data-source="item.children"
                >
                  <template #renderItem="{ item: childItem }">
                    <a-list-item>
                      <a-comment>
                        <template #avatar>
                          <a-avatar
                            :src="childItem.avatar"
                            :alt="childItem.author"
                          />
                        </template>
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

const loadComments = async () => {
  if (!props.post) return;
  try {
    const res = await myAxios.get("/comment/list", {
      params: {
        objId: String(props.post.id),
        pageSize: 10,
        pageNum: 1,
      },
    });
    comments.value = res.data || [];
  } catch (error) {
    console.error("Failed to load comments:", error);
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
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 1em;
}

.post-content {
  margin-bottom: 2em;
  line-height: 1.6;
}

.comments-section {
  margin-top: 2em;
}

.comment-list {
  margin-top: 1em;
}

.comment-reply-list {
  margin-left: 2em;
  border-left: 2px solid #f0f0f0;
  padding-left: 1em;
  background-color: #fafafa;
  border-radius: 4px;
}

.comment-form {
  margin-bottom: 2em;
}

.reply-form {
  margin: 1em 0;
}
</style>
