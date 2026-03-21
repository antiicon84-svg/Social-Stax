import { AllUsersData, UserByIdData, UserByIdVariables, CreateUserData, CreateUserVariables, UpdateMyDisplayNameData, UpdateMyDisplayNameVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useAllUsers(options?: useDataConnectQueryOptions<AllUsersData>): UseDataConnectQueryResult<AllUsersData, undefined>;
export function useAllUsers(dc: DataConnect, options?: useDataConnectQueryOptions<AllUsersData>): UseDataConnectQueryResult<AllUsersData, undefined>;

export function useUserById(vars: UserByIdVariables, options?: useDataConnectQueryOptions<UserByIdData>): UseDataConnectQueryResult<UserByIdData, UserByIdVariables>;
export function useUserById(dc: DataConnect, vars: UserByIdVariables, options?: useDataConnectQueryOptions<UserByIdData>): UseDataConnectQueryResult<UserByIdData, UserByIdVariables>;

export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useUpdateMyDisplayName(options?: useDataConnectMutationOptions<UpdateMyDisplayNameData, FirebaseError, UpdateMyDisplayNameVariables>): UseDataConnectMutationResult<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
export function useUpdateMyDisplayName(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateMyDisplayNameData, FirebaseError, UpdateMyDisplayNameVariables>): UseDataConnectMutationResult<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
