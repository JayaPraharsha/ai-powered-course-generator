const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message =
      typeof body?.detail === 'string'
        ? body.detail
        : body?.detail
          ? JSON.stringify(body.detail)
          : `Request failed: ${res.status} ${res.statusText}`
    throw new Error(message)
  }
  return res.status === 204 ? null : res.json()
}

// Courses
export const generateCourse = (payload) =>
  request('/courses/generate', { method: 'POST', body: JSON.stringify(payload) })

export const listCourses = () => request('/courses')

export const getCourse = (courseId) => request(`/courses/${courseId}`)

// Lessons — GET auto-enriches (quiz/videos/visuals) on first view server-side
export const getLesson = (lessonId) => request(`/lessons/${lessonId}`)

export const generateQuiz = (lessonId) =>
  request(`/lessons/${lessonId}/quiz/generate`, { method: 'POST' })

export const submitQuiz = (lessonId, answers) =>
  request(`/lessons/${lessonId}/quiz/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })

export const generateVisuals = (lessonId) =>
  request(`/lessons/${lessonId}/visuals/generate`, { method: 'POST' })

export const discoverVideos = (lessonId) =>
  request(`/lessons/${lessonId}/videos/discover`, { method: 'POST' })

export const getVideoNotes = (lessonId, videoUrl) =>
  request(`/lessons/${lessonId}/videos/notes`, {
    method: 'POST',
    body: JSON.stringify({ video_url: videoUrl }),
  })

export const generateHinglish = (lessonId) =>
  request(`/lessons/${lessonId}/hinglish`, { method: 'POST' })

export const askTutor = (lessonId, question) =>
  request(`/lessons/${lessonId}/tutor/ask`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  })

export { API_BASE_URL, request }
