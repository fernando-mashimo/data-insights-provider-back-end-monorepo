import { clearName, getNameVariations } from '../helper';

describe('test getNameVariations', () => {
	it('should return empty array when the full name is empty', () => {
		const fullName = '';
		const result = getNameVariations(fullName);
		expect(result).toEqual([]);
	});

	it('should return empty array when the full name is a single word', () => {
		const fullName = 'John';
		const result = getNameVariations(fullName);
		expect(result).toEqual([]);
	});

	it('should return John as first name and Doe as last name, when the full name is John Doe', () => {
		const fullName = 'John Doe';
		const result = getNameVariations(fullName);
		expect(result).toEqual([{ firstName: 'John', lastName: 'Doe' }]);
	});

	it('should return multiple variations when the full name is John Doe Smith', () => {
		const fullName = 'John Doe Smith';
		const result = getNameVariations(fullName);
		expect(result).toEqual([
			{ firstName: 'John', lastName: 'Smith' },
			{ firstName: 'John', lastName: 'Doe' },
			{ firstName: 'John', lastName: 'Doe Smith' }
		]);
	});

	it('should return multiple variations when the full name is John Doe Smith Silva', () => {
		const fullName = 'John Doe Smith Silva';
		const result = getNameVariations(fullName);
		expect(result).toEqual([
			{ firstName: 'John', lastName: 'Silva' },
			{ firstName: 'John', lastName: 'Smith' },
			{ firstName: 'John Doe', lastName: 'Silva' },
			{ firstName: 'John Doe', lastName: 'Smith' },
			{ firstName: 'John Doe', lastName: 'Smith Silva' }
		]);
	});

	it('should return multiple variations when the full name is John Doe Smith Silva Junior', () => {
		const fullName = 'John Doe Smith Silva Junior';
		const result = getNameVariations(fullName);
		expect(result).toEqual([
			{ firstName: 'John', lastName: 'Junior' },
			{ firstName: 'John', lastName: 'Silva' },
			{ firstName: 'John', lastName: 'Smith' },
			{ firstName: 'John Doe', lastName: 'Junior' },
			{ firstName: 'John Doe', lastName: 'Silva' },
			{ firstName: 'John Doe', lastName: 'Smith' },
			{ firstName: 'John Doe', lastName: 'Smith Junior' },
			{ firstName: 'John Doe', lastName: 'Smith Silva' },
			{ firstName: 'John Doe', lastName: 'Silva Junior' },
			{ firstName: 'John Doe', lastName: 'Smith Silva Junior' }
		]);
	});

	it('should return multiple variations when the full name is John Doe Potato1 Smith Silva Junior', () => {
		const fullName = 'John Doe Potato1 Smith Silva Junior';
		const result = getNameVariations(fullName);
		expect(result).toEqual([
			{ firstName: 'John', lastName: 'Junior' },
			{ firstName: 'John', lastName: 'Silva' },
			{ firstName: 'John', lastName: 'Smith' },
			{ firstName: 'John Doe', lastName: 'Junior' },
			{ firstName: 'John Doe', lastName: 'Silva' },
			{ firstName: 'John Doe', lastName: 'Smith' },
			{ firstName: 'John Doe', lastName: 'Smith Junior' },
			{ firstName: 'John Doe', lastName: 'Smith Silva' },
			{ firstName: 'John Doe', lastName: 'Silva Junior' },
			{ firstName: 'John Doe', lastName: 'Smith Silva Junior' }
		]);
	});

	it('should return multiple variations when the full name is John Doe Potato1 Potato2 Smith Silva Junior', () => {
		const fullName = 'John Doe Potato1 Potato2 Smith Silva Junior';
		const result = getNameVariations(fullName);
		expect(result).toEqual([
			{ firstName: 'John', lastName: 'Junior' },
			{ firstName: 'John', lastName: 'Silva' },
			{ firstName: 'John', lastName: 'Smith' },
			{ firstName: 'John Doe', lastName: 'Junior' },
			{ firstName: 'John Doe', lastName: 'Silva' },
			{ firstName: 'John Doe', lastName: 'Smith' },
			{ firstName: 'John Doe', lastName: 'Smith Junior' },
			{ firstName: 'John Doe', lastName: 'Smith Silva' },
			{ firstName: 'John Doe', lastName: 'Silva Junior' },
			{ firstName: 'John Doe', lastName: 'Smith Silva Junior' }
		]);
	});
});

describe('test clearName', () => {
	it('should return empty string when the name is empty', () => {
		const name = '';
		const result = clearName(name);
		expect(result).toEqual('');
	});

	it('should return the name without special characters, numbers, stop words, extra spaces and in lower case', () => {
		const name = 'JOsé John Doe 123  da Silva!';
		const result = clearName(name);
		expect(result).toEqual('jose john doe silva');
	});
});
