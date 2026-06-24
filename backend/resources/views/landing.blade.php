<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $appName }} — Shop Smarter</title>
    <meta name="description" content="Discover thousands of products at unbeatable prices on {{ $appName }}." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --primary: {{ $primaryColor }};
            --primary-dark: {{ $primaryDark }};
            --primary-light: {{ $primaryLight }};
            --text: #1A1A2E;
            --text-secondary: #6B7280;
            --bg: #FAFAFA;
            --white: #FFFFFF;
            --border: #E5E7EB;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* ── NAV ── */
        nav {
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            padding: 0 5%;
            display: flex; align-items: center; justify-content: space-between;
            height: 64px;
        }
        .nav-brand {
            display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .nav-logo {
            width: 36px; height: 36px; border-radius: 10px;
            object-fit: cover; background: var(--primary);
            display: flex; align-items: center; justify-content: center;
            font-weight: 900; color: #fff; font-size: 14px; letter-spacing: -0.5px;
        }
        .nav-logo img { width: 100%; height: 100%; border-radius: 10px; object-fit: cover; }
        .nav-name {
            font-size: 18px; font-weight: 800; color: var(--text);
            letter-spacing: -0.3px;
        }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .btn-outline {
            padding: 8px 20px; border-radius: 8px; border: 1.5px solid var(--primary);
            color: var(--primary); font-weight: 600; font-size: 14px;
            text-decoration: none; transition: all 0.2s;
        }
        .btn-outline:hover { background: var(--primary); color: #fff; }
        .btn-primary {
            padding: 8px 20px; border-radius: 8px; background: var(--primary);
            color: #fff; font-weight: 600; font-size: 14px;
            text-decoration: none; transition: background 0.2s;
            border: none; cursor: pointer;
        }
        .btn-primary:hover { background: var(--primary-dark); }

        /* ── HERO ── */
        .hero {
            margin-top: 64px;
            min-height: calc(100vh - 64px);
            display: flex; align-items: center;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            position: relative; overflow: hidden; padding: 60px 5%;
        }
        .hero::before {
            content: '';
            position: absolute; top: -50%; right: -10%; width: 600px; height: 600px;
            border-radius: 50%;
            background: rgba(255,255,255,0.06);
        }
        .hero::after {
            content: '';
            position: absolute; bottom: -30%; left: -5%; width: 400px; height: 400px;
            border-radius: 50%;
            background: rgba(255,255,255,0.04);
        }
        .hero-content {
            position: relative; z-index: 1;
            max-width: 600px;
        }
        .hero-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(255,255,255,0.18); border-radius: 100px;
            padding: 6px 16px; margin-bottom: 24px;
            font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9);
        }
        .hero-badge span { width: 6px; height: 6px; background: #fff; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }

        .hero h1 {
            font-size: clamp(36px, 6vw, 64px);
            font-weight: 900; color: #fff;
            line-height: 1.1; letter-spacing: -1.5px;
            margin-bottom: 20px;
        }
        .hero h1 em { font-style: normal; color: rgba(255,255,255,0.75); }
        .hero p {
            font-size: 18px; color: rgba(255,255,255,0.82);
            line-height: 1.7; margin-bottom: 40px; max-width: 480px;
        }
        .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-hero-primary {
            padding: 14px 32px; border-radius: 12px;
            background: #fff; color: var(--primary);
            font-weight: 700; font-size: 15px; text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); }
        .btn-hero-outline {
            padding: 14px 32px; border-radius: 12px;
            border: 2px solid rgba(255,255,255,0.6); color: #fff;
            font-weight: 600; font-size: 15px; text-decoration: none;
            transition: background 0.2s;
        }
        .btn-hero-outline:hover { background: rgba(255,255,255,0.12); }

        .hero-mockup {
            position: absolute; right: 5%; bottom: 0;
            width: 340px; height: auto; z-index: 1;
            filter: drop-shadow(0 40px 60px rgba(0,0,0,0.3));
        }

        /* ── STATS ── */
        .stats {
            background: var(--white);
            border-bottom: 1px solid var(--border);
            padding: 40px 5%;
            display: flex; justify-content: center; gap: 60px; flex-wrap: wrap;
        }
        .stat-item { text-align: center; }
        .stat-number { font-size: 32px; font-weight: 900; color: var(--primary); letter-spacing: -1px; }
        .stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; font-weight: 500; }

        /* ── FEATURES ── */
        .features {
            padding: 80px 5%; background: var(--bg);
        }
        .section-label {
            text-align: center; font-size: 13px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 1.5px;
            color: var(--primary); margin-bottom: 12px;
        }
        .section-title {
            text-align: center; font-size: clamp(26px, 4vw, 40px);
            font-weight: 900; color: var(--text); letter-spacing: -1px;
            margin-bottom: 60px; line-height: 1.2;
        }
        .feature-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 24px; max-width: 1100px; margin: 0 auto;
        }
        .feature-card {
            background: var(--white); border-radius: 20px;
            padding: 32px 28px; border: 1px solid var(--border);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .feature-icon {
            width: 52px; height: 52px; border-radius: 14px;
            background: var(--primary-light); display: flex;
            align-items: center; justify-content: center;
            font-size: 24px; margin-bottom: 18px;
        }
        .feature-card h3 { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .feature-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

        /* ── APP DOWNLOAD ── */
        .download {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            padding: 80px 5%; text-align: center;
        }
        .download h2 { font-size: clamp(28px, 4vw, 44px); font-weight: 900; color: #fff; margin-bottom: 16px; letter-spacing: -1px; }
        .download p { font-size: 17px; color: rgba(255,255,255,0.8); margin-bottom: 40px; }
        .store-buttons { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
        .store-btn {
            display: flex; align-items: center; gap: 12px;
            background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.4);
            backdrop-filter: blur(10px);
            padding: 14px 24px; border-radius: 14px;
            color: #fff; text-decoration: none;
            transition: background 0.2s;
        }
        .store-btn:hover { background: rgba(255,255,255,0.25); }
        .store-btn svg { width: 28px; height: 28px; fill: #fff; }
        .store-btn-text { text-align: left; }
        .store-btn-text small { font-size: 11px; opacity: 0.8; display: block; }
        .store-btn-text strong { font-size: 17px; font-weight: 700; }

        /* ── FOOTER ── */
        footer {
            background: var(--text); color: rgba(255,255,255,0.6);
            padding: 40px 5%; text-align: center;
        }
        footer a { color: var(--primary); text-decoration: none; }
        .footer-brand { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 12px; }
        .footer-links { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
        .footer-links a { font-size: 14px; color: rgba(255,255,255,0.6); text-decoration: none; }
        .footer-links a:hover { color: var(--primary); }
        .footer-copy { font-size: 13px; }

        @media (max-width: 768px) {
            .hero-mockup { display: none; }
            .stats { gap: 32px; }
            nav { padding: 0 16px; }
            .hero, .features, .download { padding-left: 16px; padding-right: 16px; }
        }
    </style>
</head>
<body>

<!-- NAV -->
<nav>
    <a href="/" class="nav-brand">
        <div class="nav-logo">
            @if($appLogo)
                <img src="{{ $appLogo }}" alt="{{ $appName }}" />
            @else
                {{ strtoupper(substr($appName, 0, 2)) }}
            @endif
        </div>
        <span class="nav-name">{{ $appName }}</span>
    </a>
    <div class="nav-actions">
        <a href="/admin" class="btn-outline">Admin Panel</a>
    </div>
</nav>

<!-- HERO -->
<section class="hero">
    <div class="hero-content">
        <div class="hero-badge">
            <span></span> Now Live — Shop from anywhere
        </div>
        <h1>Shop Smarter,<br /><em>Live Better.</em></h1>
        <p>{{ $appName }} brings thousands of products to your fingertips. Fast delivery, secure payments, and an experience you'll love.</p>
        <div class="hero-cta">
            <a href="/admin" class="btn-hero-primary">Go to Admin Panel →</a>
            <a href="#features" class="btn-hero-outline">Learn More</a>
        </div>
    </div>
</section>

<!-- STATS -->
<div class="stats">
    <div class="stat-item">
        <div class="stat-number">{{ $stats['products'] }}+</div>
        <div class="stat-label">Products</div>
    </div>
    <div class="stat-item">
        <div class="stat-number">{{ $stats['customers'] }}+</div>
        <div class="stat-label">Customers</div>
    </div>
    <div class="stat-item">
        <div class="stat-number">{{ $stats['orders'] }}+</div>
        <div class="stat-label">Orders Delivered</div>
    </div>
    <div class="stat-item">
        <div class="stat-number">{{ $stats['categories'] }}+</div>
        <div class="stat-label">Categories</div>
    </div>
</div>

<!-- FEATURES -->
<section class="features" id="features">
    <div class="section-label">Why Choose Us</div>
    <h2 class="section-title">Everything you need<br />in one place</h2>
    <div class="feature-grid">
        <div class="feature-card">
            <div class="feature-icon">🛍️</div>
            <h3>Huge Selection</h3>
            <p>Browse thousands of products across dozens of categories, always updated with the latest arrivals.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Secure Payments</h3>
            <p>Pay safely with Paystack — Nigeria's most trusted payment gateway. Your data is always protected.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Fast Delivery</h3>
            <p>Get your orders delivered quickly with real-time tracking and instant status notifications.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>24/7 Support</h3>
            <p>Our support team is always available via WhatsApp, email, or in-app chat to help you out.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">❤️</div>
            <h3>Wishlist & Deals</h3>
            <p>Save your favourite products, get flash sale alerts, and never miss a great deal again.</p>
        </div>
        <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Mobile App</h3>
            <p>A smooth, beautiful app experience on both Android and iOS, built for Nigerian shoppers.</p>
        </div>
    </div>
</section>

<!-- DOWNLOAD -->
<section class="download">
    <h2>Download the App</h2>
    <p>Available on Android and iOS. Start shopping in minutes.</p>
    <div class="store-buttons">
        @if($playStoreUrl)
        <a href="{{ $playStoreUrl }}" class="store-btn" target="_blank">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.18 23.76a2.5 2.5 0 0 1-1.18-2.15V2.39A2.5 2.5 0 0 1 3.18.24l11.5 11.76zm13.58-7.46-2.91-2.97-2.14 2.18 4.72 4.83a2.5 2.5 0 0 0 .33-.16zm2.73-6.44a2.49 2.49 0 0 0 0-3.72L17.76 4.5l-3.08 3.14L18 11.76zM4.81.09l11.1 11.35L13 14.35 1.5 2.64A2.5 2.5 0 0 1 4.81.09z"/>
            </svg>
            <div class="store-btn-text">
                <small>Get it on</small>
                <strong>Google Play</strong>
            </div>
        </a>
        @else
        <a href="#" class="store-btn">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.18 23.76a2.5 2.5 0 0 1-1.18-2.15V2.39A2.5 2.5 0 0 1 3.18.24l11.5 11.76zm13.58-7.46-2.91-2.97-2.14 2.18 4.72 4.83a2.5 2.5 0 0 0 .33-.16zm2.73-6.44a2.49 2.49 0 0 0 0-3.72L17.76 4.5l-3.08 3.14L18 11.76zM4.81.09l11.1 11.35L13 14.35 1.5 2.64A2.5 2.5 0 0 1 4.81.09z"/>
            </svg>
            <div class="store-btn-text">
                <small>Get it on</small>
                <strong>Google Play</strong>
            </div>
        </a>
        @endif

        @if($appStoreUrl)
        <a href="{{ $appStoreUrl }}" class="store-btn" target="_blank">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div class="store-btn-text">
                <small>Download on the</small>
                <strong>App Store</strong>
            </div>
        </a>
        @else
        <a href="#" class="store-btn">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div class="store-btn-text">
                <small>Download on the</small>
                <strong>App Store</strong>
            </div>
        </a>
        @endif
    </div>
</section>

<!-- FOOTER -->
<footer>
    <div class="footer-brand">{{ $appName }}</div>
    <div class="footer-links">
        <a href="/admin">Admin Panel</a>
        @if($supportEmail)
        <a href="mailto:{{ $supportEmail }}">Contact</a>
        @endif
    </div>
    <div class="footer-copy">&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</div>
</footer>

</body>
</html>
