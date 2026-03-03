-- 1. Inserir o usuário na tabela de Autenticação com senha criptografada (admin2025)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, confirmation_token, email_change, 
    email_change_token_new, recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@bethel.com',
    crypt('admin2025', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Admin","last_name":"Bethel"}',
    now(),
    now(),
    '', '', '', ''
)
ON CONFLICT (email) DO NOTHING;

-- 2. Garantir que o perfil foi criado e é administrador
INSERT INTO public.profiles (id, first_name, last_name, is_admin)
SELECT id, 'Admin', 'Bethel', true 
FROM auth.users 
WHERE email = 'admin@bethel.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true;
