function getHeaders() {
  return {
    'apikey': process.env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };
}

function getBaseUrl() {
  return `${process.env.SUPABASE_URL}/rest/v1`;
}

module.exports = { getHeaders, getBaseUrl };
