import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';

export const uploadToYotsuba = async (buffer) => {
    try {
        const type = await fileTypeFromBuffer(buffer);
        const extension = type ? type.ext : 'jpg';
        const mimetype = type ? type.mime : 'image/jpeg';

        const form = new FormData();
        form.append('file', buffer, { 
            filename: `kazuma_upload.${extension}`,
            contentType: mimetype 
        });

        const response = await axios.post('https://upload.yotsuba.giize.com/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        return response.data.url; 
    } catch (error) {
        throw new Error('Fallo al subir el archivo.');
    }
};