DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
	stock_quantity INT(5) NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES
("Electric Guitar", "Instruments", 499.99, 15),
("Acoustic Guitar", "Instruments", 399.99, 20),
("Drumset", "Musical Instruments", 599.99, 10),
("iPhone 11", "Technology", 9999.99, 6),
("Desktop PC", "Technology", 799.99, 10),
("Sofa", "Furniture", 450.00, 25),
("Kitchen Table", "Furniture", 315.00, 30);

SELECT * FROM products;


