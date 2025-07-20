import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './search.css';

export default function SearchPage() {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllPages = async () => {
            setIsLoading(true);
            let allMovies = [];
            let currentPage = 1; // 현재 페이지 번호를 추적합니다.

            try {
                while (true) {
                    let currentFetchUrl = `/movies/search/?page=${currentPage}`;
                    if (searchTerm) {
                        currentFetchUrl += `&title=${encodeURIComponent(searchTerm)}`;
                    }

                    console.log('➡️ 다음 요청 URL:', currentFetchUrl);

                    const res = await fetch(currentFetchUrl);

                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error('API 요청 실패:', res.status, res.statusText, errorText);
                        throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
                    }

                    const data = await res.json();
                    allMovies = allMovies.concat(data.results || []);

                    if (data.next) {
                        const url = new URL(data.next);
                        // 현재 프론트엔드가 HTTPS라면, 백엔드로부터 받은 next URL도 HTTPS로 강제 변경
                        let nextUrl; // nextUrl 선언 추가
                        if (window.location.protocol === 'https:' && url.protocol === 'http:') {
                            nextUrl = `https://${url.host}${url.pathname}${url.search}`;
                        } else {
                            nextUrl = url.pathname + url.search; // 도메인 제외하고 경로+쿼리만
                        }

                        // 이 시점에서 nextUrl이 'movies/list'를 가리킬 수 있으므로, 경로를 재조정해야 합니다.
                        // 검색 기능을 위해선 항상 '/movies/search/' 경로를 사용해야 합니다.
                        if (!nextUrl.includes('/movies/search')) {
                            const pageMatch = nextUrl.match(/page=(\d+)/);
                            const nextPageNumber = pageMatch ? parseInt(pageMatch[1]) : currentPage + 1;
                            nextUrl = `/movies/search/?page=${nextPageNumber}`;
                            if (searchTerm) {
                                nextUrl += `&title=${encodeURIComponent(searchTerm)}`;
                            }
                        }
                        // `data.next`가 있다면 `currentPage`를 증가시켜 계속 요청을 보냅니다.
                        currentPage++; // 다음 페이지로 이동
                    } else {
                        break; // data.next가 없으면 반복 종료
                    }
                }
                setMovies(allMovies);
            } catch (error) {
                console.error('영화 데이터를 불러오는 중 오류 발생:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllPages();
    }, [searchTerm]);

    // ⭐⭐ 이 부분이 누락된 코드입니다. 여기에 추가해주세요! ⭐⭐
    const filteredMovies = movies.filter((movie) => {
        const term = searchTerm.toLowerCase();
        return movie.title_kor?.toLowerCase().includes(term) || movie.title_eng?.toLowerCase().includes(term);
    });
    // ⭐⭐ 누락된 코드 끝 ⭐⭐

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
                </>
            )}
        </div>
    );
}
