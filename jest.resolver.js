/* eslint-disable @typescript-eslint/no-var-requires */
"use strict";

module.exports = function resolver(request, options) {
  // Handle @auth/prisma-adapter package
  if (request === "@auth/prisma-adapter") {
    return require.resolve("@auth/prisma-adapter/dist/index.js");
  }
  return options.defaultResolver(request, options);
};
