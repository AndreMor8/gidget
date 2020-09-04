import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export default function(metaURL) {
    const require = createRequire(metaURL);
    const __filename = fileURLToPath(metaURL);
    const __dirname = dirname(__filename);
    return { require, __filename, __dirname };
} 