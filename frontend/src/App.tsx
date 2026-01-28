import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import PostJob from './pages/PostJob'

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen gradient-bg">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/post-job" element={<PostJob />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
