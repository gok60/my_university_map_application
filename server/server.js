require('dotenv').config();
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto     = require('crypto');
console.log('EMAIL_HOST=', process.env.EMAIL_HOST);
console.log('EMAIL_PORT=', process.env.EMAIL_PORT);
console.log('EMAIL_SECURE=', process.env.EMAIL_SECURE);
const app = express();
const port = 8000;



// JWT doğrulama fonksiyonu
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Admin rolünü doğrulama middleware'i
function authenticateAdmin(req, res, next) {
    authenticateToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ success: false, message: 'Yetkisiz: Sadece adminler bu işlemi gerçekleştirebilir.' });
        }
    });
}

// CORS ayarları
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
const multer = require('multer');
// storage ayarı — önceki örnekteki gibi
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, 'uploads', 'events')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });
// Middleware ayarları
app.use(bodyParser.json());
app.use(cors());
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.user = payload;    // artık req.user.id, req.user.role, req.user.email var
    next();
  });
}
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
const client = new Client({
    user:     process.env.PGUSER,  
    host:     process.env.PGHOST,    
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port:     parseInt(process.env.PGPORT, 10), 
  });

client.connect()
    .then(() => console.log('Veritabanına bağlanıldı!'))
    .catch(err => console.error('Bağlantı hatası:', err.stack));

// Statik dosyalara (HTML, CSS, JS) erişim sağla
app.use(express.static(path.join(__dirname, 'public')));


