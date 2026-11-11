import { Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CommunitiesPage from './pages/CommunitiesPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PopularPage from './pages/PopularPage.jsx'
import PostDetailPage from './pages/PostDetailPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import { ThreadlyProvider } from './context/ThreadlyContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThreadlyProvider>
          <Routes>
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/popular" element={<PopularPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/profile/:username?" element={<ProfilePage />} />
              <Route path="/c/:communityName" element={<CommunityPage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ThreadlyProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
