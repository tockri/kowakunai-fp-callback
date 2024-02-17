type OrP<T> = Promise<T> | T
export function pipeAsync<T1>(arg: T1): Promise<T1>
export function pipeAsync<T1, T2>(
  arg: T1,
  func1: (a: T1) => OrP<T2>
): Promise<T2>
export function pipeAsync<T1, T2, T3>(
  arg: T1,
  func1: (a: T1) => OrP<T2>,
  func2: (a: T2) => OrP<T3>
): Promise<T3>
export function pipeAsync<T1, T2, T3, T4>(
  arg: T1,
  func1: (a: T1) => OrP<T2>,
  func2: (a: T2) => OrP<T3>,
  func3: (a: T3) => OrP<T4>
): Promise<T4>
export function pipeAsync<T1, T2, T3, T4, T5>(
  arg: T1,
  func1: (a: T1) => OrP<T2>,
  func2: (a: T2) => OrP<T3>,
  func3: (a: T3) => OrP<T4>,
  func4: (a: T4) => OrP<T5>
): Promise<T5>
export function pipeAsync<T1, T2, T3, T4, T5, T6>(
  arg: T1,
  func1: (a: T1) => OrP<T2>,
  func2: (a: T2) => OrP<T3>,
  func3: (a: T3) => OrP<T4>,
  func4: (a: T4) => OrP<T5>,
  func5: (a: T5) => OrP<T6>
): Promise<T6>
export function pipeAsync<T1, T2, T3, T4, T5, T6, T7>(
  arg: T1,
  func1: (a: T1) => OrP<T2>,
  func2: (a: T2) => OrP<T3>,
  func3: (a: T3) => OrP<T4>,
  func4: (a: T4) => OrP<T5>,
  func5: (a: T5) => OrP<T6>,
  func6: (a: T6) => OrP<T7>
): Promise<T7>

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function pipeAsync(
  first: any,
  ...funcs: ((a: any) => OrP<any>)[]
): Promise<any> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return funcs && funcs.length
    ? funcs.reduce(async (result, next) => next(await result), first)
    : first
}
