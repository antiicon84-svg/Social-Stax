const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'social-stax',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const allUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'AllUsers');
}
allUsersRef.operationName = 'AllUsers';
exports.allUsersRef = allUsersRef;

exports.allUsers = function allUsers(dc) {
  return executeQuery(allUsersRef(dc));
};

const userByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'UserById', inputVars);
}
userByIdRef.operationName = 'UserById';
exports.userByIdRef = userByIdRef;

exports.userById = function userById(dcOrVars, vars) {
  return executeQuery(userByIdRef(dcOrVars, vars));
};

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const updateMyDisplayNameRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMyDisplayName', inputVars);
}
updateMyDisplayNameRef.operationName = 'UpdateMyDisplayName';
exports.updateMyDisplayNameRef = updateMyDisplayNameRef;

exports.updateMyDisplayName = function updateMyDisplayName(dcOrVars, vars) {
  return executeMutation(updateMyDisplayNameRef(dcOrVars, vars));
};
