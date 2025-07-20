import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './ClickableBox.css';

export default function ClickableBox({ imageSrc, to, title }) {
    return (
        // The entire box is now a Link component that navigates to the 'to' prop URL
        <Link to={to} className="pop_box">
            <img src={imageSrc} alt={title} className="pop_image" />
            <div className="pop_title_wrapper">
                <span className="pop_title">{title}</span>
            </div>
        </Link>
    );
}
