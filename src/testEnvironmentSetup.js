//Allow the modification of the global scope not the module scope by importing this script to run as is (not as a module which behaves differently when imported)
//running the command on its own in the entry point only modified the local module scope.
mocha.setup('bdd');

//Modifying global ourselfs, make sure this is imported by entry! window=global on browsers, webpack transforms it.
//global.test = 'test';
