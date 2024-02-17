type OrP<T> = Promise<T> | T
export function pipeAsync<T1>(first: T1): Promise<T1>
export function pipeAsync<T1, T2>(
  first: T1,
  second: (a: T1) => OrP<T2>
): Promise<T2>
export function pipeAsync<T1, T2, T3>(
  first: T1,
  second: (a: T1) => OrP<T2>,
  third: (a: T2) => OrP<T3>
): Promise<T3>
export function pipeAsync<T1, T2, T3, T4>(
  first: T1,
  second: (a: T1) => OrP<T2>,
  third: (a: T2) => OrP<T3>,
  fourth: (a: T3) => OrP<T4>
): Promise<T4>
export function pipeAsync<T1, T2, T3, T4, T5>(
  first: T1,
  second: (a: T1) => OrP<T2>,
  third: (a: T2) => OrP<T3>,
  fourth: (a: T3) => OrP<T4>,
  fifth: (a: T4) => OrP<T5>
): Promise<T5>
export function pipeAsync(
  first: any,
  ...funcs: ((a: any) => OrP<any>)[]
): Promise<any> {
  return funcs && funcs.length
    ? funcs.reduce(async (result, next) => next(await result), first)
    : first
}
