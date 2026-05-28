export const RESPONSE_MESSAGES = {
  SUCCESS: '操作成功',
  CREATED: '创建成功',
  UPDATED: '更新成功',
  DELETED: '删除成功',
  ERROR: '操作失败',
  NOT_FOUND: '资源不存在',
  UNAUTHORIZED: '未授权',
  FORBIDDEN: '禁止访问',
  BAD_REQUEST: '请求参数错误',
  INTERNAL_ERROR: '服务器内部错误',
} as const;

export const RESPONSE_STATUS = {
  SUCCESS: 1,
  FAILED: 0,
} as const;

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
