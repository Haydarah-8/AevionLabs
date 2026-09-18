-- Ensure all factory template seeds exist (matches SEEDED_TEMPLATES ids/slugs).

insert into public.website_templates (
  id, slug, name, industry, description, definition_key, pages_count, active
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'roofing-premium',
    'Roofing Premium',
    'Roofing',
    'Multi-page site for roofing and exterior trades. Home, about, services, projects, and contact.',
    'roofing',
    5,
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'professional-services',
    'Professional Services',
    'Professional',
    'Calm, type-led layout for accountants, consultants, and practices.',
    'professional',
    5,
    true
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'restaurant',
    'Restaurant',
    'Hospitality',
    'Menu, atmosphere, and booking-led site for restaurants and cafes.',
    'restaurant',
    5,
    true
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'construction',
    'Construction',
    'Construction',
    'Programme-led site for builders and contractors.',
    'construction',
    5,
    true
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'dental',
    'Dental',
    'Healthcare',
    'Calm practice site for dentists and clinics.',
    'dental',
    5,
    true
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'landscaping',
    'Landscaping',
    'Landscaping',
    'Garden and grounds site with work you can photograph.',
    'landscaping',
    5,
    true
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'salon-spa',
    'Salon & Spa',
    'Beauty',
    'Booking-first salon and spa with treatments, team, and gallery.',
    'salon',
    5,
    true
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'law-firm',
    'Law Firm',
    'Legal',
    'Chambers-style site for solicitors and practice areas.',
    'law',
    5,
    true
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'fitness-studio',
    'Fitness Studio',
    'Fitness',
    'Classes, coaches, and membership for studios and gyms.',
    'fitness',
    5,
    true
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'electrician',
    'Electrician',
    'Trades',
    'Local trade site with services, areas, and quote form.',
    'electrician',
    5,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  industry = excluded.industry,
  description = excluded.description,
  definition_key = excluded.definition_key,
  pages_count = excluded.pages_count,
  active = true,
  updated_at = now();
