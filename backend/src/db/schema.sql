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
  name        VARCHAR(255) NOT NULL,
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

INSERT IGNORE INTO products (name, description, price, stock, badge, category_id) VALUES
  ('Oversized Linen Blazer',      'Relaxed-fit blazer in breathable linen. Perfect for layering.',               189.00, 15, 'new',     1),
  ('High-Waist Wide-Leg Trousers','Tailored wide-leg trousers with a clean, minimal silhouette.',                145.00, 20,  NULL,     1),
  ('Merino Crew-Neck Sweater',    'Fine-gauge merino wool in a classic crew-neck cut.',                          125.00,  8,  NULL,     2),
  ('Slim-Fit Oxford Shirt',       'Crisp cotton Oxford shirt with a slim fit and button-down collar.',            95.00, 30,  NULL,     2),
  ('Leather Card Holder',         'Vegetable-tanned full-grain leather. Fits 6 cards.',                           55.00, 50, 'limited', 3),
  ('Minimalist Canvas Tote',      'Heavyweight canvas tote with a clean brand stamp. Reinforced handles.',        65.00, 40,  NULL,     3),
  ('Asymmetric Silk Midi Dress',  'Fluid silk-blend dress with an asymmetric hem. Effortlessly elegant.',        220.00,  5, 'new',     4),
  ('Structured Shoulder Bag',     'Semi-structured shoulder bag in pebbled leather with gold hardware.',         175.00, 12, 'new',     4);
