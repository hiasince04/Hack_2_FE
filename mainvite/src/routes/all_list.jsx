import React, { useState, useEffect } from 'react';
import ClickableBox from '../component/ClickableBox';
import Pagination from '../component/Pagination';
import './all_list.css';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 변수는 .env 파일에 VITE_API_URL=https://kikoky.shop 와 같이 설정되어 있어야 합니다.
const apiUrl = import.meta.env.VITE_API_URL;

// API 응답에서 받은 'next' 페이지 URL을 정규화하는 함수입니다.
// 'page=1'이 포함된 URL이라면 쿼리 파라미터를 제거하여 기본 URL로 만듭니다.
function normalizePageUrl(url) {
    if (!url) return null;
    const urlObj = new URL(url);
    // 만약 URL에 'page=1' 쿼리 파라미터가 있다면 제거합니다.
    if (urlObj.searchParams.get('page') === '1') {
        urlObj.search = ''; // 모든 쿼리 파라미터 제거
    }
    return urlObj.toString();
}

export default function AllList() {
    const [movies, setMovies] = useState([]); // 영화 목록 데이터를 저장하는 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호를 저장하는 상태
    const itemsPerPage = 20; // 한 페이지에 표시될 영화 수 (백엔드 설정과 일치해야 함)
    const [totalCount, setTotalCount] = useState(0); // 전체 영화 수를 저장하는 상태
    const [loading, setLoading] = useState(true); // 로딩 상태를 나타내는 상태
    const [error, setError] = useState(null); // 에러 메시지를 저장하는 상태

    const [nextPageUrl, setNextPageUrl] = useState(null); // 다음 페이지 URL을 저장하는 상태 (현재 컴포넌트에서는 직접 사용되지 않지만, API 응답에 포함되므로 유지)

    // currentPage 또는 apiUrl이 변경될 때마다 영화 목록을 다시 불러옵니다.
    useEffect(() => {
        setLoading(true); // 데이터 로딩 시작 시 로딩 상태를 true로 설정
        setError(null); // 새로운 요청 전에 이전 에러 상태를 초기화

        const baseUrl = `${apiUrl}/movies/list/`; // API의 기본 영화 목록 엔드포인트
        let fullUrl = baseUrl; // 최종적으로 호출할 URL을 저장할 변수

        // 현재 페이지가 1보다 클 때만 'page' 쿼리 파라미터를 추가합니다.
        // 백엔드가 'page=1' 요청에 404를 반환하고, 쿼리 파라미터가 없는 요청을 첫 페이지로 처리하기 때문입니다.
        if (currentPage > 1) {
            fullUrl += `?page=${currentPage}`;
        }

        // 개발자 도구 콘솔에서 최종 호출 URL을 확인하여 디버깅을 돕습니다.
        console.log('✅ 최종 호출 URL:', fullUrl);

        // API 호출을 시작합니다.
        fetch(fullUrl)
            .then((res) => {
                // 응답이 성공적이지 않으면 에러를 발생시킵니다.
                if (!res.ok) {
                    console.error('API 응답 오류:', res.status, res.statusText);
                    throw new Error(`영화 목록을 불러오지 못했습니다. 상태: ${res.status}`);
                }
                return res.json(); // 응답을 JSON 형식으로 파싱합니다.
            })
            .then((data) => {
                // 응답 데이터를 콘솔에 로깅하여 확인합니다.
                console.log('📦 응답 데이터:', data);

                // API 응답의 'next' URL을 정규화하여 저장합니다.
                const normalizedNext = normalizePageUrl(data.next);
                setNextPageUrl(normalizedNext);

                // 'results' 필드가 배열인지 확인하여 데이터 유효성을 검사합니다.
                if (!Array.isArray(data.results)) {
                    throw new Error('서버 응답 내 results가 배열이 아닙니다.');
                }

                setMovies(data.results); // 영화 목록 상태 업데이트
                setTotalCount(data.count); // 전체 영화 수 상태 업데이트
                setLoading(false); // 로딩 완료 시 로딩 상태를 false로 설정
            })
            .catch((err) => {
                // 에러 발생 시 콘솔에 에러를 로깅하고 에러 상태를 업데이트합니다.
                console.error('영화 목록 로딩 실패:', err);
                setError(err.message);
                setLoading(false); // 로딩 완료 시 로딩 상태를 false로 설정
            });
    }, [currentPage, apiUrl]); // currentPage 또는 apiUrl이 변경될 때마다 이 useEffect 훅을 다시 실행합니다.

    // 전체 페이지 수를 계산합니다. itemsPerPage가 0인 경우를 방지합니다.
    const totalPages = itemsPerPage > 0 ? Math.ceil(totalCount / itemsPerPage) : 0;

    // 페이지 변경 핸들러 함수입니다.
    const handlePageChange = (pageNumber) => {
        // 현재 페이지와 요청 페이지가 다를 때만 페이지를 업데이트하여 불필요한 재렌더링을 방지합니다.
        if (pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    // 로딩 중일 때 표시할 UI
    if (loading) return <div className="loading">로딩 중...</div>;
    // 에러 발생 시 표시할 UI
    if (error) return <div className="error">에러: {error}</div>;

    // 영화 목록이 없을 때 표시할 UI
    if (movies.length === 0 && !loading && !error) {
        return (
            <div className="all-list-container">
                <h1 className="all-list-title">전체 영화 목록</h1>
                <p className="no-movies">영화가 없습니다.</p>
            </div>
        );
    }

    // 모든 조건이 충족되면 영화 목록과 페이지네이션을 렌더링합니다.
    return (
        <div className="all-list-container">
            <h1 className="all-list-title">전체 영화 목록</h1>

            <div className="movie-grid">
                {movies.map((movie) => (
                    <ClickableBox
                        key={movie.id}
                        imageSrc={movie.poster_url}
                        to={`/detail_list/${movie.id}`} // 영화 상세 페이지로 이동하는 링크
                        title={movie.title_kor}
                    />
                ))}
            </div>

            {/* 전체 페이지 수가 1보다 클 때만 페이지네이션 컴포넌트를 렌더링합니다. */}
            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
        </div>
    );
}
