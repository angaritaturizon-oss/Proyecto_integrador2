const pool = require('./pool');

async function testConnection() {
    try {
        const result = await pool.query(
            'SELECT current_database() AS database_name, NOW() AS server_time'
        );

        console.log('Conexión exitosa:', result.rows[0]);
    } catch (error) {
        console.error('Error de conexión:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

testConnection();