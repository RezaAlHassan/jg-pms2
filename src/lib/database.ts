import { supabase, type Department, type Budget, type Supplier, type PurchaseRequest, type User, type Role, type Invitation, type UserRole } from './supabase';

// Department services
export const departmentService = {
  async getAll(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('department_name');
    
    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
    
    return data || [];
  },

  async getById(id: number): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('department_id', id)
      .single();
    
    if (error) {
      console.error('Error fetching department:', error);
      throw error;
    }
    
    return data;
  },

  async create(department: Omit<Department, 'department_id' | 'created_at' | 'updated_at'>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert([department])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating department:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: number, updates: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('department_id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating department:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('department_id', id);
    
    if (error) {
      console.error('Error deleting department:', error);
      throw error;
    }
  }
};

// Budget services
export const budgetService = {
  async getAll(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('fiscal_year', { ascending: false });
    
    if (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
    
    return data || [];
  },

  async getByDepartment(departmentId: number): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('department_id', departmentId)
      .order('fiscal_year', { ascending: false });
    
    if (error) {
      console.error('Error fetching budgets by department:', error);
      throw error;
    }
    
    return data || [];
  },

  async getById(id: number): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('budget_id', id)
      .single();
    
    if (error) {
      console.error('Error fetching budget:', error);
      throw error;
    }
    
    return data;
  },

  async create(budget: Omit<Budget, 'budget_id' | 'created_at' | 'updated_at'>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .insert([budget])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: number, updates: Partial<Budget>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('budget_id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('budget_id', id);
    
    if (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  },

  async updateRemainingAmount(budgetId: number, newAmount: number): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .update({ remaining_amount: newAmount })
      .eq('budget_id', budgetId);
    
    if (error) {
      console.error('Error updating budget remaining amount:', error);
      throw error;
    }
  }
};

// Supplier services
export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('supplier_name');
    
    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
    
    return data || [];
  },

  async getApproved(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('status', 'Approved')
      .order('supplier_name');
    
    if (error) {
      console.error('Error fetching approved suppliers:', error);
      throw error;
    }
    
    return data || [];
  },

  async getById(id: number): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('supplier_id', id)
      .single();
    
    if (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
    
    return data;
  }
};

// Purchase Request services
export const purchaseRequestService = {
  async getAll(): Promise<PurchaseRequest[]> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        requester:users!requester_id(first_name, last_name, email),
        budget:budgets!budget_id(department_id, fiscal_year, remaining_amount)
      `)
      .order('request_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching purchase requests:', error);
      throw error;
    }
    
    return data || [];
  },

  async getByRequester(requesterId: number): Promise<PurchaseRequest[]> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        requester:users!requester_id(first_name, last_name, email),
        budget:budgets!budget_id(department_id, fiscal_year, remaining_amount)
      `)
      .eq('requester_id', requesterId)
      .order('request_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching purchase requests by requester:', error);
      throw error;
    }
    
    return data || [];
  },

  async getById(id: number): Promise<PurchaseRequest | null> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select(`
        *,
        requester:users!requester_id(first_name, last_name, email),
        budget:budgets!budget_id(department_id, fiscal_year, remaining_amount)
      `)
      .eq('request_id', id)
      .single();
    
    if (error) {
      console.error('Error fetching purchase request:', error);
      throw error;
    }
    
    return data;
  },

  async create(request: Omit<PurchaseRequest, 'request_id' | 'created_at' | 'updated_at'>): Promise<PurchaseRequest> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .insert([request])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating purchase request:', error);
      throw error;
    }
    
    return data;
  },

  async update(id: number, updates: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update(updates)
      .eq('request_id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating purchase request:', error);
      throw error;
    }
    
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('purchase_requests')
      .delete()
      .eq('request_id', id);
    
    if (error) {
      console.error('Error deleting purchase request:', error);
      throw error;
    }
  }
};

// User services
export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('first_name');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data || [];
  },

  async getById(id: number): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
    
    return data;
  },

  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
    
    return data;
  },

  async create(user: Omit<User, 'user_id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    return data;
  },

  async getByDepartment(departmentId: number): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('department_id', departmentId)
      .order('first_name');
    
    if (error) {
      console.error('Error fetching users by department:', error);
      throw error;
    }
    
    return data || [];
  },

  async update(id: number, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return data;
  },

  async assignRole(userId: number, roleId: number): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .insert([{ user_id: userId, role_id: roleId }]);
    
    if (error) {
      console.error('Error assigning role to user:', error);
      throw error;
    }
  }
};

// Role services
export const roleService = {
  async getAll(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('role_name');
    
    if (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
    
    return data || [];
  },

  async getById(id: number): Promise<Role | null> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('role_id', id)
      .single();
    
    if (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
    
    return data;
  }
};

// Invitation services
export const invitationService = {
  async getByToken(token: string): Promise<Invitation | null> {
    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        department_id:departments!department_id(department_id, department_name),
        invited_by:users!invited_by(user_id, first_name, last_name)
      `)
      .eq('invitation_token', token)
      .single();
    
    if (error) {
      console.error('Error fetching invitation by token:', error);
      throw error;
    }
    
    return data;
  },

  async updateStatus(token: string, status: 'Pending' | 'Accepted' | 'Expired' | 'Cancelled'): Promise<void> {
    const { error } = await supabase
      .from('invitations')
      .update({ 
        status,
        accepted_at: status === 'Accepted' ? new Date().toISOString() : null
      })
      .eq('invitation_token', token);
    
    if (error) {
      console.error('Error updating invitation status:', error);
      throw error;
    }
  }
};

// Utility functions
export const dbUtils = {
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  },

  async initializeSampleData(): Promise<void> {
    try {
      // Check if data already exists
      const { data: deptCount } = await supabase
        .from('departments')
        .select('count')
        .limit(1);
      
      if (deptCount && deptCount.length > 0) {
        console.log('Sample data already exists');
        return;
      }

      // Insert sample departments
      const { error: deptError } = await supabase
        .from('departments')
        .insert([
          { DepartmentName: 'Information Technology' },
          { DepartmentName: 'Finance' },
          { DepartmentName: 'Human Resources' },
          { DepartmentName: 'Facilities Management' },
          { DepartmentName: 'Academic Affairs' },
          { DepartmentName: 'Research and Development' }
        ]);

      if (deptError) {
        console.error('Error inserting departments:', deptError);
        throw deptError;
      }

      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }
};
