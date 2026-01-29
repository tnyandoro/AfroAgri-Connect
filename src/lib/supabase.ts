import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://eazfndlblozmgdsmzetx.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjQzMzQ3OTRkLTZlYjQtNGIzNi1hOWFlLWRlMDU2ZjNjNzQzMiJ9.eyJwcm9qZWN0SWQiOiJlYXpmbmRsYmxvem1nZHNtemV0eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5NjcwODc4LCJleHAiOjIwODUwMzA4NzgsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.W2w6y4Ren1dcFbpZUH-PJ9aMqDY3wMT_zWGtRSSSWmg';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };