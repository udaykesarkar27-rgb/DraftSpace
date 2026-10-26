import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import PostView from './pages/PostView.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyPosts from './pages/MyPosts.jsx';
import PostEditor from './pages/PostEditor.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-line dark:border-gray-800 py-6 text-center text-sm text-ink-faint dark:text-gray-500 transition-colors">
        DraftSpace - a small place for long-form writing
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="posts/:id" element={<PostView />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<MyPosts />} />
          <Route path="dashboard/new" element={<PostEditor />} />
          <Route path="dashboard/edit/:id" element={<PostEditor />} />
        </Route>

        <Route element={<ProtectedRoute role="ROLE_ADMIN" />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}