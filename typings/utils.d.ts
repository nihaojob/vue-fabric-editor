/** 提取Promise返回值 */
type UnboxPromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
/** 深度提取Promise返回值 */
type DeepUnboxPromise<T> = T extends Promise<infer Value> ? DeepUnboxPromise<Value> : T;
/** 提取构造函数的参数类型 */
type ConstructorTypes<T extends new (...args: any[]) => any> = T extends new (
  ...args: infer Args
) => any
  ? Args
  : never;
/** 为构造函数添加参数类型 */
type AppendArgument<Func extends (...args: any[]) => any, Arg> = Func extends (
  ...args: infer Args
) => infer ReturnType
  ? (...args: [...Args, Arg]) => ReturnType
  : never;
/** 提取元组类型的首个类型 */
type GetFirst<T extends unknown[]> = T extends [infer First, ...rest: unknown[]] ? First : T;
/** 提取构造函数的首个类型 */
type GetFirstConstructorType<T> = GetFirst<ConstructorTypes<T>>;
/** 为元组类型的push一个类型 */
type Push<T extends unknown[], El> = [...T, El];
/** 为元组类型的unshift一个类型 */
type Unshift<T extends unknown[], El> = [El, ...T];
/** 为元组类型的Zip类型 Zip<[1,3],[2,4]> ==> [[1,2],[3,4]]*/
type Zip<T extends unknown[], V extends unknown[]> = T extends [infer TItem, ...rest: infer TRest]
  ? V extends [infer VItem, ...rest: infer VRest]
    ? [[TItem, VItem], ...Zip<TRest, VRest>]
    : []
  : [];

/** 将联合类型转为交叉类型 */
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/** eg: type result = StringToUnion<'abc'> 结果：'a'|'b'|'c' */
type StringToUnion<S extends string> = S extends `${infer S1}${infer S2}`
  ? S1 | StringToUnion<S2>
  : never;

/** 字符串替换，类似js的字符串replace方法 */
type Replace<
  Str extends string,
  From extends string,
  To extends string
> = Str extends `${infer Left}${From}${infer Right}` ? `${Left}${To}${Right}` : Str;

/** 字符串替换，类似js的字符串replaceAll方法 */
type ReplaceAll<
  Str extends string,
  From extends string,
  To extends string
> = Str extends `${infer Left}${From}${infer Right}`
  ? Replace<Replace<`${Left}${To}${Right}`, From, To>, From, To>
  : Str;

/** eg: type result = CamelCase<'foo-bar-baz'>, 结果：fooBarBaz */
type CamelCase<S extends string> = S extends `${infer S1}-${infer S2}`
  ? S2 extends Capitalize<S2>
    ? `${S1}-${CamelCase<S2>}`
    : `${S1}${CamelCase<Capitalize<S2>>}`
  : S;

/** eg: type result = StringToArray<'abc'>, 结果：['a', 'b', 'c'] */
type StringToArray<S extends string, T extends any[] = []> = S extends `${infer S1}${infer S2}`
  ? StringToArray<S2, [...T, S1]>
  : T;

/** `RequiredKeys`是用来获取所有必填字段，其中这些必填字段组合成一个联合类型 */
type RequiredKeys<T> = {
  [P in keyof T]: T extends Record<P, T[P]> ? P : never;
}[keyof T];

/** `OptionalKeys`是用来获取所有可选字段，其中这些可选字段组合成一个联合类型 */
type OptionalKeys<T> = {
  [P in keyof T]: object extends Pick<T, P> ? P : never;
}[keyof T];

/** `GetRequired`是用来获取一个类型中，所有必填键及其类型所组成的一个新类型的 */
type GetRequired<T> = {
  [P in RequiredKeys<T>]-?: T[P];
};

/** `GetOptional`是用来获取一个类型中，所有可选键及其类型所组成的一个新类型的 */
type GetOptional<T> = {
  [P in OptionalKeys<T>]?: T[P];
};

/**  type result1 = Includes<[1, 2, 3, 4], '4'> 结果： false; type result2 = Includes<[1, 2, 3, 4], 4> 结果： true */
type Includes<T extends any[], K> = K extends T[number] ? true : false;

/** eg:type result = MyConcat<[1, 2], [3, 4]>  结果：[1, 2, 3, 4] */
type MyConcat<T extends any[], U extends any[]> = [...T, ...U];
/** eg: type result1 = MyPush<[1, 2, 3], 4> 结果：[1, 2, 3, 4] */
type MyPush<T extends any[], K> = [...T, K];
/** eg: type result3 = MyPop<[1, 2, 3]>  结果：[1, 2] */
type MyPop<T extends any[]> = T extends [...infer L, infer R] ? L : never; // eslint-disable-line

type PropType<T, Path extends string> = string extends Path
  ? unknown
  : Path extends keyof T
  ? T[Path]
  : Path extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? PropType<T[K], R>
    : unknown
  : unknown;

/**
 * NestedKeyOf
 * Get all the possible paths of an object
 * @example
 * type Keys = NestedKeyOf<{ a: { b: { c: string } }>
 * // 'a' | 'a.b' | 'a.b.c'
 */
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type RecordNamePaths<T extends object> = {
  [K in NestedKeyOf<T>]: PropType<T, K>;
};
