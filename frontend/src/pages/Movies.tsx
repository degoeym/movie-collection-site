import { Table } from "react-bootstrap"
import { Link } from "react-router-dom"
import { Movie } from "../Movie";

interface MoviesProps {
  movies: Movie[];
}

const Movies = ({movies}: MoviesProps) => {
  return(
    <Table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Rating</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {movies.map(movie =>
            <tr>
              <td>{movie.title}</td>
              <td>{movie.description}</td>
              <td>{movie.rating}</td>
              <td><Link to={`/movieCollection/${movie.id}`}>Details</Link></td>
              <td><Link to={`/movieCollection/edit/${movie.id}`}>Edit</Link></td>
            </tr>
          )}
      </tbody>
    </Table>
  )
}

export default Movies