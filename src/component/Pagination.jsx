import React from 'react';
import './Pagination.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const renderPageNumbers = () => {
        if (totalPages <= 7) {
            return pageNumbers.map((number) => (
                <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                    <button onClick={() => onPageChange(number)} className="page-link">
                        {number}
                    </button>
                </li>
            ));
        }

        const pages = [];
        if (currentPage > 3) {
            pages.push(
                <li key="1" className="page-item">
                    <button onClick={() => onPageChange(1)} className="page-link">
                        1
                    </button>
                </li>
            );
            if (currentPage > 4) {
                pages.push(
                    <li key="start-ellipsis" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
        }

        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
                    <button onClick={() => onPageChange(i)} className="page-link">
                        {i}
                    </button>
                </li>
            );
        }

        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pages.push(
                    <li key="end-ellipsis" className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            }
            pages.push(
                <li key={totalPages} className="page-item">
                    <button onClick={() => onPageChange(totalPages)} className="page-link">
                        {totalPages}
                    </button>
                </li>
            );
        }
        return pages;
    };

    return (
        <nav className="pagination-nav">
            <ul className="pagination-ul">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        className="page-link"
                        disabled={currentPage === 1}
                    >
                        &laquo;
                    </button>
                </li>

                {renderPageNumbers()}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        className="page-link"
                        disabled={currentPage === totalPages}
                    >
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    );
}
