import React, { useState, useEffect } from 'react';
import ClickableBox from '../component/ClickableBox';
import Pagination from '../component/Pagination';
import './all_list.css';

const apiUrl = import.meta.env.VITE_API_URL;

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
        setError(null);

        const baseUrl = `${apiUrl}/movies/list/`;
        let fullUrl = baseUrl;

        if (currentPage > 1) {
            fullUrl += `?page=${currentPage}`;
        }

        console.log('✅ 최종 호출 URL:', fullUrl);

        fetch(fullUrl)
            .then((res) => {
                if (!res.ok) {
                    console.error('API 응답 오류:', res.status, res.statusText);
                    throw new Error(`영화 목록을 불러오지 못했습니다. 상태: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log('📦 응답 데이터:', data);

                const normalizedNext = normalizePageUrl(data.next);
                setNextPageUrl(normalizedNext);

                if (!Array.isArray(data.results)) {
                    throw new Error('서버 응답 내 results가 배열이 아닙니다.');
                }

                setMovies(data.results);
                setTotalCount(data.count);
                setLoading(false);
            })
            .catch((err) => {
                console.error('영화 목록 로딩 실패:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [currentPage, apiUrl]);

    const totalPages = itemsPerPage > 0 ? Math.ceil(totalCount / itemsPerPage) : 0;

    const handlePageChange = (pageNumber) => {
        if (pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    if (loading) return <div className="loading">로딩 중...</div>;

    if (error) return <div className="error">에러: {error}</div>;

    if (movies.length === 0 && !loading && !error) {
        return (
            <div className="all-list-container">
                <h1 className="all-list-title">전체 영화 목록</h1>
                <p className="no-movies">영화가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="all-list-container">
            <h1 className="all-list-title">전체 영화 목록</h1>

            <div className="movie-grid">
                {movies.map((movie) => (
                    <ClickableBox
                        key={movie.id}
                        imageSrc={movie.poster_url}
                        to={`/detail_list/${movie.id}`}
                        title={movie.title_kor}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
        </div>
    );
}
