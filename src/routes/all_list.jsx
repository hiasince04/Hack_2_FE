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
    const itemsPerPage = 20; // 백엔드에서 한 페이지당 반환하는 항목 수와 일치해야 합니다.
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextPageUrl, setNextPageUrl] = useState(null); // 사용되지 않지만, API 응답에서 받으므로 유지

    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        setLoading(true);
        setError(null); // 새로운 요청 전에 오류 상태 초기화

        const baseUrl = `${apiUrl}/movies/list/`;
        let fullUrl = baseUrl;

        // currentPage가 1이 아닐 때만 ?page=N 쿼리 파라미터를 추가
        if (currentPage > 1) {
            fullUrl += `?page=${currentPage}`;
        }

        // 백엔드가 ?format=json을 항상 필요로 하는지 확인 후 주석 해제 (필요하다면)
        // 현재로서는 없어도 잘 동작할 가능성이 높습니다.
        // if (fullUrl.includes('?')) {
        //     fullUrl += '&format=json';
        // } else {
        //     fullUrl += '?format=json';
        // }

        console.log('✅ 최종 호출 URL:', fullUrl); // 콘솔에서 실제 호출되는 URL 확인

        fetch(fullUrl)
            .then((res) => {
                if (!res.ok) {
                    // 오류 응답의 상태 코드와 메시지를 더 자세히 로깅
                    console.error('API 응답 오류:', res.status, res.statusText);
                    throw new Error(`영화 목록을 불러오지 못했습니다. 상태: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log('📦 응답 데이터:', data);
                // `data.next`를 normalizePageUrl 함수로 처리하여 저장
                const normalizedNext = normalizePageUrl(data.next);
                setNextPageUrl(normalizedNext); // 다음 페이지 URL 저장

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
    }, [currentPage, apiUrl]); // currentPage 또는 apiUrl이 변경될 때마다 useEffect 재실행

    // totalPages 계산 시 itemsPerPage가 0이 되는 것을 방지
    const totalPages = itemsPerPage > 0 ? Math.ceil(totalCount / itemsPerPage) : 0;

    const handlePageChange = (pageNumber) => {
        // 현재 페이지와 요청 페이지가 다를 때만 업데이트하여 불필요한 재렌더링 방지
        if (pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    if (loading) return <div className="loading">로딩 중...</div>;
    if (error) return <div className="error">에러: {error}</div>;

    return (
        <div className="all-list-container">
            <h1 className="all-list-title">전체 영화 목록</h1>

            <div className="movie-grid">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <ClickableBox
                            key={movie.id}
                            imageSrc={movie.poster_url}
                            to={`/detail_list/${movie.id}`}
                            title={movie.title_kor}
                        />
                    ))
                ) : (
                    <p className="no-movies">영화가 없습니다.</p>
                )}
            </div>

            {/* totalPages가 1보다 클 때만 Pagination을 표시하여 불필요한 렌더링 방지 */}
            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
        </div>
    );
}
