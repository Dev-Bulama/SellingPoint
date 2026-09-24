<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [

            // ── PRIVACY POLICY ────────────────────────────────────────────────
            [
                'title'     => 'Privacy Policy',
                'slug'      => 'privacy-policy',
                'is_active' => true,
                'content'   => <<<HTML
<h2>Privacy Policy</h2>
<p>This Privacy Policy explains how <strong>SellingPoint</strong> ("we", "us", or "our") collects, uses, discloses, and protects your personal information when you use our mobile application and website (collectively, the "Service"). By using our Service, you agree to the collection and use of information in accordance with this policy.</p>

<h3>1. Information We Collect</h3>
<p>We collect the following types of information:</p>
<ul>
  <li><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</li>
  <li><strong>Profile Information:</strong> Phone number, delivery addresses, and profile photo (optional).</li>
  <li><strong>Order Information:</strong> Products purchased, payment status, delivery details, and order history.</li>
  <li><strong>Device Information:</strong> Device type, operating system, app version, and unique device identifiers.</li>
  <li><strong>Usage Data:</strong> Pages viewed, products browsed, search queries, and interactions within the app.</li>
  <li><strong>Payment Information:</strong> We do not store card details. Payments are processed securely by Paystack.</li>
</ul>

<h3>2. How We Use Your Information</h3>
<p>We use your information to:</p>
<ul>
  <li>Create and manage your account</li>
  <li>Process and deliver your orders</li>
  <li>Send order confirmations, shipping updates, and customer service communications</li>
  <li>Send promotional offers and new product announcements (you may opt out at any time)</li>
  <li>Improve our app, website, and product catalogue</li>
  <li>Prevent fraud and ensure platform security</li>
  <li>Comply with legal obligations</li>
</ul>

<h3>3. Sharing Your Information</h3>
<p>We do not sell your personal information. We may share it with:</p>
<ul>
  <li><strong>Delivery Partners:</strong> To fulfil and deliver your orders.</li>
  <li><strong>Payment Processors:</strong> Paystack processes all payments securely.</li>
  <li><strong>Cloud Service Providers:</strong> For hosting, data storage, and app infrastructure.</li>
  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights.</li>
</ul>

<h3>4. Data Retention</h3>
<p>We retain your personal data for as long as your account is active or as needed to provide the Service. You may request deletion of your account and data at any time by visiting our <a href="/data-deletion">Data Deletion page</a> or emailing us at the address below.</p>

<h3>5. Security</h3>
<p>We implement industry-standard security measures including HTTPS encryption, hashed passwords, and secure payment processing via Paystack. However, no method of transmission over the internet is 100% secure.</p>

<h3>6. Your Rights</h3>
<p>You have the right to:</p>
<ul>
  <li>Access the personal data we hold about you</li>
  <li>Correct inaccurate information</li>
  <li>Request deletion of your account and associated data</li>
  <li>Opt out of marketing communications</li>
</ul>

<h3>7. Children's Privacy</h3>
<p>Our Service is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.</p>

<h3>8. Changes to This Policy</h3>
<p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use of the Service after changes constitutes your acceptance of the updated policy.</p>

<h3>9. Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at:</p>
<p><strong>SellingPoint</strong><br/>Email: bulamabukar10906@gmail.com<br/>Website: https://sellingpointshop.com</p>
HTML,
            ],

            // ── TERMS AND CONDITIONS ──────────────────────────────────────────
            [
                'title'     => 'Terms and Conditions',
                'slug'      => 'terms-and-conditions',
                'is_active' => true,
                'content'   => <<<HTML
<h2>Terms and Conditions</h2>
<p>Welcome to <strong>SellingPoint</strong>. By downloading our app or using our website, you agree to be bound by these Terms and Conditions. Please read them carefully before using our Service.</p>

<h3>1. Acceptance of Terms</h3>
<p>By creating an account or using SellingPoint in any way, you confirm that you are at least 18 years of age and that you accept these Terms and Conditions in full. If you do not agree, please do not use our Service.</p>

<h3>2. Account Registration</h3>
<ul>
  <li>You must provide accurate and complete information when creating an account.</li>
  <li>You are responsible for maintaining the confidentiality of your password.</li>
  <li>You are responsible for all activities that occur under your account.</li>
  <li>You must notify us immediately of any unauthorised use of your account.</li>
  <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
</ul>

<h3>3. Orders and Payments</h3>
<ul>
  <li>All prices are displayed in Nigerian Naira (₦) and are inclusive of applicable taxes.</li>
  <li>Prices may change without notice. The price at the time of your order is binding.</li>
  <li>Orders are subject to product availability. We reserve the right to cancel orders if items are out of stock.</li>
  <li>Payment must be made in full at the time of placing an order.</li>
  <li>All payments are processed securely through Paystack.</li>
</ul>

<h3>4. Delivery</h3>
<ul>
  <li>Delivery times are estimates and may vary depending on your location and product availability.</li>
  <li>We are not responsible for delays caused by third-party delivery partners, weather, or other circumstances beyond our control.</li>
  <li>Risk of loss and title for products passes to you upon delivery.</li>
</ul>

<h3>5. Returns and Refunds</h3>
<ul>
  <li>You may request a return within 7 days of receiving your order if the item is defective, damaged, or not as described.</li>
  <li>Items must be returned in their original condition and packaging.</li>
  <li>Refunds are processed within 5–10 business days after we receive and inspect the returned item.</li>
  <li>We reserve the right to reject returns that do not meet our return policy conditions.</li>
</ul>

<h3>6. Prohibited Conduct</h3>
<p>You agree not to:</p>
<ul>
  <li>Use the Service for any unlawful purpose</li>
  <li>Post false, misleading, or fraudulent reviews</li>
  <li>Attempt to gain unauthorised access to our systems</li>
  <li>Use automated tools to scrape, crawl, or extract data from our platform</li>
  <li>Interfere with the operation of the Service</li>
</ul>

<h3>7. Intellectual Property</h3>
<p>All content on the SellingPoint platform — including logos, images, text, and software — is the property of SellingPoint or its licensors and is protected by copyright law. You may not reproduce, distribute, or create derivative works without our written permission.</p>

<h3>8. Limitation of Liability</h3>
<p>To the maximum extent permitted by law, SellingPoint shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if we have been advised of the possibility of such damages.</p>

<h3>9. Changes to Terms</h3>
<p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or in-app notification. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.</p>

<h3>10. Governing Law</h3>
<p>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Nigeria.</p>

<h3>11. Contact</h3>
<p>For questions about these Terms, contact us at:<br/><strong>Email:</strong> bulamabukar10906@gmail.com<br/><strong>Website:</strong> https://sellingpointshop.com</p>
HTML,
            ],

            // ── ABOUT US ──────────────────────────────────────────────────────
            [
                'title'     => 'About Us',
                'slug'      => 'about-us',
                'is_active' => true,
                'content'   => <<<HTML
<h2>About SellingPoint</h2>
<p><strong>SellingPoint</strong> is a Nigerian e-commerce platform dedicated to connecting shoppers with the best products at unbeatable prices. From electronics and fashion to home essentials and beauty products — we have it all in one place.</p>

<h3>Our Mission</h3>
<p>Our mission is simple: to make shopping accessible, affordable, and enjoyable for every Nigerian. We believe that everyone deserves access to quality products with a seamless, trustworthy shopping experience — right from the palm of their hand.</p>

<h3>What We Offer</h3>
<ul>
  <li>Thousands of products across multiple categories</li>
  <li>Secure payment processing via Paystack</li>
  <li>Fast and reliable delivery across Nigeria</li>
  <li>Real-time order tracking</li>
  <li>Flash sales and exclusive deals</li>
  <li>Genuine product reviews from verified buyers</li>
  <li>Dedicated customer support</li>
</ul>

<h3>Why Choose SellingPoint?</h3>
<p>We prioritise trust, quality, and customer satisfaction above all else. Every product on our platform is carefully reviewed to ensure it meets our quality standards. Our payment system is fully secured, and your personal data is protected at all times.</p>

<h3>Get in Touch</h3>
<p>We love hearing from our customers. Whether you have a question, suggestion, or need help with an order — our team is always here for you.</p>
<p><strong>Email:</strong> bulamabukar10906@gmail.com<br/><strong>Website:</strong> https://sellingpointshop.com</p>
HTML,
            ],

            // ── DATA DELETION (required by Google Play for apps with accounts) ─
            [
                'title'     => 'Data Deletion Request',
                'slug'      => 'data-deletion',
                'is_active' => true,
                'content'   => <<<HTML
<h2>Data Deletion Request</h2>
<p>At <strong>SellingPoint</strong>, we respect your right to control your personal data. If you would like to delete your account and all associated personal information, you can do so using either of the methods below.</p>

<h3>Option 1 — Delete from the App</h3>
<ol>
  <li>Open the SellingPoint app on your device</li>
  <li>Go to <strong>Profile → Account Settings</strong></li>
  <li>Tap <strong>Delete Account</strong></li>
  <li>Confirm the deletion</li>
</ol>
<p>Your account and all personal data will be permanently deleted within <strong>30 days</strong>.</p>

<h3>Option 2 — Submit a Request by Email</h3>
<p>Send an email to <a href="mailto:bulamabukar10906@gmail.com">bulamabukar10906@gmail.com</a> with the subject line <strong>"Data Deletion Request"</strong> and include:</p>
<ul>
  <li>Your full name</li>
  <li>The email address registered to your account</li>
</ul>
<p>We will confirm your request within 48 hours and complete the deletion within 30 days.</p>

<h3>What Data Will Be Deleted</h3>
<ul>
  <li>Your account credentials (name, email, password)</li>
  <li>Your profile information (phone number, addresses)</li>
  <li>Your order history</li>
  <li>Your wishlist and product reviews</li>
  <li>Your push notification tokens</li>
</ul>

<h3>Data We May Retain</h3>
<p>We may retain certain data where required by law, including transaction records for tax and accounting compliance. This data will not be used for marketing purposes and will be deleted after the legally required retention period.</p>

<h3>Contact</h3>
<p>For any questions about data deletion, contact us at:<br/><strong>Email:</strong> bulamabukar10906@gmail.com</p>
HTML,
            ],
        ];

        foreach ($pages as $page) {
            Page::updateOrCreate(['slug' => $page['slug']], $page);
        }
    }
}
