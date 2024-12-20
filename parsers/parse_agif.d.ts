import { default as Animation } from '../utils/animation';
import { ParseOptions } from './parse_base';
/**
 * @param {ArrayBuffer} buffer
 * @param {ParseOptions} options
 * @return {Promise}
 */
export default function (buffer: ArrayBufferLike, options?: ParseOptions): Promise<Animation>;
