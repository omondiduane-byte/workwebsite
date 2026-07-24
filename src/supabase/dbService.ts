import { supabase } from './supabaseClient';

type Response<T> = { data: T | null; error: Error | null };

const handle = <T,>(promise: PromiseLike<unknown>): Promise<Response<T>> =>
  Promise.resolve(promise)
    .then((res) => {
      const { data, error } = (res ?? {}) as { data?: unknown; error?: unknown };
      return { data: (data as T) ?? null, error: error ? (error as Error) : null };
    })
    .catch((err) => ({ data: null, error: err instanceof Error ? err : new Error(String(err)) }));

export const db = {
  from: (table: string) => ({
    select: <T = unknown>(columns = '*') => handle<T>(supabase.from(table).select(columns)),
    insert: <T = unknown>(payload: T | T[]) => handle<T>(supabase.from(table).insert(payload)),
    update: <T = unknown>(payload: Partial<T>) => ({ eq: (col: string, val: unknown) => handle<T>(supabase.from(table).update(payload).eq(col, val)) }),
    delete: () => ({ eq: (col: string, val: unknown) => handle<unknown>(supabase.from(table).delete().eq(col, val)) }),
    rpc: <T = unknown>(fnName: string, params?: object) => handle<T>(supabase.rpc(fnName, params)),
  }),
};

export default db;
