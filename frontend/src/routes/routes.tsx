import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Movies from '../pages/Movies';
import { MoviesProps } from '../pages/props/MoviesProps';

const AppRoutes = ({movies}: MoviesProps) => {
  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/movies" element={<Movies movies={movies} />} />
    </Routes>
  );
};

export default AppRoutes;