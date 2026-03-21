import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

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

/** Generated Node Admin SDK operation action function for the 'AllUsers' Query. Allow users to execute without passing in DataConnect. */
export function allUsers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<AllUsersData>>;
/** Generated Node Admin SDK operation action function for the 'AllUsers' Query. Allow users to pass in custom DataConnect instances. */
export function allUsers(options?: OperationOptions): Promise<ExecuteOperationResponse<AllUsersData>>;

/** Generated Node Admin SDK operation action function for the 'UserById' Query. Allow users to execute without passing in DataConnect. */
export function userById(dc: DataConnect, vars: UserByIdVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UserByIdData>>;
/** Generated Node Admin SDK operation action function for the 'UserById' Query. Allow users to pass in custom DataConnect instances. */
export function userById(vars: UserByIdVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UserByIdData>>;

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateMyDisplayName' Mutation. Allow users to execute without passing in DataConnect. */
export function updateMyDisplayName(dc: DataConnect, vars: UpdateMyDisplayNameVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateMyDisplayNameData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateMyDisplayName' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateMyDisplayName(vars: UpdateMyDisplayNameVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateMyDisplayNameData>>;

