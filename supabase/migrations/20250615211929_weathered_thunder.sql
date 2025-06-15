/*
  # Populate Fresh Local Food Marketplace with Sample Data

  1. Categories
    - Vegetables, Fruits, Dairy & Eggs, Meat & Poultry, Baked Goods, Honey & Preserves

  2. Sellers
    - Various local farms, bakeries, and producers in Northwest Arkansas area

  3. Products
    - Comprehensive selection of local food products with realistic pricing and details

  4. Reviews
    - Sample customer reviews for products
*/

-- Insert categories
INSERT INTO categories (name, description, icon) VALUES
  ('Vegetables', 'Fresh seasonal vegetables and leafy greens', 'leaf'),
  ('Fruits', 'Seasonal fruits, berries, and orchard produce', 'apple'),
  ('Dairy & Eggs', 'Fresh dairy products and farm eggs', 'milk'),
  ('Meat & Poultry', 'Grass-fed meat and free-range poultry', 'beef'),
  ('Baked Goods', 'Artisan breads, pastries, and baked items', 'bread'),
  ('Honey & Preserves', 'Raw honey, jams, and preserved goods', 'honey');

-- Insert sellers (Northwest Arkansas area)
INSERT INTO sellers (name, description, location, latitude, longitude, seller_type, contact_email, contact_phone, verified) VALUES
  (
    'Green Acres Farm',
    'Certified organic farm specializing in seasonal vegetables and herbs. Family-owned for three generations, committed to sustainable farming practices.',
    'Fayetteville, AR',
    36.1627,
    -94.1574,
    'farm',
    'info@greenacresfarm.com',
    '(479) 555-0123',
    true
  ),
  (
    'Sweet Life Bakery',
    'Artisan bakery creating fresh bread, pastries, and custom cakes using locally sourced ingredients whenever possible.',
    'Springdale, AR',
    36.1867,
    -94.1288,
    'bakery',
    'orders@sweetlifebakery.com',
    '(479) 555-0456',
    true
  ),
  (
    'Hillside Dairy',
    'Small family dairy producing fresh milk, cheese, and yogurt from grass-fed cows. All products are hormone-free and minimally processed.',
    'Rogers, AR',
    36.3321,
    -94.1185,
    'dairy',
    'contact@hillsidedairy.com',
    '(479) 555-0789',
    true
  ),
  (
    'Heritage Meats',
    'Pasture-raised livestock providing grass-fed beef, free-range chicken, and heritage pork. Committed to humane and sustainable practices.',
    'Bentonville, AR',
    36.3729,
    -94.2088,
    'meat',
    'orders@heritagemeats.com',
    '(479) 555-0321',
    true
  ),
  (
    'Orchard Valley',
    'Family orchard growing heirloom apples, peaches, and seasonal stone fruits. Pick-your-own available during harvest season.',
    'Elkins, AR',
    36.2298,
    -94.1178,
    'orchard',
    'info@orchardvalley.com',
    '(479) 555-0654',
    true
  ),
  (
    'Happy Hen Farm',
    'Free-range chicken farm producing fresh eggs and seasonal poultry. Hens are pasture-raised and fed non-GMO feed.',
    'Farmington, AR',
    36.0420,
    -94.2474,
    'farm',
    'eggs@happyhenfarm.com',
    '(479) 555-0987',
    true
  ),
  (
    'Busy Bee Apiary',
    'Local beekeepers producing raw honey, beeswax products, and seasonal honey varieties. Supporting local pollinator populations.',
    'Prairie Grove, AR',
    35.9645,
    -94.3171,
    'apiary',
    'honey@busybeeapiary.com',
    '(479) 555-0147',
    true
  ),
  (
    'Urban Greens',
    'Indoor vertical farm specializing in microgreens, herbs, and leafy greens. Fresh harvest available year-round.',
    'Fayetteville, AR',
    36.0822,
    -94.1719,
    'farm',
    'fresh@urbangreens.com',
    '(479) 555-0258',
    true
  ),
  (
    'Ozark Mushrooms',
    'Specialty mushroom farm growing shiitake, oyster, and seasonal wild mushrooms using sustainable cultivation methods.',
    'Winslow, AR',
    35.8012,
    -94.1341,
    'farm',
    'fungi@ozarkmushrooms.com',
    '(479) 555-0369',
    true
  ),
  (
    'Sunset Gardens',
    'Flower and herb farm offering fresh cut flowers, culinary herbs, and medicinal plants. Specializing in heirloom varieties.',
    'Tontitown, AR',
    36.1573,
    -94.2341,
    'farm',
    'blooms@sunsetgardens.com',
    '(479) 555-0741',
    true
  );

