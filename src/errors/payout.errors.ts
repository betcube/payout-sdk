export class PayoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PayoutError';
  }
}

export class PayoutApiError extends PayoutError {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly responseBody?: string,
    public readonly apiErrorCode?: number,
  ) {
    super(message);
    this.name = 'PayoutApiError';
  }
}

export class PayoutNetworkError extends PayoutError {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'PayoutNetworkError';
  }
}

export class PayoutXmlParseError extends PayoutError {
  constructor(
    message: string,
    public readonly rawXml?: string,
  ) {
    super(message);
    this.name = 'PayoutXmlParseError';
  }
}
