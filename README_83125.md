# Build Plan: Account Type Differentiation & Landing Pages

## **Phase 1: Database Schema & User Setup**

### **1.1 Database Migration**
```sql
-- Add account_type column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN account_type VARCHAR(20) DEFAULT 'artist'
CHECK (account_type IN ('admin', 'artist', 'manager', 'label'));

-- Set specific account types
UPDATE user_profiles 
SET account_type = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'brennan.tharaldson@gmail.com'
);

UPDATE user_profiles 
SET account_type = 'artist' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'feedbacklooploop@gmail.com'
);
```

### **1.2 RLS Policy Updates**
```sql
-- Allow admins to read all user profiles for admin dashboard
CREATE POLICY "Admins can read all user profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND account_type = 'admin'
  )
);
```

---

## **Phase 2: Backend API Development**

### **2.1 New Admin Endpoint**
- **Route**: `GET /api/admin/users`
- **Middleware**: Admin-only access validation
- **Query**: Join `auth.users` + `user_profiles` for complete user data
- **Response**: Array of `{first_name, last_name, account_type, email, created_at}`

### **2.2 Schema Updates**
```typescript
// Add to schemas.ts
export const AdminUserListSchema = z.array(z.object({
  first_name: z.string().nullable(),
  last_name: z.string().nullable(), 
  account_type: z.enum(['admin', 'artist', 'manager', 'label']),
  email: z.string().email(),
  created_at: z.string().datetime()
}));
```

---

## **Phase 3: Frontend Components**

### **3.1 AdminDashboard Component**
```typescript
// New file: AdminDashboard.tsx
- Header with welcome message and date/time
- 2-column grid layout:
  - Left: UserCountTable component
  - Right: Existing ApiStatus + Error test components
```

### **3.2 UserCountTable Component**
```typescript
// New file: UserCountTable.tsx
- shadcn/ui Table component
- Columns: Name, Account Type, Email
- Total user count display
- Loading/error states
```

### **3.3 useUserProfile Hook**
```typescript
// New file: useUserProfile.ts
- TanStack Query hook
- Fetches current user's profile data
- User-scoped caching with user ID
- Returns account_type for routing logic
```

---

## **Phase 4: Navigation & Routing Logic**

### **4.1 Index.tsx Updates**
```typescript
// Updated routing logic in renderActiveSection()
const { user } = useAuth();
const { data: userProfile, isLoading } = useUserProfile();

// Show loading while fetching user profile
if (isLoading) return <DashboardSkeleton />;

// Route based on account type
if (userProfile?.account_type === 'admin') {
  // Admin users: Dashboard tab shows AdminDashboard
  switch (navigation.activeSection) {
    case "dashboard":
      return <AdminDashboard />;
    // ... other admin routes
  }
} else {
  // Artist users: No dashboard, default to releases
  if (!navigation.activeSection || navigation.activeSection === 'dashboard') {
    navigation.setActiveSection('releases');
    return <ReleaseCalendar />;
  }
  
  switch (navigation.activeSection) {
    case "releases":
      return <ReleaseCalendar />;
    // ... other artist routes (no dashboard case)
  }
}
```

### **4.2 Navigation Component Updates**
```typescript
// Update Navigation.tsx navItems based on account type
const { data: userProfile } = useUserProfile();

const getNavItems = () => {
  if (userProfile?.account_type === 'admin') {
    return [
      { id: "dashboard", label: "Admin Dashboard", icon: Home },
      { id: "releases", label: "Release Manager", icon: Calendar },
      // ... other nav items
    ];
  } else {
    return [
      // No dashboard item for artists
      { id: "releases", label: "Release Manager", icon: Calendar },
      { id: "content", label: "Content Creator", icon: Video },
      // ... other nav items
    ];
  }
};
```

---

## **Phase 5: User Experience Flow**

### **5.1 Admin User (brennan.tharaldson@gmail.com)**
1. **Login** → Authentication successful
2. **Profile Fetch** → `useUserProfile()` returns `account_type: 'admin'`
3. **Default Landing** → Dashboard tab active, shows `AdminDashboard`
4. **AdminDashboard Content**:
   - User count table with both users
   - Backend API status monitoring
   - Error handler testing tools

### **5.2 Artist User (feedbacklooploop@gmail.com)**
1. **Login** → Authentication successful  
2. **Profile Fetch** → `useUserProfile()` returns `account_type: 'artist'`
3. **Auto-Redirect** → `navigation.setActiveSection('releases')`
4. **Landing Page** → Release Manager tab active, shows `ReleaseCalendar`
5. **Navigation** → No Dashboard tab visible in sidebar

---

## **Phase 6: Testing & Validation**

### **6.1 Admin Access Testing**
- Login as brennan.tharaldson@gmail.com
- Verify AdminDashboard loads with user table
- Confirm admin can see both user accounts
- Test API status and error handlers work

### **6.2 Artist Access Testing**  
- Login as feedbacklooploop@gmail.com
- Verify automatic redirect to Release Calendar
- Confirm no Dashboard tab in navigation
- Ensure artist cannot access admin endpoints

---

## **Implementation Order & Timeline**

### **Day 1 (4-5 hours)**
1. Database migration + user account setup (30 min)
2. Backend admin endpoint + schemas (2 hours)
3. useUserProfile hook creation (1 hour)
4. Index.tsx routing logic updates (1.5 hours)

### **Day 2 (3-4 hours)**
1. AdminDashboard component (2 hours)
2. UserCountTable component (1 hour)
3. Navigation updates for account types (1 hour)
4. Testing both user flows (1 hour)

---

## **Key Technical Considerations**

### **Security**
- Admin endpoints protected by account_type validation
- RLS policies prevent artists from accessing admin data
- User profile data cached with proper user scoping

### **UX Flow**
- Seamless routing based on account type
- No manual navigation required for artists
- Admin gets full system visibility
- Loading states during profile fetch

### **Scalability**
- Account type system ready for manager/label types
- Navigation system can easily add/remove tabs per account type
- Admin dashboard can be extended with more system metrics

This plan provides clear account differentiation with minimal complexity while setting up a scalable foundation for future account types.