-- Insert products
INSERT INTO products (seller_id, category_id, name, description, price, unit, image_url, stock_quantity, is_organic, tags, harvest_date, available_until) VALUES
  -- Green Acres Farm (Vegetables)
  (
    (SELECT id FROM sellers WHERE name = 'Green Acres Farm'),
    (SELECT id FROM categories WHERE name = 'Vegetables'),
    'Heirloom Tomatoes',
    'Juicy, flavorful heirloom tomatoes in mixed varieties. Perfect for salads, sandwiches, or cooking. Grown without pesticides.',
    4.99,
    'lb',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    25,
    true,
    ARRAY['heirloom', 'pesticide-free', 'vine-ripened'],
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '1 week'
  ),
  (
    (SELECT id FROM sellers WHERE name = 'Green Acres Farm'),
    (SELECT id FROM categories WHERE name = 'Vegetables'),
    'Baby Spinach',
    'Tender baby spinach leaves, perfect for salads or cooking. Harvested fresh daily from our organic fields.',
    4.49,
    'bag',
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800',
    40,
    true,
    ARRAY['baby-greens', 'salad-ready'],
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '5 days'
  ),
  (
    (SELECT id FROM sellers WHERE name = 'Green Acres Farm'),
    (SELECT id FROM categories WHERE name = 'Vegetables'),
    'Rainbow Swiss Chard',
    'Colorful and nutritious leafy greens with vibrant stems. Excellent source of vitamins and minerals.',
    3.99,
    'bunch',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800',
    15,
    true,
    ARRAY['colorful', 'nutrient-dense'],
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '4 days'
  ),

  -- Sweet Life Bakery (Baked Goods)
  (
    (SELECT id FROM sellers WHERE name = 'Sweet Life Bakery'),
    (SELECT id FROM categories WHERE name = 'Baked Goods'),
    'Artisan Sourdough Bread',
    'Traditional sourdough bread made with wild yeast starter. Crispy crust, soft interior with complex flavors.',
    8.99,
    'loaf',
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800',
    12,
    false,
    ARRAY['artisan', 'wild-yeast', 'traditional'],
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 days'
  ),
  (
    (SELECT id FROM sellers WHERE name = 'Sweet Life Bakery'),
    (SELECT id FROM categories WHERE name = 'Baked Goods'),
    'Whole Wheat Dinner Rolls',
    'Soft, fluffy dinner rolls made with locally milled whole wheat flour. Perfect for family meals.',
    6.99,
    'dozen',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    8,
    false,
    ARRAY['whole-wheat', 'family-size'],
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '2 days'
  ),

  -- Hillside Dairy (Dairy & Eggs)
  (
    (SELECT id FROM sellers WHERE name = 'Hillside Dairy'),
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs'),
    'Fresh Whole Milk',
    'Creamy, rich whole milk from grass-fed cows. Non-homogenized and minimally pasteurized for maximum flavor.',
    5.99,
    'half-gallon',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
    20,
    false,
    ARRAY['grass-fed', 'non-homogenized', 'local'],
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '5 days'
  ),
  (
    (SELECT id FROM sellers WHERE name = 'Hillside Dairy'),
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs'),
    'Artisan Cheese Selection',
    'Curated selection of locally made artisan cheeses including aged cheddar, herb goat cheese, and fresh mozzarella.',
    18.99,
    'pack',
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800',
    6,
    false,
    ARRAY['artisan', 'variety-pack', 'aged'],
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '2 weeks'
  ),

  -- Heritage Meats (Meat & Poultry)
  (
    (SELECT id FROM sellers WHERE name = 'Heritage Meats'),
    (SELECT id FROM categories WHERE name = 'Meat & Poultry'),
    'Grass-Fed Ground Beef',
    'Premium grass-fed ground beef from cattle raised on local pastures. No hormones or antibiotics.',
    9.99,
    'lb',
    'https://images.unsplash.com/photo-1588347818481-c7c1b6b3b5b3?w=800',
    30,
    false,
    ARRAY['grass-fed', 'hormone-free', 'pasture-raised'],
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '3 days'
  ),
  (
    (SELECT id FROM sellers WHERE name = 'Heritage Meats'),
    (SELECT id FROM categories WHERE name = 'Meat & Poultry'),
    'Free-Range Chicken',
    'Whole free-range chicken raised on pasture. Superior flavor and texture from natural diet and exercise.',
    16.99,
    'whole',
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800',
    8,
    false,
    ARRAY['free-range', 'pasture-raised', 'whole-bird'],
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '4 days'
  ),

  -- Happy Hen Farm (Dairy & Eggs)
  (
    (SELECT id FROM sellers WHERE name = 'Happy Hen Farm'),
    (SELECT id FROM categories WHERE name = 'Dairy & Eggs'),
    'Farm Fresh Eggs',
    'Free-range eggs from pasture-raised hens. Rich, golden yolks and superior taste from hens with access to bugs and grass.',
    6.99,
    'dozen',
    'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=800',
    50,
    false,
    ARRAY['free-range', 'pasture-raised', 'golden-yolks'],
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '2 weeks'
  ),

  -- Orchard Valley (Fruits)
  (
    (SELECT id FROM sellers WHERE name = 'Orchard Valley'),
    (SELECT id FROM categories WHERE name = 'Fruits'),
    'Heritage Apples',
    'Rare heritage apple varieties including Arkansas Black, Ashmead''s Kernel, and Esopus Spitzenburg. Unique flavors and textures.',
    5.99,
    'bag',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800',
    35,
    false,
    ARRAY['heritage', 'rare-varieties', 'heirloom'],
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '3 weeks'
  ),
  (
    (SELECT id FROM sellers WHERE name = 'Orchard Valley'),
    (SELECT id FROM categories WHERE name = 'Fruits'),
    'Seasonal Fruit Mix',
    'Beautiful selection of seasonal fruits including apples, pears, and late-season stone fruits. Perfect for gift baskets.',
    12.99,
    'basket',
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800',
    12,
    false,
    ARRAY['seasonal', 'variety-pack', 'gift-ready'],
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '1 week'
  ),

  -- Busy Bee Apiary (Honey & Preserves)
  (
    (SELECT id FROM sellers WHERE name = 'Busy Bee Apiary'),
    (SELECT id FROM categories WHERE name = 'Honey & Preserves'),
    'Raw Wildflower Honey',
    'Pure, raw honey harvested from our local beehives. Unfiltered and unpasteurized with natural enzymes intact.',
    15.99,
    'jar',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
    25,
    false,
    ARRAY['raw', 'unfiltered', 'wildflower', 'local'],
    CURRENT_DATE - INTERVAL '1 week',
    CURRENT_DATE + INTERVAL '1 year'
  ),

  -- Urban Greens (Vegetables)
  (
    (SELECT id FROM sellers WHERE name = 'Urban Greens'),
    (SELECT id FROM categories WHERE name = 'Vegetables'),
    'Microgreens Mix',
    'Nutrient-dense microgreens including pea shoots, radish, sunflower, and broccoli greens. Perfect for garnishes and salads.',
    7.99,
    'container',
    'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800',
    18,
    true,
    ARRAY['microgreens', 'nutrient-dense', 'variety-mix'],
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '5 days'
  ),
  (
    (SELECT id FROM sellers WHERE name = 'Urban Greens'),
    (SELECT id FROM categories WHERE name = 'Vegetables'),
    'Fresh Herb Bundle',
    'Mix of fresh herbs including basil, cilantro, parsley, and dill. Grown in our climate-controlled greenhouse.',
    5.99,
    'bundle',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800',
    22,
    true,
    ARRAY['fresh-herbs', 'variety-pack', 'greenhouse-grown'],
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 week'
  ),

  -- Ozark Mushrooms (Vegetables)
  (
    (SELECT id FROM sellers WHERE name = 'Ozark Mushrooms'),
    (SELECT id FROM categories WHERE name = 'Vegetables'),
    'Shiitake Mushrooms',
    'Fresh shiitake mushrooms with rich, umami flavor. Perfect for stir-fries, soups, and gourmet cooking.',
    12.99,
    'lb',
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800',
    10,
    false,
    ARRAY['gourmet', 'umami', 'specialty'],
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '5 days'
  ),
  (
    (SELECT id FROM sellers WHERE name = 'Ozark Mushrooms'),
    (SELECT id FROM categories WHERE name = 'Vegetables'),
    'Oyster Mushroom Medley',
    'Mix of oyster mushrooms in various colors including pearl, golden, and pink varieties. Delicate flavor and texture.',
    8.99,
    'lb',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800',
    8,
    false,
    ARRAY['variety-mix', 'colorful', 'delicate'],
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '4 days'
  );

