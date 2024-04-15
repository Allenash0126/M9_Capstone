const express = require('express');
const { engine } = require('express-handlebars')
const app = express();
const routes = require('./routes')
const port = 3000;

app.engine('.hbs', engine({extname: '.hbs'}))
app.set('view engine', '.hbs')
app.set('views', './views')
// app.use(express.static('public'))

app.use(routes)

app.listen(port,() => {
  console.log(`It is running on server http://localhost:${port}`)
})

module.exports = app 