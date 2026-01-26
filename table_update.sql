-- =========================================
-- Tables principales
-- =========================================

-- eventSite (créée si elle n'existe pas)
CREATE TABLE IF NOT EXISTS eventSite (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(255) UNIQUE NOT NULL,
    organizer_id BIGINT,
    FOREIGN KEY (organizer_id) REFERENCES accounts_admin(id)
);

-- eventPlan (créée si elle n'existe pas)
CREATE TABLE IF NOT EXISTS eventPlan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metadata JSON NOT NULL,
    created_at DATETIME NOT NULL,
    site_id BIGINT,
    FOREIGN KEY (site_id) REFERENCES eventSite(id)
);

-- eventSite_locations (créée si elle n'existe pas)
CREATE TABLE IF NOT EXISTS eventSite_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    site_id BIGINT,
    longitude DOUBLE NOT NULL,
    latitude DOUBLE NOT NULL,
    FOREIGN KEY (site_id) REFERENCES eventSite(id)
);

-- event_locations (créée si elle n'existe pas)
CREATE TABLE IF NOT EXISTS event_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    event_id BIGINT,
    longitude DOUBLE NOT NULL,
    latitude DOUBLE NOT NULL,
    FOREIGN KEY (event_id) REFERENCES api_event(id)
);

-- user_fcmToken (safe, supprime la précédente version conflictuelle)
DROP TABLE IF EXISTS user_fcmToken;
CREATE TABLE user_fcmToken(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fcmtoken VARCHAR(255) UNIQUE NOT NULL,
    device_type VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES accounts_customer(id)
);

-- cinema_restaurantitem_category (créée si elle n'existe pas)
CREATE TABLE IF NOT EXISTS cinema_restaurantitem_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

-- cinema_historiquestock (créée si elle n'existe pas)
CREATE TABLE IF NOT EXISTS cinema_historiquestock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT,
    quantity INT NOT NULL,
    is_addition BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES cinema_restaurantitem(id)
);

-- =========================================
-- ALTER TABLE pour ajouter de nouvelles colonnes
-- =========================================

-- Ajouter seat_id dans api_ticket
ALTER TABLE api_ticket
ADD COLUMN IF NOT EXISTS seat_id VARCHAR(100) NOT NULL DEFAULT '';

-- Ajouter stock dans cinema_restaurantitem
ALTER TABLE cinema_restaurantitem
ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 0;

-- Ajouter category_id dans cinema_restaurantitem et créer la FK
ALTER TABLE cinema_restaurantitem
ADD COLUMN IF NOT EXISTS category_id BIGINT;

ALTER TABLE cinema_restaurantitem
ADD CONSTRAINT IF NOT EXISTS fk_category_id
FOREIGN KEY (category_id) REFERENCES cinema_restaurantitem_category(id);

-- Modifier column category pour accepter NULL
ALTER TABLE cinema_restaurantitem
MODIFY COLUMN category VARCHAR(255) NULL;

-- Ajouter created_at dans api_event_likes
ALTER TABLE api_event_likes
ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- =========================================
-- INSERT categories (sécurisé pour éviter doublons)
-- =========================================

INSERT INTO cinema_restaurantitem_category (category_name)
SELECT * FROM (SELECT 'POPCORN') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM cinema_restaurantitem_category WHERE category_name = 'POPCORN') LIMIT 1;

INSERT INTO cinema_restaurantitem_category (category_name)
SELECT * FROM (SELECT 'DRINKS') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM cinema_restaurantitem_category WHERE category_name = 'DRINKS') LIMIT 1;

INSERT INTO cinema_restaurantitem_category (category_name)
SELECT * FROM (SELECT 'CANDIES') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM cinema_restaurantitem_category WHERE category_name = 'CANDIES') LIMIT 1;

INSERT INTO cinema_restaurantitem_category (category_name)
SELECT * FROM (SELECT 'SNACKS') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM cinema_restaurantitem_category WHERE category_name = 'SNACKS') LIMIT 1;

INSERT INTO cinema_restaurantitem_category (category_name)
SELECT * FROM (SELECT 'COMBO') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM cinema_restaurantitem_category WHERE category_name = 'COMBO') LIMIT 1;

-- =========================================
-- Vues
-- =========================================

CREATE OR REPLACE VIEW view_event_location AS
SELECT ae.*, es.site_name, esl.location_name, esl.longitude, esl.latitude
FROM api_event AS ae
JOIN eventSite AS es ON ae.venue = es.site_name
JOIN eventSite_locations AS esl ON es.id = esl.site_id;

CREATE OR REPLACE VIEW view_future_event_locations AS
SELECT e.*, el.location_name, el.longitude, el.latitude
FROM api_event AS e
JOIN event_locations AS el ON e.id = el.event_id
WHERE e.event_date > CURRENT_TIMESTAMP();

CREATE OR REPLACE VIEW view_event_likes AS
SELECT a.*, el.*
FROM api_event_likes AS a
JOIN event_locations AS el ON a.event_id = el.event_id;
