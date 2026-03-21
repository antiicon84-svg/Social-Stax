import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AllUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email: string;
    displayName?: string | null;
    createdAt?: TimestampString | null;
  } & User_Key)[];
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  username: string;
  email: string;
  passwordHash: string;
  displayName?: string | null;
}

export interface Session_Key {
  id: UUIDString;
  __typename?: 'Session_Key';
}

export interface UpdateMyDisplayNameData {
  user_update?: User_Key | null;
}

export interface UpdateMyDisplayNameVariables {
  displayName: string;
}

export interface UserByIdData {
  user?: {
    id: UUIDString;
    username: string;
    email: string;
    displayName?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & User_Key;
}

export interface UserByIdVariables {
  userId: UUIDString;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface AllUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AllUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<AllUsersData, undefined>;
  operationName: string;
}
export const allUsersRef: AllUsersRef;

export function allUsers(): QueryPromise<AllUsersData, undefined>;
export function allUsers(dc: DataConnect): QueryPromise<AllUsersData, undefined>;

interface UserByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UserByIdVariables): QueryRef<UserByIdData, UserByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UserByIdVariables): QueryRef<UserByIdData, UserByIdVariables>;
  operationName: string;
}
export const userByIdRef: UserByIdRef;

export function userById(vars: UserByIdVariables): QueryPromise<UserByIdData, UserByIdVariables>;
export function userById(dc: DataConnect, vars: UserByIdVariables): QueryPromise<UserByIdData, UserByIdVariables>;

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface UpdateMyDisplayNameRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyDisplayNameVariables): MutationRef<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMyDisplayNameVariables): MutationRef<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
  operationName: string;
}
export const updateMyDisplayNameRef: UpdateMyDisplayNameRef;

export function updateMyDisplayName(vars: UpdateMyDisplayNameVariables): MutationPromise<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
export function updateMyDisplayName(dc: DataConnect, vars: UpdateMyDisplayNameVariables): MutationPromise<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;

