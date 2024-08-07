const express = require('express');
const router = express.Router();
const authTokenHandler = require('../Middlewares/checkAuthToken');
const jwt = require('jsonwebtoken');
const errorHandler = require('../Middlewares/errorMiddleware');
const request = require('request');
const User = require('../Models/UserSchema');
require('dotenv').config();


function createResponse(ok, message, data) {
    return {
        ok,
        message,
        data,
    };
}


router.get('/test', authTokenHandler, async (req, res) => {
    res.json(createResponse(true, 'Test API works for calorie intake report'));
});

router.post('/addcalorieintake', authTokenHandler, async (req, res) => {
    const { name, date, quantity, quantitytype } = req.body;
    console.log("gg")
    if (!name || !date || !quantity || !quantitytype) {
        return res.status(400).json(createResponse(false, 'Please provide all the details'));
    }
    if(!(quantity>0&&quantity<9999)){
        return res.status(400).json(createResponse(false, 'The quantity is invalid'));
    }
    let qtyingrams = 0;
    if (quantitytype === 'g') {
        qtyingrams = quantity;
    }
    else if (quantitytype === 'kg') {
        qtyingrams = quantity * 1000;
    }
    else if (quantitytype === 'ml') {
        qtyingrams = quantity;
    }
    else if (quantitytype === 'l') {
        qtyingrams = quantity * 1000;
    }
    // else if (quantitytype === 'oz') {
    //     qtyingrams = quantity * 1000;
    // }
    else {
        return res.status(400).json(createResponse(false, 'Invalid quantity type'));
    }
    // console.log('https://api.calorieninjas.com/v1/nutrition?query=' + name)
    console.log("gg")
    var query = name;
    // console.log('https://api.calorieninjas.com/v1/nutrition?query=' + query)
    // console.log('https://api.calorieninjas.com/v1/nutrition?query=' +quantity+quantitytype+' '+ query)
    request.get({
        // url: 'https://api.calorieninjas.com/v1/nutrition?query=' +quantity+quantitytype+' '+ query,
        url: 'https://api.calorieninjas.com/v1/nutrition?query=' + query,
        headers: {
            'X-Api-Key': process.env.NUTRITION_API_KEY,
        },
    }, async function (error, response, body) {
        if (error){ console.log("ggee");return console.error('Request failed:', error);}
        else if (response.statusCode != 200){ console.log("ggee");return console.error('Error:', response.statusCode, body.toString('utf8'));}
        else {
            console.log("gg")
            // body :[ {
            //     "name": "rice",
            //     "calories": 127.4,
            //     "serving_size_g": 100,
            //     "fat_total_g": 0.3,
            //     "fat_saturated_g": 0.1,
            //     "protein_g": 2.7,
            //     "sodium_mg": 1,
            //     "potassium_mg": 42,
            //     "cholesterol_mg": 0,
            //     "carbohydrates_total_g": 28.4,
            //     "fiber_g": 0.4,
            //     "sugar_g": 0.1
            // }]
            // console.log(body);
            body = JSON.parse(body);
            console.log("body:"+body.items[0].name);
            // if (!body.items || !body.items.length || !body.items[0].calories || !body.items[0].serving_size_g) {
            //     return res.status(500).json(createResponse(false, 'API did not return expected data'));
            // }
            console.log("gg")
            console.log(body.items[0].calories / body.items[0].serving_size_g,qtyingrams)
            let calorieIntake = (body.items[0].calories / body.items[0].serving_size_g) * parseInt(qtyingrams);            
            // let calorieIntake = (body[0].calories / body[0].serving_size_g) * parseInt(qtyingrams);
            const userId = req.userId;
            const user = await User.findOne({ _id: userId });
            user.calorieIntake.push({
                // name,
                item: body.items[0].name,
                date: new Date(date),
                quantity,
                quantitytype,
                calorieIntake: parseInt(calorieIntake)
            })
            console.log("gg")
            await user.save();
            res.json(createResponse(true, 'Calorie intake added successfully'));
        }
    });

})
router.post('/getcalorieintakebydate', authTokenHandler, async (req, res) => {
    console.log("tttttt")
    const { date } = req.body;
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    if (!date) {
        let date = new Date();   // sept 1 2021 12:00:00
        user.calorieIntake = filterEntriesByDate(user.calorieIntake, date);
        // console.log(user.calorieIntake,"intake")
        return res.json(createResponse(true, 'Calorie intake for today', user.calorieIntake));
    }
    user.calorieIntake = filterEntriesByDate(user.calorieIntake, new Date(date));
    // console.log(user.calorieIntake,"intake")
    res.json(createResponse(true, 'Calorie intake for the date', user.calorieIntake));
    
})
router.post('/getcalorieintakebylimit', authTokenHandler, async (req, res) => {
    const { limit } = req.body;
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    // console.log(user.calorieIntake,"intake")
    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'Calorie intake', user.calorieIntake));
    }
    else {


        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();
        // 1678910

        user.calorieIntake = user.calorieIntake.filter((name) => {
            return new Date(name.date).getTime() >= currentDate;
        })

        console.log(user.calorieIntake,"intake")
        return res.json(createResponse(true, `Calorie intake for the last ${limit} days`, user.calorieIntake));


    }
})
router.delete('/deletecalorieintake', authTokenHandler, async (req, res) => {
    const { name, date } = req.body;
    if (!name || !date) {
        return res.status(400).json(createResponse(false, 'Please provide all the details'));
    }
console.log("--------------------------------------------------------------")
console.log(req.body,"req")
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.calorieIntake = user.calorieIntake.filter((entry) => {
        console.log('entry:', entry);
        return entry.item != name && entry.date != date;
        // entry.name != name && entry.date != date;
        // entry.date.toString()!==new Date(date).toString();
    })
    await user.save();
    res.json(createResponse(true, 'Calorie intake deleted successfully'));

})
router.get('/getgoalcalorieintake', authTokenHandler, async (req, res) => {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    let maxCalorieIntake = 0;
    let heightInCm = parseFloat(user.height[user.height.length - 1].height);
    let weightInKg = parseFloat(user.weight[user.weight.length - 1].weight);
    let age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    let BMR = 0;
    let gender = user.gender;
    if (gender == 'male') {
        BMR = 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age)

    }
    else if (gender == 'female') {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)

    }
    else {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)
    }
    if (user.goal == 'weightLoss') {
        maxCalorieIntake = BMR - 500;
    }
    else if (user.goal == 'weightGain') {
        maxCalorieIntake = BMR + 500;
    }
    else {
        maxCalorieIntake = BMR;
    }

    res.json(createResponse(true, 'max calorie intake', { maxCalorieIntake }));

})


function filterEntriesByDate(entries, targetDate) {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
            entryDate.getDate() === targetDate.getDate() &&
            entryDate.getMonth() === targetDate.getMonth() &&
            entryDate.getFullYear() === targetDate.getFullYear()
        );
    });
}
module.exports = router;
