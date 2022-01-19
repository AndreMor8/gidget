//Copied from https://github.com/gumlet/gif-resize/blob/f5f4366dd7b8c4ba9c932e2d702e2941fe9d7e17/src/index.js
import { execa } from 'execa';

export default opts => async buf => {
	opts = Object.assign({
		resize_method: "lanczos2",
		optimizationLevel: 2
	}, opts);

	if (!Buffer.isBuffer(buf)) return Promise.reject(new TypeError('Expected a buffer'));

	const args = ['--no-warnings', '--no-app-extensions'];

	if (opts.interlaced) args.push('--interlace');
	if (opts.optimizationLevel) args.push(`--optimize=${opts.optimizationLevel}`);
	if (opts.colors) args.push(`--colors=${opts.colors}`);
	if (opts.lossy) args.push(`--lossy=${opts.lossy}`);
	if (opts.resize_method) args.push(`--resize-method=${opts.resize_method}`);
	if (opts.gamma) args.push(`--gamma=${opts.gamma}`);
	if (opts.crop) args.push(`--crop=${opts.crop[0]},${opts.crop[1]}+${opts.crop[2]}x${opts.crop[3]}`);
	if (opts.flip_h) args.push(`--flip-horizontal`);
	if (opts.flip_v) args.push(`--flip-vertical`);
	if (opts.stretch && opts.width && opts.height) args.push(`--resize=${opts.width}x${opts.height}`);
	if (opts.width && (!opts.stretch || !opts.height)) args.push(`--resize-width=${opts.width}`);
	if (opts.height && (!opts.stretch || !opts.width)) args.push(`--resize-height=${opts.height}`);

	if (opts.rotate) {
		if (opts.rotate == 90) args.push(`--rotate-90`);
		if (opts.rotate == 180) args.push(`--rotate-180`);
		if (opts.rotate == 270) args.push(`--rotate-270`);
	}
	args.push('--output', "-");

	try {
		const gif_output = await execa("gifsicle", args, { input: buf, encoding: null });
		return gif_output.stdout;
	} catch (error) {
		error.message = error.stderr || error.message;
		throw error;
	}
};