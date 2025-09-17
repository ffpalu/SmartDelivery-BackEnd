import multer from "multer";
import path from "path";
import { FileService } from "../services/fileService";

FileService.ensureUploadDir();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		const filename = FileService.generateFileName(file.originalname);
		cb(null, filename);
	}
}); 

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

	if(allowedTypes.includes(file.mimetype)){
		cb(null, true);
	} else {
		cb(new Error('Invalid file type. only JPEG and PNG allowed.'), false);
	}
}

export const upload = multer({
	storage, fileFilter,
	limits: {
		fileSize: 5* 1024 * 1024
	}
});

export const uploadSingle = upload.single('file');
export const uploadProof = upload.single('proof'); 