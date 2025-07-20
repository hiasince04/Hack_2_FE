import React, { useState, useEffect } from 'react';
import ClickableBox from '../component/ClickableBox';
import Pagination from '../component/Pagination';
import './all_list.css';

function normalizePageUrl(url) {
  if (!url) return null;
  const urlObj = new URL(url);
  if (urlObj.searchParams.get('page') === '1') {
    urlObj.search = '';
  }
  return urlObj.toString();
}

export default function AllList() {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nextPageUrl, setNextPageUrl] = useState(null);

  useEffect(() => {
    setLoading(true);

    fetch(`/movies/list/?page=${currentPage}`)
      .then(res => {
        if (!res.ok) throw new Error('영화 목록을 불러오지 못했습니다.');
        return res.json();
      })
      .then(data => {
        console.log('응답 데이터:', data);
        const normalizedNext = normalizePageUrl(data.next);
        setNextPageUrl(normalizedNext);

        if (!Array.isArray(data.results)) {
          throw new Error('서버 응답 내 results가 배열이 아닙니다.');
        }

        setMovies(data.results);
        setTotalCount(data.count);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="all-list-container">
      <h1 className="all-list-title">전체 영화 목록</h1>

      <div className="movie-grid">
        {movies.map(movie => (
          <ClickableBox
            key={movie.id}
            imageSrc={movie.poster_url}
            to={`/detail_list/${movie.id}`}
            title={movie.title_kor}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
