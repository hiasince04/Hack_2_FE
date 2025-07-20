import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './search.css';
import Pagination from '../component/Pagination';

const API_BASE_URL = import.meta.env.PROD ? 'https://kikoky.shop' : '';

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
            console.log('총 영화 개수 (data.count):', data.count);
            console.log('계산된 총 페이지 (totalPages):', Math.ceil(data.count / 20));
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

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
}
