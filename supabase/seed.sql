-- ==============================================================================
-- STAYSYNC PG SAAS DEMO SEED DATA
-- Fictional dataset for Urban Nest PG, Green View PG, and Blue Haven PG
-- ==============================================================================

-- 1. Insert Subscription Plans
INSERT INTO subscription_plans (id, name, display_name, price_monthly, price_yearly, max_properties, max_beds, max_tenants, max_staff, features)
VALUES 
('STARTER', 'STARTER', 'Starter Plan', 999.00, 9990.00, 1, 50, 50, 2, '["1 Property", "Up to 50 Beds", "Standard Reports", "Email Notifications"]'::jsonb),
('GROWTH', 'GROWTH', 'Growth Plan', 2499.00, 24990.00, 5, 300, 300, 10, '["5 Properties", "Up to 300 Beds", "Visual Room Map", "Automated Billing", "SMS & WhatsApp Ready"]'::jsonb),
('PRO', 'PRO', 'Pro Enterprise', 4999.00, 49990.00, 9999, 9999, 9999, 9999, '["Unlimited Properties", "Unlimited Beds", "Multi-Manager Access", "Advanced Financial Analytics", "Custom Integrations"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Demo Organization
INSERT INTO organizations (id, name, slug, phone, email, address, currency, timezone, rent_due_day, late_fee_amount, receipt_prefix, subscription_plan_id)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Prime Living Hospitality',
  'prime-living',
  '+91 98765 43210',
  'owner@primeliving.com',
  '1204 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
  'INR',
  'Asia/Kolkata',
  5,
  250.00,
  'REC',
  'GROWTH'
) ON CONFLICT (id) DO NOTHING;

-- 3. Demo Owner & Manager Profiles
INSERT INTO profiles (id, organization_id, email, full_name, phone, role)
VALUES 
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'hari@primeliving.com', 'Hari Prasad', '+91 98765 00001', 'OWNER'),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'rajesh@primeliving.com', 'Rajesh Sharma', '+91 98765 00002', 'MANAGER'),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'arun.tenant@gmail.com', 'Arun Kumar', '+91 98765 00003', 'TENANT')
ON CONFLICT (id) DO NOTHING;

-- 4. Demo Properties
INSERT INTO properties (id, organization_id, name, code, address, city, state, pincode, phone, email, manager_id)
VALUES 
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Urban Nest PG', 'UN-01', 'Plot 42, 4th Cross, Koramangala 5th Block', 'Bengaluru', 'Karnataka', '560034', '+91 98765 11001', 'urbannest@primeliving.com', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Green View PG', 'GV-02', 'Tower B, Outer Ring Road, Bellandur', 'Bengaluru', 'Karnataka', '560103', '+91 98765 11002', 'greenview@primeliving.com', 'b0000000-0000-0000-0000-000000000002'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Blue Haven PG', 'BH-03', '15th Main, HSR Layout Sector 4', 'Bengaluru', 'Karnataka', '560102', '+91 98765 11003', 'bluehaven@primeliving.com', 'b0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
