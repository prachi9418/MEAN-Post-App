const express = require("express");
const router = express.Router();

const postController = require("../controllers/posts");

const checkAuth = require("../middelwares/checkAuth");
const extractFile = require("../middelwares/file");

router.post("", checkAuth, extractFile, postController.createPost);

router.put("/:id", checkAuth, extractFile, postController.updatePost);

router.get("", postController.getPosts);

router.get("/:id", postController.getPost);

router.delete("/:id", checkAuth, postController.deletePost);

module.exports = router;
