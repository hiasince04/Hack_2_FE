import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './search.css';
import Pagination from '../component/Pagination'; // ⭐ 이 줄을 추가합니다.

// 💡 API_BASE_URL을 환경에 따라 다르게 설정합니다.
// 개발 환경일 때는 상대 경로를 사용하여 Vite 프록시가 작동하도록 하고,
// 배포 환경일 때는 백엔드 API의 실제 도메인 주소를 사용합니다.
const API_BASE_URL = import.meta.env.PROD ? 'https://kikoky.shop' : '';

export default function SearchPage() {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false); // 초기 로딩 상태는 false로 시작
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
    const [totalPages, setTotalPages] = useState(1); // 총 페이지 상태 추가 (백엔드의 count/PAGE_SIZE 기반)

    // 검색어 입력 지연(debounce)을 위한 타이머 참조
    const debounceTimeoutRef = useRef(null);

    // 영화 데이터를 비동기적으로 불러오는 함수
    const fetchMovies = async (page, term) => {
        setIsLoading(true); // 데이터 로딩 시작

        // API_BASE_URL을 접두사로 붙여 전체 URL을 구성합니다.
        let requestUrl = `${API_BASE_URL}/movies/search/?page=${page}`;
        if (term) {
            requestUrl += `&title=${encodeURIComponent(term)}`; // 검색어가 있으면 title 쿼리 파라미터 추가
        }

        console.log('➡️ 요청 URL:', requestUrl); // 디버깅을 위해 요청 URL을 콘솔에 출력

        try {
            const res = await fetch(requestUrl); // API 요청 전송
            if (!res.ok) {
                // 응답이 성공적이지 않을 경우 (예: 404, 500)
                const errorText = await res.text(); // 오류 응답 본문 텍스트로 읽기
                console.error('API 요청 실패:', res.status, res.statusText, errorText);
                throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`);
            }
            const data = await res.json(); // JSON 데이터로 파싱

            setMovies(data.results || []); // 현재 페이지의 영화 결과만 상태에 저장
            // 백엔드의 total count와 PAGE_SIZE(20)를 이용하여 총 페이지 수 계산
            setTotalPages(Math.ceil(data.count / 20));
        } catch (error) {
            console.error('영화 데이터를 불러오는 중 오류 발생:', error);
            setMovies([]); // 오류 발생 시 영화 목록 초기화
            setTotalPages(1); // 총 페이지 수도 1로 초기화
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    // searchTerm 또는 currentPage가 변경될 때 API 호출을 트리거하는 useEffect 훅
    useEffect(() => {
        // 기존에 설정된 디바운스 타이머가 있다면 취소
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // 500ms 후에 fetchMovies 함수를 호출하도록 타이머 설정
        debounceTimeoutRef.current = setTimeout(() => {
            fetchMovies(currentPage, searchTerm);
        }, 500); // 0.5초 디바운스

        // 컴포넌트 언마운트 시 또는 useEffect가 다시 실행될 때 타이머 클리어
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchTerm, currentPage]); // searchTerm이나 currentPage가 변경될 때마다 이 훅이 다시 실행됨

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber); // 현재 페이지 상태 업데이트
    };

    // movies 상태와 searchTerm 상태를 기반으로 영화 목록을 필터링합니다.
    // 이 변수는 컴포넌트 렌더링 시점에 항상 계산됩니다.
    const filteredMovies = movies.filter((movie) => {
        const term = searchTerm.toLowerCase();
        // 영화 제목(한글 또는 영어)에 검색어가 포함되어 있는지 확인
        return movie.title_kor?.toLowerCase().includes(term) || movie.title_eng?.toLowerCase().includes(term);
    });

    return (
        <div className="search-page">
            <input
                type="text"
                placeholder="영화 제목 검색"
                value={searchTerm} // input 필드의 값을 searchTerm 상태와 동기화
                onChange={(e) => {
                    setSearchTerm(e.target.value); // 입력 값으로 searchTerm 상태 업데이트
                    setCurrentPage(1); // 검색어가 변경되면 페이지를 1로 리셋
                }}
                className="search-input"
            />

            {isLoading ? ( // 로딩 중일 때 로딩 메시지 표시
                <p>로딩 중...</p>
            ) : (
                // 로딩이 끝나면 영화 목록 또는 검색 결과 없음 메시지 표시
                <ul className="movie-list">
                    {filteredMovies.length > 0 ? ( // 필터링된 영화가 있을 경우 목록 렌더링
                        filteredMovies.map((movie) => (
                            <li
                                key={movie.id} // 각 영화 아이템의 고유 키
                                onClick={() => navigate(`/detail_list/${movie.id}`)} // 클릭 시 상세 페이지로 이동
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
                        // 검색 결과가 없을 경우 메시지 표시
                        <li className="no-results">검색 결과가 없습니다.</li>
                    )}
                </ul>
            )}

            {/* Pagination 컴포넌트 렌더링 */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
}
