
import React, { useState, useEffect } from 'react';
import { filmQuotes } from '../data/quotes';

export const Footer: React.FC = () => {
    const [quote, setQuote] = useState(() => filmQuotes[Math.floor(Math.random() * filmQuotes.length)]);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // Start fade out
            setTimeout(() => {
                setQuote(currentQuote => {
                    let newQuote;
                    do {
                        newQuote = filmQuotes[Math.floor(Math.random() * filmQuotes.length)];
                    } while (newQuote === currentQuote); // Ensure new quote is different
                    return newQuote;
                });
                setFade(true); // Start fade in
            }, 500); // Time for fade-out transition
        }, 5000); // Change quote every 5 seconds

        return () => clearInterval(interval);
    }, []); // Empty dependency array ensures this effect runs only once

    return (
        <footer className="footer-bg">
            <div className="footer-content px-6 sm:px-8 flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
                <div className="social-icons order-1 md:order-1">
                    <a href="https://www.youtube.com/@luke1618gamer" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <i className="fab fa-youtube"></i>
                    </a>
                    <a href="https://www.tiktok.com/@hoangcao2704" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                        <i className="fab fa-tiktok"></i>
                    </a>
                    <a href="https://www.linkedin.com/in/hoangminhcao" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <i className="fab fa-linkedin"></i>
                    </a>
                </div>
                <div id="quote-container" className="quote-container order-3 md:order-2 flex-grow">
                    <p id="quote-text" className={`transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                       &ldquo;{quote}&rdquo;
                    </p>
                </div>
                <p className="copyright-text order-2 md:order-3 whitespace-nowrap">&copy; 2025 MrLuke1618. All rights reserved.</p>
            </div>
        </footer>
    );
};
