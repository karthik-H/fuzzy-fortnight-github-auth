export type DataResponse<IData> =
  | ISuccessDataResponse<IData>
  | IFailedDataResponse;

type ISuccessDataResponse<IData> = {
  data: IData;
  message: string;
  success: true;
};

type IFailedDataResponse = {
  error: unknown;
  message: string;
  success: false;
};
