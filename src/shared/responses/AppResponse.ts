export class AppResponse<T = undefined> {
  constructor(
    public message: string,
    public statusCode: number,
    public data?: T,
  ) {}
}
