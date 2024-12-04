import { APIGatewayProxyResult } from "aws-lambda";
import { UpdateDashboardCardsUseCase } from "../../../../domain/useCases/updateDashboardCards";
import { MetabaseClientImp } from "../../../output/http/MetabaseClientImp";
import { httpErrorHandler } from "../../helpers/httpErrorHandler";
import { LambdaHttpResponse } from "../../helpers/httpResponse";

const metabaseClient = new MetabaseClientImp();
const useCase = new UpdateDashboardCardsUseCase(metabaseClient);

export const handler = async(): Promise<APIGatewayProxyResult> => {
  try {
    await useCase.execute();

    return LambdaHttpResponse.success();
  } catch (error) {
    return httpErrorHandler(error);
  }
};
