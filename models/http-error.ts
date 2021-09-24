class HttpError extends Error {
  constructor(message: string, errorCode: number) {
    super(message);
    this["code"] = errorCode;
  }
}

export default HttpError;
