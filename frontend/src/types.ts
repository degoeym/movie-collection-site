export type Rating = 'Unknown' | 'G' | 'PG' | 'PG13' | 'R' | 'NC17' | 'X'

export interface Movie {
  id: string
  title: string
  description: string
  rating: Rating
  releaseDate: string
  createdAt: string
  updatedAt: string
}

export interface NewMovieDto {
  title: string
  description: string
  rating: Rating
  releaseDate: string
}

export type UpdateMovieDto = NewMovieDto
