<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $page->title }} — {{ $appName }}</title>
    <meta name="description" content="{{ $page->title }} for {{ $appName }}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --primary: {{ $primaryColor }};
            --primary-dark: {{ $primaryDark }};
            --text: #1A1A2E;
            --text-secondary: #6B7280;
            --bg: #FAFAFA;
            --white: #FFFFFF;
            --border: #E5E7EB;
        }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

        /* NAV */
        nav {
            position: sticky; top: 0; z-index: 100;
            background: rgba(255,255,255,0.97); backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            padding: 0 5%; display: flex; align-items: center; justify-content: space-between; height: 64px;
        }
        .nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-img { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; }
        .nav-logo-placeholder {
            width: 34px; height: 34px; border-radius: 8px;
            background: var(--primary); display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: 800; font-size: 14px;
        }
        .nav-name { font-weight: 700; font-size: 17px; color: var(--text); }
        .nav-back {
            font-size: 13px; color: var(--primary); text-decoration: none; font-weight: 600;
            padding: 8px 16px; border: 1.5px solid var(--primary); border-radius: 20px;
            transition: all .2s;
        }
        .nav-back:hover { background: var(--primary); color: #fff; }

        /* HERO */
        .hero {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            padding: 56px 5% 48px; text-align: center;
        }
        .hero h1 { font-size: clamp(24px, 4vw, 36px); font-weight: 800; color: #fff; margin-bottom: 12px; }
        .hero p { font-size: 14px; color: rgba(255,255,255,0.8); }

        /* CONTENT */
        .container { max-width: 820px; margin: 0 auto; padding: 48px 5% 80px; }

        .content { background: var(--white); border-radius: 16px; padding: 40px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); }

        /* Prose styles for the HTML content from the admin */
        .prose h1 { font-size: 22px; font-weight: 700; color: var(--text); margin: 32px 0 12px; }
        .prose h2 { font-size: 19px; font-weight: 700; color: var(--text); margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 2px solid var(--border); }
        .prose h3 { font-size: 16px; font-weight: 600; color: var(--primary); margin: 20px 0 8px; }
        .prose p { font-size: 15px; line-height: 1.8; color: #374151; margin-bottom: 14px; }
        .prose ul, .prose ol { margin: 10px 0 16px 24px; }
        .prose li { font-size: 15px; line-height: 1.8; color: #374151; margin-bottom: 6px; }
        .prose strong { color: var(--text); font-weight: 600; }
        .prose a { color: var(--primary); text-decoration: none; }
        .prose a:hover { text-decoration: underline; }
        .prose blockquote { border-left: 4px solid var(--primary); padding: 12px 20px; background: #FFF7ED; border-radius: 0 8px 8px 0; margin: 16px 0; font-style: italic; color: #555; }
        .prose hr { border: none; border-top: 1px solid var(--border); margin: 28px 0; }

        /* FOOTER */
        footer {
            background: var(--text); color: rgba(255,255,255,0.6);
            text-align: center; padding: 28px 5%; font-size: 13px;
        }
        footer a { color: rgba(255,255,255,0.8); text-decoration: none; margin: 0 8px; }
        footer a:hover { color: #fff; }
        .footer-links { margin-bottom: 10px; }
    </style>
</head>
<body>

    <nav>
        <a href="/" class="nav-brand">
            @if($appLogo)
                <img src="{{ $appLogo }}" alt="{{ $appName }}" class="nav-logo-img" />
            @else
                <div class="nav-logo-placeholder">{{ strtoupper(substr($appName, 0, 1)) }}</div>
            @endif
            <span class="nav-name">{{ $appName }}</span>
        </a>
        <a href="/" class="nav-back">← Home</a>
    </nav>

    <div class="hero">
        <h1>{{ $page->title }}</h1>
        <p>Last updated: {{ $page->updated_at->format('F j, Y') }}</p>
    </div>

    <div class="container">
        <div class="content">
            <div class="prose">
                {!! $page->content !!}
            </div>
        </div>
    </div>

    <footer>
        <div class="footer-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-and-conditions">Terms &amp; Conditions</a>
            <a href="/about-us">About Us</a>
            <a href="/data-deletion">Data Deletion</a>
        </div>
        <p>&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
    </footer>

</body>
</html>
