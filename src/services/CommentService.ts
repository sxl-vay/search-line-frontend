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
    parentComment: Comment
  ): Promise<void> {
    if (!parentComment.currentPage) {
      parentComment.currentPage = 1;
      parentComment.hasMore = true;
    }
    if (!parentComment.hasMore) return;

    try {
      const res = await myAxios.get("/comment/list", {
        params: {
          objId: String(objId),
          parentId: parentComment.id,
          pageSize: 10,
          pageNum: parentComment.currentPage,
        },
      });

      const newComments = (res.data || []).map((comment: Comment) => ({
        ...comment,
        parentAuthor: this.findParentAuthor(comment, res.data),
      }));

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
    } catch (error) {
      console.error("Failed to load child comments:", error);
    }
  }

  private static findParentAuthor(
    comment: Comment,
    commentList: Comment[]
  ): string {
    for (const item of commentList) {
      if (item.id === comment.parentId) {
        return item.author;
      }
    }
    return "";
  }
}
