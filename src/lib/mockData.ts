import type { Department, Budget, User, PurchaseRequestWithDetails, Supplier } from './supabase';

export const mockDepartments: Department[] = [
    { department_id: 1, department_name: 'Information Technology', created_at: new Date().toISOString() },
    { department_id: 2, department_name: 'Finance', created_at: new Date().toISOString() },
    { department_id: 3, department_name: 'Human Resources', created_at: new Date().toISOString() },
    { department_id: 4, department_name: 'Facilities Management', created_at: new Date().toISOString() },
    { department_id: 5, department_name: 'Academic Affairs', created_at: new Date().toISOString() },
];

export const mockBudgets: Budget[] = [
    { budget_id: 1, department_id: 1, fiscal_year: 2024, total_amount: 500000, remaining_amount: 325000, created_at: new Date().toISOString() },
    { budget_id: 2, department_id: 2, fiscal_year: 2024, total_amount: 250000, remaining_amount: 150000, created_at: new Date().toISOString() },
    { budget_id: 3, department_id: 3, fiscal_year: 2024, total_amount: 100000, remaining_amount: 75000, created_at: new Date().toISOString() },
    { budget_id: 4, department_id: 4, fiscal_year: 2024, total_amount: 300000, remaining_amount: 120000, created_at: new Date().toISOString() },
];

export const mockUsers: User[] = [
    {
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@university.edu',
        password_hash: 'hashed',
        department_id: 1,
        is_active: true,
        created_at: new Date().toISOString()
    },
    {
        user_id: 2,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@university.edu',
        password_hash: 'hashed',
        department_id: 2,
        is_active: true,
        created_at: new Date().toISOString()
    },
    {
        user_id: 3,
        first_name: 'Robert',
        last_name: 'Johnson',
        email: 'robert.j@university.edu',
        password_hash: 'hashed',
        department_id: 1,
        is_active: true,
        created_at: new Date().toISOString()
    },
];

export const mockSuppliers: Supplier[] = [
    {
        supplier_id: 1,
        supplier_name: 'Dell Technologies',
        status: 'Approved',
        onboarding_date: '2023-01-15',
        created_at: new Date().toISOString()
    },
    {
        supplier_id: 2,
        supplier_name: 'Amazon Business',
        status: 'Approved',
        onboarding_date: '2023-03-20',
        created_at: new Date().toISOString()
    },
    {
        supplier_id: 3,
        supplier_name: 'Staples Advantage',
        status: 'Approved',
        onboarding_date: '2023-02-10',
        created_at: new Date().toISOString()
    },
];

export const mockPurchaseRequests: PurchaseRequestWithDetails[] = [
    {
        request_id: 1,
        requester_id: 1,
        request_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        amount: 1250.50,
        status: 'Pending',
        budget_id: 1,
        department_id: 1,
        description: 'New Laptops for IT Staff',
        justification: 'Current laptops are over 5 years old and failing.',
        requester: { first_name: 'John', last_name: 'Doe', email: 'john.doe@university.edu' },
        budget: { department_id: 1, fiscal_year: 2024, remaining_amount: 325000, total_amount: 500000 }
    },
    {
        request_id: 2,
        requester_id: 2,
        request_date: new Date(Date.now() - 86400000 * 5).toISOString(),
        amount: 450.00,
        status: 'Approved',
        budget_id: 2,
        department_id: 2,
        description: 'Office Supplies and Stationery',
        justification: 'Quarterly restock of essential office materials.',
        requester: { first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@university.edu' },
        budget: { department_id: 2, fiscal_year: 2024, remaining_amount: 150000, total_amount: 250000 }
    },
    {
        request_id: 3,
        requester_id: 3,
        request_date: new Date(Date.now() - 86400000 * 1).toISOString(),
        amount: 2800.00,
        status: 'In Progress',
        budget_id: 1,
        department_id: 1,
        description: 'Server Maintenance Contract',
        justification: 'Renewal of annual maintenance for data center servers.',
        requester: { first_name: 'Robert', last_name: 'Johnson', email: 'robert.j@university.edu' },
        budget: { department_id: 1, fiscal_year: 2024, remaining_amount: 325000, total_amount: 500000 }
    },
    {
        request_id: 4,
        requester_id: 1,
        request_date: new Date(Date.now() - 86400000 * 10).toISOString(),
        amount: 15000.00,
        status: 'Completed',
        budget_id: 1,
        department_id: 1,
        description: 'Networking Equipment Upgrade',
        justification: 'Replacing core switches in the main building.',
        requester: { first_name: 'John', last_name: 'Doe', email: 'john.doe@university.edu' },
        budget: { department_id: 1, fiscal_year: 2024, remaining_amount: 325000, total_amount: 500000 }
    }
];
