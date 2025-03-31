module.exports = (path, options) => {
  // Call the default resolver
  return options.defaultResolver(path, {
    ...options,
    // Use package.json data
    packageFilter: (pkg) => {
      if (pkg.name === "@auth/prisma-adapter") {
        return { ...pkg, main: pkg.module };
      }
      return pkg;
    },
  });
};
