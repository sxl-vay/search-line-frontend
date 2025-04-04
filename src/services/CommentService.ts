import myAxios from "@/plugins/myAxios";

export interface Comment {
  id: string | number;
  content: string;
  author: string;
  avatar: string;
  datetime: string;
  gmtCreate: string;
  ip: string;
  parentId?: string | number;
  rootId?: string | number;
  children?: Comment[];
  isExpanded?: boolean;
  showChildren?: boolean;
  hasMore?: boolean;
  currentPage?: number;
  parentAuthor?: string;
  loading?: boolean;
}

export class CommentService {
  static async loadComments(
    objId: string | number,
    rootId = "0",
    pageSize = 10,
    pageNum = 1
  ): Promise<Comment[]> {
    try {
      const res = await myAxios.get("/comment/list", {
        params: {
          objId: String(objId),
          rootId,
          pageSize,
          pageNum,
        },
      });
      return (res.data || []).map((comment: Comment) => ({
        ...comment,
        showChildren: false,
        children: [],
        isExpanded: false,
      }));
    } catch (error) {
      console.error("Failed to load comments:", error);
      return [];
    }
  }

  static async loadChildComments(
    objId: string | number,
    rootId: string | number,
    pageSize = 10,
    pageNum = 1
  ): Promise<Comment[]> {
    try {
      const res = await myAxios.get("/comment/list", {
        params: {
          objId: String(objId),
          rootId,
          pageSize,
          pageNum,
        },
      });

      const comments = (res.data || []).map((comment: Comment) => ({
        ...comment,
        parentAuthor: this.findParentAuthor(comment, res.data),
        loading: false,
        hasMore: true,
        currentPage: 1,
      }));

      return comments;
    } catch (error) {
      console.error("Failed to load child comments:", error);
      return [];
    }
  }

  static async createReply(params: {
    objId: string | number;
    content: string;
    parentId?: string | number;
    rootId?: string | number;
  }): Promise<Comment | null> {
    try {
      const res = await myAxios.post("/comment/reply", {
        objId: String(params.objId),
        content: params.content,
        parentId: params.parentId || "0",
        rootId: params.rootId || "0",
      });
      return res.data;
    } catch (error) {
      console.error("Failed to create reply:", error);
      return null;
    }
  }

  private static findParentAuthor(
    comment: Comment,
    commentList: Comment[]
  ): string {
    if (!comment.parentId || comment.parentId === "0") return "";
    const parent = commentList.find((c) => c.id === comment.parentId);
    return parent ? parent.author : "";
  }

  static async getCommentCount(
    objId: string
  ): Promise<{ objAllCommentCount: number; rootCommentCount: number }> {
    try {
      const [rootCountRes, replyCountRes] = await Promise.all([
        myAxios.get(`/comment/count/${objId}`),
        myAxios.get(`/comment/count/${objId}/0`),
      ]);
      return {
        objAllCommentCount: rootCountRes.data || 0,
        rootCommentCount: replyCountRes.data || 0,
      };
    } catch (error) {
      console.error("Failed to get comment count:", error);
      return { objAllCommentCount: 0, rootCommentCount: 0 };
    }
  }

  static async getRootCommentRepliesCount(
    objId: string,
    rootId: string | number
  ): Promise<number> {
    try {
      const res = await myAxios.get(`/comment/count/${objId}/${rootId}`);
      return res.data || 0;
    } catch (error) {
      console.error("Failed to get root comment replies count:", error);
      return 0;
    }
  }
}
