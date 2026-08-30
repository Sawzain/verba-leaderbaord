// Centralized logger. Currently a thin wrapper around console, but
// routing every log call through here means swapping in a real logging
// service (Sentry, Pino, a log drain) later is a one-file change instead
// of hunting down every scattered console.error call across routes.

function error(context, err) {
  console.error(`[${new Date().toISOString()}] ${context}`, err || "");
}

function info(context) {
  console.log(`[${new Date().toISOString()}] ${context}`);
}

module.exports = { error, info };
