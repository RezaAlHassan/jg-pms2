-- University Procurement Database Schema
-- Simplified version with lowercase table and column names

-- Enable UUID extension if using PostgreSQL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- DROP STATEMENTS (Run first to avoid conflicts)
-- ==============================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS invitation_details CASCADE;
DROP VIEW IF EXISTS supplier_performance CASCADE;
DROP VIEW IF EXISTS purchase_request_details CASCADE;
DROP VIEW IF EXISTS user_details CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS update_purchase_requests_updated_at ON purchase_requests;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
DROP TRIGGER IF EXISTS update_catalogs_updated_at ON catalogs;
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS purchase_requests CASCADE;
DROP TABLE IF EXISTS catalogs CASCADE;
DROP TABLE IF EXISTS supplier_ratings CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ==============================================
-- USER MANAGEMENT TABLES
-- ==============================================

-- Departments Table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    max_budget_limit DECIMAL(15,2) DEFAULT 0 CHECK (max_budget_limit >= 0),
    can_approve BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT
);

-- User Roles Table (Many-to-Many relationship)
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Invitations Table
CREATE TABLE invitations (
    invitation_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id INTEGER NOT NULL,
    role_ids INTEGER[] NOT NULL,
    invitation_token VARCHAR(255) NOT NULL UNIQUE,
    invited_by INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Expired', 'Cancelled')),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT,
    FOREIGN KEY (invited_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- ==============================================
-- SUPPLIER MANAGEMENT TABLES
-- ==============================================

-- Suppliers Table
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_info JSONB, -- Store structured contact details
    certifications TEXT,
    contract_terms TEXT,
    onboarding_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Inactive', 'Suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Ratings Table
CREATE TABLE supplier_ratings (
    rating_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL,
    rating_date DATE NOT NULL,
    timeliness_score DECIMAL(3,2) CHECK (timeliness_score >= 0 AND timeliness_score <= 5),
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 5),
    responsiveness_score DECIMAL(3,2) CHECK (responsiveness_score >= 0 AND responsiveness_score <= 5),
    overall_score DECIMAL(3,2) GENERATED ALWAYS AS (
        (timeliness_score + quality_score + responsiveness_score) / 3
    ) STORED,
    rated_by INTEGER NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    FOREIGN KEY (rated_by) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- Catalogs Table
CREATE TABLE catalogs (
    catalog_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    catalog_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT
);

-- ==============================================
-- BUDGET MANAGEMENT TABLES
-- ==============================================

-- Budgets Table
CREATE TABLE budgets (
    budget_id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL,
    fiscal_year INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount >= 0),
    remaining_amount DECIMAL(15,2) NOT NULL CHECK (remaining_amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE,
    UNIQUE(department_id, fiscal_year)
);

-- ==============================================
-- PURCHASE REQUEST MANAGEMENT TABLES
-- ==============================================

-- Purchase Requests Table
CREATE TABLE purchase_requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled', 'In Progress', 'Completed')),
    funding_source VARCHAR(100),
    budget_id INTEGER NOT NULL, -- Made mandatory
    department_id INTEGER NOT NULL, -- Made mandatory
    description TEXT,
    justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- User Management Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(invitation_token);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expires ON invitations(expires_at);

-- Supplier Management Indexes
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_name ON suppliers(supplier_name);
CREATE INDEX idx_supplier_ratings_supplier ON supplier_ratings(supplier_id);
CREATE INDEX idx_supplier_ratings_date ON supplier_ratings(rating_date);
CREATE INDEX idx_catalogs_supplier ON catalogs(supplier_id);
CREATE INDEX idx_catalogs_department ON catalogs(department_id);

-- Purchase Request Indexes
CREATE INDEX idx_purchase_requests_requester ON purchase_requests(requester_id);
CREATE INDEX idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX idx_purchase_requests_date ON purchase_requests(request_date);
CREATE INDEX idx_purchase_requests_budget ON purchase_requests(budget_id);
CREATE INDEX idx_purchase_requests_amount ON purchase_requests(amount);

-- Budget Management Indexes
CREATE INDEX idx_budgets_department ON budgets(department_id);
CREATE INDEX idx_budgets_fiscal_year ON budgets(fiscal_year);

-- ==============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Function to update UpdatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with UpdatedAt columns
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_catalogs_updated_at BEFORE UPDATE ON catalogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SAMPLE DATA INSERTS
-- ==============================================

-- Insert sample departments
INSERT INTO departments (department_name) VALUES 
('Information Technology'),
('Finance'),
('Human Resources'),
('Facilities Management'),
('Academic Affairs'),
('Research and Development');

-- Insert sample roles
INSERT INTO roles (role_name, description, max_budget_limit, can_approve) VALUES 
('Requestor', 'Can create and submit purchase requests', 0, FALSE),
('Approver', 'Can approve purchase requests within their authority', 10000.00, TRUE),
('Admin', 'Full system administration access', 999999.99, TRUE),
('Budget Manager', 'Manages departmental budgets', 50000.00, TRUE),
('Procurement Officer', 'Handles supplier relationships and procurement processes', 25000.00, TRUE);

-- Insert sample users (password hash is for 'password123')
INSERT INTO users (first_name, last_name, email, password_hash, department_id) VALUES 
('John', 'Doe', 'john.doe@university.edu', '$2b$10$rQZ8K9mN2pL3vX7wE5tYOu8vB1cD4fG6hI9jK2lM5nP8qR3sT6uV9xY', 1),
('Jane', 'Smith', 'jane.smith@university.edu', '$2b$10$rQZ8K9mN2pL3vX7wE5tYOu8vB1cD4fG6hI9jK2lM5nP8qR3sT6uV9xY', 2),
('Mike', 'Johnson', 'mike.johnson@university.edu', '$2b$10$rQZ8K9mN2pL3vX7wE5tYOu8vB1cD4fG6hI9jK2lM5nP8qR3sT6uV9xY', 1),
('Sarah', 'Williams', 'sarah.williams@university.edu', '$2b$10$rQZ8K9mN2pL3vX7wE5tYOu8vB1cD4fG6hI9jK2lM5nP8qR3sT6uV9xY', 3);

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), -- John Doe - Requestor
(1, 2), -- John Doe - Approver
(2, 1), -- Jane Smith - Requestor
(2, 4), -- Jane Smith - Budget Manager
(3, 1), -- Mike Johnson - Requestor
(4, 3); -- Sarah Williams - Admin

-- Insert sample suppliers
INSERT INTO suppliers (supplier_name, contact_info, certifications, onboarding_date, status) VALUES 
('Tech Solutions Inc.', '{"phone": "+1-555-0123", "email": "contact@techsolutions.com", "address": "123 Tech St, Silicon Valley, CA"}', 'ISO 9001, ISO 27001', '2023-01-15', 'Approved'),
('Office Supplies Co.', '{"phone": "+1-555-0456", "email": "sales@officesupplies.com", "address": "456 Office Ave, Business District, NY"}', 'ISO 9001', '2023-02-20', 'Approved'),
('Equipment Rentals LLC', '{"phone": "+1-555-0789", "email": "rentals@equipment.com", "address": "789 Equipment Blvd, Industrial Zone, TX"}', 'OSHA Certified', '2023-03-10', 'Pending');

-- Insert sample budgets for current fiscal year
INSERT INTO budgets (department_id, fiscal_year, total_amount, remaining_amount) VALUES 
(1, 2024, 500000.00, 450000.00), -- IT Department
(2, 2024, 300000.00, 280000.00), -- Finance Department
(3, 2024, 200000.00, 195000.00), -- HR Department
(4, 2024, 400000.00, 350000.00), -- Facilities Management
(5, 2024, 600000.00, 550000.00), -- Academic Affairs
(6, 2024, 800000.00, 750000.00); -- Research and Development

-- Insert sample catalogs
INSERT INTO catalogs (supplier_id, department_id, catalog_name, description) VALUES 
(1, 1, 'IT Hardware Catalog', 'Computers, servers, networking equipment'),
(1, 1, 'Software Licenses', 'Operating systems, productivity software'),
(2, 2, 'Office Supplies', 'Paper, pens, office furniture'),
(3, 4, 'Facilities Equipment', 'Maintenance tools, cleaning supplies');

-- Insert sample invitation (expires in 7 days)
INSERT INTO invitations (email, first_name, last_name, department_id, role_ids, invitation_token, invited_by, expires_at) VALUES 
('new.user@university.edu', 'New', 'User', 1, ARRAY[1, 2], 'sample_invitation_token_12345', 1, CURRENT_TIMESTAMP + INTERVAL '7 days');

-- ==============================================
-- VIEWS FOR COMMON QUERIES
-- ==============================================

-- View for user information with department and roles
CREATE VIEW user_details AS
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.is_active,
    d.department_name,
    STRING_AGG(r.role_name, ', ') as roles
FROM users u
JOIN departments d ON u.department_id = d.department_id
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.is_active, d.department_name;

-- View for purchase request details
CREATE VIEW purchase_request_details AS
SELECT 
    pr.request_id,
    pr.request_date,
    pr.amount,
    pr.status,
    pr.description,
    CONCAT(u.first_name, ' ', u.last_name) as requester_name,
    d.department_name,
    b.fiscal_year,
    b.remaining_amount as budget_remaining
FROM purchase_requests pr
JOIN users u ON pr.requester_id = u.user_id
JOIN departments d ON u.department_id = d.department_id
LEFT JOIN budgets b ON pr.budget_id = b.budget_id;

-- View for supplier performance
CREATE VIEW supplier_performance AS
SELECT 
    s.supplier_id,
    s.supplier_name,
    s.status,
    COUNT(sr.rating_id) as total_ratings,
    AVG(sr.overall_score) as average_rating,
    MAX(sr.rating_date) as last_rating_date
FROM suppliers s
LEFT JOIN supplier_ratings sr ON s.supplier_id = sr.supplier_id
GROUP BY s.supplier_id, s.supplier_name, s.status;

-- View for invitation details with department and inviter information
CREATE VIEW invitation_details AS
SELECT 
    i.invitation_id,
    i.email,
    i.first_name,
    i.last_name,
    i.status,
    i.expires_at,
    i.created_at,
    i.accepted_at,
    d.department_name,
    CONCAT(inviter.first_name, ' ', inviter.last_name) as invited_by_name,
    inviter.email as invited_by_email,
    STRING_AGG(r.role_name, ', ') as assigned_roles
FROM invitations i
JOIN departments d ON i.department_id = d.department_id
JOIN users inviter ON i.invited_by = inviter.user_id
LEFT JOIN roles r ON r.role_id = ANY(i.role_ids)
GROUP BY i.invitation_id, i.email, i.first_name, i.last_name, i.status, 
         i.expires_at, i.created_at, i.accepted_at, d.department_name, 
         inviter.first_name, inviter.last_name, inviter.email;

-- ==============================================
-- COMMENTS AND DOCUMENTATION
-- ==============================================

COMMENT ON TABLE departments IS 'University departments and organizational units';
COMMENT ON TABLE roles IS 'User roles defining permissions and access levels with budget limits';
COMMENT ON TABLE users IS 'System users including faculty, staff, and administrators';
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON TABLE invitations IS 'User invitation system for onboarding new users with role assignments';
COMMENT ON TABLE suppliers IS 'External suppliers and vendors';
COMMENT ON TABLE supplier_ratings IS 'Performance ratings and feedback for suppliers';
COMMENT ON TABLE catalogs IS 'Product catalogs offered by suppliers to departments';
COMMENT ON TABLE budgets IS 'Departmental budgets for each fiscal year';
COMMENT ON TABLE purchase_requests IS 'Purchase requests submitted by users';
COMMENT ON COLUMN purchase_requests.budget_id IS 'Mandatory budget allocation for this purchase request';
COMMENT ON COLUMN purchase_requests.department_id IS 'Mandatory department assignment for this purchase request';
COMMENT ON COLUMN roles.max_budget_limit IS 'Maximum budget amount this role can approve';
COMMENT ON COLUMN roles.can_approve IS 'Whether this role has approval permissions';
COMMENT ON COLUMN invitations.role_ids IS 'Array of role IDs to assign to the invited user';
COMMENT ON COLUMN invitations.invitation_token IS 'Unique secure token for invitation validation';
COMMENT ON COLUMN invitations.expires_at IS 'Invitation expiration timestamp (typically 7 days)';

-- End of simplified schema creation