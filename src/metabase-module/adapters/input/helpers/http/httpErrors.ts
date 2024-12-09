export class HttpError extends Error {
	constructor(
		public statusCode: number,
		public code: string,
		message: string
	) {
		super(message);
	}
}

export class ForbiddenError extends HttpError {
	constructor(message: string) {
		super(403, 'FORBIDDEN', message);
	}
}

export class BadRequestError extends HttpError {
	constructor(message: string) {
		super(400, 'BAD_REQUEST', message);
	}
}

export class UnauthorizedError extends HttpError {
	constructor(message: string) {
		super(401, 'UNAUTHORIZED', message);
	}
}
