import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./search.css";

export default function SearchPage() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllPages = async () => {
      setIsLoading(true);
      let allMovies = [];
      let nextUrl = "/movies/search";

      try {
        while (nextUrl) {
          const res = await fetch(nextUrl);
          if (!res.ok) throw new Error("API 요청 실패");
          const data = await res.json();

          allMovies = allMovies.concat(data.results || []);

          if (data.next) {
            const url = new URL(data.next);
            nextUrl = url.pathname + url.search; // 도메인 제외하고 경로+쿼리만
          } else {
            nextUrl = null;
          }
        }
        setMovies(allMovies);
      } catch (error) {
        console.error("영화 데이터를 불러오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPages();
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const term = searchTerm.toLowerCase();
    return (
      movie.title_kor?.toLowerCase().includes(term) ||
      movie.title_eng?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="search-page">
      {isLoading ? (
        <p>로딩 중...</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="영화 제목 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <ul className="movie-list">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie) => (
                <li
                  key={movie.id}
                  onClick={() => navigate(`/detail_list/${movie.id}`)}
                  className="movie-item"
                >
                  <img
                    src={movie.poster_url}
                    alt={movie.title_eng}
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <strong>{movie.title_kor}</strong>
                    <em>{movie.title_eng}</em>
                  </div>
                </li>
              ))
            ) : (
              <li className="no-results">검색 결과가 없습니다.</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
