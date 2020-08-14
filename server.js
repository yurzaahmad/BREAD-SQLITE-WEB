const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const dbfile = "./db/dataSiswa"
const path = require('path');
const bodyParser = require('body-parser');
const port = 3000;

let db = new sqlite3.Database(dbfile, sqlite3.OPEN_READWRITE, (err) => {
    if (err) throw err;
    console.log("Koneksi ke database berhasil!");
});


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, 'public')))


app.get('/add', (req, res) => res.render('add'))

app.post('/add', (req, res) => {


    let sql = 'INSERT INTO bread (string, integer, float, date, boolean) values (?,?,?,?,?)';
    db.run(sql, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean], (err) => {
        if (err) throw err;
        res.redirect('/')
    })


});

app.get('/delete/:id', (req, res) => {
    let id = req.params.id
    console.log(id)
    let sql = `DELETE FROM bread WHERE id = ?`
    db.run(sql, id, (err) => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect('/');
    });
});
app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    let sql = 'SELECT * FROM bread WHERE id = ?'
    db.get(sql, id, (err, rows) => {
        console.log('data', rows);
        if (err) throw err
        res.render('edit', { data: rows })
    })
})
app.post("/edit/:id", (req, res) => {
    let id = req.params.id
    let sql = 'UPDATE bread set string = ?, integer =?, float = ?, date = ?, boolean = ? WHERE id = ?';
    db.run(sql, [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean, id], (err) => {
        if (err) throw err;
        res.redirect('/')
    })

})

app.get('/', (req, res) => {
    let dataSearch = []
    let search = false

    if (req.query.checkId && req.query.Id) {
        dataSearch.push(`id = ${req.query.Id}`)
        search = true
    }

    if (req.query.checkString && req.query.String) {
        dataSearch.push(`string = "${req.query.String}"`)
        search = true
    }

    if (req.query.checkInteger && req.query.Integer) {
        dataSearch.push(`integer = "${req.query.Integer}"`)
        search = true
    }

    if (req.query.checkFloat && req.query.Float) {
        dataSearch.push(`float = "${req.query.Float}"`)
        search = true
    }

    if (req.query.checkDate && req.query.startDate && req.query.endDate) {
        dataSearch.push(`date BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`)
        search = true
    }

    if (req.query.checkBoolean && req.query.boolean) {
        dataSearch.push(`boolean = "${req.query.boolean}"`)
        search = true
    }

    let searchFinal = ""
    if (search) {
        searchFinal += `WHERE ${dataSearch.join(' AND ')}`
    }
    console.log(searchFinal)
    console.log(dataSearch)

    const page = req.query.page || 1
    const limit = 3
    const offset = (page - 1) * limit


    db.all(`SELECT COUNT (id) as total FROM bread`, (err, rows) => {
        if (err) {
            return console.error(err.message)
        } else if (rows == 0) {
            return res.send('data not found')
        } else {
            total = rows[0].total
            const pages = Math.ceil(total / limit)

            let sql = `SELECT * FROM bread ${searchFinal} LIMIT ? OFFSET ?`
            console.log('data yang dicari', sql)
            db.all(sql, [limit, offset], (err, result) => {

                if (err) {
                    return console.error(err.message)
                } else if (rows == 0) {
                    return res.send('No data');
                } else {
                    console.log(req.query.page);
                    res.render('list', { data: result, page, pages })
                }
            })
        }
    })
})



app.listen(port, () => {
    console.log(`web ini berjalan di port ${port}!`)
})