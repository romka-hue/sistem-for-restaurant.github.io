const { Client } = require('pg');

async function setupDatabase() {
    // Connect to postgres database to create our database
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres', // Change if your password is different
        database: 'postgres'
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL');

        // Create database if not exists
        await client.query(`
            SELECT 'CREATE DATABASE restaurant_db'
            WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'restaurant_db')
        `).catch(() => {});
        
        try {
            await client.query('CREATE DATABASE restaurant_db');
            console.log('✅ Database "restaurant_db" created');
        } catch (err) {
            if (err.code === '42P04') {
                console.log('✅ Database "restaurant_db" already exists');
            } else {
                throw err;
            }
        }

        await client.end();

        // Now connect to restaurant_db and create tables
        const dbClient = new Client({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'postgres',
            database: 'restaurant_db'
        });

        await dbClient.connect();
        console.log('Connected to restaurant_db');

        // Create tables
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS reservations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                date DATE NOT NULL,
                time TIME NOT NULL,
                guests INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                items JSONB NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✅ Tables created successfully');

        // Create default admin user
        const bcrypt = require('bcrypt');
        const hash = await bcrypt.hash('admin123', 10);
        
        try {
            await dbClient.query(
                'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
                ['admin@restaurant.com', hash, 'admin']
            );
            console.log('✅ Admin user created: admin@restaurant.com / admin123');
        } catch (err) {
            if (err.code === '23505') {
                console.log('✅ Admin user already exists');
            }
        }

        // Create default staff user
        const staffHash = await bcrypt.hash('staff123', 10);
        try {
            await dbClient.query(
                'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
                ['staff@restaurant.com', staffHash, 'staff']
            );
            console.log('✅ Staff user created: staff@restaurant.com / staff123');
        } catch (err) {
            if (err.code === '23505') {
                console.log('✅ Staff user already exists');
            }
        }

        await dbClient.end();
        console.log('\n🎉 Database setup complete!\n');
        console.log('Default accounts:');
        console.log('  Admin: admin@restaurant.com / admin123');
        console.log('  Staff: staff@restaurant.com / staff123\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

setupDatabase();
