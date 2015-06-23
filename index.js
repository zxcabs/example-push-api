/**
 * @author "Evgeny Reznichenko" <kusakyky@gmail.com>
 */

var
    app = require('./src/app');


app.listen(80, function (err) {
    if (err) {
        console.error(err);
    } else {
        console.log('Server started');
    }
});
