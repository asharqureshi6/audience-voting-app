module.exports = async function (context, req) {
  context.log('negotiate function called');
  context.res = {
    body: context.bindings.signalRConnectionInfo
  };
};