-- Insert sample reviews
INSERT INTO product_reviews (product_id, customer_name, rating, comment) VALUES
  (
    (SELECT id FROM products WHERE name = 'Heirloom Tomatoes'),
    'Sarah Johnson',
    5,
    'These tomatoes are absolutely incredible! The flavor is so much better than store-bought. Will definitely order again.'
  ),
  (
    (SELECT id FROM products WHERE name = 'Heirloom Tomatoes'),
    'Mike Chen',
    5,
    'Best tomatoes I''ve had in years. Perfect for my summer salads.'
  ),
  (
    (SELECT id FROM products WHERE name = 'Farm Fresh Eggs'),
    'Lisa Rodriguez',
    5,
    'The yolks are so orange and rich! You can really taste the difference from pasture-raised hens.'
  ),
  (
    (SELECT id FROM products WHERE name = 'Artisan Sourdough Bread'),
    'David Thompson',
    4,
    'Great texture and flavor. The crust is perfect. Would love to see more variety in sizes.'
  ),
  (
    (SELECT id FROM products WHERE name = 'Raw Wildflower Honey'),
    'Emma Wilson',
    5,
    'This honey is amazing! You can taste the different flowers. Perfect for my morning tea.'
  ),
  (
    (SELECT id FROM products WHERE name = 'Grass-Fed Ground Beef'),
    'Robert Martinez',
    5,
    'Superior quality beef. The flavor is outstanding and I feel good about supporting local farmers.'
  ),
  (
    (SELECT id FROM products WHERE name = 'Microgreens Mix'),
    'Jennifer Lee',
    4,
    'Fresh and flavorful. Great for adding nutrition and color to my meals.'
  ),
  (
    (SELECT id FROM products WHERE name = 'Heritage Apples'),
    'Tom Anderson',
    5,
    'Love trying these old varieties! Each apple has such a unique flavor profile.'
  );