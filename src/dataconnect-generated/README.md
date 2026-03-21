# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*AllUsers*](#allusers)
  - [*UserById*](#userbyid)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateMyDisplayName*](#updatemydisplayname)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## AllUsers
You can execute the `AllUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
allUsers(): QueryPromise<AllUsersData, undefined>;

interface AllUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<AllUsersData, undefined>;
}
export const allUsersRef: AllUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
allUsers(dc: DataConnect): QueryPromise<AllUsersData, undefined>;

interface AllUsersRef {
  ...
  (dc: DataConnect): QueryRef<AllUsersData, undefined>;
}
export const allUsersRef: AllUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the allUsersRef:
```typescript
const name = allUsersRef.operationName;
console.log(name);
```

### Variables
The `AllUsers` query has no variables.
### Return Type
Recall that executing the `AllUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AllUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AllUsersData {
  users: ({
    id: UUIDString;
    username: string;
    email: string;
    displayName?: string | null;
    createdAt?: TimestampString | null;
  } & User_Key)[];
}
```
### Using `AllUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, allUsers } from '@dataconnect/generated';


// Call the `allUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await allUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await allUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
allUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `AllUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, allUsersRef } from '@dataconnect/generated';


// Call the `allUsersRef()` function to get a reference to the query.
const ref = allUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = allUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## UserById
You can execute the `UserById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
userById(vars: UserByIdVariables): QueryPromise<UserByIdData, UserByIdVariables>;

interface UserByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UserByIdVariables): QueryRef<UserByIdData, UserByIdVariables>;
}
export const userByIdRef: UserByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
userById(dc: DataConnect, vars: UserByIdVariables): QueryPromise<UserByIdData, UserByIdVariables>;

interface UserByIdRef {
  ...
  (dc: DataConnect, vars: UserByIdVariables): QueryRef<UserByIdData, UserByIdVariables>;
}
export const userByIdRef: UserByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the userByIdRef:
```typescript
const name = userByIdRef.operationName;
console.log(name);
```

### Variables
The `UserById` query requires an argument of type `UserByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UserByIdVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `UserById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UserByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `UserById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, userById, UserByIdVariables } from '@dataconnect/generated';

// The `UserById` query requires an argument of type `UserByIdVariables`:
const userByIdVars: UserByIdVariables = {
  userId: ..., 
};

// Call the `userById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await userById(userByIdVars);
// Variables can be defined inline as well.
const { data } = await userById({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await userById(dataConnect, userByIdVars);

console.log(data.user);

// Or, you can use the `Promise` API.
userById(userByIdVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `UserById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, userByIdRef, UserByIdVariables } from '@dataconnect/generated';

// The `UserById` query requires an argument of type `UserByIdVariables`:
const userByIdVars: UserByIdVariables = {
  userId: ..., 
};

// Call the `userByIdRef()` function to get a reference to the query.
const ref = userByIdRef(userByIdVars);
// Variables can be defined inline as well.
const ref = userByIdRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = userByIdRef(dataConnect, userByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  username: string;
  email: string;
  passwordHash: string;
  displayName?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  username: ..., 
  email: ..., 
  passwordHash: ..., 
  displayName: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ username: ..., email: ..., passwordHash: ..., displayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  username: ..., 
  email: ..., 
  passwordHash: ..., 
  displayName: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ username: ..., email: ..., passwordHash: ..., displayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateMyDisplayName
You can execute the `UpdateMyDisplayName` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateMyDisplayName(vars: UpdateMyDisplayNameVariables): MutationPromise<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;

interface UpdateMyDisplayNameRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyDisplayNameVariables): MutationRef<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
}
export const updateMyDisplayNameRef: UpdateMyDisplayNameRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMyDisplayName(dc: DataConnect, vars: UpdateMyDisplayNameVariables): MutationPromise<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;

interface UpdateMyDisplayNameRef {
  ...
  (dc: DataConnect, vars: UpdateMyDisplayNameVariables): MutationRef<UpdateMyDisplayNameData, UpdateMyDisplayNameVariables>;
}
export const updateMyDisplayNameRef: UpdateMyDisplayNameRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMyDisplayNameRef:
```typescript
const name = updateMyDisplayNameRef.operationName;
console.log(name);
```

### Variables
The `UpdateMyDisplayName` mutation requires an argument of type `UpdateMyDisplayNameVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateMyDisplayNameVariables {
  displayName: string;
}
```
### Return Type
Recall that executing the `UpdateMyDisplayName` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMyDisplayNameData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMyDisplayNameData {
  user_update?: User_Key | null;
}
```
### Using `UpdateMyDisplayName`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMyDisplayName, UpdateMyDisplayNameVariables } from '@dataconnect/generated';

// The `UpdateMyDisplayName` mutation requires an argument of type `UpdateMyDisplayNameVariables`:
const updateMyDisplayNameVars: UpdateMyDisplayNameVariables = {
  displayName: ..., 
};

// Call the `updateMyDisplayName()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMyDisplayName(updateMyDisplayNameVars);
// Variables can be defined inline as well.
const { data } = await updateMyDisplayName({ displayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMyDisplayName(dataConnect, updateMyDisplayNameVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateMyDisplayName(updateMyDisplayNameVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateMyDisplayName`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMyDisplayNameRef, UpdateMyDisplayNameVariables } from '@dataconnect/generated';

// The `UpdateMyDisplayName` mutation requires an argument of type `UpdateMyDisplayNameVariables`:
const updateMyDisplayNameVars: UpdateMyDisplayNameVariables = {
  displayName: ..., 
};

// Call the `updateMyDisplayNameRef()` function to get a reference to the mutation.
const ref = updateMyDisplayNameRef(updateMyDisplayNameVars);
// Variables can be defined inline as well.
const ref = updateMyDisplayNameRef({ displayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMyDisplayNameRef(dataConnect, updateMyDisplayNameVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

