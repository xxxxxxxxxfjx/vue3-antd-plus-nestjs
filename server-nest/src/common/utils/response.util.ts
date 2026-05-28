import { ApiResponse } from '../interfaces/response.interface';
import { RESPONSE_MESSAGES } from '../constants/response.constants';

export class ResponseUtil {
  static success<T>(
    data: T,
    message = RESPONSE_MESSAGES.SUCCESS,
  ): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
    };
  }

  static created<T>(
    data: T,
    message = RESPONSE_MESSAGES.CREATED,
  ): ApiResponse<T> {
    return {
      code: 201,
      message,
      data,
    };
  }

  static error(
    message = RESPONSE_MESSAGES.ERROR,
    code = 500,
  ): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
