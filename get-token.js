const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:leo%40ABC2025%21%21@localhost:5432/university' });
client.connect()
  .then(() => client.query("SELECT email, \"emailVerificationToken\" FROM users WHERE email='judith@gmail.com'"))
  .then(res => {
    console.log(res.rows[0]);
    client.end();
  })
  .catch(console.error);
