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
                    // 더 이상 다음 페이지가 없을 때까지 반복
                    // 올바른 검색 API 경로와 현재 검색어를 포함하여 URL을 구성합니다.
                    // 백엔드에서 받은 `data.next`를 사용하지 않고 직접 구성합니다.
                    let currentFetchUrl = `/movies/search/?page=${currentPage}`;
                    if (searchTerm) {
                        currentFetchUrl += `&title=${encodeURIComponent(searchTerm)}`;
                    }

                    // 디버깅을 위해 현재 요청 URL을 콘솔에 출력
                    console.log('➡️ 다음 요청 URL:', currentFetchUrl);

                    const res = await fetch(currentFetchUrl);

                    if (!res.ok) {
                        // 오류 발생 시 응답 텍스트를 함께 로깅하여 디버깅에 도움
                        const errorText = await res.text();
                        console.error('API 요청 실패:', res.status, res.statusText, errorText);
                        throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
                    }

                    const data = await res.json();
                    allMovies = allMovies.concat(data.results || []);

                    // 백엔드의 'next' 필드를 사용하지 않고, 수동으로 다음 페이지를 결정합니다.
                    // 'count'와 'PAGE_SIZE'를 사용하여 총 페이지 수를 계산할 수 있다면 더 정확하지만,
                    // 여기서는 단순히 페이지 번호를 증가시키며 다음 페이지가 있는지 확인하는 방식으로 진행합니다.
                    // DRF의 PageNumberPagination은 기본적으로 next, previous URL을 제공하므로,
                    // 여기서는 'data.next'가 null이 될 때까지 반복하는 방식을 다시 신뢰하되,
                    // URL의 도메인/프로토콜만 수정하는 방식으로 변경하겠습니다.

                    if (data.next) {
                        const url = new URL(data.next);
                        // 현재 프론트엔드가 HTTPS라면, 백엔드로부터 받은 next URL도 HTTPS로 강제 변경
                        if (window.location.protocol === 'https:' && url.protocol === 'http:') {
                            nextUrl = `https://${url.host}${url.pathname}${url.search}`;
                        } else {
                            nextUrl = url.pathname + url.search; // 도메인 제외하고 경로+쿼리만
                        }
                        // 이 시점에서 nextUrl이 'movies/list'를 가리킬 수 있으므로, 경로를 재조정해야 합니다.
                        // 검색 기능을 위해선 항상 '/movies/search/' 경로를 사용해야 합니다.
                        if (!nextUrl.includes('/movies/search')) {
                            // 백엔드가 잘못된 경로를 주더라도, 다음 요청은 '/movies/search'로 시작하도록 강제합니다.
                            // 페이지 번호는 nextUrl에서 가져와 사용합니다.
                            const pageMatch = nextUrl.match(/page=(\d+)/);
                            const nextPageNumber = pageMatch ? parseInt(pageMatch[1]) : currentPage + 1; // 페이지 번호 추출 또는 1 증가
                            nextUrl = `/movies/search/?page=${nextPageNumber}`;
                            if (searchTerm) {
                                nextUrl += `&title=${encodeURIComponent(searchTerm)}`;
                            }
                        }
                        // `data.next`가 있다면 `currentPage`를 증가시켜 계속 요청을 보냅니다.
                        currentPage++;
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
    }, [searchTerm]); // searchTerm이 변경될 때도 다시 fetch하도록 의존성 추가

    // ... (나머지 코드는 동일)
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
