export default class ApiResponse {
  constructor(
    public statusCode: number,
    public data: any,
    public message: string
  ) {}
}
