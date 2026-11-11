import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { currentUser as demoUser, sampleMessages } from '../utils/sampleData.js'
import { readDemoState, writeDemoState } from '../services/demoModeService.js'
import { useAuth } from './AuthContext.jsx'
import {
  createPost as createPostRequest,
  deletePost as deletePostRequest,
  getPosts,
  getSavedPosts,
  toggleBookmark as toggleBookmarkRequest,
  updatePost as updatePostRequest,
  voteComment as voteCommentRequest,
  votePost as votePostRequest,
} from '../services/postService.js'
import {
  createCommunity as createCommunityRequest,
  getCommunities,
  joinCommunity,
  leaveCommunity,
} from '../services/communityService.js'
import { getUsers, updateProfile as updateProfileRequest } from '../services/userService.js'
import { createComment as createCommentRequest } from '../services/postService.js'

const ThreadlyContext = createContext(null)

export function ThreadlyProvider({ children }) {
  const { user: accountUser, isAuthenticated, updateUser } = useAuth()
  const [demoState, setDemoState] = useState(readDemoState)
  const [remoteState, setRemoteState] = useState(null)
  const [remoteRetryKey, setRemoteRetryKey] = useState(0)
  const [notice, setNotice] = useState(null)
  const [createPostOpen, setCreatePostOpen] = useState(false)
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false)
  const [editingPostId, setEditingPostId] = useState(null)
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    let active = true
    if (!isAuthenticated) return () => { active = false }
    Promise.all([
      getPosts({ page: 1, limit: 100, sort: 'latest' }),
      getCommunities(),
      getUsers(),
      getSavedPosts(),
    ])
      .then(([postResult, communities, users, savedPosts]) => {
        if (!active) return
        setRemoteState({
          userId: accountUser.id,
          status: 'success',
          posts: postResult.posts,
          communities,
          users,
          comments: [],
          bookmarks: savedPosts.map((post) => post.id),
        })
      })
      .catch((error) => {
        if (!active) return
        setRemoteState({
          userId: accountUser.id,
          status: 'error',
          posts: [],
          communities: [],
          users: [],
          comments: [],
          bookmarks: [],
        })
        setNotice({ message: error.message || 'Could not load your account data.', type: 'error', id: Date.now() })
      })

    return () => { active = false }
  }, [accountUser?.id, isAuthenticated, remoteRetryKey])

  const activeRemoteState = isAuthenticated && remoteState?.userId === accountUser?.id
    ? remoteState
    : null
  const remoteStatus = activeRemoteState?.status || (isAuthenticated ? 'loading' : 'idle')

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
      if (isAuthenticated) {
        setRemoteRetryKey((key) => key + 1)
        return
      }
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

    function updateRemote(updater) {
      setRemoteState((current) => current?.userId === accountUser?.id
        ? { ...updater(current), userId: current.userId, status: 'success' }
        : current)
    }

    async function createPost({ community, communityId, title, body, image }) {
      const selectedCommunity = communityId || community
      const activeCommunities = activeRemoteState?.communities || demoState.communities
      const targetCommunity = activeCommunities.find(
        (item) => item.id === selectedCommunity || item.name === selectedCommunity,
      )
      if (!targetCommunity) {
        notify('Choose an available community before creating a post.', 'error')
        return null
      }
      if (isAuthenticated) {
        try {
          const post = await createPostRequest({
            communityId: targetCommunity.id || targetCommunity.name,
            title,
            body,
            image: image?.trim() || null,
          })
          updateRemote((state) => ({ ...state, posts: [post, ...state.posts] }))
          notify('Your post was published.')
          return post
        } catch (error) {
          notify(error.message || 'Your post could not be published.', 'error')
          return null
        }
      }

      const post = {
        id: `demo-${crypto.randomUUID()}`,
        community: targetCommunity.name,
        communityId: targetCommunity.id,
        title: title.trim(),
        body: body.trim(),
        image: image?.trim() || null,
        author: demoUser.username,
        authorId: demoUser.username,
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

    async function editPost(postId, updates) {
      if (isAuthenticated) {
        try {
          const updated = await updatePostRequest(postId, {
            communityId: updates.community,
            title: updates.title,
            body: updates.body,
            image: updates.image?.trim() || null,
          })
          updateRemote((state) => ({
            ...state,
            posts: state.posts.map((post) => post.id === postId ? updated : post),
          }))
          notify('Your post was updated.')
          setEditingPostId(null)
          return updated
        } catch (error) {
          notify(error.message || 'Your post could not be updated.', 'error')
          return null
        }
      }

      const post = demoState.posts.find((item) => item.id === postId)
      if (!post || post.author !== demoUser.username || !post.demoOwned) {
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

    async function deletePost(postId) {
      if (isAuthenticated) {
        try {
          await deletePostRequest(postId)
          updateRemote((state) => ({
            ...state,
            posts: state.posts.filter((post) => post.id !== postId),
            bookmarks: state.bookmarks.filter((id) => id !== postId),
          }))
          notify('Your post was deleted.')
          return true
        } catch (error) {
          notify(error.message || 'Your post could not be deleted.', 'error')
          return false
        }
      }
      const post = demoState.posts.find((item) => item.id === postId)
      if (!post || post.author !== demoUser.username || !post.demoOwned) {
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

    async function votePost(postId, direction) {
      if (isAuthenticated) {
        try {
          const post = activeRemoteState?.posts.find((item) => item.id === postId)
          const value = post?.userVote === direction ? 0 : direction
          const updated = await votePostRequest(postId, value)
          updateRemote((state) => ({
            ...state,
            posts: state.posts.map((item) => item.id === postId ? updated : item),
          }))
          return true
        } catch (error) {
          notify(error.message || 'Your appreciation could not be saved.', 'error')
          return false
        }
      }
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

    async function toggleBookmark(postId) {
      if (isAuthenticated) {
        try {
          const post = await toggleBookmarkRequest(postId)
          updateRemote((state) => ({
            ...state,
            posts: state.posts.map((item) => item.id === postId ? post : item),
            bookmarks: post.bookmarked
              ? [...new Set([...state.bookmarks, postId])]
              : state.bookmarks.filter((id) => id !== postId),
          }))
          notify(post.bookmarked ? 'Post added to your reading list.' : 'Post removed from your reading list.')
          return post.bookmarked
        } catch (error) {
          notify(error.message || 'The post could not be saved.', 'error')
          return false
        }
      }
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

    async function toggleJoin(community) {
      const communityId = typeof community === 'string' ? community : community.id || community.name
      const activeCommunities = activeRemoteState?.communities || demoState.communities
      const target = activeCommunities.find((item) => item.id === communityId || item.name === communityId)
      if (!target) {
        notify('This community is no longer available.', 'error')
        return false
      }
      if (isAuthenticated) {
        try {
          const updated = target.joined
            ? await leaveCommunity(target.id || target.name)
            : await joinCommunity(target.id || target.name)
          updateRemote((state) => ({
            ...state,
            communities: state.communities.map((item) => item.id === updated.id ? updated : item),
          }))
          notify(updated.joined ? `Joined ${updated.title}.` : `Left ${updated.title}.`)
          return updated.joined
        } catch (error) {
          notify(error.message || 'Your space membership could not be updated.', 'error')
          return false
        }
      }
      const joined = !target.joined
      const saved = updateDemoState((state) => ({
        ...state,
        communities: state.communities.map((item) => item.id === target.id
          ? { ...item, joined, members: Math.max(0, item.members + (joined ? 1 : -1)) }
          : item),
      }))
      notifyLocalChange(joined ? `Joined ${target.title || target.name}.` : `Left ${target.title || target.name}.`, saved)
      return joined
    }

    async function createCommunity(payload) {
      try {
        const community = await createCommunityRequest(payload)
        updateRemote((state) => ({ ...state, communities: [community, ...state.communities] }))
        notify(`${community.title} space created.`)
        return community
      } catch (error) {
        notify(error.message || 'The space could not be created.', 'error')
        return null
      }
    }

    async function updateCurrentProfile(payload) {
      try {
        const updated = await updateProfileRequest(payload)
        updateUser(updated)
        updateRemote((state) => ({
          ...state,
          users: state.users.map((user) => user.id === updated.id
            ? { ...user, ...updated, isFollowing: user.isFollowing }
            : user),
        }))
        notify('Your profile was updated.')
        return updated
      } catch (error) {
        notify(error.message || 'Your profile could not be updated.', 'error')
        return null
      }
    }

    async function addComment(postId, body, parentCommentId = null) {
      if (isAuthenticated) {
        try {
          const comment = await createCommentRequest(postId, body, parentCommentId)
          updateRemote((state) => ({
            ...state,
            comments: [...state.comments, comment],
            posts: state.posts.map((post) => post.id === postId
              ? { ...post, commentCount: post.commentCount + 1 }
              : post),
          }))
          notify(parentCommentId ? 'Reply added.' : 'Comment added.')
          return comment
        } catch (error) {
          notify(error.message || 'Your reply could not be added.', 'error')
          return null
        }
      }
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
        author: demoUser.username,
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

    async function voteComment(commentId, direction, currentVote) {
      if (isAuthenticated) {
        try {
          const comment = activeRemoteState?.comments.find((item) => item.id === commentId)
          const value = (currentVote ?? comment?.userVote ?? 0) === direction ? 0 : direction
          const updated = await voteCommentRequest(commentId, value)
          notify('Your appreciation was recorded.')
          return updated
        } catch (error) {
          notify(error.message || 'Your appreciation could not be saved.', 'error')
          return null
        }
      }
      const comment = demoState.comments.find((item) => item.id === commentId)
      if (!comment) return null
      const previous = currentVote ?? comment.userVote ?? 0
      const next = previous === direction ? 0 : direction
      const saved = updateDemoState((state) => ({
        ...state,
        comments: state.comments.map((item) => item.id === commentId
          ? { ...item, userVote: next, score: (item.score || 0) - previous + next }
          : item),
      }))
      notifyLocalChange('Your appreciation was updated.', saved)
      return { ...comment, userVote: next, score: (comment.score || 0) - previous + next }
    }

    const activeState = activeRemoteState || (isAuthenticated
      ? { posts: [], communities: [], users: [], comments: [], bookmarks: [] }
      : demoState)
    const activeUser = accountUser || demoUser
    const users = activeRemoteState?.users || (isAuthenticated ? [] : demoState.users)
    return {
      demoMode: !isAuthenticated,
      currentUser: activeUser,
      communities: activeState.communities,
      posts: activeState.posts,
      comments: activeState.comments,
      users,
      bookmarks: activeRemoteState?.bookmarks || (isAuthenticated ? [] : demoState.bookmarks),
      directoryStatus: storageError ? 'error' : remoteStatus === 'error' ? 'error' : 'success',
      directoryError: storageError || remoteStatus === 'error'
        ? new Error(storageError || 'Your account data could not be loaded.')
        : null,
      reloadDirectory: retryStorage,
      notice,
      setNotice: (message, type = 'success') => typeof message === 'object'
        ? setNotice({ ...message, id: Date.now() })
        : notify(message, type),
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
      createCommunity,
      updateCurrentProfile,
      addComment,
      voteComment,
      isBookmarked: (postId) => activeRemoteState
        ? activeRemoteState.bookmarks.includes(postId)
        : demoState.bookmarks.includes(postId),
    }
  }, [
    accountUser,
    createCommunityOpen,
    createPostOpen,
    demoState,
    editingPostId,
    isAuthenticated,
    notice,
    activeRemoteState,
    remoteStatus,
    storageError,
    updateUser,
  ])

  return <ThreadlyContext.Provider value={value}>{children}</ThreadlyContext.Provider>
}

export function useThreadly() {
  const context = useContext(ThreadlyContext)
  if (!context) {
    throw new Error('useThreadly must be used within ThreadlyProvider')
  }
  return context
}
