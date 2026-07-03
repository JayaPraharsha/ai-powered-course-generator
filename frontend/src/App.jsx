import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Course from './pages/Course'
import Lesson from './pages/Lesson'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/course/:courseId" element={<Course />} />
        <Route path="/course/:courseId/lesson/:lessonId" element={<Lesson />} />
      </Route>
    </Routes>
  )
}

export default App
