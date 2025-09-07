import React from "react";

function Layout({ children }) {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1>TaskFlow</h1>
                <nav>
                {/* Example nav links, you can add React Router here later */}
                <a href="/" style={{ marginRight: '15px' }}>Home</a>
                <a href="/about">About</a>
                </nav>
            </header>

            <main>{children}</main>

            <footer style={{ marginTop: '40px', fontSize: '0.9em', color: '#555' }}>
                &copy; 2025 TaskFlow. All rights reserved.
            </footer>
        </div>
    );
}

export default Layout;