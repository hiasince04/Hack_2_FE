import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './detail_list.css';

// API 기본 URL을 환경 변수에서 가져옵니다.
// 이 변수는 .env 파일에 VITE_API_URL=https://kikoky.shop 와 같이 설정되어 있어야 합니다.
const apiUrl = import.meta.env.VITE_API_URL;

// 별점 표시 및 상호작용을 위한 StarRating 컴포넌트
const StarRating = ({ rating, onRating, isInteractive = false }) => {
    const [hover, setHover] = useState(0); // 마우스 오버 시 별점 상태
    const totalStars = 5; // 총 별 개수
    // 평점을 10점 만점에서 5점 만점으로 변환하여 표시
    const displayRating = isInteractive ? rating : Math.round((rating / 10) * totalStars);

    return (
        <div className={`star-rating ${isInteractive ? 'interactive' : ''}`}>
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1; // 각 별의 값 (1부터 5까지)
                return (
                    <span
                        key={starValue}
                        // 현재 별 값이 hover 상태 또는 실제 평점보다 작거나 같으면 'filled' 클래스 적용
                        className={starValue <= (hover || displayRating) ? 'star filled' : 'star'}
                        // 상호작용 모드일 때만 클릭 이벤트 활성화
                        onClick={() => isInteractive && onRating(starValue)}
                        // 상호작용 모드일 때만 마우스 오버/리브 이벤트 활성화
                        onMouseEnter={() => isInteractive && setHover(starValue)}
                        onMouseLeave={() => isInteractive && setHover(0)}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

// 영화 상세 정보를 표시하는 DetailList 컴포넌트
export default function DetailList() {
    const { id } = useParams(); // URL 파라미터에서 영화 ID 가져오기
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅
    const { user } = useAuth(); // 사용자 인증 정보를 가져오는 훅

    const [movie, setMovie] = useState(null); // 영화 상세 정보를 저장하는 상태
    const [comments, setComments] = useState([]); // 댓글 목록을 저장하는 상태
    const [newComment, setNewComment] = useState(''); // 새로 작성할 댓글 내용을 저장하는 상태
    const [myRating, setMyRating] = useState(0); // 사용자의 평점을 저장하는 상태
    const [error, setError] = useState(null); // 에러 메시지를 저장하는 상태

    // 영화 상세 정보 불러오기
    useEffect(() => {
        // API URL과 ID를 사용하여 영화 상세 정보 엔드포인트 구성
        // 예: https://kikoky.shop/movies/list/123/
        // **** 중요: apiUrl 변수를 사용하여 절대 경로로 요청합니다. ****
        fetch(`${apiUrl}/movies/list/${id}/`)
            .then((res) => {
                // 응답이 성공적이지 않으면 에러 발생
                if (!res.ok) {
                    // HTTP 상태 코드가 404일 경우, 특정 메시지 출력
                    if (res.status === 404) {
                        throw new Error('요청하신 영화를 찾을 수 없습니다. (404 Not Found)');
                    }
                    throw new Error(`영화 정보를 불러오지 못했습니다. 상태: ${res.status}`);
                }
                return res.json(); // 응답을 JSON으로 파싱
            })
            .then((data) => setMovie(data)) // 파싱된 데이터를 movie 상태에 설정
            .catch((err) => {
                console.error('영화 상세 정보 로딩 실패:', err); // 콘솔에 에러 로깅
                setError(err.message); // 에러 메시지 상태 업데이트
            });
    }, [id, apiUrl]); // id 또는 apiUrl이 변경될 때마다 useEffect 재실행

    // 댓글 목록 불러오기
    useEffect(() => {
        // API URL과 ID를 사용하여 댓글 목록 엔드포인트 구성
        // 예: https://kikoky.shop/movies/comment/list/123/
        // **** 중요: apiUrl 변수를 사용하여 절대 경로로 요청합니다. ****
        fetch(`${apiUrl}/movies/comment/list/${id}/`)
            .then((res) => {
                // 응답이 성공적이지 않으면 에러 발생
                if (!res.ok) {
                    // 404 Not Found 오류 시 특정 메시지
                    if (res.status === 404) {
                        console.warn('댓글 목록을 찾을 수 없습니다 (404). 아직 댓글이 없거나 경로 오류일 수 있습니다.');
                        return { results: [] }; // 빈 배열 반환하여 오류 처리 대신 빈 댓글 목록 표시
                    }
                    throw new Error('댓글 정보를 불러오지 못했습니다.');
                }
                return res.json(); // 응답을 JSON으로 파싱
            })
            .then((data) => {
                // 백엔드가 페이지네이션된 객체를 반환하므로, 'results' 필드를 사용합니다.
                setComments(data.results || []);
            })
            .catch((err) => console.error('댓글 로딩 실패:', err)); // 댓글 로딩 실패 시 콘솔에 에러 로깅
    }, [id, apiUrl]); // id 또는 apiUrl이 변경될 때마다 useEffect 재실행

    // 코멘트 제출 핸들러
    const handleCommentSubmit = (e) => {
        e.preventDefault(); // 폼 기본 제출 동작 방지

        // 사용자 로그인 여부 확인
        if (!user) {
            // alert('코멘트를 작성하려면 로그인이 필요합니다.'); // alert 대신 커스텀 모달 사용 권장
            navigate('/login'); // 로그인 페이지로 리디렉션
            return;
        }
        // 코멘트 내용이 비어있는지 확인
        if (!newComment.trim()) {
            // alert('코멘트 내용을 입력해주세요.'); // alert 대신 커스텀 모달 사용 권장
            return;
        }

        const token = user.token; // 사용자 토큰 가져오기

        // 토큰 유효성 확인
        if (!token) {
            // alert('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.'); // alert 대신 커스텀 모달 사용 권장
            navigate('/login'); // 로그인 페이지로 리디렉션
            return;
        }

        // 댓글 생성 API 호출
        // 예: https://kikoky.shop/movies/comment/create/123/
        // **** 중요: apiUrl 변수를 사용하여 절대 경로로 요청합니다. ****
        fetch(`${apiUrl}/movies/comment/create/${id}/`, {
            method: 'POST', // POST 메서드 사용
            headers: {
                'Content-Type': 'application/json', // JSON 형식으로 데이터 전송
                Authorization: `Bearer ${token}`, // 인증 토큰 포함
            },
            body: JSON.stringify({ comment: newComment }), // 코멘트 내용을 JSON 문자열로 변환하여 전송
        })
            .then((res) => {
                // 응답이 성공적이지 않으면 에러 발생
                if (!res.ok) {
                    throw new Error('댓글 작성 실패');
                }
                return res.json(); // 응답을 JSON으로 파싱
            })
            .then((newData) => {
                setComments([...comments, newData]); // 새 댓글을 기존 댓글 목록에 추가
                setNewComment(''); // 코멘트 입력 필드 초기화
            })
            .catch((err) => console.error('댓글 작성 실패:', err.message)); // 에러 발생 시 콘솔에 로깅 (alert 대신)
    };

    // 에러 상태일 때 표시할 UI
    if (error) {
        return (
            <div className="detail-page-wrapper">
                <div className="error-container">
                    <h1>에러</h1>
                    <p>{error}</p>
                    <Link to="/" className="go-home-button">
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    // 영화 데이터가 로드되지 않았을 때 표시할 UI
    if (!movie) {
        return <div className="loading">로딩 중...</div>;
    }

    // 영화 상세 정보가 로드되면 표시할 UI
    return (
        <div className="detail-page-wrapper">
            <div className="detail-container">
                <img className="detail-poster" src={movie.poster_url} alt={movie.title_kor} />
                <div className="detail-info">
                    <h1 className="detail-title-kor">{movie.title_kor}</h1>
                    <h2 className="detail-title-eng">{movie.title_eng}</h2>

                    <div className="info-section">
                        <span className="info-label">개봉일</span>
                        <span>{movie.release_date || '정보 없음'}</span>
                    </div>
                    <div className="info-section">
                        <span className="info-label">장르</span>
                        <span>{movie.genre || '정보 없음'}</span>
                    </div>
                    <div className="info-section">
                        <span className="info-label">평점</span>
                        <StarRating rating={movie.rate || 0} />
                    </div>
                    <div className="info-section plot">
                        <h3>줄거리</h3>
                        <p>{movie.plot || '줄거리 정보 없음'}</p>
                    </div>

                    <div className="actors">
                        <h3>출연진</h3>
                        {movie.casts?.length > 0 ? (
                            <div className="actor-list">
                                {movie.casts.map((cast, index) => (
                                    <div key={index} className="actor">
                                        <img
                                            src={cast.profile_url}
                                            alt={cast.name}
                                            className="actor-image"
                                            onError={(e) => (e.currentTarget.src = '/default-profile.png')}
                                        />
                                        <p>
                                            {cast.name}
                                            {cast.role ? ` (${cast.role})` : ''}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>배우 정보 없음</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="comment-section-wrapper">
                <h3 className="section-title">코멘트 & 평점 남기기</h3>

                <div className="rating-box">
                    <span>내 평점:</span>
                    <StarRating rating={myRating} onRating={setMyRating} isInteractive={true} />
                </div>

                <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <textarea
                        className="comment-textarea"
                        placeholder={
                            user
                                ? `${user.username}님, 코멘트를 남겨보세요...`
                                : '코멘트를 작성하려면 로그인이 필요합니다.'
                        }
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!user}
                    />
                    <button type="submit" className="comment-submit-button" disabled={!user}>
                        등록
                    </button>
                </form>

                <div className="comment-list">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="comment-item">
                                <span className="comment-username">{comment.author || comment.username}</span>
                                <p className="comment-text">{comment.content || comment.text || comment.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className="no-comments">아직 작성된 코멘트가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
