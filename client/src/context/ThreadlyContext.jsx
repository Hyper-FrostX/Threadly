import { createContext, useContext, useMemo, useState } from 'react'
import { currentUser, sampleMessages } from '../utils/sampleData.js'
import { readDemoState, writeDemoState } from '../services/demoModeService.js'

const ThreadlyContext = createContext(null)

export function ThreadlyProvider({ children }) {
  const [demoState, setDemoState] = useState(readDemoState)
  const [notice, setNotice] = useState(null)
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false)
  const [editingPostId, setEditingPostId] = useState(null)
  const [storageError, setStorageError] = useState('')

  const value = useMemo(() => {
    function notify(message, type = 'success') {
      setNotice({ message, type, id: Date.now() })
    }

    function notifyLocalChange(message, saved) {
      notify(
        saved
          ? `${message} Saved in this browser.`
          : `${message} Browser storage is unavailable, so this change will not persist after refresh.`,
        saved ? 'success' : 'error',
      )
    }

    function persistState(nextState) {
      try {
        writeDemoState(nextState)
        setStorageError('')
        return true
      } catch {
        setStorageError('Browser storage is unavailable. Changes will not persist after refresh.')
        return false
      }
    }

    function retryStorage() {
      const saved = persistState(demoState)
      notify(
        saved ? 'Your changes are saved in this browser.' : 'Your changes could not be saved in this browser.',
        saved ? 'success' : 'error',
      )
    }

    function updateDemoState(updater) {
      const nextState = updater(demoState)
      setDemoState(nextState)
      return persistState(nextState)
    }

    function createPost({ community, communityId, title, body, image }) {
      const communityName = communityId || community
      const targetCommunity = demoState.communities.find(
        (item) => item.id === communityName || item.name === communityName,
      )
      if (!targetCommunity) {
        notify('Choose an available community before creating a post.', 'error')
        return null
      }
      const post = {
        id: `demo-${crypto.randomUUID()}`,
        community: targetCommunity.name,
        communityId: targetCommunity.id,
        title: title.trim(),
        body: body.trim(),
        image: image?.trim() || null,
        author: currentUser.username,
        authorId: currentUser.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 0,
        commentCount: 0,
        featured: true,
        userVote: 0,
        demoOwned: true,
      }
      const saved = updateDemoState((state) => ({ ...state, posts: [post, ...state.posts] }))
      notifyLocalChange('Post created.', saved)
      return post
    }

    function editPost(postId, updates) {
      const post = demoState.posts.find((item) => item.id === postId)
      if (!post || post.author !== currentUser.username || !post.demoOwned) {
        notify('Only posts you created can be edited.', 'error')
        return null
      }
      const updated = {
        ...post,
        title: updates.title.trim(),
        body: updates.body.trim(),
        community: updates.community,
        communityId: updates.community,
        image: updates.image?.trim() || null,
        updatedAt: new Date().toISOString(),
      }
      const saved = updateDemoState((state) => ({
        ...state,
        posts: state.posts.map((item) => item.id === postId ? updated : item),
      }))
      notifyLocalChange('Your post was updated.', saved)
      setEditingPostId(null)
      return updated
    }

    function deletePost(postId) {
      const post = demoState.posts.find((item) => item.id === postId)
      if (!post || post.author !== currentUser.username || !post.demoOwned) {
        notify('Only posts you created can be deleted.', 'error')
        return false
      }
      const saved = updateDemoState((state) => ({
        ...state,
        posts: state.posts.filter((item) => item.id !== postId),
        comments: state.comments.filter((comment) => comment.postId !== postId),
        bookmarks: state.bookmarks.filter((id) => id !== postId),
      }))
      notifyLocalChange('Your post was deleted.', saved)
      return true
    }

    function votePost(postId, direction) {
      const post = demoState.posts.find((item) => item.id === postId)
      if (!post) {
        notify('This post is no longer available.', 'error')
        return false
      }
      const previous = post.userVote || 0
      const next = previous === direction ? 0 : direction
      const saved = updateDemoState((state) => ({
        ...state,
        posts: state.posts.map((item) => item.id === postId
          ? { ...item, userVote: next, score: item.score - previous + next }
          : item),
      }))
      notifyLocalChange(next === 0 ? 'Your vote was removed.' : 'Your vote was updated.', saved)
      return true
    }

    function toggleBookmark(postId) {
      if (!demoState.posts.some((post) => post.id === postId)) {
        notify('This post is no longer available.', 'error')
        return false
      }
      const saved = demoState.bookmarks.includes(postId)
      const savedToBrowser = updateDemoState((state) => ({
        ...state,
        bookmarks: saved
          ? state.bookmarks.filter((id) => id !== postId)
          : [...state.bookmarks, postId],
      }))
      notifyLocalChange(saved ? 'Post removed from Saved Posts.' : 'Post saved.', savedToBrowser)
      return !saved
    }

    function toggleJoin(community) {
      const communityId = typeof community === 'string' ? community : community.id || community.name
      const target = demoState.communities.find((item) => item.id === communityId || item.name === communityId)
      if (!target) {
        notify('This community is no longer available.', 'error')
        return false
      }
      const joined = !target.joined
      const saved = updateDemoState((state) => ({
        ...state,
        communities: state.communities.map((item) => item.id === target.id
          ? { ...item, joined, members: Math.max(0, item.members + (joined ? 1 : -1)) }
          : item),
      }))
      notifyLocalChange(joined ? `Joined t/${target.name}.` : `Left t/${target.name}.`, saved)
      return joined
    }

    function addComment(postId, body, parentCommentId = null) {
      if (!demoState.posts.some((post) => post.id === postId)) {
        notify('This post is no longer available.', 'error')
        return null
      }
      if (parentCommentId && !demoState.comments.some((comment) => comment.id === parentCommentId && comment.postId === postId)) {
        notify('The comment you are replying to could not be found.', 'error')
        return null
      }
      const comment = {
        id: `demo-comment-${crypto.randomUUID()}`,
        postId,
        parentCommentId,
        author: currentUser.username,
        body: body.trim(),
        createdAt: new Date().toISOString(),
        score: 0,
      }
      const saved = updateDemoState((state) => ({
        ...state,
        comments: [...state.comments, comment],
        posts: state.posts.map((post) => post.id === postId
          ? { ...post, commentCount: post.commentCount + 1 }
          : post),
      }))
      notifyLocalChange(parentCommentId ? 'Reply added.' : 'Comment added.', saved)
      return comment
    }

    return {
      demoMode: true,
      currentUser,
      communities: demoState.communities,
      posts: demoState.posts,
      comments: demoState.comments,
      users: demoState.users,
      bookmarks: demoState.bookmarks,
      directoryStatus: storageError ? 'error' : 'success',
      directoryError: storageError ? new Error(storageError) : null,
      reloadDirectory: retryStorage,
      notice,
      setNotice: (message) => notify(message),
      dismissNotice: () => setNotice(null),
      messages: sampleMessages,
      createPostOpen,
      createCommunityOpen,
      editingPostId,
      setCreatePostOpen,
      setCreateCommunityOpen,
      setEditingPostId,
      createPost,
      editPost,
      deletePost,
      votePost,
      toggleBookmark,
      toggleJoin,
      addComment,
      isBookmarked: (postId) => demoState.bookmarks.includes(postId),
    }
  }, [createCommunityOpen, createPostOpen, demoState, editingPostId, notice, storageError])

  return <ThreadlyContext.Provider value={value}>{children}</ThreadlyContext.Provider>
}

export function useThreadly() {
  const context = useContext(ThreadlyContext)
  if (!context) {
    throw new Error('useThreadly must be used within ThreadlyProvider')
  }
  return context
}
