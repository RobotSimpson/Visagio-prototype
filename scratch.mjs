import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twsrhjobtdarxiaxyrok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3c3Joam9idGRhcnhpYXh5cm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NzgwODgsImV4cCI6MjA5MTQ1NDA4OH0.sSxnmgqnHYWW_NNOExxip82NPMlOkv3rSCxGYD-nEtM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  // Try to fetch one message to see its structure
  const { data: msgs, error: msgsErr } = await supabase
    .from('negotiation_messages')
    .select('*')
    .limit(1);
    
  console.log('Messages Schema/Sample:', msgs, msgsErr);
  
  const { data: negs, error: negsErr } = await supabase
    .from('negotiations')
    .select('*')
    .limit(1);
    
  console.log('Negotiations Schema/Sample:', negs, negsErr);
}

inspectSchema();
