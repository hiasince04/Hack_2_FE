import React, { useState } from 'react'
import Navbar from './Navbar'
import './PopularMovies.css' 

export default function PopularMovies() {
  const [page, setPage] = useState(1)

  return (
    <div className="container">
      <Navbar />
    </div>
  )
}