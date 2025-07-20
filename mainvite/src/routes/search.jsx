// mainvite/src/routes/search.jsx 파일
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './search.css';

// 💡 API_BASE_URL을 환경에 따라 다르게 설정합니다.
const API_BASE_URL = import.meta.env.PROD // 'production' 모드인지 확인 (Vite에서 제공하는 환경 변수)
    ? 'https://kikoky.shop' // 배포 환경일 때 백엔드 API의 실제 도메인 주소
    : ''; // 개발 환경일 때는 상대 경로를 사용하여 Vite 프록시가 작동하도록 함 (예: /movies)

export default function SearchPage() {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const debounceTimeoutRef = useRef(null);

    const fetchMovies = async (page, term) => {
        setIsLoading(true);
        // ⭐ API_BASE_URL을 접두사로 붙여 전체 URL을 구성합니다.
        let requestUrl = `${API_BASE_URL}/movies/search/?page=${page}`;
        if (term) {
            requestUrl += `&title=${encodeURIComponent(term)}`;
        }

        console.log('➡️ 요청 URL:', requestUrl);

        try {
            const res = await fetch(requestUrl);
            if (!res.ok) {
                const errorText = await res.text();
                console.error('API 요청 실패:', res.status, res.statusText, errorText);
                throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();

            setMovies(data.results || []);
            setTotalPages(Math.ceil(data.count / 20));
        } catch (error) {
            console.error('영화 데이터를 불러오는 중 오류 발생:', error);
            setMovies([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            fetchMovies(currentPage, searchTerm);
        }, 500);

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchTerm, currentPage]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const filteredMovies = movies.filter((movie) => {
        const term = searchTerm.toLowerCase();
        return movie.title_kor?.toLowerCase().includes(term) || movie.title_eng?.toLowerCase().includes(term);
    });

    return (
        <div className="search-page">
            <input
                type="text"
                placeholder="영화 제목 검색"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
                className="search-input"
            />

            {isLoading ? (
                <p>로딩 중...</p>
            ) : (
                <ul className="movie-list">
                    {filteredMovies.length > 0 ? (
                        filteredMovies.map((movie) => (
                            <li
                                key={movie.id}
                                onClick={() => navigate(`/detail_list/${movie.id}`)}
                                className="movie-item"
                            >
                                <img src={movie.poster_url} alt={movie.title_eng} className="movie-poster" />
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
            )}

            {/* 페이지네이션 컴포넌트 추가 */}
            {/* Pagination 컴포넌트가 있다면 여기에 추가하고 props를 전달합니다. */}
            {/* <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
            /> */}
        </div>
    );
}
