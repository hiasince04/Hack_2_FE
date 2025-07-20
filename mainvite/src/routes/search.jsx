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
            let hasNextPage = true; // 다음 페이지가 있는지 여부를 추적합니다. (초기에는 있다고 가정)

            try {
                while (hasNextPage) {
                    // 항상 '/movies/search/' 경로와 현재 페이지, 검색어를 사용하여 URL을 구성합니다.
                    let requestUrl = `/movies/search/?page=${currentPage}`;
                    if (searchTerm) {
                        requestUrl += `&title=${encodeURIComponent(searchTerm)}`;
                    }

                    console.log('➡️ 다음 요청 URL:', requestUrl);

                    const res = await fetch(requestUrl);

                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error('API 요청 실패:', res.status, res.statusText, errorText);
                        throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
                    }

                    const data = await res.json();
                    allMovies = allMovies.concat(data.results || []);

                    // 백엔드의 'next' 필드가 존재하는지 여부로 다음 페이지가 있는지 판단합니다.
                    // 'next' 필드 안의 URL 내용이 무엇인지는 더 이상 중요하지 않습니다.
                    if (data.next) {
                        currentPage++; // 다음 페이지 번호로 증가
                    } else {
                        hasNextPage = false; // data.next가 없으면 더 이상 페이지가 없다고 판단
                    }
                }
                setMovies(allMovies); // 모든 영화 데이터를 상태에 저장
            } catch (error) {
                console.error('영화 데이터를 불러오는 중 오류 발생:', error);
                setMovies([]); // 오류 발생 시 영화 목록을 비웁니다.
            } finally {
                setIsLoading(false);
            }
        };

        // searchTerm이 변경될 때마다 fetchAllPages 함수를 다시 호출하여 새로운 검색을 시작합니다.
        // 컴포넌트가 처음 마운트될 때 (searchTerm이 빈 문자열일 때)도 실행됩니다.
        fetchAllPages();
    }, [searchTerm]); // searchTerm이 변경될 때 useEffect가 다시 실행됩니다.

    // movies 상태와 searchTerm 상태를 기반으로 필터링된 영화 목록을 생성합니다.
    // 이는 항상 useEffect 외부에서, return 문 이전에 정의되어야 합니다.
    const filteredMovies = movies.filter((movie) => {
        const term = searchTerm.toLowerCase();
        return movie.title_kor?.toLowerCase().includes(term) || movie.title_eng?.toLowerCase().includes(term);
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
