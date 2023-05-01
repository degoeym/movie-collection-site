import { useState } from 'react'
import './App.css'
import Header from './components/Header.tsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { Movie } from './Movie.tsx'
import AppRoutes from './routes/routes.tsx'

function App() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [movie, setMovie] = useState<Movie | null>(null)

  return (
    <Router>
      <Header />
      <br />
      <AppRoutes movies={movies} />
    </Router>
  )
}

export default App
