const express = require('express');
const app = express();
const path = require('path');

/*app.set('view engine', 'html');
app.set('views', './views')*/

app.get('/registration', (req, res, next) => {
  res.sendFile(path.join(__dirname + '/views/registration.html'));
});

app.listen(3007, () => console.log('Registration service has started! Port: 3007'));