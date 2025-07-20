import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './detail_list.css';

const apiUrl = import.meta.env.VITE_API_URL;

const StarRating = ({ rating, onRating, isInteractive = false }) => {
    const [hover, setHover] = useState(0);
    const totalStars = 5;
    const displayRating = isInteractive ? rating : Math.round((rating / 10) * totalStars);

    return (
        <div className={`star-rating ${isInteractive ? 'interactive' : ''}`}>
            {[...Array(totalStars)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <span
                        key={starValue}
                        className={starValue <= (hover || displayRating) ? 'star filled' : 'star'}
                        onClick={() => isInteractive && onRating(starValue)}
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

export default function DetailList() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [movie, setMovie] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [myRating, setMyRating] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${apiUrl}/movies/list/${id}/`)
            .then((res) => {
                if (!res.ok) throw new Error('영화 정보를 불러오지 못했습니다.');
                return res.json();
            })
            .then((data) => setMovie(data))
            .catch((err) => setError(err.message));
    }, [id]);

    useEffect(() => {
        fetch(`${apiUrl}/movies/comment/list/${id}/`)
            .then((res) => {
                if (!res.ok) throw new Error('댓글 정보를 불러오지 못했습니다.');
                return res.json();
            })
            .then((data) => {
                setComments(data.results || []);
            })
            .catch((err) => console.error('댓글 로딩 실패:', err));
    }, [id]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            alert('코멘트를 작성하려면 로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        if (!newComment.trim()) {
            alert('코멘트 내용을 입력해주세요.');
            return;
        }

        const token = user.token;

        if (!token) {
            alert('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
            navigate('/login');
            return;
        }

        fetch(`${apiUrl}/movies/comment/create/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ comment: newComment }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('댓글 작성 실패');
                return res.json();
            })
            .then((newData) => {
                setComments([...comments, newData]);
                setNewComment('');
            })
            .catch((err) => alert(err.message));
    };

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

    if (!movie) {
        return <div className="loading">로딩 중...</div>;
    }

    return (
        <div className="detail-page-wrapper">
            <div className="detail-container">
                <img className="detail-poster" src={movie.poster_url} alt={movie.title_kor} />
                <div className="detail-info">
                    <h1 className="detail-title-kor">{movie.title_kor}</h1>
                    <h2 className="detail-title-eng">{movie.title_eng}</h2>

                    <div className="info-section">
                        <span className="info-label">개발일</span>
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
                        <h3>중견리</h3>
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
                                ? `${user.username}님, 코멘트를 남기세요...`
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
