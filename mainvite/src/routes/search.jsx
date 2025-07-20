// mainvite/src/routes/search.jsx 파일
import React, { useState, useEffect, useRef } from 'react'; // useRef 추가
import { useNavigate } from 'react-router-dom';
import './search.css';

export default function SearchPage() {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 초기 로딩 상태는 false로 시작
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
    const [totalPages, setTotalPages] = useState(1); // 총 페이지 상태 추가

    // 검색어 입력 지연을 위한 debounce 타이머
    const debounceTimeoutRef = useRef(null);

    // API 호출 로직을 별도 함수로 분리
    const fetchMovies = async (page, term) => {
        setIsLoading(true);
        let requestUrl = `/movies/search/?page=${page}`;
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

            setMovies(data.results || []); // 현재 페이지의 결과만 저장
            setTotalPages(Math.ceil(data.count / 20)); // PAGE_SIZE 20 기준으로 총 페이지 계산
        } catch (error) {
            console.error('영화 데이터를 불러오는 중 오류 발생:', error);
            setMovies([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };

    // searchTerm 또는 currentPage가 변경될 때 API 호출
    useEffect(() => {
        // searchTerm이 비어있을 때는 초기화만 하고 API 호출을 하지 않을 수도 있습니다.
        // if (!searchTerm) {
        //    setMovies([]);
        //    setTotalPages(1);
        //    return;
        // }

        // debounceTimeoutRef.current에 저장된 기존 타이머가 있다면 클리어
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // 500ms 후에 API 호출
        debounceTimeoutRef.current = setTimeout(() => {
            fetchMovies(currentPage, searchTerm);
        }, 500);

        // 컴포넌트 언마운트 시 타이머 클리어
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchTerm, currentPage]); // searchTerm과 currentPage가 변경될 때 API 호출

    // 페이지 변경 핸들러 (Pagination 컴포넌트와 연동)
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
                    setCurrentPage(1); // 검색어 변경 시 페이지 1로 리셋
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
