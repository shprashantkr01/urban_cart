// Multer is node.js middleware that handles multipart/form-data primarily used for file uploads.
import multer from "multer";

// Tels multer to store uploaded files on the disk.
const storage = multer.diskStorage({
    filename:function(req,file,callback){//Function to save the filename
        callback(null,file.originalname)//Keeps the filename original.
    }
})

const upload = multer({storage})

export default upload