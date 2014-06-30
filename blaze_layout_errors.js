// If the user still has blaze-layout throw  an error. Let's get rid of that
// package so it's not lingering around with all its nastiness.
if (Package['blaze-layout']) {
  throw new Error(
    "Sorry! The blaze-layout package has been replaced by iron-layout. Please remove the package like this:\n> mrt remove blaze-layout\n> meteor remove blaze-layout"
  );
}
