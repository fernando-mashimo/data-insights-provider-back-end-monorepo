import { validate as validateUUID } from 'uuid';

export class InputValidator {
	public static isValidUUID(target: string): boolean {
		return target != null && validateUUID(target);
	}

	public static isValidMail(target: string): boolean {
		return target != null && !!target.match(RegexPatterns.Mail);
	}

	public static isNumeric(target: string): boolean {
		return target != null && !!target.match(RegexPatterns.Numeric);
	}

	public static isPositiveNumber(target: number): boolean {
		return target != null && target >= 0;
	}

	public static isAlphabetic(target: string): boolean {
		return target != null && !!target.match(RegexPatterns.Alphabetic);
	}

	public static isAlphanumericWithSpecialChars(target: string): boolean {
		return target != null && !!target.match(RegexPatterns.AlphanumericWithSpecialChars);
	}

	public static isValidDate(target: string): boolean {
		return target != null && !!target.match(RegexPatterns.Date);
	}

	public static isFilledString(target: string): boolean {
		return target != null && target.trim() !== '';
	}

	public static isValidFileExtension(target: string, allowedExtensions: string[]): boolean {
		const targetAllowedExtensions = allowedExtensions.join('|');

		return target != null && !!target.match(RegexPatterns.FileExtensions(targetAllowedExtensions));
	}

	public static isValueInEnum(targetValue: string, targetEnum: unknown): boolean {
		return (
			targetValue != null &&
			Object.values(targetEnum as Record<string, unknown>).includes(targetValue)
		);
	}

	public static isValidJWT(target: string): boolean {
		return target != null && !!target.match(RegexPatterns.JWT);
	}
}

/*eslint-disable no-control-regex */
/*eslint-disable no-useless-escape */
const RegexPatterns = {
	Mail: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
	Numeric: /-?\d+(?:\.\d+)?/g,
	Alphabetic: /^[a-zA-Z \/\-_.áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/,
	AlphanumericWithSpecialChars: /^[a-zA-Z0-9 \/\-_.@áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ()"]+$/,
	Date: /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/,
	FileExtensions: (extensions: string) => `^.*.(${extensions})$`,
	JWT: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/]*/g
};
