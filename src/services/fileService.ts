import fs from 'fs';
import path from 'path';

export class FileService {
	private static readonly UPLOAD_DIR = 'updloads';
	private static readonly MAX_FILE_SIZE = 5 * 1000 * 1024;
	private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

	static ensureUploadDir(): void {
		const uploadPath = path.join(process.cwd(), this.UPLOAD_DIR);
		if(!fs.existsSync(uploadPath)) {
		fs.mkdirSync(uploadPath, {recursive: true})
		}
	}

	static validateFile(file: Express.Multer.File): void {
		if(!this.ALLOWED_TYPES.includes(file.mimetype)) {
			throw new Error('Invalid file type. Only JPEG and PNG allowed');
		}

		if(file.size > this.MAX_FILE_SIZE) {
			throw new Error('File too large. Maximum size is 5MB.')
		}
	}

	static generateFileName(originalName:string, prefix: string = ''): string {
		const timestamp = Date.now();
		const extension = path.extname(originalName);
		return `${prefix}${timestamp}${extension}`;
	}

	static getFilePath(filename:string):string {
		return path.join(this.UPLOAD_DIR, filename);
	}

	static deleteFile(filename: string): void {
		const filePath = path.join(process.cwd(), this.UPLOAD_DIR, filename);
		if(fs.existsSync(filePath))
			fs.unlinkSync(filePath)
	}

	static getFileUrl(filename:string) : string {
		return `/uploads/${filename}`;
	}
}