<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            ['question' => 'How do I track my order?', 'answer' => 'You can track your order from the Orders section in the app. Each order has a status that updates as it progresses.', 'category' => 'orders', 'sort_order' => 1],
            ['question' => 'What payment methods are accepted?', 'answer' => 'We accept payments via Paystack (cards, bank transfer, USSD) and Cash on Delivery in selected areas.', 'category' => 'payment', 'sort_order' => 1],
            ['question' => 'How long does delivery take?', 'answer' => 'Lagos: 1–2 days. South West: 2–4 days. Other states: 3–7 days.', 'category' => 'delivery', 'sort_order' => 1],
            ['question' => 'Can I return a product?', 'answer' => 'Yes, you can request a return within 7 days of delivery. The product must be unused and in original packaging.', 'category' => 'returns', 'sort_order' => 1],
            ['question' => 'Is my payment information secure?', 'answer' => 'Yes, all payments are processed through Paystack, a PCI DSS-compliant payment gateway. We never store your card details.', 'category' => 'payment', 'sort_order' => 2],
            ['question' => 'How do I cancel an order?', 'answer' => 'You can cancel a pending or confirmed order from the Order Details screen. Once the order is shipped, cancellation is not possible.', 'category' => 'orders', 'sort_order' => 2],
            ['question' => 'How do I get free shipping?', 'answer' => 'Free shipping is available on orders above the threshold for your zone. Lagos: ₦50,000+. Check the cart for your zone\'s threshold.', 'category' => 'delivery', 'sort_order' => 2],
        ];

        foreach ($faqs as $faq) {
            Faq::firstOrCreate(['question' => $faq['question']], array_merge($faq, ['is_active' => true]));
        }
    }
}
