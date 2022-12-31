export function catchError<TError>(fn: () => void): TError | undefined {
  let ex: TError | undefined = undefined;
  try {
    //@ts-expect-error
    fn("viewer");
  } catch (error: any) {
    ex = error;
  }

  return ex;
}
