import { APIGatewayProxyResult } from "aws-lambda";

export class LambdaHttpResponse {
    public static success(
        payload?: unknown,
        headers?: Headers,
        isFile = false
    ): APIGatewayProxyResult {
        if (isFile) {
            return {
                isBase64Encoded: true,
                statusCode: 200,
                body:
                    (payload as Buffer)?.toString("base64") ??
                    ({} as Buffer).toString("base64"),
                headers: {
                    ...headers,
                    "access-control-allow-origin": "*",
                    "access-control-expose-headers": "content-disposition",
                },
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(payload ?? {}),
            headers: {
                ...headers,
                "access-control-allow-origin": "*",
            },
        };
    }

    public static created(payload?: unknown): APIGatewayProxyResult {
        return {
            statusCode: 201,
            body: JSON.stringify(payload ?? {}),
            headers: {
                "access-control-allow-origin": "*",
            },
        };
    }

    public static accepted(payload?: unknown): APIGatewayProxyResult {
        return {
            statusCode: 202,
            body: JSON.stringify(payload ?? {}),
            headers: {
                "access-control-allow-origin": "*",
            },
        };
    }

    public static error(
        statusCode: number,
        code?: string,
        message?: string
    ): APIGatewayProxyResult {
        if (statusCode < 500) {
            console.warn(
                `Error response sent with status code ${statusCode}, code ${code} and message ${JSON.stringify(
                    message
                )}`
            );
        } else {
            console.error(
                `Error response sent with status code ${statusCode}, code ${code} and message ${JSON.stringify(
                    message
                )}`
            );
        }

        return {
            statusCode,
            body: code
                ? JSON.stringify({
                      code,
                      message,
                  })
                : JSON.stringify({}),
            headers: {
                "access-control-allow-origin": "*",
            },
        };
    }
}

export interface Headers {
    [header: string]: boolean | number | string;
}
