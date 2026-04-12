DO $$
BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


CREATE TABLE IF NOT EXISTS users(
    u_id SERIAL PRIMARY KEY,
    u_name VARCHAR(200) NOT NULL,
    u_email VARCHAR(200) NOT NULL UNIQUE,
    u_password VARCHAR(255),
    u_role VARCHAR(50) NOT NULL 
);

INSERT INTO users (u_name, u_email, u_password, u_role)
VALUES
('Jens Kohler', 'jens.kohler@example.com', '$2b$10$nZmLZHRSS3CAA0zp4YneoOMqgR76C05G6OtzKmhlLUEyLM2m0blo6', 'admin'),
('Test Admin', 'test.admin@example.com', '$2b$10$b3kxL8jgw9Nl.T/pm7d/l.sg.eR2wOy4EOUxvR9kLgBryqBzhj9UC', 'admin'),
('System Admin', 'admin@admin.com', '$2b$10$nZmLZHRSS3CAA0zp4YneoOMqgR76C05G6OtzKmhlLUEyLM2m0blo6', 'admin'),
('Zaracki Kenpatchi Anime', 'test.user@example.com', '$2b$10$FBZRMNf/jvZ6OoRTgdpyc.tMYLWLDRVACXXw9D8qzWOTwUCsaezmi', 'user')
ON CONFLICT (u_email) DO NOTHING;

CREATE TABLE IF NOT EXISTS  orders(
    order_id SERIAL PRIMARY KEY,
    user_id INT,
    ordered_items JSON NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Pending',
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (u_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
