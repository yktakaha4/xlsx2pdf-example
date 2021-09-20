import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

interface Request {
  name?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { name } = JSON.parse(event.body ?? "{}") as Request;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Hello, ${(name ?? "nanashi-san").toUpperCase()} !`,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: String(e),
      }),
    };
  }
};
