const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, getStatistics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Require admin role for all subroutes
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.post('/users', createUser);
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

router.get('/statistics', getStatistics);

module.exports = router;
