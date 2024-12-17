/**
 * Extracts some combinations of first name and last name from the full name.
 */
export function getNameVariations(fullName: string): { firstName: string; lastName: string }[] {
	const fullNameParts = fullName.split(' ');
	const fullNameSize = fullNameParts.length;

	if (fullNameSize === 2) {
		const [firstName, lastName] = fullNameParts;
		return [{ firstName, lastName }];
	}

	if (fullNameSize === 3) {
		const [firstName, middleName, lastName] = fullNameParts;
		return [
			{ firstName, lastName },
			{ firstName, lastName: middleName },
			{ firstName, lastName: `${middleName} ${lastName}` }
		];
	}

	if (fullNameSize === 4) {
		const [firstName, secondOrMiddleName, middleName, lastName] = fullNameParts;
		const compoundName = `${firstName} ${secondOrMiddleName}`;
		return [
			{ firstName, lastName },
			{ firstName, lastName: middleName },
			{ firstName: compoundName, lastName },
			{ firstName: compoundName, lastName: middleName },
			{ firstName: compoundName, lastName: `${middleName} ${lastName}` }
		];
	}

	if (fullNameSize === 5) {
		const [firstName, secondName, thirdName, fourthName, lastName] = fullNameParts;
		const compoundName = `${firstName} ${secondName}`;
		return [
			{ firstName, lastName },
			{ firstName, lastName: fourthName },
			{ firstName, lastName: thirdName },
			{ firstName: compoundName, lastName },
			{ firstName: compoundName, lastName: fourthName },
			{ firstName: compoundName, lastName: thirdName },
			{ firstName: compoundName, lastName: `${thirdName} ${lastName}` },
			{ firstName: compoundName, lastName: `${thirdName} ${fourthName}` },
			{ firstName: compoundName, lastName: `${fourthName} ${lastName}` },
			{ firstName: compoundName, lastName: `${thirdName} ${fourthName} ${lastName}` }
		];
	}

	if (fullNameSize > 5) {
		const names = fullNameParts;
		const firstsPick = names.slice(0, 2);
		const lastsPick = names.slice(-3);
		const namePick = firstsPick.concat(lastsPick);
		const newName = namePick.join(' ');
		return getNameVariations(newName);
	}

	return [];
}

/**
 * Remove from the name:
 * - Numbers
 * - Special characters
 * - Extra spaces
 * - Stop words
 * Convert accented characters to non-accented characters.
 * And lower case the name.
 */
export function clearName(fullName: string): string {
	const stopWords = ['de', 'da', 'do', 'dos', 'das'];
	const name = fullName
		.normalize('NFD')
		.replace(/[^a-zA-Z\s]/g, '')
		.replace(/\d/g, '')
		.replace(/\s+/g, ' ')
		.split(' ')
		.filter((word) => !stopWords.includes(word.toLowerCase()))
		.join(' ')
		.toLowerCase();
	return name;
}
