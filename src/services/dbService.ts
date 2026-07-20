import { supabase } from '../supabaseClient';

type Response<T> = { data: T | null; error: Error | null };

const handle = <T,>(promise: Promise<any>): Promise<Response<T>> =>
  promise
    .then((res) => {
      const { data, error } = res;
      return { data: data ?? null, error: error ? (error as Error) : null };
    })
    .catch((err) => ({ data: null, error: err instanceof Error ? err : new Error(String(err)) }));

export const db = {
  from: (table: string) => ({
    select: <T = any>(columns = '*') => handle<T>(supabase.from(table).select(columns)),
    insert: <T = any>(payload: T | T[]) => handle<T>(supabase.from(table).insert(payload)),
    update: <T = any>(payload: Partial<T>) => ({ eq: (col: string, val: any) => handle<T>(supabase.from(table).update(payload).eq(col, val)) }),
    delete: () => ({ eq: (col: string, val: any) => handle<any>(supabase.from(table).delete().eq(col, val)) }),
    rpc: <T = any>(fnName: string, params?: object) => handle<T>(supabase.rpc(fnName, params)),
  }),
};

export default db;
