// // const express = require('express');
// // const User = require('../models/userModel');
const authMiddleware = require("./../Middlewares/checkAuthToken"); // Assuming you have some kind of authentication middleware

// // const router = express.Router();

// // // Get profile
// // router.get('/profile', authMiddleware, async (req, res) => {
// //     try {
// //         const user = await User.findById(req.user.id);
// //         res.json(user);
// //     } catch (error) {
// //         res.status(500).json({ error: 'Server Error' });
// //     }
// // });

// // // Update profile
// // router.put('/profile', authMiddleware, async (req, res) => {
// //     try {
// //         const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
// //         res.json(user);
// //     } catch (error) {
// //         res.status(500).json({ error: 'Error updating profile' });
// //     }
// // });

// // module.exports = router;

// const express = require('express');
// const router = express.Router();
// // const authMiddleware = require('../middleware/authMiddleware');
// const User = require('../models/userModel'); // Adjust the path as needed

// // Assuming you have a middleware to authenticate users
// router.use(authMiddleware);

// // Get user profile
// router.get('/', async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id); // Assuming user ID is stored in req.user.id
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Update user profile
// router.put('/', async (req, res) => {
//     const { name, email, password, age, height, weight, weightGoal } = req.body;
//     try {
//         let user = await User.findById(req.user.id);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         user.name = name || user.name;
//         user.email = email || user.email;
//         if (password) {
//             user.password = password; // Ensure you hash the password before saving
//         }
//         user.age = age || user.age;
//         user.height = height || user.height;
//         user.weight = weight || user.weight;
//         user.weightGoal = weightGoal || user.weightGoal;

//         await user.save();
//         res.json({ message: 'Profile updated successfully', user });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/userModel'); // Adjust the path as needed

// Assuming you have a middleware to authenticate users
router.use(authMiddleware);

// Get user profile
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Assuming user ID is stored in req.user.id
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error); // Detailed error log
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/', async (req, res) => {
    const { name, email, password, age, height, weight, weightGoal } = req.body;
    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        if (password) {
            user.password = password; // Ensure you hash the password before saving
        }
        user.age = age || user.age;
        user.height = height || user.height;
        user.weight = weight || user.weight;
        user.weightGoal = weightGoal || user.weightGoal;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error); // Detailed error log
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;