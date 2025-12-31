<template>
  <div class="post-detail-container">
    <!-- 头部 -->
    <div class="detail-header">
      <button class="back-btn" @click="$emit('back')">
        <span class="arrow">&lt;&lt;</span> BACK
      </button>
      <div class="header-info">
        <span class="header-tag">[LOG_DETAIL]</span>
        <span class="post-id">#{{ String(post?.id || 0).padStart(4, '0') }}</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <span class="loading-text">>> LOADING_LOG_DATA...</span>
      <span class="cursor blink">_</span>
    </div>

    <!-- 帖子内容 -->
    <CustomScrollbar v-else-if="post" class="detail-content">
      <!-- 标题 -->
      <div class="title-section">
        <h1 class="post-title">{{ post.title }}</h1>
      </div>

      <!-- 封面图 -->
      <div v-if="post.cover" class="cover-section">
        <img :src="post.cover" :alt="post.title" class="cover-image" />
      </div>

      <!-- 内容 -->
      <div class="content-section">
        <div class="content-header">
          <span class="section-label">// CONTENT</span>
        </div>
        <div class="content-body">
          <p v-for="(paragraph, idx) in contentParagraphs" :key="idx" class="paragraph">
            {{ paragraph }}
          </p>
        </div>
      </div>

      <!-- 元信息 -->
      <div class="meta-section">
        <div class="meta-row">
          <span class="meta-label">AUTHOR:</span>
          <span class="meta-value author">@{{ post.user?.name || 'UNKNOWN' }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">TAG:</span>
          <span class="meta-value tag">[{{ post.tag }}]</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">TIME:</span>
          <span class="meta-value">{{ formatTime(post.created_at) }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">VIEWS:</span>
          <span class="meta-value">{{ post.view_count }}</span>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="action-section">
        <button 
          class="action-btn" 
          :class="{ active: post.is_liked }"
          @click="handleLike"
        >
          <span class="action-icon">♥</span>
          <span class="action-text">{{ post.like_count }} LIKES</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">✉</span>
          <span class="action-text">{{ post.comment_count }} COMMENTS</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">↗</span>
          <span class="action-text">SHARE</span>
        </button>
      </div>

      <!-- 评论区 -->
      <div class="comment-section">
        <div class="section-header">
          <span class="section-label">// COMMENTS ({{ post.comment_count }})</span>
        </div>
        
        <!-- 评论输入框 -->
        <div class="comment-input-box">
          <div class="input-header">
            <span class="prompt">
              {{ replyTo ? `REPLY_TO @${replyTo.user?.name} >` : 'NEW_COMMENT >' }}
            </span>
            <button v-if="replyTo" class="cancel-reply" @click="replyTo = null">×</button>
          </div>
          <textarea 
            v-model="commentContent"
            class="comment-textarea"
            placeholder="输入你的评论..."
            rows="3"
          ></textarea>
          <div class="input-actions">
            <span class="char-hint">{{ commentContent.length }}/2000</span>
            <button 
              class="submit-btn" 
              :disabled="!commentContent.trim() || submittingComment"
              @click="handleSubmitComment"
            >
              {{ submittingComment ? 'SENDING...' : '[SEND]' }}
            </button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-if="loadingComments" class="comments-loading">
          <span>>> LOADING_COMMENTS...</span>
        </div>
        <div v-else-if="comments.length === 0" class="no-comments">
          <span>>> NO_COMMENTS_YET</span>
        </div>
        <div v-else class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-main">
              <div class="comment-header">
                <span class="comment-author">@{{ comment.user?.name || 'UNKNOWN' }}</span>
                <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-actions">
                <button 
                  class="comment-action-btn" 
                  :class="{ active: comment.is_liked }"
                  @click="handleCommentLike(comment)"
                >
                  ♥ {{ comment.like_count }}
                </button>
                <button class="comment-action-btn" @click="replyTo = comment">↳ REPLY</button>
                <button 
                  v-if="isMyComment(comment)" 
                  class="comment-action-btn delete"
                  @click="handleDeleteComment(comment)"
                >
                  ✕ DELETE
                </button>
              </div>
            </div>
            
            <!-- 回复列表 -->
            <div v-if="comment.replies?.length" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="comment-header">
                  <span class="reply-indicator">└─</span>
                  <span class="comment-author">@{{ reply.user?.name || 'UNKNOWN' }}</span>
                  <span v-if="reply.reply_to_user" class="reply-to">
                    ➜ <span class="reply-to-name">@{{ reply.reply_to_user.name }}</span>
                  </span>
                  <span class="comment-time">{{ formatTime(reply.created_at) }}</span>
                </div>
                <div class="comment-content">{{ reply.content }}</div>
                <div class="comment-actions">
                  <button 
                    class="comment-action-btn" 
                    :class="{ active: reply.is_liked }"
                    @click="handleCommentLike(reply)"
                  >
                    ♥ {{ reply.like_count }}
                  </button>
                  <button class="comment-action-btn" @click="replyTo = reply">↳ REPLY</button>
                  <button 
                    v-if="isMyComment(reply)" 
                    class="comment-action-btn delete"
                    @click="handleDeleteComment(reply)"
                  >
                    ✕ DELETE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomScrollbar>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <span>>> ERROR: LOG_NOT_FOUND_IN_WORLDLINE</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPost, toggleLike } from '../api/post'
import { getComments, createComment, deleteComment, toggleCommentLike } from '../api/comment'
import { getToken } from '../api/request'
import CustomScrollbar from './CustomScrollbar.vue'

const props = defineProps({
  postId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['back', 'updated'])

const post = ref(null)
const loading = ref(true)
const comments = ref([])
const loadingComments = ref(false)
const commentContent = ref('')
const submittingComment = ref(false)
const replyTo = ref(null)
const currentUserId = ref(null)

// 内容分段
const contentParagraphs = computed(() => {
  if (!post.value?.content) return []
  return post.value.content.split('\n').filter(p => p.trim())
})

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const sec = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${sec}`
}

// 获取当前用户ID
const getCurrentUserId = () => {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.user_id
  } catch {
    return null
  }
}

// 加载帖子
const loadPost = async () => {
  loading.value = true
  try {
    const res = await getPost(props.postId)
    if (res.code === 200 && res.data) {
      post.value = res.data
    }
  } catch (e) {
    console.error('加载帖子失败', e)
  } finally {
    loading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  loadingComments.value = true
  try {
    const res = await getComments(props.postId, { limit: 50 })
    if (res.code === 200 && res.data) {
      comments.value = res.data.items || []
    }
  } catch (e) {
    console.error('加载评论失败', e)
  } finally {
    loadingComments.value = false
  }
}

// 点赞帖子
const handleLike = async () => {
  if (!post.value) return
  try {
    const res = await toggleLike(post.value.id)
    if (res.code === 200 && res.data) {
      post.value.is_liked = res.data.is_liked
      post.value.like_count = res.data.like_count
      emit('updated')
    }
  } catch (e) {
    console.error('点赞失败', e)
  }
}

// 发表评论
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) return
  
  submittingComment.value = true
  try {
    const data = {
      content: commentContent.value.trim()
    }
    if (replyTo.value) {
      data.parent_id = replyTo.value.id
    }
    
    const res = await createComment(props.postId, data)
    if (res.code === 201) {
      commentContent.value = ''
      replyTo.value = null
      post.value.comment_count++
      loadComments()
      emit('updated')
    }
  } catch (e) {
    console.error('发表评论失败', e)
  } finally {
    submittingComment.value = false
  }
}

// 评论点赞
const handleCommentLike = async (comment) => {
  try {
    const res = await toggleCommentLike(props.postId, comment.id)
    if (res.code === 200 && res.data) {
      comment.is_liked = res.data.is_liked
      comment.like_count = res.data.like_count
    }
  } catch (e) {
    console.error('评论点赞失败', e)
  }
}

// 删除评论
const handleDeleteComment = async (comment) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const res = await deleteComment(props.postId, comment.id)
    if (res.code === 200) {
      loadComments()
      post.value.comment_count = Math.max(0, post.value.comment_count - 1)
      emit('updated')
    }
  } catch (e) {
    console.error('删除评论失败', e)
  }
}

// 是否是我的评论
const isMyComment = (comment) => {
  return currentUserId.value && comment.user_id === currentUserId.value
}

onMounted(() => {
  currentUserId.value = getCurrentUserId()
  loadPost()
  loadComments()
})
</script>

<style scoped>
.post-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1117;
  color: #c9d1d9;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
}

/* Header */
.detail-header {
  height: 60px;
  border-bottom: 1px solid #30363d;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #161b22;
  gap: 24px;
  flex-shrink: 0;
}

.back-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}

.arrow {
  color: #58a6ff;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-tag {
  font-size: 12px;
  color: #7ee787;
  font-weight: bold;
}

.post-id {
  color: #79c0ff;
  font-size: 14px;
}

/* Loading */
.loading-state,
.error-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8b949e;
  font-size: 14px;
}

.loading-text {
  color: #58a6ff;
}

/* Content */
.detail-content {
  flex: 1;
  min-height: 0;
}

.detail-content :deep(.scrollbar-content) {
  padding: 24px;
}

/* Meta Section */
.meta-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px;
  padding: 16px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  margin-top: 20px;
  margin-bottom: 20px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  color: #484f58;
  font-size: 11px;
  font-weight: bold;
  min-width: 60px;
}

.meta-value {
  color: #8b949e;
  font-size: 13px;
}

.meta-value.author {
  color: #58a6ff;
}

.meta-value.tag {
  color: #d2a8ff;
}

/* Title */
.title-section {
  margin-bottom: 20px;
}

.post-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #c9d1d9;
  line-height: 1.4;
}

/* Cover */
.cover-section {
  margin-bottom: 20px;
  border: 1px solid #30363d;
  border-radius: 6px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  background: #010409;
}

/* Content */
.content-section {
  margin-bottom: 24px;
}

.content-header,
.section-header {
  margin-bottom: 12px;
}

.section-label {
  color: #484f58;
  font-size: 12px;
  font-weight: bold;
}

.content-body {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 20px;
}

.paragraph {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.8;
  color: #c9d1d9;
}

.paragraph:last-child {
  margin-bottom: 0;
}

/* Actions */
.action-section {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #30363d;
  border-bottom: 1px solid #30363d;
  margin-bottom: 24px;
}

.action-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #58a6ff;
  color: #58a6ff;
}

.action-btn.active {
  border-color: #f85149;
  color: #f85149;
}

.action-icon {
  font-size: 14px;
}

/* Comments */
.comment-section {
  margin-top: 24px;
}

/* Comment Input */
.comment-input-box {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
}

.input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.input-header .prompt {
  color: #7ee787;
  font-size: 12px;
  font-weight: bold;
}

.cancel-reply {
  background: transparent;
  border: none;
  color: #f85149;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
}

.comment-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #010409;
  border: 1px solid #30363d;
  color: #c9d1d9;
  padding: 12px;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  min-height: 60px;
  outline: none;
}

.comment-textarea:focus {
  border-color: #58a6ff;
}

.comment-textarea::placeholder {
  color: #484f58;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.char-hint {
  color: #484f58;
  font-size: 11px;
}

.submit-btn {
  background: #238636;
  border: none;
  color: #fff;
  padding: 6px 16px;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2ea043;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Comments List */
.comments-loading,
.no-comments {
  padding: 30px;
  text-align: center;
  color: #484f58;
  font-size: 13px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 16px;
}

.comment-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.comment-author {
  color: #58a6ff;
  font-weight: 600;
}

.comment-time {
  color: #484f58;
}

.reply-to {
  color: #6e7681;
  font-size: 12px;
}

.reply-to-name {
  color: #d2a8ff;
}

.comment-content {
  color: #c9d1d9;
  font-size: 14px;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.comment-action-btn {
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  font-family: inherit;
  transition: color 0.2s;
}

.comment-action-btn:hover {
  color: #58a6ff;
}

.comment-action-btn.active {
  color: #f85149;
}

.comment-action-btn.delete:hover {
  color: #f85149;
}

/* Replies */
.replies-list {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid #30363d;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reply-indicator {
  color: #484f58;
}

/* Animations */
.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