// Kayıt & Aktivasyon E-postası
app.post('/api/register', async (req, res) => {
    const { username, password, role, name, surname, email, community,student_no } = req.body;
    if (!username || !password || !role || !name || !surname || !email|| !community|| !student_no) {
      return res.status(400).json({ success:false, message:'Tüm alanlar gereklidir.' });
    }
  
    // 1) Benzersiz kontrol
    const { rows } = await client.query(
      'SELECT 1 FROM users WHERE username=$1 OR email=$2',
      [username, email]
    );
    if (rows.length) {
      return res.status(400).json({ success:false, message:'Kullanıcı veya email zaten kayıtlı.' });
    }
  
    // 2) Şifreyi hash’le
    const hashed = await bcrypt.hash(password, saltRounds);
    // 3) Aktivasyon kodu
    const code = crypto.randomBytes(16).toString('hex');
    // 4) DB’ye kaydet
       await client.query(
       `INSERT INTO users
       (username, password, role, name, surname, email, activation_code, community, student_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
       [username, hashed, role, name, surname, email, code, community, student_no]
      );
  
    // 5) transporter’ı kur
    let transporter, mailFrom;
    if (process.env.NODE_ENV === 'development') {
      // --- DEVELOPMENT: Ethereal ---
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      mailFrom = `"Hacettepe GIS (Test)" <${testAccount.user}>`;
    } else {
      // --- PRODUCTION: Üniversite SMTP ---
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,             // smtp.gmail.com
        port: parseInt(process.env.EMAIL_PORT, 10),  // 587
        secure: process.env.EMAIL_SECURE === 'true', // false => STARTTLS
        auth: {
          user: process.env.EMAIL_USER,           // haritahacettepe@gmail.com
          pass: process.env.EMAIL_PASS            // uygulama şifresi
        }
      });
      mailFrom = `"Hacettepe GIS" <${process.env.EMAIL_USER}>`;
    }
  
    // 6) Mail içeriği ve gönderim
    const verifyLink = `${process.env.SERVER_URL}/api/verify/${code}`;
    const info = await transporter.sendMail({
      from:    mailFrom,
      to:      email,
      subject: 'Hesabınızı doğrulayın',
      html:    `<p>Merhaba ${name},</p>
                <p>Hesabınızı aktifleştirmek için <a href="${verifyLink}">buraya tıklayın</a>.</p>`
    });
  
    // 7) Yanıt
    const response = {
      success: true,
      message: 'Kayıt başarılı! Aktivasyon e-postası gönderildi.'
    };
    if (process.env.NODE_ENV === 'development') {
      // Ethereal’da preview URL’i dönmek çok faydalı
      response.previewURL = nodemailer.getTestMessageUrl(info);
    }
  
    res.status(201).json(response);
  });
// Kullanıcı Giriş Endpoint'i
// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      code: 'login_missing_fields',
      message: 'E-posta ve parola gerekli.'
    });
  }

  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'login_failed',
        message: 'Kullanıcı bulunamadı.'
      });
    }

    const user = result.rows[0];

    // 1) E-posta doğrulandı mı?
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        code: 'login_email_not_verified',
        message: 'E-posta adresiniz doğrulanmadı. Lütfen mailinizi kontrol edin.'
      });
    }

    // 2) Supervisor onayı (is_verified) var mı?
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        code: 'login_not_approved',
        message: 'Hesabınız supervisor onayı bekliyor.'
      });
    }

    // 3) Parola kontrolü
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        code: 'login_failed',
        message: 'Şifre yanlış.'
      });
    }

    // 4) Token oluştur
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      username: user.username
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      code: 'login_error',
      message: 'Sunucu hatası.'
    });
  }
});
// --- Kullanıcı Onaylama (is_verified = TRUE) ---
app.put(
  '/api/users/:id/verify',
  authenticateSupervisor,              // veya authorizeAdminOrSupervisor
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await client.query(
        'UPDATE users SET is_verified = TRUE WHERE id = $1 RETURNING *',
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      }
      res.json({ success: true, message: 'Kullanıcı onaylandı.', user: result.rows[0] });
    } catch (err) {
      console.error('Verify error:', err);
      res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
  }
);

// --- Kullanıcı Onayını Kaldırma (is_verified = FALSE) ---
app.put(
  '/api/users/:id/unverify',
  authenticateSupervisor,              // veya authorizeAdminOrSupervisor
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await client.query(
        'UPDATE users SET is_verified = FALSE WHERE id = $1 RETURNING *',
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
      }
      res.json({ success: true, message: 'Onay kaldırıldı.', user: result.rows[0] });
    } catch (err) {
      console.error('Unverify error:', err);
      res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
  }
);

// GET /api/verify/:code
app.get('/api/verify/:code', async (req, res) => {
  const { code } = req.params;

  try {
    // activation_code eşleşen satırı sadece email_verified olarak işaretle
    const result = await client.query(
      `UPDATE users
         SET email_verified = TRUE,
             activation_code = NULL
       WHERE activation_code = $1
       RETURNING id`,
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(400).send('Geçersiz veya süresi dolmuş kod.');
    }

    res.send(
      'E-postanız doğrulandı! ' +
      'Supervisor onayı bekleniyor; onaylandığında giriş yapabilirsiniz.'
    );
  } catch (err) {
    console.error('Email verify error:', err);
    res.status(500).send('Sunucu hatası.');
  }
});

  
app.get('/api/users', async (req, res) => {
  try {
      const result = await client.query(
     `SELECT
        id,
        name,
        surname,
        email,
        role,
        is_verified,
        community,
        student_no
        FROM users
        ORDER BY id`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Kullanıcı listesi alınırken hata:', err);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

app.get('/api/hatalar', authorizeAdminOrSupervisor, async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        h.id,
        u.name    AS creator_name,
        u.surname AS creator_surname,
        h.isim_soyisim,
        h.hata_turu,
        h.aciklama,
        ST_X(h.geom) AS longitude,
        ST_Y(h.geom) AS latitude
      FROM hata_noktalar h
      JOIN users u ON h.user_id = u.id
      ORDER BY h.id;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Hatalar alınırken sorun:', error);
    res.status(500).json({ success: false, error: 'Veri alınırken sorun.' });
  }
});


// Kullanıcı silme endpoint’i
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }
    return res.json({ success: true, message: 'Kullanıcı silindi.' });
  } catch (err) {
    console.error('Kullanıcı silme hatası:', err);
    return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});
// Rol Güncelleme
app.put('/api/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Artık 'normal' de dahil
  const allowed = ['normal', 'admin', 'supervisor'];
  if (!allowed.includes(role)) {
    return res
      .status(400)
      .json({ success: false, message: 'Geçersiz rol.' });
  }

  try {
    await client.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, id]
    );
    return res.json({ success: true, message: 'Rol başarıyla güncellendi.' });
  } catch (err) {
    console.error('Role update hatası:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Sunucu hatası.' });
  }
});
// server.js

// … diğer import’lar, client.connect(), requireAuth vs. — ya da hiç auth istemiyorsanız olduğu gibi

// Hesap Onaylama (is_verified = TRUE)
app.put('/api/users/:id/verify',authenticateSupervisor, async (req, res) => {
  const { id } = req.params;
  try {
    await client.query(
      'UPDATE users SET is_verified = TRUE WHERE id = $1',
      [id]
    );
    res.json({ success: true, message: 'Kullanıcı onaylandı.' });
  } catch (err) {
    console.error('Verify hatası:', err);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Hata Ekleme Endpoint'i - Sadece Adminler İçin
// server.js
app.post(
  '/api/hatalar',
  authenticateAdmin,
  async (req, res) => {
    const creatorId = req.user.id;            // JWT içinden gelen kullanıcı id
    const { isim_soyisim, hata_turu, aciklama, latitude, longitude } = req.body;

    // … alan kontrolü …

    const insertSql = `
      INSERT INTO hata_noktalar
        (user_id, isim_soyisim, hata_turu, aciklama, geom)
      VALUES
        ($1,      $2,          $3,        $4,       ST_SetSRID(ST_MakePoint($5,$6),4326))
      RETURNING *;
    `;
    const params = [ creatorId, isim_soyisim, hata_turu, aciklama, longitude, latitude ];

    try {
      const { rows } = await client.query(insertSql, params);
      res.status(201).json({ success: true, hata: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Hata eklenirken sorun.' });
    }
  }
);

// Hata Güncelleme Endpoint'i
app.put('/api/hatalar/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { isim_soyisim, hata_turu, aciklama, latitude, longitude } = req.body;

    if (!isim_soyisim || !hata_turu || !aciklama || latitude == null || longitude == null) {
        return res.status(400).json({ success: false, message: 'Tüm alanlar gereklidir.' });
    }

    try {
        const result = await client.query(
            'UPDATE hata_noktalar SET isim_soyisim = $1, hata_turu = $2, aciklama = $3, geom = ST_SetSRID(ST_MakePoint($4, $5), 4326) WHERE id = $6',
            [isim_soyisim, hata_turu, aciklama, longitude, latitude, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Hata bulunamadı.' });
        }

        res.status(200).json({ success: true, message: 'Hata başarıyla güncellendi.' });
    } catch (error) {
        console.error('Hata güncellenirken bir sorun oluştu:', error);
        res.status(500).json({ success: false, message: 'Güncelleme sırasında hata oluştu.' });
    }
});

// Hata Silme Endpoint'i - Sadece Adminler İçin
app.delete('/api/hatalar/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query('DELETE FROM hata_noktalar WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Hata bulunamadı.' });
        }

        res.json({ success: true, message: 'Hata başarıyla silindi.' });
    } catch (error) {
        console.error('Hata silinirken bir sorun oluştu:', error);
        res.status(500).json({ success: false, error: 'Hata silinirken bir sorun oluştu.' });
    }
});

// ======= Birimler Tablosu İçin CRUD Endpoint'leri =======

// Tüm birimleri almak için GET endpoint'i
app.get('/api/birimler', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        id,
        name,
        description,
        website,
        telefon,
        ST_X(geom) AS longitude,
        ST_Y(geom) AS latitude
      FROM birimler
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Birimler alınırken bir sorun oluştu:', error);
    res.status(500).json({ success: false, error: 'Veri alınırken bir sorun oluştu.' });
  }
});
// server.js içinde, diğer middleware’lerin yanına
function authorizeAdminOrSupervisor(req, res, next) {
  authenticateToken(req, res, () => {
    const role = req.user.role;
    if (role === 'admin' || role === 'supervisor') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Yetkisiz: Sadece admin ve supervisor rollerine sahip kullanıcılar bu işlemi gerçekleştirebilir.'
    });
  });
}

function authenticateSupervisor(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user.role === 'supervisor') {
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: 'Yetkisiz: Sadece supervisor rolündekiler bu işlemi yapabilir.' });
    }
  });
}
// Yeni birim eklemek için POST endpoint'i (Sadece adminler)
app.post(
  '/api/birimler',
  authenticateSupervisor,
  async (req, res) => {
    const { name, description, latitude, longitude, website, telefon } = req.body;
    if (!name || !description || latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ success: false, message: 'Name, description, latitude ve longitude alanları gereklidir.' });
    }
    try {
      const result = await client.query(
        `INSERT INTO birimler
           (name, description, geom, website, telefon)
         VALUES
           ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6)
         RETURNING
           id, name, description, website, telefon,
           ST_Y(geom) AS latitude, ST_X(geom) AS longitude`,
        [name, description, longitude, latitude, website, telefon]
      );
      res.status(201).json({
        success: true,
        message: 'Birim başarıyla eklendi.',
        birim: result.rows[0]
      });
    } catch (error) {
      console.error('Birim eklenirken hata:', error);
      res.status(500).json({ success: false, message: 'Birim eklenirken bir sorun oluştu.' });
    }
  }
);

// Mevcut birimi güncellemek için PUT endpoint'i (Sadece adminler)
app.put(
  '/api/birimler/:id',
  authenticateSupervisor,
  async (req, res) => {
    const { id } = req.params;
    const { name, description, latitude, longitude, website, telefon } = req.body;
    if (!name || !description || latitude == null || longitude == null) {
      return res
        .status(400)
        .json({ success: false, message: 'Name, description, latitude ve longitude alanları gereklidir.' });
    }
    try {
      const result = await client.query(
        `UPDATE birimler SET
           name        = $1,
           description = $2,
           geom        = ST_SetSRID(ST_MakePoint($3, $4), 4326),
           website     = $5,
           telefon     = $6
         WHERE id = $7`,
        [name, description, longitude, latitude, website, telefon, id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Birim bulunamadı.' });
      }
      res.json({ success: true, message: 'Birim başarıyla güncellendi.' });
    } catch (error) {
      console.error('Birim güncellenirken hata:', error);
      res.status(500).json({ success: false, message: 'Birim güncellenirken bir sorun oluştu.' });
    }
  }
);
app.delete(
  '/api/birimler/:id',
  authenticateSupervisor,
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await client.query(
        'DELETE FROM birimler WHERE id = $1',
        [id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Birim bulunamadı.' });
      }
      res.json({ success: true, message: 'Birim başarıyla silindi.' });
    } catch (error) {
      console.error('Birim silinirken hata:', error);
      res.status(500).json({ success: false, message: 'Birim silinirken bir sorun oluştu.' });
    }
  }
);
// ======= Etkinlikler Tablosu İçin CRUD Endpoint'leri =======
// server.js (veya routes/events.js)

app.get('/api/events', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT
        e.id,
        u.name   AS creator_name,
        u.surname AS creator_surname,
        e.title, 
        e.date,
        e.time,
        e.location,
        e.event_type,
        e.description,
        image_path,
        ST_X(e.geom) AS longitude,
        ST_Y(e.geom) AS latitude
      FROM events e
      JOIN users u ON e.user_id = u.id
      ORDER BY e.date DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ success:false, message:'Server error.' });
  }
});
// POST /api/events
app.post(
  '/api/events',
  authenticateToken,
  authenticateAdmin,
  upload.single('image'),
  async (req, res) => {
    const creatorId = req.user.id;
    const {
      title,
      date,
      time,
      location,
      event_type,
      contact_info,
      description,
      website,
      latitude,
      longitude
    } = req.body;

    // required fields check (time optional)
    if (!title || !date || !location || !event_type || !contact_info || !description
        || latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const imagePath = req.file ? `/uploads/events/${req.file.filename}` : null;

    const sql = `
      INSERT INTO events
        (user_id, title, date, time, location, event_type, contact_info,
         description, website, geom, image_path)
      VALUES
        ($1,        $2,    $3,  $4,     $5,       $6,         $7,
         $8,         $9,     ST_SetSRID(ST_MakePoint($10,$11),4326), $12)
      RETURNING *;
    `;
    const params = [
      creatorId, title, date, time || null, location,
      event_type, contact_info, description,
      website || null, longitude, latitude, imagePath
    ];

    try {
      const result = await client.query(sql, params);
      res.status(201).json({ success: true, event: result.rows[0] });
    } catch (err) {
      console.error('Insert event error:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// PUT /api/events/:id
app.put(
  '/api/events/:id',
  authenticateToken,
  authenticateAdmin,
  upload.single('image'),
  async (req, res) => {
    const { id } = req.params;
    const {
      title,
      date,
      time,
      location,
      event_type,
      contact_info,
      description,
      website,
      latitude,
      longitude
    } = req.body;

    if (!title || !date || !location || !event_type || !contact_info ||
        !description || latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // build dynamic SQL if image included
    let sql = `
      UPDATE events SET
        title         = $1,
        date          = $2,
        time          = $3,
        location      = $4,
        event_type    = $5,
        contact_info  = $6,
        description   = $7,
        website       = $8,
        geom          = ST_SetSRID(ST_MakePoint($9,$10),4326)
    `;
    const params = [ title, date, time||null, location, event_type,
                     contact_info, description, website||null,
                     longitude, latitude ];
    if (req.file) {
      sql += `, image_path = $11`;
      params.push(`/uploads/events/${req.file.filename}`);
    }
    params.push(id);
    sql += ` WHERE id = $${params.length}`;

    try {
      const result = await client.query(sql, params);
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
      }
      res.json({ success: true, message: 'Event updated.' });
    } catch (err) {
      console.error('Update event error:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// DELETE /api/events/:id
app.delete(
  '/api/events/:id',
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await client.query('DELETE FROM events WHERE id=$1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
      }
      res.json({ success: true, message: 'Event deleted.' });
    } catch (err) {
      console.error('Delete event error:', err);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// Otomatik silme görevi
cron.schedule('0 0 * * *', async () => { // Her gün saat 00:00'da çalışır
    const deleteQuery = `
        DELETE FROM events
        WHERE Tarih <= NOW() - INTERVAL '2 days'
        RETURNING *;
    `;
    
    try {
        const result = await client.query(deleteQuery);
        if (result.rowCount > 0) {
            console.log(`${result.rowCount} etkinlik silindi.`);
        } else {
            console.log('Silinecek etkinlik bulunamadı.');
        }
    } catch (error) {
        console.error('Etkinlik silinirken bir hata oluştu:', error);
    }
}, {
    timezone: "Europe/Istanbul" // İhtiyacınıza göre zaman dilimini ayarlayın
});
// Sunucuyu başlat
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
