const express = require('express')
const path = require('path')
var parser = require('body-parser')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(parser.urlencoded({ extended: false }))
  .use(parser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/getRate', (req, res) => {
    var basePrice = Number(0);
    var answer = "";
    var v1 = Number(req.body.weight);
    if (req.body.mailType == "stamped") {
      basePrice = 0.50;
      answer = "Your selected mail was: 'Letters (Stamped)' \n" +
               "You specified that the wight of your package is:  " + v1 + "oz\n" +
               "The price of mailing your package is: $" + (basePrice + (0.21 * (v1-1)));
    }
    else if (req.body.mailType == 'metered'){
        basePrice = 0.47;
        answer = "Your selected mail was: 'Letters (Metered)' \n" +
                "You specified that the wight of your package is:  " + v1 + "oz\n" +
                "The price of mailing your package is: $" + (basePrice + (0.21 * (v1-1)));
    }
    else if (req.body.mailType == 'flats'){
        basePrice = 1.0;
        answer = "Your selected mail was: 'Large Envelopes (Flats)' \n" +
            "You specified that the wight of your package is:  " + v1 + "oz\n" +
            "The price of mailing your package is: $" + (basePrice + (0.21 * (v1-1)));
    }
    else {

        if(v1 >= 5){
            basePrice = 3.5;
        }
        else if(v1 < 9 && v1 > 5){
          basePrice = 3.75
        }
        else if(v1 = 9){
          basePrice = 4.1
        }
        else if(v1 = 10){
          basePrice = 4.45
        }
        else if(v1 = 11){
          basePrice = 4.8
        }
        else if(v1 = 12){
          basePrice = 5.15
        }
        else if(v1 = 13){
          basePrice = 5.50
        }
        answer = "Your selected mail was: 'First-Class Package Service - Retail' \n" +
            "You specified that the wight of your package is:  " + v1 + "oz\n" +
            "The price of mailing your package is: $" + (basePrice);
    }

    res.render('pages/result', {
        result: answer
    })
    
})
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
