import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import AuthGuard from './components/common/AuthGuard'
import MaintenanceBanner from './components/common/MaintenanceBanner'
import GlobalAIAssistant from './components/common/GlobalAIAssistant'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard'))
const PostJob = lazy(() => import('./pages/PostJob'))
const CheckEmail = lazy(() => import('./pages/CheckEmail'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Jobs = lazy(() => import('./pages/Jobs'))

function PageFallback() {
  return (
    <div className="flex flex-grow items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthGuard>
        <MaintenanceBanner />
        <div className="flex flex-col min-h-screen gradient-bg">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/employer-dashboard" element={<EmployerDashboard />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/check-email" element={<CheckEmail />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <GlobalAIAssistant />
        </div>
      </AuthGuard>
    </Router>
  )
}

export default App
