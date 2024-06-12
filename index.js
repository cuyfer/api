const express = require('express')
// const mysql = require('mysql')
const cors = require('cors')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')

const app = express()
const port = 9000

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_asuse',
    password: '6sxkZF&BPWNbv$M',
    database: 'freedb_s_artikel'
});

db.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + db.threadId);
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "member")  
    },
    filename: function (req, file, cb) {
        const tanggal = new Date();
        const format = tanggal.getDate() + '-' + (tanggal.getMonth() + 1) + '-' + tanggal.getFullYear() + '-' + tanggal.getHours() + ':' + tanggal.getMinutes();
        cb(null, format + '-' +  file.originalname.replace(/\s+/g, '-'))  
    }
});


const upload = multer({ storage: storage });






const keamanan = (req, res, next)=>{
    const api = req.query.key
    const key = 'dyfas'
    if(api === key){
        next()
    }else{
        res.status(403).json({ Failed: "Failed!" })
    }
}

app.get('/api/v1/member', keamanan, (req,res)=>{
    const query = "SELECT * FROM member"
    db.query(query,(err, hasil)=>{
        if(err){
            res.status(500).json({Gagal : err})
            return
        }
        res.json(hasil)
    })
})



app.get('/api/v1/projek', keamanan, (req, res)=>{
    const query = "SELECT * FROM projek"
    db.query(query, (err, hasil)=>{
        if(err){
            res.status(500).json({ Gagal: err })
            return
        }
        res.json(hasil)
    })
})



app.get('/api/v1/member/:filename', (req, res) => {
    const filename = req.params.filename; // Perbaikan di sini
    const filePath = path.join(__dirname, 'member', filename);
    
    // Cek apakah file ada sebelum mengirimkannya
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('File not found or error:', err);
            res.status(404).send('File not found');
        } else {
            console.log('Sent:', filename);
        }
    });
});



app.post('/api/v1/post',keamanan, upload.single('foto'), (req, res)=>{
    try {
        if (!req.file) {
            return res.status(400).send('Tidak ada file yang diunggah.');
        }

        const { nama, des } = req.body;
        const foto = req.file.path;

        const query = 'INSERT INTO member (nama, des, foto) VALUES (?, ?, ?)';
        db.query(query, [nama, des, foto], (err, result) => {
            if (err) {
                console.error('Kesalahan saat menyisipkan data:', err);
                res.status(500).send('Kesalahan Server Internal');
                return;
            }
            res.status(200).json({ Berhasil: `Success ${result.insertId}` });
        });
    } catch (error) {
        console.error('Kesalahan server:', error);
        res.status(500).send('Kesalahan Server Internal');
    }
})
// app.post('/api/v1/post',keamanan, upload.single('foto'), (req, res)=>{
//     const {nama, des} = req.body
//     const foto = req.file.path
//     const query = 'INSERT INTO member (nama, des, foto) VALUES (?, ?, ?)'

//     db.query(query, [nama, des, foto], (err, hasil)=>{
//         if(err){
//             res.status(500).json({Gagal: err})
//             return
//         }
//         res.json({ Sukses: "Berhasil!" })
//     })

// })



app.post('/api/v1/post/projek', (req, res)=>{
    const { nama_projek, penjelasan, bahasa } = req.body
    const query = 'INSERT INTO projek (nama_projek, penjelasan, bahasa) VALUES (?, ?, ?)'
    db.query(query, [nama_projek, penjelasan, bahasa], (err, hasil)=>{
        if(err){
            res.status(500).json({ Gagal: err })
            return
        }
        res.json({ Sukses: "Sukses "+ nama_projek, penjelasan, bahasa })
    })
})




app.get('/api/v1/:name', keamanan, (req,res)=>{
    const nama_projek = req.params.name
    const query = "SELECT * FROM projek WHERE nama_projek = ?"
    db.query(query, [nama_projek], (err, hasil)=>{
        if(err){
            res.status(500).json({err: err})
            return
        }
        if (hasil.length > 0) {
            res.status(200).json(hasil[0]);
        } else {
            res.status(404).send('Data tidak ditemukan');
        }
    })
})
  





app.listen(port, ()=>{
    console.log(`Server is running on port http://localhost:${port}`)
})