const Decentragram = artifacts.require("Decentragram");
const user = artifacts.require("user");

module.exports = function(deployer) {
  // Code goes here...
  deployer.deploy(Decentragram);

  deployer.deploy(user);
};