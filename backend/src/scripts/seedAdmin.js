const db = require('../models');
const User = db.User;
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        console.log('Veritabanına bağlanılıyor...');

        await db.sequelize.sync();

        const adminExists = await User.findOne({ where: { email: 'admin@test.com' } });

        if (adminExists) {
            console.log('Admin kullanıcısı zaten mevcut.');
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 8);

        await User.create({
            username: 'admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'Admin'
        });

        console.log('Admin kullanıcısı başarıyla oluşturuldu!');
        console.log('Email: admin@test.com');
        console.log('Şifre: admin123');
    } catch (error) {
        console.error('Hata oluştu:', error);
    } finally {
        await db.sequelize.close();
        process.exit();
    }
}

seedAdmin();
