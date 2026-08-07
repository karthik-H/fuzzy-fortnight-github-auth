export type DataResponse<IData> =
  | {
      data: IData;
      message: string;
      success: true;
    }
  | {
      error: unknown;
      message: string;
      success: false;
    };
