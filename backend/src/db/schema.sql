-- VELN ecommerce database schema
-- Safe to run multiple times: tables and seed data are only created if absent.
-- Usage: mysql -u root -p < backend/src/db/schema.sql

CREATE DATABASE IF NOT EXISTS veln_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veln_db;

CREATE TABLE IF NOT EXISTS users (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) NOT NULL UNIQUE,
  password             VARCHAR(255) NOT NULL,
  role                 ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  email_notifications  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price       DECIMAL(10, 2) NOT NULL,
  stock       INT UNSIGNED NOT NULL DEFAULT 0,
  image_url   VARCHAR(500),
  badge       ENUM('new', 'sale', 'limited', 'new arrival', 'bestseller', 'essential', 'classic'),
  category_id INT UNSIGNED NOT NULL,
  active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity   INT UNSIGNED NOT NULL DEFAULT 1,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_user_product (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlists (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  added_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  status           ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  total            DECIMAL(10, 2) NOT NULL,
  shipping_name    VARCHAR(255) NOT NULL,
  shipping_address VARCHAR(500) NOT NULL,
  payment_method   ENUM('card', 'transfer', 'cash') NOT NULL,
  payment_status   ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id   INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity   INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_resets (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  token      VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used       TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS promotions (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  discount_pct DECIMAL(5, 2) NOT NULL CHECK (discount_pct > 0 AND discount_pct <= 100),
  starts_at    DATETIME NOT NULL,
  ends_at      DATETIME NOT NULL,
  active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coupons (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(50) NOT NULL UNIQUE,
  discount_pct DECIMAL(5, 2) NOT NULL CHECK (discount_pct > 0 AND discount_pct <= 100),
  max_uses     INT UNSIGNED NOT NULL DEFAULT 1,
  used_count   INT UNSIGNED NOT NULL DEFAULT 0,
  expires_at   DATETIME NOT NULL,
  active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS promotion_products (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  promotion_id INT UNSIGNED NOT NULL,
  product_id   INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_promo_product (promotion_id, product_id),
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)   REFERENCES products(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed: INSERT IGNORE skips rows that would violate the UNIQUE constraint,
-- so re-running this file never duplicates data.
INSERT IGNORE INTO categories (name, slug) VALUES
  ('Women',        'women'),
  ('Men',          'men'),
  ('Accessories',  'accessories'),
  ('New Arrivals', 'new-arrivals');

-- category_id is resolved by slug so this stays correct regardless of auto-increment state
INSERT IGNORE INTO products (name, description, price, stock, badge, image_url, category_id) VALUES
  -- Women
  ('Oversized Linen Blazer',        'Relaxed-fit blazer in breathable linen. Perfect for layering.',                    189.00, 15, 'new',     'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80', (SELECT id FROM categories WHERE slug = 'women')),
  ('High-Waist Wide-Leg Trousers',  'Tailored wide-leg trousers with a clean, minimal silhouette.',                     145.00, 20,  NULL,     'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80', (SELECT id FROM categories WHERE slug = 'women')),
  ('Silk Slip Dress',               'Bias-cut silk dress with adjustable straps. Versatile day to night.',              195.00,  8, 'new',     'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', (SELECT id FROM categories WHERE slug = 'women')),
  ('Cropped Cashmere Cardigan',     'Soft cashmere blend in a relaxed cropped silhouette.',                             165.00, 12,  NULL,     'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80', (SELECT id FROM categories WHERE slug = 'women')),
  ('Tailored Wool Coat',            'Double-breasted wool coat with structured shoulders and clean lines.',             380.00,  6, 'limited', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80', (SELECT id FROM categories WHERE slug = 'women')),
  -- Men
  ('Merino Crew-Neck Sweater',      'Fine-gauge merino wool in a classic crew-neck cut.',                               125.00,  8,  NULL,     'https://images.unsplash.com/photo-1614495800428-84885b5a39b9?w=600&q=80', (SELECT id FROM categories WHERE slug = 'men')),
  ('Slim-Fit Oxford Shirt',         'Crisp cotton Oxford shirt with a slim fit and button-down collar.',                 95.00, 30,  NULL,     'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', (SELECT id FROM categories WHERE slug = 'men')),
  ('Relaxed Chino Trousers',        'Lightweight chinos in a relaxed fit. Garment-washed for softness.',                115.00, 25,  NULL,     'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', (SELECT id FROM categories WHERE slug = 'men')),
  ('Technical Field Jacket',        'Water-resistant shell with clean seams and concealed pockets.',                    245.00, 10, 'new',     'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', (SELECT id FROM categories WHERE slug = 'men')),
  ('Linen Blend Shorts',            'Easy-fit shorts in a linen-cotton blend. Perfect for warm seasons.',                75.00, 35,  NULL,     'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&q=80', (SELECT id FROM categories WHERE slug = 'men')),
  -- Accessories
  ('Leather Card Holder',           'Vegetable-tanned full-grain leather. Fits 6 cards.',                                55.00, 50, 'limited', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Minimalist Canvas Tote',        'Heavyweight canvas tote with a clean brand stamp. Reinforced handles.',             65.00, 40,  NULL,     'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Pebbled Leather Belt',          'Full-grain pebbled leather with a matte silver buckle.',                            85.00, 30,  NULL,     'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Merino Wool Scarf',             'Extra-fine merino wool in a generous 200cm length.',                                95.00, 20,  NULL,     'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80', (SELECT id FROM categories WHERE slug = 'accessories')),
  ('Structured Weekend Bag',        'Full-grain leather holdall with canvas lining and brass hardware.',                295.00,  8, 'limited', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80', (SELECT id FROM categories WHERE slug = 'accessories')),
  -- New Arrivals
  ('Asymmetric Silk Midi Dress',    'Fluid silk-blend dress with an asymmetric hem. Effortlessly elegant.',             220.00,  5, 'new',     'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', (SELECT id FROM categories WHERE slug = 'new-arrivals')),
  ('Structured Shoulder Bag',       'Semi-structured shoulder bag in pebbled leather with gold hardware.',              175.00, 12, 'new',     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', (SELECT id FROM categories WHERE slug = 'new-arrivals')),
  ('Ribbed Knit Midi Skirt',        'Column silhouette in a fine-ribbed knit. Pairs with anything.',                    130.00, 18, 'new',     'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80', (SELECT id FROM categories WHERE slug = 'new-arrivals')),
  ('Suede Chelsea Boots',           'Pull-on Chelsea boots in soft suede with a stacked leather sole.',                 285.00,  9, 'new',     'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80', (SELECT id FROM categories WHERE slug = 'new-arrivals')),
  ('Oversized Bomber Jacket',       'Relaxed bomber in a lightweight technical fabric with ribbed trim.',               215.00, 14, 'new',     'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80', (SELECT id FROM categories WHERE slug = 'new-arrivals'));
