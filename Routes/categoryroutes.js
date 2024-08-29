const express = require("express");

const { createCategory, updateCategory, deleteCategory, 
    getCategoryById, getAll } = require("../Controller/categorycontroller");
const router = express.Router();

router.post('/create',createCategory);
router.post('/update',updateCategory);
router.post('/delete',deleteCategory);
router.get('/getone',getCategoryById);
router.get('/getall',getAll);

module.exports =  router;
